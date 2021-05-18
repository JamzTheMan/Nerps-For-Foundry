/*
 * Where all the magic happens...
*/

let socket;
const heroPointReminderTime = 60 * 60000;

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
Hooks.on("updateCombat", async (combat) => {
  console.log("Nerps auto-remove-frightened: " + game.settings.get("Nerps-For-Foundry", "auto-remove-frightened"))
  console.log("Nerps auto-remove-expired-effects: " + game.settings.get("Nerps-For-Foundry", "auto-remove-expired-effects"))

  if (canvas.ready && game.user.isGM) {
    if(game.settings.get("Nerps-For-Foundry", "auto-remove-expired-effects")) {
      game.pf2e.effectTracker.refresh().then(() => game.pf2e.effectTracker.removeExpired());
    }
    // const combatantToken = canvas.tokens.get(combat?.current.tokenId);
    // window.Nerps.checkForExpiredEffects(combatantToken);
  }
});

/**
 * End of turn event.
 */
Hooks.on("preUpdateCombat", async (combat, update) => {
  if (canvas.ready && game.user.isGM) {
    if(game.settings.get("Nerps-For-Foundry", "auto-remove-frightened")) {
      const combatantToken = canvas.tokens.get(combat?.current.tokenId);
      window.Nerps.checkForFrightened(combatantToken);
    }
    if(game.settings.get("Nerps-For-Foundry", "auto-remove-expired-effects")) {
      game.pf2e.effectTracker.refresh().then(() => game.pf2e.effectTracker.removeExpired());
    }
  }
});

function heroPointReminder(nextReminderTimestamp) {
  const nextReminder = nextReminderTimestamp - Date.now();
  let reminderMin = Math.floor(nextReminder / 60000);
  let reminderSeconds = Math.floor((nextReminder - (reminderMin * 60000)) / 1000);

  if (!game.settings.get("Nerps-For-Foundry", "reminder-active")) {
    console.log("NERPS game settings timer turned off!")
  } else {
    ui.notifications.info(`I'll remind you to hand out hero points in ${reminderMin} minutes, ${reminderSeconds} seconds.`)
    console.log("NERPS game settings timer turned on!")
  }

  let heroPointReminder = setTimeout(heroPointReminderAlert, nextReminder);
}

function heroPointReminderAlert() {
  let nextTimer = game.settings.get("Nerps-For-Foundry", "next-reminder-timestamp");
  if (nextTimer > Date.now()) {
    console.log("NERPS game settings timer was reset, skipping...")
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
      console.log("NERPS game settings timer turned off, skipping alert...")
    }
  }

  nextTimer = Date.now() + heroPointReminderTime;
  game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer);

  // console.log(`Nerps! Next timer is ${nextTimer}`);
  heroPointReminder(nextTimer);

}

