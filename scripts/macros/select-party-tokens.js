// Macro to select all player owned tokens on the canvas
export function selectAllPlayerTokens() {

// Ensure the canvas is active
    if (!canvas || !canvas.tokens) {
        ui.notifications.error("No active canvas or tokens available.");
        return;
    }

// Get all tokens on the canvas
    const tokens = canvas.tokens.placeables;

// Filter tokens to only include party members
    const partyTokens = tokens.filter(token => {
        const actor = token.actor;
        return actor && actor.hasPlayerOwner; // Check if the token is owned by a player
    });

// Select all party member tokens
    if (partyTokens.length > 0) {
        canvas.tokens.controlled.forEach(t => t.release()); // Deselect currently selected tokens
        partyTokens.forEach(token => token.control({releaseOthers: false})); // Select party member tokens
        ui.notifications.info(`${partyTokens.length} party member token(s) selected.`);
    } else {
        ui.notifications.warn("No party member tokens found.");
    }
}
