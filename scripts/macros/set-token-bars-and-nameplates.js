export async function setTokenBarsAndNameplates() {
// Set Names and Bars

// Update all tokens on the map so that the name and bars shows on hover.
// Display Modes: ALWAYS, CONTROL, HOVER, NONE, OWNER, OWNER_HOVER

    const tokens = canvas.tokens.placeables.filter(token => token.actor).map(token => {
        console.log(token.actor);
        return {
            _id: token.id,
            "bar1.attribute": "attributes.hp",
            "bar2.attribute": "None",
            "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
            "displayBars": CONST.TOKEN_DISPLAY_MODES.HOVER
        };
    });

    canvas.scene.updateEmbeddedDocuments('Token', tokens)

    const updates = game.actors.map(a => ({_id: a.id, "prototypeToken.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER}));
    await Actor.updateDocuments(updates);
}