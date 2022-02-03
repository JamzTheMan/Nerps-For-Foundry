import {MODULE_PATH} from "./constants.js";
import {getSetting, setSetting} from "./utils/extensions.js";
import {Logger} from "./utils/logger.js";

// CONFIG.debug.hooks = true;
export const heroPointReminderTime = 60 * 60000;
export let log = new Logger();

let socket;

export let i18n = key => {
  return game.i18n.localize(key);
};

export function heroPointReminder(nextReminderTimestamp) {
  const nextReminder = nextReminderTimestamp - Date.now();
  let reminderMin = Math.floor(nextReminder / 60000);
  let reminderSeconds = Math.floor((nextReminder - (reminderMin * 60000)) / 1000);

  if (!getSetting("reminder-active")) {
    log.debug("game settings timer turned off!")
  } else {
    ui.notifications.info(`I'll remind you to hand out hero points in ${reminderMin} minutes, ${reminderSeconds} seconds.`)
    log.debug("game settings timer turned on!")
  }

  setTimeout(heroPointReminderAlert, nextReminder);
}

function heroPointReminderAlert() {
  let nextTimer = getSetting("next-reminder-timestamp");
  if (nextTimer > Date.now()) {
    log.info("Game settings timer was reset, skipping...")
  } else {
    if (getSetting("reminder-active")) {
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
  setSetting("next-reminder-timestamp", nextTimer);

  log.debug(`Next timer is ${nextTimer}`);
  heroPointReminder(nextTimer);
}

export class NerpsForFoundry {
  async addEffect(targetActorId, effectItemName) {
    socket.executeAsGM(addEffectItem, targetActorId, effectItemName);
  }

  async RemoveReactionEffects(currentCombatant, expiryText) {
    let reactionEffectIds = currentCombatant.actor.items
                                            .filter(item => item.type === 'effect')
                                            .filter(item => item.name.startsWith('Reaction: '))
                                            .filter(item => item.data.data.duration.expiry === expiryText)
                                            .map(item => item.id);

    await currentCombatant.actor.deleteEmbeddedDocuments("Item", reactionEffectIds);
  }

  async removeEffect(targetActorId, effectItemName) {
    await socket.executeAsGM(removeEffectItem, targetActorId, effectItemName);
  }

  toggleHeroPointReminder() {
    let currentSetting = getSetting("reminder-active");
    setSetting("reminder-active", !currentSetting);

    if (currentSetting) {
      ui.notifications.info(`Hero Point Reminder is now off!`)
    } else {
      ui.notifications.info(`Hero Point Reminder is now on!`)

      let nextTimer = getSetting("next-reminder-timestamp");
      log.debug(`toggleHeroPointReminder :: Next timer is ${nextTimer}`);

      if (nextTimer <= Date.now()) {
        nextTimer = Date.now() + heroPointReminderTime;
        setSetting("next-reminder-timestamp", nextTimer);
      }
    }
  }

  resetHeroPointReminder() {
    ui.notifications.info(`Hero Point Reminder timer reset.`)

    let nextTimer = Date.now() + heroPointReminderTime;
    setSetting("next-reminder-timestamp", nextTimer);
  }

  loadCustomCssOverrides() {
    const head = document.getElementsByTagName("head")[0];
    const mainCss = document.createElement("link");
    mainCss.setAttribute("rel", "stylesheet")
    mainCss.setAttribute("type", "text/css")
    mainCss.setAttribute("href", `${MODULE_PATH}/styles/custom-css-overrides.css`)
    mainCss.setAttribute("media", "all")
    head.insertBefore(mainCss, head.lastChild);
  }
}

export function addEffectItem(targetActorId, effectItemName) {
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

export async function removeEffectItem(targetActorId, effectItemName) {
  let targetActor = game.actors.get(targetActorId);

  let effectItems = targetActor.items.filter(item => item.type === 'effect' && item.name.includes(effectItemName));
  for (let effectItem of effectItems) {
    await effectItem.delete();
  }
}