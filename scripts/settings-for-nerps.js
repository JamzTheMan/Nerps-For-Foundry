import {MODULE_NAME} from "./constants.js";

// Register any custom module settings here
export const registerSettings = function () {
    const debouncedReload = foundry.utils.debounce(function () {
        window.location.reload();
    }, 100);

    game.settings.register(MODULE_NAME, "auto-remove-reaction-effects", {
        name: "Auto-Remove Reaction Effects",
        hint: "Automatically remove effects that start with the name 'Reaction: ' at the start (or end based on duration settings) of the tokens turn in combat.",
        type: Boolean,
        default: true,
        scope: "world",
        config: true,
    });

    game.settings.register(MODULE_NAME, "disable-xp-inputs", {
        name: "Disable PC XP Inputs for Players",
        hint: "If checked, will disable XP value and max inputs for players.",
        type: Boolean,
        default: false,
        scope: "world",
        config: true
    });

    game.settings.register(MODULE_NAME, "disable-wizard-level-up", {
        name: "Disable Level Up Wizard",
        hint: "If checked, players will not see the level up wizard when they level up. Use the Scene Controls to toggle this setting.",
        type: Boolean,
        default: true,
        scope: "world",
        config: true,
        onChange: () => {
            Object.values(ui.windows)
                .filter(appV1 => appV1.document?.type === "character")
                .forEach(appV1 => appV1.render({force: true}));

            foundry.applications.instances.values()
                .filter(appV1 => appV1.document?.type === "character")
                .forEach(appV1 => appV2.render({force: true}));
        }
    });

    game.settings.register(MODULE_NAME, "load-custom-css-override", {
        name: "Load Custom CSS",
        hint: "Loads custom CSS rules to override various module CSS I fixed to my liking.",
        type: Boolean,
        default: true,
        scope: "world",
        config: true
    });

    game.settings.register(MODULE_NAME, "journal-editor-tools", {
        name: "Add Autocorrect toolbar buttons to Journal Editor",
        hint: "Tools to attempt to correct text pasted from PDF.",
        type: Boolean,
        default: false,
        scope: "world",
        config: true,
        onChange: debouncedReload
    });

    game.settings.register(MODULE_NAME, "additional-auto-correct-rules", {
        name: "Autocorrect RegEx Rules",
        hint: "Add these regular expressions to auto-correct default rules.",
        type: String,
        default: `[]`,
        scope: "world",
        config: true
    });

    game.settings.register(MODULE_NAME, "auto-correct-f-words", {
        name: "Autocorrect F words",
        hint: "[EXPERIMENTAL] Copy from PDFoundry oddly adds a space after the 'f' in many words.",
        type: String,
        default: `Jorgenf ist, inf luence, aff luent, campf ire`,
        scope: "world",
        config: true
    });

    game.settings.register(MODULE_NAME, "debug-mode", {
        name: "Toggle Debug Mode",
        hint: "If checked, will enable Debug level logging.",
        type: Boolean,
        default: false,
        scope: "client",
        config: true
    });

    game.settings.register(MODULE_NAME, "auto-select-combatant-token", {
        name: "Auto-Select Combatant Token",
        hint: "Automatically select the current combatant's token at turn start.",
        type: Boolean,
        default: true,
        scope: "client",
        config: true
    });

    game.settings.register(MODULE_NAME, "auto-center-combatant-token", {
        name: "Auto-Center Combatant Token",
        hint: "Automatically center the view on the current combatant's token at turn start.",
        type: Boolean,
        default: true,
        scope: "client",
        config: true
    });

    game.settings.register(MODULE_NAME, "auto-mystify-npcs-on-combat-start", {
        name: "Auto-Mystify NPCs on Combat Start",
        hint: "Automatically mystify NPC tokens when combat starts (requires PF2e Workbench module).",
        type: Boolean,
        default: true,
        scope: "world",
        config: true
    });
};
