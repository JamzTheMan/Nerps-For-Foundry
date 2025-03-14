import {autoCorrectJournalContent} from "./autocorrect-journal-content.js"
import {JOURNAL_MARKER, MODULE_NAME} from "./constants.js";
import {adjustShieldHP} from "./macros/adjust-shield-hp.js";
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
import {repairShield, repairTargetsShield} from "./macros/repair-targets-shield.js";
import {rollPerceptionChecks} from "./macros/roll-perception-checks.js";
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

    if (getSetting('journal-editor-tools')) {
        tinymce.PluginManager.add("nerpsJournalFix", function (editor) {
            editor.ui.registry.addButton("nerpsJournalFix", {
                tooltip: "Apply autocorrections to journal, infused with Nerps.",
                icon: "format-painter",
                onAction: function () {
                    editor.setDirty(true)
                    const selectedContent = editor.selection.getContent();
                    if (selectedContent === "") {
                        const newJournalContent = autoCorrectJournalContent(editor.getContent());
                        editor.setContent(newJournalContent);
                    } else {
                        const newSelectedContent = autoCorrectJournalContent(selectedContent);
                        editor.selection.setContent(newSelectedContent);
                    }

                    const newContent = editor.getContent().replaceAll(JOURNAL_MARKER, "");
                    editor.setContent(`${newContent}`);
                    // editor.setContent(`${newContent}\n${JOURNAL_MARKER}`);
                },
            });
        });

        tinymce.PluginManager.add("nerpsJournalPasteAndFix", function (editor) {
            editor.ui.registry.addButton("nerpsJournalPasteAndFix", {
                tooltip: "Paste from clipboard with autocorrections, infused with Nerps, to the journal.",
                icon: "paste",
                onAction: function () {
                    editor.setDirty(true)
                    navigator.clipboard.readText().then(pasteContent => {
                        editor.insertContent(autoCorrectJournalContent(pasteContent));
                        const newContent = editor.getContent().replaceAll(JOURNAL_MARKER, "");
                        editor.setContent(`${newContent}`);
                        // editor.setContent(`${newContent}\n${JOURNAL_MARKER}`);
                    })
                },
            });
        });

        // Convenience button to set text to block quote and font size 14
        tinymce.PluginManager.add("nerpsJournalBlockquote", function (editor) {
            editor.ui.registry.addButton("nerpsJournalBlockquote", {
                tooltip: "Format selected text, infused with Nerps, to the journal.",
                icon: "quote",
                onAction: function () {
                    const selectedContent = editor.selection.getContent();
                    if (selectedContent !== "") {
                        editor.setDirty(true)
                        editor.execCommand("mceBlockQuote");
                        editor.execCommand('FontSize', false, '14pt');
                    }
                },
            });
        });

        CONFIG.TinyMCE.plugins = CONFIG.TinyMCE.plugins + " nerpsJournalFix nerpsJournalPasteAndFix nerpsJournalBlockquote";
        CONFIG.TinyMCE.toolbar = CONFIG.TinyMCE.toolbar + " nerpsJournalFix nerpsJournalPasteAndFix nerpsJournalBlockquote";
    }

    /*
      Export out functions to be used in macro scripts...
     */
    log.info("Exposing macro functions...")
    game.nerps = mergeObject(game.nerps ?? {}, {
        "measureTokenDistance": measureTokenDistance,
        "repairTargetsShield": repairTargetsShield,
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
        "revertAllJournalEntriesWithXp": revertAllJournalEntriesWithXp
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

Hooks.on("pf2e.startTurn", async (combatant, _combat, userId) => {
    if (canvas.ready) {
        if (getSetting("auto-remove-reaction-effects")) {
            // await removeReactions(combatant, 'turn-start');
            await socket.executeAsGM(removeReactions, combatant.actorId, 'turn-start');
        }
    }
});

Hooks.on("pf2e.endTurn", async (combatant, _combat, userId) => {
    if (canvas.ready) {
        if (getSetting("auto-remove-reaction-effects")) {
            await socket.executeAsGM(removeReactions, combatant.actorId, 'turn-end');
        }
    }
});

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE_NAME);
    socket.register("removeReactions", removeReactions);
    socket.register("repairShield", repairShield);
    log.info("SocketLib for Nerps-For_Foundry ready!");
});

async function removeReactions(combatantActorId, expiryText) {
    await window.NerpsForFoundry.RemoveReactionEffects(combatantActorId, expiryText);
}

Hooks.on('getSceneControlButtons', (controls) => {
    if (!canvas) return;

    const tokenLayer = controls.find(control => control.name === "token");
    if (tokenLayer) {
        tokenLayer.tools.push({
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
    }
});

Hooks.once('ready', async () => {
    await waitForModule('pf2e-level-up-wizard');
    // alert("Level Up Button is ready!");

    log.info("pf2e-level-up-wizard module is now ready.");

    Hooks.on('renderCharacterSheetPF2e', (app, html, data) => {
        // alert("Character Sheet is ready!");
        if (getSetting("disable-wizard-level-up")) {
            html
                .find('.char-level')
                .find('button[title="Level Up!"]')
                .prop('disabled', true)
                .attr('title', "Your GM hasn't given you permission to level up.");
        }

    });
});

async function waitForModule(moduleName) {
    const maxWaitTime = 10000; // 1 minute in milliseconds
    const checkInterval = 500; // Interval to check in milliseconds
    let elapsedTime = 0;

    while (!game.modules.get(moduleName)?.active && elapsedTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsedTime += checkInterval;
        log.info(`Waiting on ${moduleName} module...`);
    }

    if (elapsedTime >= maxWaitTime) {
        log.info(`Timeout: ${moduleName} module did not become active within ${maxWaitTime / 1000} seconds.`);
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
});
