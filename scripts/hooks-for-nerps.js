import {registerSettings, getSetting, setSetting} from "./settings-for-nerps.js";
import {NerpsForFoundry, addEffectItem, removeEffectItem, heroPointReminder, heroPointReminderTime, log} from "./nerps-for-foundry.js";

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
v${game.modules.get("Nerps-For-Foundry").data.version}
`, `font-family: monospace`); // Small

  registerSettings();
  log.info("### Initialized! ###");
});

Hooks.once('ready', async function () {
  window.NerpsForFoundry = new NerpsForFoundry();

  if (game.user.isGM) {
    let nextTimer = getSetting("next-reminder-timestamp");
    // log.info(`NerpsForFoundry! Next timer is ${nextTimer}`);

    if (nextTimer <= Date.now()) {
      nextTimer = Date.now() + heroPointReminderTime;
      setSetting({key: "next-reminder-timestamp", value: nextTimer});
    }

    // log.info(`NerpsForFoundry! Next timer is ${nextTimer}`);
    heroPointReminder(nextTimer);
  }

  log.info("### Ready! ###");
});

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("Nerps-For-Foundry");
  socket.register("addEffect", addEffectItem);
  socket.register("removeEffect", removeEffectItem);
});

Hooks.on("pf2e.startTurn", async (combatant, _combat, userId) => {
  if (canvas.ready && game.user.isGM) {
    if (getSetting("auto-remove-expired-effects")) {
      await game.pf2e.effectTracker.removeExpired();
    }

    if (getSetting("auto-remove-reaction-effects")) {
      await window.NerpsForFoundry.RemoveReactionEffects(combatant, 'turn-start');
    }
  }

  if (!game.user.isGM && getSetting("auto-process-healing-temp-fix")) {
    log.debug("default actor?");
    log.debug(combatant.token);
    PF2EPersistentDamage.processHealing(combatant.token);
  }
});

Hooks.on("pf2e.endTurn", async (combatant, _combat, userId) => {
  if (canvas.ready && game.user.isGM) {
    if (getSetting("auto-remove-frightened")) {
      await combatant.actor.decreaseCondition("frightened");
    }

    if (getSetting("auto-remove-reaction-effects")) {
      await window.NerpsForFoundry.RemoveReactionEffects(combatant, 'turn-end');
    }
  }
});

/**
 * Capture Fast Healing/Regen Events
 */
Hooks.on("renderChatMessage", async (message, data, html) => {
  if (canvas.ready && game.user.isGM) {
    if (getSetting("auto-process-persistent-damage")) {
      if ('persistent' in message.data.flags) {
        let damageAmount = message.roll.total * -1;
        let chatActor = game.actors.get(message.data.speaker.actor);
        chatActor.modifyTokenAttribute("attributes.hp", damageAmount, true, true)

        ChatMessage.create({
          content: `${damageAmount} HP was automatically applied.`,
          speaker: message.data.speaker,
          flavor: $(message.data.flavor).filter('div').text().trim().split('\n')[0]
        });
      }

      if (getSetting("auto-process-healing")) {
        const msgFlavorTxt = $(message.data.flavor).filter('div').text().trim();

        if (msgFlavorTxt == "Received healing (Fast Healing)" || msgFlavorTxt == "Received healing (Regeneration)") {
          let healingAmount = message.roll.total;
          let chatActor = game.actors.get(message.data.speaker.actor);
          chatActor.modifyTokenAttribute("attributes.hp", healingAmount, true, true)

          ChatMessage.create({
            content: `+${healingAmount} HP was automatically applied.`,
            speaker: message.data.speaker,
            flavor: `<span>${msgFlavorTxt}</span>`
          });
        }
      }
    }
  }
});

/**
 * Run PDF post edit rules
 */
Hooks.on("preUpdateJournalEntry", async (journalEntry, update) => {
  if (!getSetting("auto-correct-journal-entry")) {
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

  const rules = JSON.parse(getSetting("auto-correct-rules"));
  rules.forEach(rule => {
    log.debug(`Rule name: ${rule.name}`);
    log.debug(`Rule find: "${rule.find}"`);
    log.debug(`Rule replace: ${rule.replace}`);

    newContent = newContent.replaceAll(rule.find, rule.replace);
    log.debug(`---------------------------------`)
    log.debug(`newContent: ${newContent}`)
  });

  const fWords = getSetting("auto-correct-f-words");
  fWords.split(/\s*,\s*/).forEach(word => {
    log.debug(`Fixing all occurrences of "${word}"`);
    newContent = newContent.replaceAll(word, word.replaceAll(" ", ""));
  })

  update.content = `<article data-auto-corrected="true"><p>${newContent}</p></article>`;

  log.debug(`---------------------------------`)
  log.debug(`New content: ${update.content}`)
});