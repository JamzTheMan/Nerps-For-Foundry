import {log} from "../nerps-for-foundry.js"

let yesToAll = false;

export async function enrichAllJournalEntriesWithXp() {
    const journalEntries = game.journal;
    let enrichmentsFound = false;

    for (const journalEntry of journalEntries) {
        for (const page of journalEntry.pages.filter(p => p.type === "text")) {
            if (page.text && page.text.content) {
                const shouldContinue = await enrichJournalEntryWithXp(journalEntry.name, page.name, yesToAll);

                if (shouldContinue === null) {
                    yesToAll = false;
                    return; // Exit the function if cancel is selected
                }
                if (shouldContinue) {
                    enrichmentsFound = true;
                }
            }
        }
    }

    yesToAll = false;

    if (!enrichmentsFound) {
        ui.notifications.info("No XP awards that needed to be enriched were found.");
    }
}

export async function enrichJournalEntryWithXp(journalEntryName, pageName) {
    const journalEntry = game.journal.getName(journalEntryName);

    if (journalEntry) {
        const page = journalEntry.pages.find(p => p.name === pageName);

        if (page && page.text && page.text.content) {
            const content = page.text.content;

            function replaceXP(content) {
                log.info(content);

                const changes = [];
                const updatedContent = content.replace(/(?<!\{)\b(\d+) XP(?: ([\s\S]*?))?[.,]/g, (match, p1, p2) => {
                    const encodedOriginalText = match ? encodeURIComponent(match) : '';
                    log.info(`encodedOriginalText: ${encodedOriginalText}`);

                    const p2Encoded = p2 ? escapeHTML(p2) : '';

                    const reasonDescription = p2 ? `Accomplishment (${stripAndTrimHtml(p2)})` : 'Reasons';
                    const journalText = `${p2Encoded}`;

                    const uniqueId = `award-xp-enriched_${Date.now()}`;
                    const replacement = `<span id="${uniqueId}" data-original="${encodedOriginalText}">[[/award ${p1} ${reasonDescription}]]{${p1} XP${journalText}.}</span>`;

                    changes.push({id: uniqueId, replacement: replacement});

                    return replacement;
                });

                return {originalContent: content, updatedContent: updatedContent, changes: changes};
            }

            const {originalContent, updatedContent, changes} = replaceXP(content);
            if (changes.length > 0) {
                page.text.content = updatedContent;

                const journalApp = journalEntry.sheet.render(true, {
                    pageId: page.id,
                    left: 115,
                    top: 50,
                    height: window.innerHeight - 150
                });

                await new Promise((resolve) => {
                    Hooks.once('renderJournalSheet', (app, html, data) => {
                        if (app === journalEntry.sheet) {
                            resolve();
                        }
                    });
                });

                let delay = 500;
                changes.forEach((change, index) => {
                    setTimeout(() => {
                        const focusElement = document.getElementById(change.id);
                        if (focusElement) {
                            focusElement.scrollIntoView({behavior: "smooth", block: "center"});
                        }
                    }, delay * (index + 1));
                });

                function onDialogClose() {
                    alert("Dialog was closed");
                }

                if (!yesToAll) {
                    const shouldModify = await new Promise((resolve) => {
                        const dialogContent = `
                            <p>Do you want to keep these changes for <b>"${page.name}"</b>:</p>
                            <textarea>${changes.map(change => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(change.replacement, 'text/html');
                            return doc.body.textContent;
                        }).join('</textarea><hr><textarea>')}</textarea>
                        `;

                        const dialog = new foundry.applications.api.DialogV2({
                            window: {
                                title: `Modify ${journalEntry.name}`,
                                icon: 'fa-solid fa-trophy'
                            },
                            position: {
                                left: journalApp.position.left + journalApp.position.width + 10
                            },
                            content: dialogContent,
                            buttons: [{
                                action: "yes",
                                label: "Yes",
                                callback: () => resolve(true),
                                default: true
                            }, {
                                action: "yesall",
                                label: "Yes to All",
                                callback: () => {
                                    yesToAll = true;
                                    resolve(true);
                                }
                            }, {
                                action: "no",
                                label: "No",
                                callback: () => resolve(false)
                            }, {
                                action: "cancel",
                                label: "Cancel",
                                callback: () => resolve(null)
                            }],
                            close: {
                                callback: (event, button) => {
                                    alert("Dialog was closed");
                                    resolve(null)
                                }
                            },
                            rejectClose: true
                        }).render({force: true});
                    });


                    if (shouldModify) {
                        await page.update({'text.content': updatedContent});
                        journalEntry.render(true);
                    } else if (shouldModify === false) {
                        page.text.content = content;
                        await journalEntry.sheet.render(true, {pageId: page.id});
                    } else {
                        page.text.content = content;
                        await journalEntry.sheet.render(true, {pageId: page.id});
                        return null; // Return null if cancel is selected
                    }
                } else {
                    await page.update({'text.content': updatedContent});
                    journalEntry.render(true);
                }

                return true;
            } else {
                return false;
            }
        } else {
            ui.notifications.error(`Page or content not found in journal entry "${journalEntryName}".`);
        }
    } else {
        ui.notifications.error(`Journal entry "${journalEntryName}" not found.`);
    }
}

export async function revertJournalEntryXpEnrichment(journalEntryName, pageName) {
    const journalEntry = game.journal.getName(journalEntryName);

    if (journalEntry) {
        const page = journalEntry.pages.find(p => p.name === pageName);

        if (page && page.text && page.text.content) {
            const content = page.text.content;

            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Find all span elements with IDs that start with 'award-xp-enriched'
            const spans = doc.querySelectorAll('span[id^="award-xp-enriched"]');

            spans.forEach(span => {
                span.outerHTML = decodeURIComponent(span.getAttribute('data-original'));
            });

            await page.update({'text.content': doc.body.innerHTML});
            journalEntry.render(true);
            ui.notifications.info(`Journal entry "${journalEntryName}: ${pageName}" has been reverted to its original content.`);
        } else {
            ui.notifications.error(`Page or content not found in journal entry "${journalEntryName}".`);
        }
    } else {
        ui.notifications.error(`Journal entry "${journalEntryName}" not found.`);
    }
}

function stripAndTrimHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent.replace(/\n/g, ' ').trim() || ""
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return ' ' + div.innerHTML;
}
