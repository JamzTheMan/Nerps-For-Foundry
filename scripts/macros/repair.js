import {log} from "../nerps-for-foundry.js";
import {socket} from "../hooks-for-nerps.js";

/**
 * Repair modes supported by this macro.
 * @enum {string}
 */
export const REPAIR_MODE = {
    SHIELD: 'shield',
    CONSTRUCT: 'construct',
};

/**
 * Returns true if the given actor is a repairable construct.
 * Requires both the 'construct' and 'minion' traits, so that PC automatons
 * (which have 'construct' but not 'minion') are excluded.
 * Supports both PF2e's Set-based actor.traits and the legacy array at system.traits.value.
 *
 * @param {Actor} actor
 * @returns {boolean}
 */
function isConstruct(actor) {
    // PF2e v7+ exposes a Set at actor.traits
    if (actor.traits instanceof Set) return actor.traits.has('construct') && actor.traits.has('minion');
    // Fallback: array in system data
    const traits = actor.system?.traits?.value ?? [];
    return traits.includes('construct') && traits.includes('minion');
}

export function repair(token) {
    /**
     * Set actor to the token's actor if no target is selected, otherwise set it to the first target's actor.
     */
    const targets = game.user.targets;
    let shieldActor = token.actor;

    if (targets.size > 0) {
        shieldActor = targets.first().actor;
    }

    /**
     * Check if any itemType equipment of the actor matches a slug (and optionally checks in how many hands it is held)
     *
     * @param {string} slug Slug of the equipment to search
     * @param {int} hands Number of hands the item shall be held
     * @param {boolean} invested Check if item is invested
     * @returns {boolean} true if the actor has a matching item equipment
     */
    const checkItemPresent = (slug, hands, invested) =>
        token.actor.itemTypes.equipment.some(
            (equipment) => equipment.slug === slug && (!hands || equipment.handsHeld === hands) && (!invested || equipment.isInvested)
        );

    function CheckForCraftersEyePiece() {
        return checkItemPresent("crafters-eyepiece", 0, true) || checkItemPresent("crafters-eyepiece-greater", 0, true);
    }

    /**
     * Wrapper for the DSN Hook. It will only use the hook if the non-buggy setting is not enabled.
     *
     * @param {Object} code code which will be executed
     */
    function dsnHook(code) {
        if (game.modules.get("dice-so-nice")?.active && !game.settings.get("dice-so-nice", "immediatelyDisplayChatMessages") && !game.modules.get("df-manual-rolls")?.active) {
            Hooks.once('diceSoNiceRollComplete', code);
        } else {
            code();
        }
    }

    /**
     * Check whether the current actor has a feature.
     *
     * @param {string} slug
     * @returns {boolean} true if the feature exists, false otherwise
     */
    const checkFeat = (slug) =>
        token.actor.items
            .filter((item) => item.type === 'feat')
            .some((item) => item.slug === slug);


    if (canvas.tokens.controlled.length !== 1) {
        ui.notifications.warn('You need to select exactly one token to perform repair.');
    } else {
        const hasRepairKit = checkItemPresent('repair-kit') || checkItemPresent('repair-kit-superb');
        // const hasRepairFeat = checkFeat('tinkering-fingers');

        const skillName = "Repair";
        const skillKey = "crafting";
        // const skillRank = token.actor.skills[skillKey].rank
        const actionSlug = "Repair"
        const actionName = "Repair"

        const modifiers = []

        let DCsByLevel = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50]
        let DC = DCsByLevel[token.actor.system.details.level.value] + 2

        const constructTarget = isConstruct(shieldActor);
        const shieldTarget = shieldActor.heldShield !== null;

        if (!constructTarget && !shieldTarget) {
            ui.notifications.error(`${shieldActor.name} is not a repairable target — must be a construct minion or have a shield equipped.`);
            return;
        }

        /**
         * Resolves the repair mode and DC, then kicks off the skill roll.
         * Extracted so it can be called directly or from within the prompt dialog.
         *
         * @param {REPAIR_MODE[keyof REPAIR_MODE]} mode
         */
        const beginRoll = (mode) => {
            /** @type {number} */
            let resolvedDC;

            if (mode === REPAIR_MODE.CONSTRUCT) {
                resolvedDC = DCsByLevel[shieldActor.system.details.level.value] ?? DC;
                log.info(`repair | Targeting construct "${shieldActor.name}" (level ${shieldActor.system.details.level.value}), DC ${resolvedDC}`);
            } else {
                resolvedDC = DCsByLevel[shieldActor.items.find(item => item.id === shieldActor.heldShield._id).level];
                log.info(`repair | Targeting shield "${shieldActor.heldShield.name}" on "${shieldActor.name}", DC ${resolvedDC}`);
            }

            const hasReforgingShield = mode === REPAIR_MODE.SHIELD && shieldActor.heldShield?.slug === 'reforging-shield';
            const reforgingMultiplier = hasReforgingShield ? 2 : 1;
            const reforgingNote = hasReforgingShield ? `<li class="roll-note"><strong>Reforging Shield</strong> Each time a character Repairs the shield, the shield recovers double the number of Hit Points.</li>` : "";

            const successRestored = CheckForCraftersEyePiece() ? 10 : 5;
            const critSuccessRestored = CheckForCraftersEyePiece() ? 15 : 10;
            const craftersEyepieceNotes = CheckForCraftersEyePiece() ? `<li class="roll-note"><strong>Crafter's Eyepiece</strong> When you Repair an item, increase the Hit Points restored to 10 + 10 per proficiency rank on a success or 15 + 15 per proficiency rank on a critical success.</li>` : "";

            const options = token.actor.getRollOptions(['all', 'skill-check', skillName.toLowerCase()]);
            options.push(`action:${actionSlug}`);
            const DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === 'DamageRoll');

            const target = mode === REPAIR_MODE.CONSTRUCT ? 'construct' : 'item';
            const hardnessLabel = mode === REPAIR_MODE.CONSTRUCT ? "construct's" : "item's";

            // Build the item/construct heading matching PF2e's item-heading-partial.hbs style.
            const repairTarget = mode === REPAIR_MODE.CONSTRUCT ? shieldActor : shieldActor.heldShield;
            const targetImg = repairTarget.img ?? 'icons/svg/mystery-man.svg';
            const targetName = repairTarget.name;
            const itemHeading = `<li style="display:flex;align-items:center;"><img src="${targetImg}" style="height:32px;width:32px;margin-right:3px;border:none;" alt="${targetName}"/><strong>${targetName}</strong></li><li class="roll-note"><!--result--></li>`;

            game.pf2e.Check.roll(
                new game.pf2e.CheckModifier(
                    `<span class="pf2-icon">A</span> <b>${actionName}</b> - <p class="compact-text">${skillName} Skill Check</p>`,
                    token.actor.skills[skillKey], modifiers),
                {
                    actor: token.actor,
                    type: 'skill-check',
                    options,
                    dc: {value: resolvedDC},
                    traits: ['exploration', 'manipulate'],
                },
                event,
                async (roll, _outcome, message) => {
                    // Capture the message ID from the ChatMessage argument — this is the correct,
                    // reliable way to get the ID in PF2e's Check.roll callback.
                    const messageId = message?.id;

                    /**
                     * Appends HTML to the flavor of a specific chat message by ID.
                     * Done on the calling client — no socket needed — since any client can update
                     * a message's flavor.
                     */
                    const appendFlavor = async (html) => {
                        const msg = messageId ? game.messages.get(messageId) : null;
                        if (!msg) {
                            log.warn(`repair | No message found for id "${messageId}" — skipping flavor update.`);
                            return;
                        }
                        if (msg.system?.flavor !== undefined) {
                            await msg.update({'system.flavor': (msg.system.flavor ?? '') + html});
                        } else {
                            await msg.update({flavor: (msg.flavor ?? '') + html});
                        }
                    };

                    if (roll.degreeOfSuccess === 3) {
                        const damageRepaired = (critSuccessRestored + token.actor.skills.crafting.rank * critSuccessRestored) * reforgingMultiplier;
                        const outcomeHtml = `<ul class="notes"><!--heading--><li class="roll-note"><strong>Critical Success</strong> You restore ${critSuccessRestored} Hit Points to the ${target}, plus an additional ${critSuccessRestored} Hit Points per proficiency rank you have in Crafting (a total of ${critSuccessRestored * 2} HP if you're trained, ${critSuccessRestored * 3} HP if you're an expert, ${critSuccessRestored * 4} HP if you're a master, or ${critSuccessRestored * 5} HP if you're legendary).</li>${craftersEyepieceNotes}${reforgingNote}</ul>`;
                        dsnHook(async () => {
                            const resultText = await socket.executeAsGM(applyRepairHP, damageRepaired, shieldActor.id, mode);
                            await appendFlavor(outcomeHtml.replace('<!--heading-->', itemHeading.replace('<!--result-->', resultText)));
                        });
                    } else if (roll.degreeOfSuccess === 2) {
                        const damageRepaired = (successRestored + token.actor.skills.crafting.rank * successRestored) * reforgingMultiplier;
                        const outcomeHtml = `<ul class="notes"><!--heading--><li class="roll-note"><strong>Success</strong> You restore ${successRestored} Hit Points to the ${target}, plus an additional ${successRestored} Hit Points per proficiency rank you have in Crafting (a total of ${successRestored * 2} HP if you're trained, ${successRestored * 3} HP if you're an expert, ${successRestored * 4} HP if you're a master, or ${successRestored * 5} HP if you're legendary).</li>${craftersEyepieceNotes}${reforgingNote}</ul>`;
                        dsnHook(async () => {
                            const resultText = await socket.executeAsGM(applyRepairHP, damageRepaired, shieldActor.id, mode);
                            await appendFlavor(outcomeHtml.replace('<!--heading-->', itemHeading.replace('<!--result-->', resultText)));
                        });
                    } else if (roll.degreeOfSuccess === 1) {
                        const outcomeHtml = `<ul class="notes"><li class="roll-note"><strong>Failure</strong> You fail to make the repair and nothing happens.</li></ul>`;
                        dsnHook(async () => {
                            await appendFlavor(outcomeHtml);
                        });
                    } else if (roll.degreeOfSuccess === 0) {
                        const damageRoll = await new DamageRoll('2d6').evaluate();
                        const damageTotal = damageRoll.total;
                        const outcomeHtml = `<ul class="notes"><!--heading--><li class="roll-note"><strong>Critical Failure</strong> You deal <strong>${damageTotal}</strong> (2d6) damage to the ${target}. Apply the ${hardnessLabel} Hardness to this damage.</li></ul>`;
                        dsnHook(async () => {
                            const resultText = await socket.executeAsGM(applyRepairHP, -damageTotal, shieldActor.id, mode);
                            await appendFlavor(outcomeHtml.replace('<!--heading-->', itemHeading.replace('<!--result-->', resultText)));
                        });
                    }
                },
            );
        };

        // Determine which targets actually need repair.
        // Use actor.hitPoints (PF2e computed property) so it works for both PC and NPC actor types.
        const constructNeedsRepair = constructTarget && shieldActor.hitPoints.value < shieldActor.hitPoints.max;
        const shield = shieldTarget ? shieldActor.heldShield : null;
        const shieldNeedsRepair = shieldTarget && shield.system.hp.value < shield.system.hp.max;

        if (constructTarget && shieldTarget) {
            // Both are present — only prompt when both need repair.
            if (constructNeedsRepair && shieldNeedsRepair) {
                foundry.applications.api.DialogV2.wait({
                    window: {
                        title: `Repair — ${shieldActor.name}`,
                        icon: 'fa-solid fa-wrench',
                    },
                    position: {width: 420},
                    content: `<p>What do you want to repair on <strong>${shieldActor.name}</strong>?</p>`,
                    buttons: [
                        {
                            action: REPAIR_MODE.CONSTRUCT,
                            icon: 'fas fa-robot',
                            label: 'Construct',
                            default: true,
                            callback: () => beginRoll(REPAIR_MODE.CONSTRUCT),
                        },
                        {
                            action: REPAIR_MODE.SHIELD,
                            icon: 'fas fa-shield-halved',
                            label: `Shield (${shield.name})`,
                            callback: () => beginRoll(REPAIR_MODE.SHIELD),
                        },
                        {
                            action: 'cancel',
                            icon: 'fas fa-times',
                            label: 'Cancel',
                        },
                    ],
                });
                return;
            } else if (constructNeedsRepair) {
                beginRoll(REPAIR_MODE.CONSTRUCT);
                return;
            } else if (shieldNeedsRepair) {
                beginRoll(REPAIR_MODE.SHIELD);
                return;
            } else {
                ui.notifications.info(`${shieldActor.name} and their shield are already at full HP.`);
                return;
            }
        }

        // Only one target type is present — check if it actually needs repair.
        if (constructTarget && !constructNeedsRepair) {
            ui.notifications.info(`${shieldActor.name} is already at full HP.`);
            return;
        }
        if (shieldTarget && !shieldNeedsRepair) {
            ui.notifications.info(`${shield.name} is already at full HP.`);
            return;
        }

        // Single applicable target that needs repair — proceed immediately.
        beginRoll(constructTarget ? REPAIR_MODE.CONSTRUCT : REPAIR_MODE.SHIELD);
    }
}

