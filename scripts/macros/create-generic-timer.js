export async function createGenericTimer(token) {
    const ITEM_UUID = 'Compendium.nerps-for-foundry.shared-items.O72nH1FuDpP6j9Zm'; // Timer: Generic
    const effect = (await fromUuid(ITEM_UUID)).toObject();
    const actor = token.actor;

    countdownEffect();

    function getTime() {
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        let ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert from 24h to 12h format
        hours = hours % 12;
        // the hour '0' should be '12'
        hours = hours ? hours : 12;

        // Pad single digit minutes or seconds with a leading zero
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    function countdownEffect() {
        let date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        // Pad single digit minutes or seconds with a leading zero
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        let time = `${hours}:${minutes}:${seconds}`;

        console.log(time);

        let template = `
<style>
    .centered-content {
        display: flex;
        align-items: center;
    }
</style>

<p>Name: <input id="countdownname" type="string" style="width: 200px;" value="Generated @ ${getTime()}"></p> 
<p>
    Time: <input id="countdowninput" type="string" style="width: 50px;" value="1d4">
    
    <select name="durationUnit" id="durationUnit">
        <option value="rounds" selected>Rounds</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
    </select>
</p>

<div class="centered-content">
    <input type="checkbox" id="counter"/>
    <p>Counter? (allows you to increment/decrement badge)</p>
</div>

<div class="centered-content">
    <input type="checkbox" id="cooldown"/>
    <p>Cooldown (adds 1 to duration)</p>
</div>

<div class="centered-content">
    <input type="checkbox" id="unidentified"/>
    <p>Effect is unidentified/secret?</p>
</div>
`;

        new Dialog({
            title: "Countdown Effect",
            content: template,
            buttons: {
                ok: {
                    label: "Apply",
                    callback: (html) => {
                        main(html);
                    },
                },
                cancel: {
                    label: "Cancel",
                },
            },
        }).render(true);
    }

    async function main(html) {
        let coolDownText = "";
        let countdownNumber = "";
        let duration = html.find("#countdowninput")[0].value;
        let durationUnit = html.find("#durationUnit")[0].value;
        const counter = html.find("#counter")[0].checked;
        const isCooldown = html.find("#cooldown")[0].checked;
        const unidentified = html.find("#unidentified")[0].checked;

        effect.name = "Timer: " + html.find("#countdownname")[0].value;

        if (duration.includes("d")) {
            countdownNumber = new Roll(duration).roll({async: false}).total;
        } else {
            countdownNumber = duration;
        }

        if (isCooldown) {
            countdownNumber = parseInt(countdownNumber) + 1;
            coolDownText = "a cool down ";
        }
        ;

        ui.notifications.info(`${actor.name} now has ${coolDownText}${effect.name} for ${countdownNumber} ${durationUnit}.`);

        effect.system.duration.value = countdownNumber;
        effect.system.duration.unit = durationUnit;
        effect.system.unidentified = unidentified;

        if (counter) {
            effect.system.badge = {
                "type": "counter",
                "value": 1,
                "min": 1,
                "max": null,
                "label": null
            }
        }

        await token.actor.createEmbeddedDocuments("Item", [effect]);
    }
}