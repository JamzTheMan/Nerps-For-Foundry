import {MODULE_PATH} from "./constants.js";
import {Logger} from "./utils/logger.js";

// CONFIG.debug.hooks = true;
export let log = new Logger();

export let i18n = key => {
  return game.i18n.localize(key);
};

export class NerpsForFoundry {
  async RemoveReactionEffects(combatantActorId, expiryText) {
    // console.log(currentCombatant.actor.items);
    let combatantActor = game.combat.getCombatantByActor(combatantActorId)?.actor;
    let reactionEffectIds = combatantActor.items
        .filter(item => item.type === 'effect')
        .filter(item => item.name.startsWith('Reaction: '))
        .filter(item => item.system.duration.expiry === expiryText)
        .map(item => item._id);

    await combatantActor.deleteEmbeddedDocuments("Item", reactionEffectIds);
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