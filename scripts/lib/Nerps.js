/*
 * Where all the magic happens...
*/

let socket;
// let localNerps;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("Nerps-For-Foundry");
	socket.register("addEffect", addEffectItem);
	socket.register("removeEffect", removeEffectItem);
});

Hooks.once('ready', async function () {
	window.Nerps = new Nerps();
	// localNerps = new Nerps();

	console.log("### Nerps for Foundry Ready!");

	// localNerps.sendMessage("WEEEEE!");

	if (game.user.isGM) {
		// heroPointReminder();
	}
});

function heroPointReminder() {
	const interval = 1000 * 60 * 60
	const maxIterations = 8
	let interation = 1
	let messageContent = "Maybe it's time to award a hero point? hint hint."

	ui.notifications.info("I'll remind you to hand out hero points every hour for the next " + maxIterations + " hours")

	let heroPointReminder = setInterval(function () {
		let roll = new Roll("20dc").roll()

		ui.notifications.info(messageContent)

		let chatData = {
			user: game.user._id,
			speaker: ChatMessage.getSpeaker(),
			flavor: messageContent,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			roll
		}
		ChatMessage.create(chatData, {})

		// If the count down is finished, write some text
		if (interation++ >= maxIterations) {
			clearInterval(heroPointReminder);
		}
	}, interval);
}


function addEffectItem(targetActorId, effectItemName) {
	let targetActor = game.actors.get(targetActorId);
	
	// console.log("Nerps: targetActor is instance of Actor?", targetActor instanceof Actor);

	// ui.notifications.info(`Adding item ${effectItemName}`);
	console.log("Nerps: targetActor", targetActor);
	console.log("Nerps: effectItemName", effectItemName);

	let effectItem = game.items.getName(effectItemName);
	if (effectItem != null) {
		console.log("Nerps: EFFECT ITEM:", effectItem);
		targetActor.createOwnedItem(effectItem.data);
	} else {
		console.log(`Nerps: Unable to find item named ${effectItemName}`)
	}
}

async function removeEffectItem(targetActorId, effectItemName) {
	let targetActor = game.actors.get(targetActorId);

	let effectItems = targetActor.items.filter(item => item.type === 'effect' && item.name.includes(effectItemName));
	for (let effectItem of effectItems) {
		await effectItem.delete();
	}
}

export class Nerps {
	async addEffect(targetActorId, effectItemName) {
		console.log(`Nerps.addEffectItem: targetActorId = ${targetActorId}`);
		console.log(`Nerps.addEffectItem: effectItemName = ${effectItemName}`);

		socket.executeAsGM(addEffectItem, targetActorId, effectItemName);
	}

	async removeEffect(targetActorId, effectItemName) {
		await socket.executeAsGM(removeEffectItem, targetActorId, effectItemName);
	}
}