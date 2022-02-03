import {MODULE_NAME} from "../constants.js";

export let getSetting = key => {
  return game.settings.get(MODULE_NAME, key);
};

export let setSetting = (key, value) => {
  game.settings.set(MODULE_NAME, key, value).then();
  return;
};

export let i18n = key => {
  return game.i18n.localize(MODULE_NAME + '.' + key);
};