/**
 * Applies the result of a Repair skill check to either the held shield or the construct HP of the given actor.
 * Returns a result text string describing what happened (for the caller to append to the chat message).
 * Only mutates game data — no chat message updates — so it is safe to run via socket.executeAsGM.
 *
 * @param {number} hpRestored  HP to restore (negative = damage on crit fail; 0 = failure/no change)
 * @param {string} actorId     actor.id of the target being repaired
 * @param {REPAIR_MODE[keyof REPAIR_MODE]} [mode=REPAIR_MODE.SHIELD]  'shield' or 'construct'
 * @returns {Promise<string>}  Human-readable result text, e.g. "Repaired for 20 HP. Now has 35 / 60 HP."
 */
export async function applyRepairHP(hpRestored, actorId, mode = REPAIR_MODE.SHIELD) {
    const actor = game.actors.get(actorId);

    if (mode === REPAIR_MODE.CONSTRUCT) {
        const hardness = actor.system.attributes.hardness?.value ?? 0;
        log.info(`applyRepairHP | construct "${actor.name}", hpRestored=${hpRestored}, hardness=${hardness}`);

        if (hpRestored < 0) hpRestored = Math.min(0, hpRestored + hardness);

        const hp = actor.hitPoints;
        const newHp = Math.max(0, Math.min(hp.max, hp.value + hpRestored));
        if (hpRestored !== 0) await actor.update({"system.attributes.hp.value": newHp});

        return hpRestored > 0
            ? `<strong>Repaired</strong> for ${hpRestored} HP. Now has ${newHp} / ${hp.max} HP.`
            : hpRestored < 0
                ? `<strong>Damaged</strong> for ${-hpRestored} HP (after ${hardness} hardness). Now has ${newHp} / ${hp.max} HP.`
                : `No change.`;

    } else {
        const shield = actor.heldShield;
        log.info(`applyRepairHP | shield "${shield.name}" on "${actor.name}", hpRestored=${hpRestored}`);

        if (hpRestored < 0) hpRestored = Math.min(0, hpRestored + shield.system.hardness);

        const newShieldHp = Math.max(0, Math.min(shield.system.hp.max, shield.system.hp.value + hpRestored));
        if (hpRestored !== 0) await shield.update({"system.hp.value": newShieldHp});

        return hpRestored > 0
            ? `<strong>Repaired</strong> for ${hpRestored} HP. Now has ${newShieldHp} / ${shield.system.hp.max} HP.`
            : hpRestored < 0
                ? `<strong>Damaged</strong> for ${-hpRestored} HP (after ${shield.system.hardness} hardness). Now has ${newShieldHp} / ${shield.system.hp.max} HP.`
                : `No change.`;
    }
}

/**
 * @deprecated Use {@link applyRepairHP} instead. This wrapper is kept for backward compatibility.
 */
export async function applyRepair(hpRestored, actorId, mode = REPAIR_MODE.SHIELD) {
    return applyRepairHP(hpRestored, actorId, mode);
}

// ---------------------------------------------------------------------------
// Deprecated aliases — to be removed in a future release
// ---------------------------------------------------------------------------

/**
 * @deprecated Use {@link repair} instead.
 */
export const repairTargetsShield = repair;

/**
 * @deprecated Use {@link applyRepair} instead.
 */
export const repairShield = applyRepair;

