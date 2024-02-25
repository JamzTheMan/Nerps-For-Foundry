export function adjustShieldHP(actor) {
    const targets = game.user.targets;
    let shieldActor = actor;

    if (targets.size > 0) {
        shieldActor = targets.first().actor;
    } else {
        shieldActor = actor;
    }

    if (!shieldActor) {
        ui.notifications.warn("You must have an actor selected.");
    } else {
        const shieldEquipped = shieldActor.items.find(item => item.id == shieldActor.heldShield._id);

        const isReforgingShield = shieldEquipped.name == "Reforging Shield" ? true : false;
        let repairSuccessTotal = 22222;
        const hasReforgingShield = isReforgingShield ? `<p><i>Reforging Shield: double HP included</i></p>` : "";

        const shieldInfo = `${shieldEquipped.name}`;

        const dialogContent = `Damage: <input id="damageId" type="text" autofocus />`;

        new Dialog({
            title: `Adjust ${shieldEquipped.name} HP`,
            content: dialogContent,
            buttons: {
                doItButton: {
                    label: "Damage It!",
                    callback: (html) => adjustShield(html, shieldEquipped),
                    icon: `<i class="fas fa-check"></i>`
                },
                cancelButton: {
                    label: "Cancel",
                    icon: `<i class="fas fa-cancel"></i>`
                }
            },
            default: "doItButton"
        }).render(true);
    }

    async function adjustShield(html, shieldEquipped) {
        const damageDone = html.find("input#damageId").val();
        const newShieldHp = Math.max(0, shieldEquipped.system.hp.value - damageDone);
        const shieldUpdate = {"system.hp.value": newShieldHp};

        await shieldEquipped.update(shieldUpdate);

        ui.notifications.info(`${shieldEquipped.name} now has ${newShieldHp} HP.`);
    }
}