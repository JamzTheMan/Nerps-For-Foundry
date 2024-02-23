import {log} from "../scripts/nerps-for-foundry.js";

export function repairTargetsShield(token) {
    ui.notifications.info("Add Reforging shield to function!")

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
        const skillRank = token.actor.skills[skillKey].rank
        const actionSlug = "Repair"
        const actionName = "Repair"

        const modifiers = []

        let DCsByLevel = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50]
        let DC = DCsByLevel[token.actor.system.details.level.value] + 2

        // Look for a shield on the target actor and use it's DC if it exist
        if (shieldActor.heldShield !== null) {
            DC = DCsByLevel[shieldActor.items.find(item => item.id === shieldActor.heldShield._id).level]
        } else {
            ui.notifications.error(`${shieldActor.name} does not have a shield equipped.`);
            return;
        }

        const successRestored = CheckForCraftersEyePiece() ? 10 : 5;
        const critSuccessRestored = CheckForCraftersEyePiece() ? 15 : 10;
        const craftersEyepieceNotes = CheckForCraftersEyePiece() ? "<p><strong>Crafter's Eyepiece</strong> When you Repair an item, increase the Hit Points restored to 10 + 10 per proficiency rank on a success or 15 + 15 per proficiency rank on a critical success</p>" : "";

        const options = token.actor.getRollOptions(['all', 'skill-check', skillName.toLowerCase()]);
        options.push(`action:${actionSlug}`);
        let DamageRoll = CONFIG.Dice.rolls.find((r) => r.name == "DamageRoll");
        game.pf2e.Check.roll(
            new game.pf2e.CheckModifier(
                `<span class="pf2-icon">A</span> <b>${actionName}</b> - <p class="compact-text">${skillName} Skill Check</p>`,
                token.actor.skills[skillKey], modifiers),
            {actor: token.actor, type: 'skill-check', options, dc: {value: DC}}, //for DC insert: , dc: {value: 30}
            event,
            async (roll) => {
                if (roll.degreeOfSuccess === 3) {
                    // crit success message
                    const damageRepaired = critSuccessRestored + token.actor.skills.crafting.rank * critSuccessRestored;
                    dsnHook(() => {
                        ChatMessage.create({
                            user: game.user.id,
                            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                            flavor: `<strong>Critical Success</strong><br>You restore ${critSuccessRestored} Hit Points to the item, plus an additional ${critSuccessRestored} Hit Points per proficiency rank you have in Crafting (a total of ${critSuccessRestored * 2} HP if you’re trained, ${critSuccessRestored * 3} HP if you’re an expert, ${critSuccessRestored * 4} HP if you’re a master, or ${critSuccessRestored * 5} HP if you’re legendary).${craftersEyepieceNotes}<p><strong>Total Repaired: ${damageRepaired} HP</strong>.</p>`,
                            speaker: ChatMessage.getSpeaker(),
                        });
                    });
                    repairShield(damageRepaired, shieldActor.heldShield);
                } else if (roll.degreeOfSuccess === 2) {
                    // success message
                    const damageRepaired = successRestored + token.actor.skills.crafting.rank * successRestored;
                    dsnHook(() => {
                        ChatMessage.create({
                            user: game.user.id,
                            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                            flavor: `<strong>Success</strong><br>You restore ${successRestored} Hit Points to the item, plus an additional ${successRestored} Hit Points per proficiency rank you have in Crafting (a total of ${successRestored * 2} HP if you’re trained, ${successRestored * 3} HP if you’re an expert, ${successRestored * 4} HP if you’re a master, or ${successRestored * 5} HP if you’re legendary).${craftersEyepieceNotes}<p><strong>Total Repaired: ${damageRepaired} HP.</strong></p>`,
                            speaker: ChatMessage.getSpeaker(),
                        });
                    });
                    repairShield(damageRepaired, shieldActor.heldShield);
                } else if (roll.degreeOfSuccess === 1) {
                    // Fail message
                    dsnHook(() => {
                        ChatMessage.create({
                            user: game.user.id,
                            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                            flavor: `<strong>Failure</strong><br>You fail to make the repair and nothing happens.`,
                            speaker: ChatMessage.getSpeaker(),
                        });
                    });
                } else if (roll.degreeOfSuccess === 0) {
                    // crit fail damage
                    dsnHook(() => {
                        new DamageRoll("2d6").toMessage({
                            flavor: "<strong>Critical Failure</strong><br>You deal 2d6 damage to the item. Apply the item’s Hardness to this damage.",
                            speaker: ChatMessage.getSpeaker(),
                        }).then((r) => {
                            let damage = r.rolls.reduce((sum, roll) => sum + roll.total, 0);
                            repairShield(-damage, shieldActor.heldShield);
                        });
                    });
                }
            },
        );
    }

    /**
     * Check if any itemType equipment of the actor matches a slug (and optionally checks in how many hands it is held)
     *
     * @param {string} hpRestored hp restored to shield
     * @param {string} shield shield to be repaired
     * @returns {Promise<void>}
     */
    async function repairShield(hpRestored, shield) {
        if (hpRestored < 0) {
            hpRestored = Math.min(0, hpRestored + shield.system.hardness);
        }
        const newShieldHp = Math.max(0, Math.min(shield.system.hp.max, shield.system.hp.value + hpRestored));
        const shieldUpdate = {"system.hp.value": newShieldHp};

        await shield.update(shieldUpdate);
    }
}