function addEffectItem(targetActorId, effectItemName) {
  let targetActor = game.actors.get(targetActorId);

  // console.log("Nerps: targetActor is instance of Actor?", targetActor instanceof Actor);

  // ui.notifications.info(`Adding item ${effectItemName}`);
  // console.log("Nerps: targetActor", targetActor);
  // console.log("Nerps: effectItemName", effectItemName);

  let effectItem = game.items.getName(effectItemName);
  if (effectItem != null) {
    // console.log("Nerps: EFFECT ITEM:", effectItem);
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
    // console.log(`Nerps.addEffectItem: targetActorId = ${targetActorId}`);
    // console.log(`Nerps.addEffectItem: effectItemName = ${effectItemName}`);

    socket.executeAsGM(addEffectItem, targetActorId, effectItemName);
  }

  async removeEffect(targetActorId, effectItemName) {
    await socket.executeAsGM(removeEffectItem, targetActorId, effectItemName);
  }

  // Inspired by: https://github.com/CarlosFdez/pf2e-persistent-damage/blob/master/src/module/pf2e-persistent-damage.ts
  async checkForExpiredEffects(combatantToken) {
    // ui.notifications.info(`We got a updateCombat hook! ${combatantToken.name}`);

    // console.log(`Nerps: Combat token is: `, combatantToken);

    await combatantToken.actor.items
    .filter(item => item.type === 'effect')
    .map(item => {
      // let startInit = item.data.data.start.initiative
      // let startValue = item.data.data.start.value
      let duration = item.data.data.duration.value

      // ui.notifications.info(`Item! ${item.name}, start: ${startInit}, startValue: ${startValue}, duration: ${duration}`);

      // From: https://gitlab.com/hooking/foundry-vtt---pathfinder-2e/-/blob/master/src/module/system/effect-panel.ts
      const effect = duplicate(item.data);
      // const duration = EffectPanel.getEffectDuration(effect);

      if (duration < 0) {
        effect.data.expired = false;
        effect.data.remaining = game.i18n.localize('PF2E.EffectPanel.UnlimitedDuration');
      } else {
        const start = effect.data.start?.value ?? 0;
        const remaining = start + duration - game.time.worldTime;
        effect.data.expired = remaining <= 0;
        let initiative = 0;

        if (
            remaining === 0 &&
            game.combat?.data?.active &&
            game.combat?.turns?.length > game.combat?.turn
        ) {
          initiative = game.combat.turns[game.combat.turn].initiative;
          if (initiative === effect.data.start.initiative) {
            if (effect.data.duration.expiry === 'turn-start') {
              effect.data.expired = true;
            } else if (effect.data.duration.expiry === 'turn-end') {
              effect.data.expired = false;
            } else {
              // unknown value - default to expired
              effect.data.expired = true;
              console.warn(
                  `Unknown value ${effect.data.duration.expiry} for duration expiry field in effect "${effect?.name}".`,
              );
            }
          } else {
            effect.data.expired = initiative < (effect.data.start.initiative ?? 0);
          }
        }
      }

      ui.notifications.warn(`Item ${item.name} expired? ${effect.data.expired}`);
    })

  }

  async checkForFrightened(combatantToken) {
    //console.log(`Nerps: Combat token is: `, combatantToken);

    if (!combatantToken.owner) {
      return;
    }

    await combatantToken.actor.items
    .filter(item => item.type === 'condition' && item.name === "Frightened")
    .map(item => {
      let conditionValue = item.data.data.value.value

      if (conditionValue > 1) {
        item.update({'data.value.value': (conditionValue - 1)});
        ui.notifications.info(`${combatantToken.name}'s Frightened condition reduced to ${conditionValue - 1}`);
      } else {
        combatantToken.actor.deleteOwnedItem(item._id);
        ui.notifications.info(`${combatantToken.name}'s Frightened condition removed!`);
      }
    })
  }

  toggleHeroPointReminder() {
    let currentSetting = game.settings.get("Nerps-For-Foundry", "reminder-active");
    game.settings.set("Nerps-For-Foundry", "reminder-active", !currentSetting)

    if (currentSetting) {
      ui.notifications.info(`Hero Point Reminder is now off!`)
    } else {
      ui.notifications.info(`Hero Point Reminder is now on!`)

      let nextTimer = game.settings.get("Nerps-For-Foundry", "next-reminder-timestamp");
      // console.log(`Nerps! Next timer is ${nextTimer}`);

      if (nextTimer <= Date.now()) {
        nextTimer = Date.now() + heroPointReminderTime;
        game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer);
      }

      // console.log(`Nerps! Next timer is ${nextTimer}`);
      //heroPointReminder(nextTimer);
    }
  }

  resetHeroPointReminder() {
    ui.notifications.info(`Hero Point Reminder timer reset.`)

    let nextTimer = Date.now() + heroPointReminderTime;
    game.settings.set("Nerps-For-Foundry", "next-reminder-timestamp", nextTimer)
  }
}