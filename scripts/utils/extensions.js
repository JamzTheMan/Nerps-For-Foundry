import {MODULE_NAME} from "../constants.js";

export let getSetting = key => {
    return game.settings.get(MODULE_NAME, key);
};

export let setSetting = async (key, value) => {
    await game.settings.set(MODULE_NAME, key, value);
};

export let toggleSetting = async (key) => {
    await game.settings.set(MODULE_NAME, key, !game.settings.get(MODULE_NAME, key));
};

export let i18n = key => {
    return game.i18n.localize(MODULE_NAME + '.' + key);
};
