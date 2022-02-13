import {getSetting} from "./utils/extensions.js";
import {log} from "./nerps-for-foundry.js";
import {DEFAULT_RULES, JOURNAL_MARKER} from "./constants.js";

export function autoCorrectJournalContent(journalContent) {
  const additionalRules = JSON.parse(getSetting("additional-auto-correct-rules"));
  const rules = [...DEFAULT_RULES, ...additionalRules];

  // Remove any existing markers...
  const originalContent = journalContent;
  const skipDoOnceRules = journalContent.includes(JOURNAL_MARKER);
  let newContent = journalContent.replaceAll(JOURNAL_MARKER, "");

  rules.forEach(rule => {
    log.debug(`Rule name: ${rule.name}`);
    log.debug(`Rule find: "${rule.findExpression}"`);
    log.debug(`Rule replace: ${rule.replaceExpression}`);
    log.debug(`Rule lowerCaseFirst: ${rule.lowerCaseFirst}`);

    if (skipDoOnceRules && rule.doOnce) {
      return;
    }

    if (rule.lowerCaseFirst) {
      newContent = newContent.replaceAll(new RegExp(rule.findExpression, 'g'), function (match) {
        return match.toLowerCase();
      });
      newContent = newContent.replaceAll(new RegExp(rule.findExpression, 'gi'), rule.replaceExpression);
    } else {
      newContent = newContent.replaceAll(new RegExp(rule.findExpression, 'gm'), rule.replaceExpression);
    }

    const fWords = getSetting("auto-correct-f-words");
    fWords.split(/\s*,\s*/).forEach(word => {
      log.debug(`Fixing all occurrences of "${word}"`);
      newContent = newContent.replaceAll(word, word.replaceAll(" ", ""));
    })

    log.debug(`originalContent: ${originalContent}`)
    log.debug(`---------------------------------`);
    log.debug(`newContent: ${newContent}`);
    log.debug(`---------------------------------`);
  });

  return newContent;
}