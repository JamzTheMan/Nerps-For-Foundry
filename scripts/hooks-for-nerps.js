import {MODULE_NAME} from "./constants.js";
import {adjustShieldHP} from "./macros/adjust-shield-hp.js";
import {
    checkForPf2ePerceptionConditions,
    clearPf2ePerceptionConditions
} from "./macros/clear-pf2e-perception-conditions.js";
import {combineDamage} from "./macros/combine-damage.js";
import {counteractCheck} from "./macros/counteract-check.js";
import {createGenericTimer} from "./macros/create-generic-timer.js";
import {
    enrichAllJournalEntriesWithXp,
    enrichJournalEntryWithXp,
    revertAllJournalEntriesWithXp,
    revertJournalEntryXpEnrichment
} from "./macros/enrich-journal-entries-with-xp.js";
import {explorationActivities} from "./macros/exploration-activities.js";
import {exportActorWithImages} from "./macros/export-actor-with-images.js";
import {measureTokenDistance} from "./macros/measure-token-distances.js";
import {applyRepair, repair, repairShield, repairTargetsShield} from "./macros/repair.js";
import {rollPerceptionChecks} from "./macros/roll-perception-checks.js";
import {selectAllPlayerTokens} from "./macros/select-party-tokens.js";
import {setTokenBarsAndNameplates} from "./macros/set-token-bars-and-nameplates.js";
import {log, NerpsForFoundry} from "./nerps-for-foundry.js";
import {registerSettings} from "./settings-for-nerps.js";
import {getSetting, toggleSetting} from "./utils/extensions.js";

export let socket;

/*
    __  __            __
   / / / /___  ____  / /_______
  / /_/ / __ \/ __ \/ //_/ ___/
 / __  / /_/ / /_/ / ,< (__  )
/_/ /_/\____/\____/_/|_/____/
                               */
Hooks.once('init', async function () {
    console.log(`%c

  _  _                     _ _      ___                 _          
 | \\| |___ _ _ _ __ ______| | | ___| __|__ _  _ _ _  __| |_ _ _  _ 
 | .\` / -_) '_| '_ (_-<___|_  _|___| _/ _ \\ || | ' \\/ _\` | '_| || |
 |_|\\_\\___|_| | .__/__/     |_|    |_|\\___/\\_,_|_||_\\__,_|_|  \\_, |
              |_|                                             |__/                                                   
v${game.modules.get(MODULE_NAME).version}
`, `font-family: monospace`); // Small

    registerSettings();


    /*
      Export out functions to be used in macro scripts...
     */
    log.info("Exposing macro functions...")
    game.nerps = mergeObject(game.nerps ?? {}, {
        "measureTokenDistance": measureTokenDistance,
        "repair": repair,
        /** @deprecated Use repair instead. */ "repairTargetsShield": repairTargetsShield,
        "adjustShieldHP": adjustShieldHP,
        "combineDamage": combineDamage,
        "setTokenBarsAndNameplates": setTokenBarsAndNameplates,
        "explorationActivities": explorationActivities,
        "counteractCheck": counteractCheck,
        "exportActorWithImages": exportActorWithImages,
        "createGenericTimer": createGenericTimer,
        "rollPerceptionChecks": rollPerceptionChecks,
        "enrichJournalEntryWithXp": enrichJournalEntryWithXp,
        "enrichAllJournalEntriesWithXp": enrichAllJournalEntriesWithXp,
        "revertJournalEntryXpEnrichment": revertJournalEntryXpEnrichment,
        "revertAllJournalEntriesWithXp": revertAllJournalEntriesWithXp,
        "clearPf2ePerceptionConditions": clearPf2ePerceptionConditions,
        "checkForPf2ePerceptionConditions": checkForPf2ePerceptionConditions,
    });

    game.keybindings.register(MODULE_NAME, 'select-player-tokens', {
        name: 'Select All Player Tokens',
        hint: 'Deselect all currently selected tokens and select all player owned tokens.',
        editable: [
            {
                key: 'KeyP',
                modifiers: ['Shift']
            }
        ],
        onDown: () => selectAllPlayerTokens(),
        restricted: false,
        reservedModifiers: [],
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });

    log.info("### Initialized! ###");
});

Hooks.once('ready', async function () {
    window.NerpsForFoundry = new NerpsForFoundry();

    if (getSetting('load-custom-css-override')) {
        window.NerpsForFoundry.loadCustomCssOverrides();
    }

    log.info("### Ready! ###");
});

