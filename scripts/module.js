import { Nerps } from "./lib/Nerps.js";

Hooks.once('init', async function () {
	console.log(`%c

    _   __ ______ ____   ____  _____
   / | / // ____// __ \\ / __ \\/ ___/
  /  |/ // __/  / /_/ // /_/ /\\__ \\
 / /|  // /___ / _, _// ____/___/ /
/_/ |_//_____//_/ |_|/_/    /____/

v3.0.0
`, `font-family: monospace`);

	console.log("### Nerps for Foundry Initialized")
	// CONFIG.debug.hooks = true;

	game.settings.register("Nerps-For-Foundry", "reminder-active", {
		name: "Reminder Active",
		hint: "Toggle Hero Point Reminder on or off.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "next-reminder-timestamp", {
		name: "Next Reminder",
		hint: "This stores the timestamp for the next Hero Point reminder",
		type: Number,
		default: 0,
		scope: "world",
		config: false,
	});

	game.settings.register("Nerps-For-Foundry", "auto-remove-frightened", {
		name: "Auto-Reduce Frightened Condition",
		hint: "Automatically Reduce Frightened condition by 1 at end combatants turn.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "auto-remove-expired-effects", {
		name: "Auto-Remove Expired Effects",
		hint: "[EXPERIMENTAL] Automatically remove expired effects during combat.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "auto-remove-delay", {
		name: "Auto Remove Effects Delay",
		hint: "[EXPERIMENTAL] Do not remove expired effects for x milliseconds on combat turns.",
		type: Number,
		default: 0,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "auto-correct-journal-entry", {
		name: "Autocorrect Journal Entries",
		hint: "[EXPERIMENTAL] Will attempt to correct text pasted from PDF.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "auto-correct-rules", {
		name: "Autocorrect RegEx Rules",
		hint: "[EXPERIMENTAL] Use these regular expressions to auto-correct journal entries on paste.",
		type: String,
		default: `[ { "name": "Remove paragraph tags", "find": "<p>", "replace": "" }, { "name": "Remove paragraph end tags", "find": "</p>", "replace": "" }, { "name": "Replace non breaking spaces", "find": "&nbsp;", "replace": " " }, { "name": "Remove double spaces", "find": "[ ]+", "replace": " " }, { "name": "Remove trailing and leading whitespace", "find": "^s*(.*)s*$", "replace": "$1" }, { "name": "Add paragraph breaks", "find": "\\\\.([A-Z])", "replace": ".</p>\\n<p>$1" }, { "name": "Fix stupid F", "find": " f ", "replace": " f" }, { "name": "Fix stupid Jorgenfist", "find": "Jorgenf ist", "replace": "Jorgenfist" }, { "name": "Find Special Keywords", "find": "(TRAP|DEVELOPMENT|CREATURE|CREATURES|TREASURE|TACTICS|HAUNT|STORY AWARD): ", "replace": "</p>\\n<br />\\n<h4>$1</h4>\\n<p>" }, { "name": "Find Tactics", "find": "(TACTICS)", "replace": "</p>\\n<br />\\n<h4>$1</h4>\\n<p>" }, { "name": "Highlight DC Checks", "find": "(DC [0-9]+.*check)", "replace": "<code>$1</code>" } ]`,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "auto-correct-f-words", {
		name: "Autocorrect F words",
		hint: "[EXPERIMENTAL] Copy from PDFoundry oddly adds a space after the 'f' in many words.",
		type: String,
		default: `Jorgenf ist, inf luence, aff luent, campf ire`,
		scope: "world",
		config: true,
	});

	game.settings.register("Nerps-For-Foundry", "debug-mode", {
		name: "Toggle Debug Mode",
		hint: "If checked, will enable Debug level logging.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});
});
