import {log} from "../nerps-for-foundry.js";

export async function clearPf2ePerceptionConditions(token, visibility = ['concealed', 'hidden', 'undetected', 'unnoticed']) {
    const perceptionData = token?.document?.flags?.['pf2e-perception']?.data;
    log.debug(perceptionData);

    // Clear the matching visibility conditions
    if (!perceptionData || !Object.keys(perceptionData).length) return;

    for (let id in perceptionData) {
        if (visibility.includes(perceptionData[id].visibility)) {
            await token.document.unsetFlag('pf2e-perception', `data.${id}.visibility`);
        }
    }

    log.debug("------ After Token Updated ------");
    log.debug(token?.document?.flags?.['pf2e-perception']?.data);
}

export async function checkForPf2ePerceptionConditions(token, visibility = ['concealed', 'hidden', 'undetected', 'unnoticed']) {
    const perceptionData = token?.document?.flags?.['pf2e-perception']?.data;
    if (!perceptionData || !Object.keys(perceptionData).length) return [];

    const conditionTokens = new Map();
    for (let id in perceptionData) {
        if (visibility.includes(perceptionData[id].visibility)) {
            const condition = perceptionData[id].visibility;
            const sentenceCaseCondition = condition.charAt(0).toUpperCase() + condition.slice(1).toLowerCase();
            const tokenName = canvas.tokens.get(id)?.name || 'Unknown Token';
            if (!conditionTokens.has(sentenceCaseCondition)) {
                conditionTokens.set(sentenceCaseCondition, []);
            }
            conditionTokens.get(sentenceCaseCondition).push(tokenName);
        }
    }

    return Array.from(conditionTokens, ([condition, tokens]) => `${condition} from ${tokens.join(', ')}`);
}
