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

  json(...args) {
    try {
      console.log("NerpsForFoundry!", '|', ...args);
      args.forEach(arg => console.log(JSON.stringify(arg)));
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