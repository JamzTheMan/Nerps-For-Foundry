import { Nerps } from "./lib/Nerps.js";

Hooks.once('init', async function () {
	console.log(`%c

    _   __ ______ ____   ____  _____
   / | / // ____// __ \\ / __ \\/ ___/
  /  |/ // __/  / /_/ // /_/ /\\__ \\
 / /|  // /___ / _, _// ____/___/ /
/_/ |_//_____//_/ |_|/_/    /____/


`, `font-family: monospace`);

	console.log("### Nerps for Foundry Initialized")

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

	game.settings.register("Nerps-For-Foundry", "reminder-active", {
		name: "Reminder Active",
		hint: "Toggle Hero Point Reminder on or off.",
		type: Boolean,
		default: false,
		scope: "world",
		config: true,
	});
});
