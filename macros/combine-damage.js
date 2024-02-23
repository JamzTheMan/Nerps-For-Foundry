export function combineDamage() {
// Macro to combine last 2 damage rolls for purposes of easy IWR and to support feats like Double Slice, Flurry of Blows, etc...

    const DamageRoll = CONFIG.Dice.rolls.find(((R) => R.name === "DamageRoll"));
    const damageRolls = game.messages
        .filter(it => it.flags.pf2e.context?.type === "damage-roll")
        .slice(-2);

    if (damageRolls.length < 2) {
        return ui.notifications.error("There are not at least 2 damage rolls in chat...");
    }

    const firstDamageRoll = damageRolls[0];
    const secondDamageRoll = damageRolls[1];

// Throw the dice away, we just need the values combined for IWR
    let results = new Map();

    damageRolls.forEach(damageRoll => {
        damageRoll.rolls.forEach(roll => {
            roll.terms.forEach(term => {
                term.rolls.forEach(roll => {
                    //console.log(`type: ${roll.type}`);

                    let damageType = roll.type;
                    let damageTotal = roll.total;
                    let isPersistent = false;

                    if (roll._formula.includes("persistent")) {
                        // console.log(`type: ${roll._formula}`);
                        isPersistent = true;
                        damageType = damageType.concat(",persistent");
                        const bracketIndex = roll._formula.lastIndexOf("[");
                        damageTotal = roll._formula.substring(0, bracketIndex);
                    }

                    if (!results.has(damageType) || isPersistent) {
                        if (isPersistent) {
                            var uuid = Math.random().toString(36).slice(-6);
                            results.set(damageType + "~" + uuid, damageTotal);
                        } else {
                            results.set(damageType, damageTotal);
                        }
                    } else {
                        const currentValue = results.get(damageType);
                        results.set(damageType, currentValue + damageTotal);
                    }
                });
            });
        });
    });

// console.log(results);

    let finalFormula = '';
    results.forEach(function (value, key, fooMap) {
        const uuidIndex = key.lastIndexOf("~");
        let damageType = key;
        if (uuidIndex > 0) {
            damageType = key.substring(0, uuidIndex);
        }
        finalFormula = finalFormula.concat(`(${value})[${damageType}], `);
    })

    finalFormula = finalFormula.replace(/,\s*$/, "");

// do the thing
    const combinedDamage = new DamageRoll(finalFormula);
    combinedDamage.toMessage({
        flavor: `<h3>Combined Total Damage From...</h3>${firstDamageRoll.item.name}<br/>${secondDamageRoll.item.name}`,
        speaker: ChatMessage.getSpeaker()
    });
}