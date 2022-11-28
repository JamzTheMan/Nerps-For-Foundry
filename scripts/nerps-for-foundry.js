import {MODULE_PATH} from "./constants.js";
import {getSetting, setSetting} from "./utils/extensions.js";
import {Logger} from "./utils/logger.js";

// CONFIG.debug.hooks = true;
export let log = new Logger();

let socket;

export let i18n = key => {
  return game.i18n.localize(key);
};

export class NerpsForFoundry {
  async RemoveReactionEffects(currentCombatant, expiryText) {
    let reactionEffectIds = currentCombatant.actor.items
                                            .filter(item => item.type === 'effect')
                                            .filter(item => item.name.startsWith('Reaction: '))
                                            .filter(item => item.system.duration.expiry === expiryText)
                                            .map(item => item.id);

    await currentCombatant.actor.deleteEmbeddedDocuments("Item", reactionEffectIds);
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

  loadCustomPathfinderUICssOverrides() {
    const head = document.getElementsByTagName("head")[0];
    const mainCss = document.createElement("link");
    mainCss.setAttribute("rel", "stylesheet")
    mainCss.setAttribute("type", "text/css")
    mainCss.setAttribute("href", `${MODULE_PATH}/styles/pathfinder-ui-override.css`)
    mainCss.setAttribute("media", "all")
    head.insertBefore(mainCss, head.lastChild);
  }
}