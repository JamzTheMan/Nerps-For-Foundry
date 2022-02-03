import {MODULE_NAME} from "./constants.js";

// Register any custom module settings here
export const registerSettings = function () {
  const debouncedReload = foundry.utils.debounce(function () {
    window.location.reload();
  }, 100);

  game.settings.register(MODULE_NAME, "reminder-active", {
    name: "Reminder Active",
    hint: "Toggle Hero Point Reminder on or off.",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "next-reminder-timestamp", {
    name: "Next Reminder",
    hint: "This stores the timestamp for the next Hero Point reminder",
    type: Number,
    default: 0,
    scope: "world",
    config: false,
  });

  game.settings.register(MODULE_NAME, "auto-process-persistent-damage", {
    name: "Auto-Process Persistent Damage",
    hint: "Automatically damages actor when PF2EPersistentDamage module posts chat message.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-process-healing", {
    name: "Auto-Process Fast Healing & Regeneration",
    hint: "Automatically heals actor when PF2EPersistentDamage module posts chat message.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-remove-frightened", {
    name: "Auto-Reduce Frightened Condition",
    hint: "Automatically Reduce Frightened condition by 1 at end combatants turn.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-remove-expired-effects", {
    name: "Auto-Remove Expired Effects",
    hint: "Automatically remove expired effects during combat. (xdy-pf2e-workbench has same functionality)",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-remove-reaction-effects", {
    name: "Auto-Remove Reaction Effects",
    hint: "Automatically remove effects that start with the name 'Reaction: ' at the start (or end based on duration settings) of the tokens turn in combat.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "load-custom-css-override", {
    name: "Load Custom CSS",
    hint: "Loads custom CSS rules to override various module CSS I fixed to my liking.",
    type: Boolean,
    default: true,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-correct-journal-entry", {
    name: "Autocorrect Journal Entries",
    hint: "[EXPERIMENTAL] Will attempt to correct text pasted from PDF.",
    type: Boolean,
    default: false,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-correct-rules", {
    name: "Autocorrect RegEx Rules",
    hint: "[EXPERIMENTAL] Use these regular expressions to auto-correct journal entries on paste.",
    type: String,
    default: `[ { "name": "Remove paragraph tags", "find": "<p>", "replace": "" }, { "name": "Remove paragraph end tags", "find": "</p>", "replace": "" }, { "name": "Replace non breaking spaces", "find": "&nbsp;", "replace": " " }, { "name": "Remove double spaces", "find": "[ ]+", "replace": " " }, { "name": "Remove trailing and leading whitespace", "find": "^s*(.*)s*$", "replace": "$1" }, { "name": "Add paragraph breaks", "find": "\\\\.([A-Z])", "replace": ".</p>\\n<p>$1" }, { "name": "Fix stupid F", "find": " f ", "replace": " f" }, { "name": "Fix stupid Jorgenfist", "find": "Jorgenf ist", "replace": "Jorgenfist" }, { "name": "Find Special Keywords", "find": "(TRAP|DEVELOPMENT|CREATURE|CREATURES|TREASURE|TACTICS|HAUNT|STORY AWARD): ", "replace": "</p>\\n<br />\\n<h4>$1</h4>\\n<p>" }, { "name": "Find Tactics", "find": "(TACTICS)", "replace": "</p>\\n<br />\\n<h4>$1</h4>\\n<p>" }, { "name": "Highlight DC Checks", "find": "(DC [0-9]+.*check)", "replace": "<code>$1</code>" } ]`,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "auto-correct-f-words", {
    name: "Autocorrect F words",
    hint: "[EXPERIMENTAL] Copy from PDFoundry oddly adds a space after the 'f' in many words.",
    type: String,
    default: `Jorgenf ist, inf luence, aff luent, campf ire`,
    scope: "world",
    config: true,
  });

  game.settings.register(MODULE_NAME, "debug-mode", {
    name: "Toggle Debug Mode",
    hint: "If checked, will enable Debug level logging.",
    type: Boolean,
    default: false,
    scope: "client",
    config: true,
  });
};
