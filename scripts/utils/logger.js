/*
 Custom logger class
 */
import {getSetting} from "../settings-for-nerps.js";

export class Logger {
  info(...args) {
    try {
      console.log("NerpsForFoundry!", '|', ...args);
    } catch (e) {
    }
  }

  debug(...args) {
    try {
      const isDebugging = getSetting("debug-mode");

      if (isDebugging) {
        console.log("NerpsForFoundry!", '|', ...args);
      }
    } catch (e) {
    }
  }
}