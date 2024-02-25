export function rollPerceptionChecks() {
    // TODO: Add option to select DC by level or default to PC APL?
    const proficiency = ['Trained', 'Expert', 'Master', 'Legendary', 'Untrained'];
    const degreeOfSuccessValues = ['Crit-Fail', 'Fail', 'Success', 'Crit-Success'];
    const highlightColors = ['#80001740', '#bababa00', '#83e68880', '#83e688ff']
    const DCbyLevel = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50];

    let pcLevels = 0;
    let SHOW_DICE_ROLLS = game.user.getFlag('world', 'save_state')?.showDiceRolls;

    const ownedTokens = canvas.tokens.ownedTokens
        .filter(t => t.actor.hasPlayerOwner)
        .filter(t => t.actor.type === "character");

    ownedTokens.forEach(token => pcLevels = pcLevels + token.actor.system.details.level.value);

    const apl = Math.round(pcLevels / ownedTokens.length);
    const partyLvlDC = DCbyLevel[apl];

// TODO: Add PC Stealth DC's if rolling for NPC?

    const showDiceChecked = SHOW_DICE_ROLLS ? 'checked' : '';
    const dialog = new Dialog({
        title: 'Set Perception DC',
        content: `
        <form>
            <h3>Average DC for Party Level ${apl} is ${partyLvlDC}</h3>
            <div class="form-group">
                <label>DC:</label>
                <input id="dc" name="dc" type="number" value="${partyLvlDC}"/>
            </div>
            <div class="form-group">
                <label for="showDice"> Show Dice Rolls/Chat Messages?</label>
                <input type="checkbox" id="showDice" name="showDice" value="true" ${showDiceChecked}>
            </div>
            <br />
        </form>
        `,
        buttons: {
            yes: {
                label: 'Roll Using DC',
                callback: (html) => postSave(html, true),
            },
            yesNoDC: {
                label: 'Roll With No DC',
                callback: (html) => postSave(html, false),
            },
            no: {
                label: 'Cancel',
            },
        },
        default: 'yes',
        render: html => html.find('#dc').focus()
    });

    async function postSave($html, useDC) {
        const DC = useDC ? parseInt($html.find('[name="dc"]')[0].value) || 0 : 0;
        const showDice = $("#showDice").is(':checked');
        const SEARCH_UUID = "Compendium.nerps-for-foundry.nerps-pf2e-exploration-effects.Item.XiVLHjg5lQVMX8Fj"; // Search

        // Save the state for showDice for later macro runs...
        game.user.setFlag('world', 'save_state', {showDiceRolls: showDice});

        let dcText = '';
        if (DC > 0) {
            dcText = `<b>DC ${DC}</b> `;
        }

        let tokenList = canvas.tokens.controlled
            .filter(t => t.actor.hasPlayerOwner)
            .filter(t => t.actor.type === "character");

        let messageContent = `<p>Rolling Secret ${dcText}Perception checks for selected PC's.</p><hr><p>${tokenList.map(t => " " + t.actor.name)}</p>`;

        // OK, you didn't select any PC tokens, lets check for NPC's only?
        if (tokenList.length === 0) {
            // console.log("TEST", canvas.tokens)
            tokenList = canvas.tokens.controlled
                .filter(t => t.actor.type === "npc");

            messageContent = `<p>Rolling Secret ${dcText}Perception checks for selected NPC's.</p><hr><p>${tokenList.map(t => " " + t.actor.name)}</p>`;
        }


        // Ok, you didn't select any tokens so I assume you want all PC's that are "Searching"
        if (tokenList.length === 0) {
            console.log(canvas.tokens);
            // tokenList = canvas.tokens.ownedTokens

            tokenList = canvas.tokens.ownedTokens
                .filter(t => t.actor.hasPlayerOwner)
                .filter(t => t.actor.type === "character")
                .filter(t => t.actor.itemTypes.effect.find((e) => e.flags.core?.sourceId === SEARCH_UUID));

            messageContent = `<p>Rolling Secret ${dcText}Perception checks for PC's using the @Compendium[pf2e.actionspf2e.TiNDYUGlMmxzxBYU]{Search} Exploration Activity.</p><hr><p>${tokenList.map(t => " " + t.actor.name)}</p>`;
        }

        // OK, so there are NO PC's searching, I assume you aren't doing exploration mode
        // OR your party is really dumb and has NO BODY keeping an eye out? Which in that case, why
        // roll perception? Ok, maybe you have your reasons, here, I'll roll for ALL PC's then...
        if (tokenList.length === 0) {
            console.log(canvas.tokens);
            // tokenList = canvas.tokens.ownedTokens

            tokenList = canvas.tokens.ownedTokens
                .filter(t => t.actor.hasPlayerOwner)
                .filter(t => t.actor.type === "character");

            messageContent = `<p>Rolling Secret ${dcText}Perception checks for all PC's.</p><hr><p>${tokenList.map(t => " " + t.actor.name)}</p>`;
        }

        // create the message and output to chat
        if (messageContent !== '') {
            let chatData = {
                blind: true,
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(game.user.name),
                whisper: ChatMessage.getWhisperRecipients(game.user.name),
                content: messageContent,
            };
            ChatMessage.create(chatData, {});
        }

        groupPerception(tokenList, DC, showDice)
    }

    async function groupPerception(tokenList, DC, showDice) {
        if (!game.user.isGM) {
            ui.notifications.warn('You not the GM yo!')
            return
        }

        let result = '<div style="display: grid; grid-row-gap: 0.25em;">'

        for (const token of tokenList) {
            const actor = token.actor
            if (!actor || !actor.isOfType('character', 'npc') || !actor.hasPlayerOwner || !actor.attributes.perception) continue
            result += await rollPerception(actor, DC, showDice)
        }

        result += "</div>";

        console.log(`DC is ${DC}`);
        let dcText = '';
        if (DC > 0) {
            dcText = ` vs DC ${DC}`;
        }

        ChatMessage.create({
            content: result,
            flavor: `<h2>Group Perception Checks${dcText}</h2>`,
            whisper: [game.user.id]
        })
    }

    async function rollPerception(actor, DC, showDice) {
        let options = actor.getRollOptions(['all', 'wis-based', 'perception']);
        options.push("action:search"); // add more traits here in new lines
        options.push("secret");

        const perception = actor.attributes.perception
        const check = new game.pf2e.CheckModifier('', perception)

        console.log(DC);
        let rollOptions;

        if (DC > 0) {
            rollOptions = {
                actor: actor,
                options: options,
                type: 'perception-check',
                createMessage: showDice,
                skipDialog: true,
                dc: {value: DC}
            }
        } else {
            rollOptions = {
                actor: actor,
                options: options,
                type: 'perception-check',
                createMessage: showDice,
                skipDialog: true
            }
        }

        const roll = await game.pf2e.Check.roll(check, rollOptions);
        if (!roll) return ''

        const rank = proficiency[(perception.rank ?? 1) - 1]
        const die = roll.dice[0].total
        if (die === undefined) return ''

        const degreeOfSuccess = roll.options.degreeOfSuccess;
        const degreeOfSuccessValue = degreeOfSuccessValues[degreeOfSuccess];
        const highlightColor = highlightColors[degreeOfSuccess];

        let result = `<div style="display: grid; grid-template-columns: 6fr 3fr 1fr; background-color: ${highlightColor};" title="${roll.result}">`
        result += `<span><b>${actor.name}</b> <small><i>(${rank})</i></small></span><span`

        if (degreeOfSuccess === undefined) {
            result += `<span>&nbsp;</span><span`
        } else {
            result += `<span>${degreeOfSuccessValue}</span><span`
        }

        if (die === 20) {
            result += ' style="background-color: #00000030; font-weight: bold; text-align: center;"'
        } else if (die === 1) {
            result += ' style="background-color: #00000030; font-weight: bold; text-align: center;"'
        } else {
            result += ' style="text-align: center;"'
        }

        return `${result}>${roll.total}</span></div>`
    }


    dialog.render(true);
}