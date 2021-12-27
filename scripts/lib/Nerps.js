/*
 * Where all the magic happens...
*/

let socket;
let log;

const heroPointReminderTime = 60 * 60000;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("Nerps-For-Foundry");
  socket.register("addEffect", addEffectItem);
  socket.register("removeEffect", removeEffectItem);
});

Hooks.once('ready', async function () {
  window.Nerps = new Nerps();
  log = new Logger();

  log.info("### Nerps for Foundry Ready!");

  if (game.user.isGM) {
    let nextTimer = game.settings.get("Nerps-For-Foundry", "next-reminder-timestamp");
    // console.log(`Nerps! Next timer is ${nextTimer}`);

    if (nextTimer <= Date.now()) {
      nextTimer = Date.now() + heroPointReminderTime;
      game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer);
    }

    // console.log(`Nerps! Next timer is ${nextTimer}`);
    heroPointReminder(nextTimer);
  }
});

// if (game.user.getFlag('pf2e', 'settings.showEffectPanel') ?? true) {
// 	game.pf2e.effectPanel.render(true);
// }

/**
 * Start of turn event.
 */
Hooks.on("updateCombat", async () => {
  log.debug("updateCombat :: auto-remove-frightened: " + game.settings.get("Nerps-For-Foundry", "auto-remove-frightened"))
  log.debug("updateCombat :: auto-remove-expired-effects: " + game.settings.get("Nerps-For-Foundry", "auto-remove-expired-effects"))

  if (canvas.ready && game.user.isGM) {
    if (game.settings.get("Nerps-For-Foundry", "auto-remove-expired-effects")) {
      await window.Nerps.RemoveReactionEffects(game.combat.combatant);
      await game.pf2e.effectTracker.removeExpired();
    }
  }
});

/**
 * End of turn event.
 */
Hooks.on("preUpdateCombat", async (combat, update) => {
  if (canvas.ready && game.user.isGM) {
    if (game.settings.get("Nerps-For-Foundry", "auto-remove-frightened")) {
      canvas.tokens.get(combat?.current?.tokenId).actor.decreaseCondition("frightened")
    }
  }
});

Hooks.on("preUpdateJournalEntry", async (journalEntry, update) => {
  if (!game.settings.get("Nerps-For-Foundry", "auto-correct-journal-entry")) {
    log.info(`auto-correct-journal-entry off, skipping!;`);
    return;
  }

  let newContent = update.content;
  if (newContent == null) {
    return; // Nothing to do!
  }

  const autoCorrected = newContent.search(`<article data-auto-corrected="true">`);
  if (autoCorrected >= 0) {
    log.debug(`Already autocorrected? ${autoCorrected}`);
    return;
  }

  const rules = JSON.parse(game.settings.get("Nerps-For-Foundry", "auto-correct-rules"));
  rules.forEach(rule => {
    log.debug(`Rule name: ${rule.name}`);
    log.debug(`Rule find: "${rule.find}"`);
    log.debug(`Rule replace: ${rule.replace}`);

    newContent = newContent.replaceAll(rule.find, rule.replace);
    log.debug(`---------------------------------`)
    log.debug(`newContent: ${newContent}`)
  });

  const fWords = game.settings.get("Nerps-For-Foundry", "auto-correct-f-words");
  fWords.split(/\s*,\s*/).forEach(word => {
    log.debug(`Fixing all occurrences of "${word}"`);
    newContent = newContent.replaceAll(word, word.replaceAll(" ", ""));
  })

  update.content = `<article data-auto-corrected="true"><p>${newContent}</p></article>`;

  log.debug(`---------------------------------`)
  log.debug(`New content: ${update.content}`)
});

function delayCall() {
  const delay = game.settings.get("Nerps-For-Foundry", "auto-remove-delay");
  log.debug(`Delaying promise ${delay} ms.`)
  return function () {
    return new Promise(resolve => setTimeout(() => resolve(), delay));
  };
}

