import {MODULE_NAME} from "../constants.js";
import {getSetting} from "./extensions.js";

/*
 Custom logger class
 */
export class Logger {
  info(...args) {
    try {
      console.info(MODULE_NAME, ' | ', ...args);
    } catch (e) {
    }
  }

  json(...args) {
    try {
      console.log(MODULE_NAME, ' | ', ...args);
      args.forEach(arg => console.log(JSON.stringify(arg)));
    } catch (e) {
    }
  }

  debug(...args) {
    try {
      const isDebugging = getSetting("debug-mode");

      if (isDebugging) {
        // .warn gives nicer info, e.g. a stacktrace...
        console.debug(MODULE_NAME, ' | ', ...args);
        console.warn("^ Stacktrace:");
      }
    } catch (e) {
    }
  }
}