Hooks.on("createCombatant", async (combatant, _options, _userId) => {
    if (!canvas.ready || !game.user.isGM) return;

    const token = canvas.tokens.get(combatant.tokenId);
    if (!token) return;

    // Set token bars and nameplates for the added token only
    await token.document.update({
        "bar1.attribute": "attributes.hp",
        "bar2.attribute": null,
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER
    });

    // Mystify NPC token
    if (token.actor?.type === "npc" && getSetting("auto-mystify-npcs-on-combat-start")) {
        await game.PF2eWorkbench.doMystificationFromToken(token.id, false);
    }
});

Hooks.on("pf2e.startTurn", async (combatant, _combat, userId) => {
    if (!canvas.ready) return;

    if (getSetting("auto-remove-reaction-effects")) {
        await socket.executeAsGM(removeReactions, combatant.actorId, 'turn-start');
    }

    const combatToken = canvas.tokens.get(combatant.tokenId);
    if (!combatToken) return;

    if (getSetting("auto-select-combatant-token")) {
        canvas.tokens.releaseAll();
        combatToken.control({releaseOthers: true});
    }
    if (getSetting("auto-center-combatant-token")) {
        canvas.animatePan({x: combatToken.center.x, y: combatToken.center.y, scale: canvas.stage.scale.x});
    }
});

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE_NAME);
    socket.register("removeReactions", removeReactions);
    socket.register("applyRepair", applyRepair);
    socket.register("repairShield", repairShield); // @deprecated — kept for backward compatibility, use applyRepair
    log.info("SocketLib for Nerps-For_Foundry ready!");
});

async function removeReactions(combatantActorId, expiryText) {
    await window.NerpsForFoundry.RemoveReactionEffects(combatantActorId, expiryText);
}

Hooks.on('getSceneControlButtons', (controls) => {
    if (!canvas || !game.user.isGM) return;

    controls.tokens?.tools && (controls.tokens.tools.levelUpAllowed = {
        name: 'levelUpAllowed',
        title: 'Allow Players to Level Up',
        icon: 'fa-solid fa-hat-wizard',
        visible: game.user.isGM,
        toggle: true,
        active: !getSetting("disable-wizard-level-up"),
        onClick: async () => {
            await toggleSetting("disable-wizard-level-up");
        }
    });
});

Hooks.once('ready', async () => {
    if (!await waitForModule('pf2e-level-up-wizard')) return;

    Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
        // alert("Character Sheet is ready!");
        if (getSetting("disable-wizard-level-up")) {
            const levelUpButton = html[0].querySelector('.char-level button.level-up-icon-button');
            if (levelUpButton) {
                levelUpButton.disabled = true;
                levelUpButton.title = "The gods have not deemed you worth to level up.";
                Object.assign(levelUpButton.style, {
                    opacity: '0.75',
                    filter: 'grayscale(100%)',
                    cursor: 'not-allowed'
                });
            }
        }
    });
});

async function waitForModule(moduleName) {
    const maxWaitTime = 10000; // 10 seconds in milliseconds
    const checkInterval = 500; // Interval to check in milliseconds
    let elapsedTime = 0;

    while (!game.modules.get(moduleName)?.active && elapsedTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsedTime += checkInterval;
        log.info(`Waiting on ${moduleName} module...`);
    }

    if (elapsedTime >= maxWaitTime) {
        log.info(`Timeout: ${moduleName} module did not become active within ${maxWaitTime / 1000} seconds.`);
        return false;
    } else {
        log.info(`${moduleName} module is now ready.`);
        return true;
    }
}

// Disable XP inputs for players
Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
    if (getSetting("disable-xp-inputs") && !game.user.isGM) {
        html
            .find('.char-level')
            .find('input[name="system.details.level.value"]')
            .prop('disabled', true);

        html
            .find('.char-level')
            .find('input[name="system.details.xp.value"]')
            .prop('disabled', true);

        html
            .find('.char-level')
            .find('input[name="system.details.xp.max"]')
            .prop('disabled', true);

        html
            .find('.char-level')
            .find('button.level-up-icon-button')
            .prop('disabled', true);
    }

    html.find('.exp-data').css({'white-space': 'nowrap'});
});

