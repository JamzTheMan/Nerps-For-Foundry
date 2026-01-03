export async function setTokenBarsAndNameplates() {
// Set Names and Bars

// Update all tokens in all scenes so that the name and bars shows on hover.
// Display Modes: ALWAYS, CONTROL, HOVER, NONE, OWNER, OWNER_HOVER

    // Update tokens in all scenes
    for (const scene of game.scenes) {
        const tokens = scene.tokens.map(token => {
            return {
                _id: token.id,
                "bar1.attribute": "attributes.hp",
                "bar2.attribute": "None",
                "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
                "displayBars": CONST.TOKEN_DISPLAY_MODES.HOVER
            };
        });

        if (tokens.length > 0) {
            await scene.updateEmbeddedDocuments('Token', tokens);
            console.log(`Updated ${tokens.length} tokens in scene: ${scene.name}`);
        }
    }

    // Update prototype tokens for all actors
    const updates = game.actors.map(a => ({
        _id: a.id,
        "prototypeToken.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
        "prototypeToken.displayBars": CONST.TOKEN_DISPLAY_MODES.HOVER,
        "prototypeToken.bar1.attribute": "attributes.hp",
        "prototypeToken.bar2.attribute": "None"
    }));
    await Actor.updateDocuments(updates);

    console.log(`Updated ${updates.length} actor prototype tokens`);
}
