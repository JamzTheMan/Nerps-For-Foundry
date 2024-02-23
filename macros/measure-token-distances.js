export function measureTokenDistance() {
    var message = "";

    for (var token of canvas.tokens.controlled) {
        message += `<h3>From ${token.name}</h3>`;

        for (var target of game.user.targets) {
            var finalDistance = token.distanceTo(target);
            message += ` to 🎯${target.name}: <b>${finalDistance} ft</b><br/>`
        }
    }

    if (message) {
        ChatMessage.create({content: `${message}`});
    }
}