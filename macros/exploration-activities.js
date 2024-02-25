import {log} from "../scripts/nerps-for-foundry.js";

export async function explorationActivities(token) {

    const actors = canvas.tokens.controlled.flatMap((token) => token.actor ?? []);
    if (actors.length === 0 && game.user.character) actors.push(game.user.character);
    if (actors.length === 0) {
        const message = game.i18n.localize("PF2E.ErrorMessage.NoTokenSelected");
        return ui.notifications.error(message);
    }

    const ITEM_UUID = "Compendium.nerps-for-foundry.nerps-pf2e-exploration-effects.Item.khJJdnGwdSMIbfY0"; // Exploration Activities
    const source = (await fromUuid(ITEM_UUID)).toObject();

    source.flags = mergeObject(source.flags ?? {}, {core: {sourceId: ITEM_UUID}});

    for (const actor of actors) {
        const existing = actor.itemTypes.effect.find((e) => e.flags.core?.sourceId === ITEM_UUID);

        if (existing) {
            await existing.delete().then(
                actor.update({"system.exploration": []})
            );

            ui.notifications.info("Exploration activity removed.");
        } else {
            const items = await actor.createEmbeddedDocuments("Item", [source]);
            const explorationActivity = items.filter((item) => item.type === "effect" && !item.name.startsWith("Exploration Activities"))[0];

            const explorationAction = await getUUIDfromString(explorationActivity.description);


            // if (explorationAction !== null) {
            //     const newItem = await actor.createEmbeddedDocuments("Item", [explorationAction]);
            //     actor.update({"system.exploration": [newItem[0]._id]});
            // }


            // Get the name of the item you're about to add
            const newItemName = explorationAction.name;

            // Search for an item with the same name and type "action"
            const existingItem = actor.items.find(item => item.name === newItemName && item.type === "action");

            if (existingItem) {
                // If an item with the same name exists, make it the Active Exploration Action
                console.log(`Item with name ${newItemName} already exists with id ${existingItem.id}`);
                actor.update({"system.exploration": [existingItem.id]});
            } else {
                // If no item with the same name exists, create a new one and make it the Active Exploration Action
                const newItem = await actor.createEmbeddedDocuments("Item", [explorationAction]);
                actor.update({"system.exploration": [newItem[0]._id]});
            }
        }
    }
}

/**
 * Extracts the UUID from a string and retrieves the corresponding object.
 *
 * @param {string} variable - The string containing the UUID. The string should be in the format "@Compendium[pf2e.actionspf2e.IE2nThCmoyhQA0Jn]{Avoid Notice}".
 * @returns {Promise<Object|null>} - A Promise that resolves with the object that matches the UUID, or null if no object is found or if the string does not contain a UUID.
 */
async function getUUIDfromString(variable) {
    // Extract the UUID from the string
    let uuidMatch = variable.match(/@UUID\[(.*?)\]/);
    if (uuidMatch) {
        let uuid = uuidMatch[1];

        // Retrieve the object that matches the UUID
        let object = await fromUuid(uuid);
        if (object) {
            // Convert the object to a plain JavaScript object
            let objectData = object.toObject();
            log.debug(objectData);

            return objectData;
        } else {
            log.info("No object found with the given UUID");
        }
    } else {
        console.info("No UUID found in the string");
    }

    return null;
}