// Create a hook to add a custom token ring configuration. This ring configuration will appear in the settings.
Hooks.on('initializeDynamicTokenRingConfig', (ringConfig) => {
    const rusthengeRing = new foundry.canvas.tokens.DynamicRingData({
        label: 'Rusthenge',
        effects: {
            RING_PULSE: 'TOKEN.RING.EFFECTS.RING_PULSE',
            RING_GRADIENT: 'TOKEN.RING.EFFECTS.RING_GRADIENT',
            BKG_WAVE: 'TOKEN.RING.EFFECTS.BKG_WAVE',
            INVISIBILITY: 'TOKEN.RING.EFFECTS.INVISIBILITY',
        },
        spritesheet: `modules/${MODULE_NAME}/images/rings/rusthenge-sprite-sheet.json`,
    });
    ringConfig.addConfig('rusthengeRing', rusthengeRing);

    const aoaRing = new foundry.canvas.tokens.DynamicRingData({
        label: 'Age of Ashes',
        effects: {
            RING_PULSE: 'TOKEN.RING.EFFECTS.RING_PULSE',
            RING_GRADIENT: 'TOKEN.RING.EFFECTS.RING_GRADIENT',
            BKG_WAVE: 'TOKEN.RING.EFFECTS.BKG_WAVE',
            INVISIBILITY: 'TOKEN.RING.EFFECTS.INVISIBILITY',
        },
        spritesheet: `modules/${MODULE_NAME}/images/rings/age-of-ashes-sprite-sheet.json`,
    });
    ringConfig.addConfig('aoaRing', aoaRing);

    const sdofRing = new foundry.canvas.tokens.DynamicRingData({
        label: 'Seven Dooms of Sandpoint',
        effects: {
            RING_PULSE: 'TOKEN.RING.EFFECTS.RING_PULSE',
            RING_GRADIENT: 'TOKEN.RING.EFFECTS.RING_GRADIENT',
            BKG_WAVE: 'TOKEN.RING.EFFECTS.BKG_WAVE',
            INVISIBILITY: 'TOKEN.RING.EFFECTS.INVISIBILITY',
        },
        spritesheet: `modules/${MODULE_NAME}/images/rings/seven-dooms-of-sandpoint-sprite-sheet.json`,
    });
    ringConfig.addConfig('sdofRing', sdofRing);

    const bloodLordsNpcRing = new foundry.canvas.tokens.DynamicRingData({
        label: 'Blood Lord\'s NPC',
        effects: {
            RING_PULSE: 'TOKEN.RING.EFFECTS.RING_PULSE',
            RING_GRADIENT: 'TOKEN.RING.EFFECTS.RING_GRADIENT',
            BKG_WAVE: 'TOKEN.RING.EFFECTS.BKG_WAVE',
            INVISIBILITY: 'TOKEN.RING.EFFECTS.INVISIBILITY',
        },
        spritesheet: `modules/${MODULE_NAME}/images/rings/blood-lords-npc-sprite-sheet.json`,
    });
    ringConfig.addConfig('bloodLordsNpcRing', bloodLordsNpcRing);

    const bloodLordsPcRing = new foundry.canvas.tokens.DynamicRingData({
        label: 'Blood Lord\'s PC',
        effects: {
            RING_PULSE: 'TOKEN.RING.EFFECTS.RING_PULSE',
            RING_GRADIENT: 'TOKEN.RING.EFFECTS.RING_GRADIENT',
            BKG_WAVE: 'TOKEN.RING.EFFECTS.BKG_WAVE',
            INVISIBILITY: 'TOKEN.RING.EFFECTS.INVISIBILITY',
        },
        spritesheet: `modules/${MODULE_NAME}/images/rings/blood-lords-pc-sprite-sheet.json`,
    });
    ringConfig.addConfig('bloodLordsPcRing', bloodLordsPcRing);
});

// Fix thrall auto-deletion on expiration for PF2e Summons Assistant
Hooks.on("deleteItem", async (effect, info) => {
    log.debug(`Deleting item: ${effect}`);
    if (!game.user.isGM || effect.rollOptionSlug !== "thrall-expiration-date") return;

    log.debug(`Deleting Thrall: ${info}`);

    const actor = info?.parent?.parent?.constructor?.name === "TokenDocumentPF2e"
        ? game.actors.get(info.parent.parent.actorId)
        : info?.parent?.constructor?.name === "NPCPF2e"
            ? info.parent
            : null;

    if (!actor) return;
    if (!game.tcal.isTransientActor(actor)) return;

    try {
        // Delete all tokens of this actor from all scenes
        for (let scene of game.scenes) {
            const tokensToDelete = scene.tokens.filter(t => t.actor?.id === actor.id);
            if (tokensToDelete.length > 0) {
                await scene.deleteEmbeddedDocuments("Token", tokensToDelete.map(t => t.id));
            }
        }

        // Delete the actor itself
        await actor.delete();
    } catch (error) {
        console.warn(`${MODULE_ID} | Could not delete transient actor:`, error);
    }
});