function heroPointReminder(nextReminderTimestamp) {
  const nextReminder = nextReminderTimestamp - Date.now();
  let reminderMin = Math.floor(nextReminder / 60000);
  let reminderSeconds = Math.floor((nextReminder - (reminderMin * 60000)) / 1000);

  if (!game.settings.get("Nerps-For-Foundry", "reminder-active")) {
    log.debug("game settings timer turned off!")
  } else {
    ui.notifications.info(`I'll remind you to hand out hero points in ${reminderMin} minutes, ${reminderSeconds} seconds.`)
    log.debug("game settings timer turned on!")
  }

  let heroPointReminder = setTimeout(heroPointReminderAlert, nextReminder);
}

function heroPointReminderAlert() {
  let nextTimer = game.settings.get("Nerps-For-Foundry", "next-reminder-timestamp");
  if (nextTimer > Date.now()) {
    log.info("Game settings timer was reset, skipping...")
  } else {
    if (game.settings.get("Nerps-For-Foundry", "reminder-active")) {
      let messageContent = "Maybe it's time to award a hero point? hint hint."
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
    } else {
      log.debug("game settings timer turned off, skipping alert...")
    }
  }

  nextTimer = Date.now() + heroPointReminderTime;
  game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer);

  log.debug(`Next timer is ${nextTimer}`);
  heroPointReminder(nextTimer);

}

function addEffectItem(targetActorId, effectItemName) {
  let targetActor = game.actors.get(targetActorId);

  // ui.notifications.info(`Adding item ${effectItemName}`);
  log.debug("addEffectItem targetActor", targetActor);
  log.debug("addEffectItem effectItemName", effectItemName);

  let effectItem = game.items.getName(effectItemName);
  if (effectItem != null) {
    log.debug("addEffectItem EFFECT ITEM:", effectItem);
    targetActor.createOwnedItem(effectItem.data);
  } else {
    log.info(`Unable to find item named ${effectItemName}`)
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
    socket.executeAsGM(addEffectItem, targetActorId, effectItemName);
  }

  async RemoveReactionEffects(currentCombatant) {
    let reactionEffectIds = currentCombatant.actor.items
    .filter(item => item.type === 'effect')
    .filter(item => item.name.startsWith('Reaction: '))
    .map(item => item.id);

    await currentCombatant.actor.deleteEmbeddedDocuments("Item", reactionEffectIds);
  }

  async removeEffect(targetActorId, effectItemName) {
    await socket.executeAsGM(removeEffectItem, targetActorId, effectItemName);
  }

  toggleHeroPointReminder() {
    let currentSetting = game.settings.get("Nerps-For-Foundry", "reminder-active");
    game.settings.set("Nerps-For-Foundry", "reminder-active", !currentSetting)

    if (currentSetting) {
      ui.notifications.info(`Hero Point Reminder is now off!`)
    } else {
      ui.notifications.info(`Hero Point Reminder is now on!`)

      let nextTimer = game.settings.get("Nerps-For-Foundry", "next-reminder-timestamp");
      log.debug(`toggleHeroPointReminder :: Next timer is ${nextTimer}`);

      if (nextTimer <= Date.now()) {
        nextTimer = Date.now() + heroPointReminderTime;
        game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer);
      }
    }
  }

  resetHeroPointReminder() {
    ui.notifications.info(`Hero Point Reminder timer reset.`)

    let nextTimer = Date.now() + heroPointReminderTime;
    game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer)
  }
}

/*
 Custom logger class
 TODO: Change debug mode boolean to a choice and use log levels that mirror java loggers
 */
export class Logger {
  info(...args) {
    try {
      console.log("Nerps!", '|', ...args);
    } catch (e) {
    }
  }

  debug(...args) {
    try {
      const isDebugging = game.settings.get("Nerps-For-Foundry", "debug-mode");

      if (isDebugging) {
        console.log("Nerps!", '|', ...args);
      }
    } catch (e) {
    }
  }
}