export function exportActorWithImages(actor) {
// Convert token and portrait images to base64 for easier export/import to other servers

    if (!actor && canvas.tokens.controlled.length !== 1) {
        ui.notifications.warn("You must have a single actor selected.");
        return;
    }

    function toDataURL(src, callback, outputFormat) {
        let image = new Image();
        image.crossOrigin = 'Anonymous';
        image.onload = function () {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            let dataURL;
            canvas.height = this.naturalHeight;
            canvas.width = this.naturalWidth;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat, 0.7);
            // console.log('base64 encoded:', dataURL);

            // Foundry refuses to accept webp as a valid file extension when using base64 even though it supports webp normally...
            // So we hack it by changing the image type to png but leaving the data as webp which works for now
            dataURL = dataURL.replace("data:image/webp", "data:image/png");
            callback(dataURL);
        };

        image.src = src;
        if (image.complete || image.complete === undefined) {
            image.src = "data:image/gif;base64, R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            image.src = src;
        }
    }

    toDataURL(actor.img,
        async function (dataUrl) {
            const portraitImage = dataUrl;

            toDataURL(actor.data.token.img,
                async function (dataUrl) {
                    const tokenImage = dataUrl;

                    // Deep clone so we leave the original actor with image references...
                    var newActor = JSON.parse(JSON.stringify(actor));

                    newActor.name = `${actor.name}`;
                    newActor.img = portraitImage;
                    newActor.token.img = tokenImage;

                    let actorClone = await Actor.create(newActor);

                    actorClone.exportToJSON();
                    actorClone.delete();
                }
                , "image/webp")
        }
        , "image/webp")
}