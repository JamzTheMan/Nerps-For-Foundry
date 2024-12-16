import {log} from "../nerps-for-foundry.js"

export async function enrichAllJournalEntriesWithXp() {
    const journalEntries = game.journal;
    let enrichmentsFound = false;
    let yesToAll = false;

    for (const journalEntry of journalEntries) {
        for (const page of journalEntry.pages.filter(p => p.type === "text")) {
            if (page.text && page.text.content) {
                const shouldContinue = await enrichJournalEntryWithXp(journalEntry.name, page.name, yesToAll);

                if (shouldContinue === 'cancel') return; // Exit the function if cancel is selected
                if (shouldContinue === 'yesAll') yesToAll = true;
                if (shouldContinue === "yes" || shouldContinue || yesToAll) enrichmentsFound = true;
            }
        }
    }

    if (!enrichmentsFound) {
        ui.notifications.warn("No XP awards that needed to be enriched were found.");
    }
}

export async function enrichJournalEntryWithXp(journalEntryName, pageName, yesToAll, contents = null) {
    const journalEntry = game.journal.getName(journalEntryName);
    const XP_REGEX_WITH_VALUE = /(?<!\{)\b(\d+) XP(?: ([\s\S]*?))?[.,]/g;

    if (journalEntry) {
        const page = journalEntry.pages.find(p => p.name === pageName);

        if (page && page.text && page.text.content) {
            const content = page.text.content;

            function findXP_awardText(htmlContent) {
                const changes = [];
                let newContentIndex = 0;

                const $content = $('<div>').html(htmlContent);
                $content.find('*:contains("XP")').each(function () {
                    const $this = $(this);
                    const text = $this.html();

                    // Skip elements that already have an id starting with 'award-xp-enriched'
                    if ($this.closest('span[id^="award-xp-enriched"]').length > 0) {
                        return;
                    }

                    const changedContent = text.replace(/<span id="award-xp-enriched_.*?<\/span>|(\b(\d+)?\s*XP\b(.*?)(\.))/gs, function (match, xpFound, xpValue, xpNotes, period) {
                        if (xpFound) {
                            const encodedOriginalText = match ? encodeURIComponent(match) : '';

                            xpValue = xpValue || '';
                            const xpNotesEncoded = xpNotes ? escapeHTML(xpNotes) : '';

                            let reasonDescription = xpNotes ? `Accomplishment (${stripAndTrimHtml(xpNotes)})` : 'Accomplishment (Reasons)';
                            if (xpValue === '' && /in combat/i.test(xpNotes)) reasonDescription = '00 Encounter (THREAT_LEVEL)';

                            const journalText = `${xpNotesEncoded}`;
                            const uniqueId = `award-xp-enriched_${foundry.utils.randomID(8)}`;

                            let newContent
                            if (contents === null) {
                                newContent = `[[/award ${xpValue} ${reasonDescription}]]{${xpValue} XP${journalText}.}`;
                            } else {
                                newContent = contents[newContentIndex]
                            }
                            const replacement = `<span id="${uniqueId}" data-original="${encodedOriginalText}">${newContent}</span>`;
                            changes.push({id: uniqueId, replacement: replacement});
                            newContentIndex++;

                            return replacement;
                        }
                        return match; // Return the original match if it's inside a span with id "award-xp-enriched_XXXX"
                    });

                    $this.html(changedContent);
                });

                const updatedContent = $content.html();
                return {updatedContent, changes};
            }

            const {updatedContent, changes} = findXP_awardText(content);

            log.info(`original Content: ${content}`);
            log.info(`updatedContent: ${updatedContent}`);

            if (changes.length > 0) {
                page.text.content = updatedContent;

                const journalApp = await renderJournalEntrySheet(journalEntry, page);

                let delay = 500;
                changes.forEach((change, index) => {
                    log.info(`change: ${change.replacement}`);

                    setTimeout(() => {
                        const focusElement = document.getElementById(change.id);
                        if (focusElement) {
                            focusElement.scrollIntoView({behavior: "smooth", block: "center"});
                        }
                    }, delay * (index + 1));
                });

                if (!yesToAll) {
                    const shouldModify = await new Promise((resolve) => {
                        const dialogContent = `
                            <p>Do you want to keep these changes for <b>"${page.name}"</b>:</p>
                            <textarea id="award-xp-enriched_changes_${foundry.utils.randomID(8)}">${changes.map(change => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(change.replacement, 'text/html');
                            return doc.body.textContent;
                        }).join(`</textarea><hr><textarea id="award-xp-enriched_changes_${foundry.utils.randomID(8)}">`)}</textarea>`;

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
                                callback: () => {
                                    const xpAwardChanges = document.querySelectorAll('[id^="award-xp-enriched_changes_"]');
                                    const contents = Array.from(xpAwardChanges).map(textarea => textarea.value);

                                    // Compare original content with current content
                                    const hasChanges = changes.some((change, index) => {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(change.replacement, 'text/html');
                                        return doc.body.textContent !== contents[index];
                                    });

                                    if (hasChanges) {
                                        resolve({action: 'update', contents});
                                    } else {
                                        resolve({action: 'yes'});
                                    }
                                },
                                default: true
                            }, {
                                action: "yesAll",
                                label: "Yes to All",
                                callback: () => resolve({action: 'yesAll'})
                            }, {
                                action: "no",
                                label: "No",
                                callback: () => resolve({action: 'no'})
                            }, {
                                action: "cancel",
                                label: "Cancel",
                                callback: () => resolve({action: 'cancel'})
                            }]
                        }).render({force: true});
                    });

                    if (shouldModify.action === 'yes' || shouldModify.action === 'yesAll') {
                        await page.update({'text.content': updatedContent});
                        await renderJournalEntrySheet(journalEntry, page);
                    } else if (shouldModify.action === 'update') {
                        // Revert temp changes first...
                        page.text.content = content;
                        await renderJournalEntrySheet(journalEntry, page);

                        // Call the function again with the new content
                        const contents = shouldModify.contents;
                        return await enrichJournalEntryWithXp(journalEntry.name, page.name, false, contents);
                    } else if (shouldModify.action === 'no' || shouldModify.action === 'cancel') {
                        page.text.content = content;
                        await renderJournalEntrySheet(journalEntry, page);
                    }

                    return shouldModify.action;
                } else {
                    await page.update({'text.content': updatedContent});
                    await renderJournalEntrySheet(journalEntry, page);
                    return yesToAll;
                }
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

export async function revertAllJournalEntriesWithXp() {
    const journalEntries = game.journal;
    let enrichmentsFound = false;


    for (const journalEntry of journalEntries) {
        for (const page of journalEntry.pages.filter(p => p.type === "text")) {
            if (page.text && page.text.content) {
                if (await revertJournalEntryXpEnrichment(journalEntry.name, page.name))
                    enrichmentsFound = true
            }
        }
    }

    if (!enrichmentsFound) {
        ui.notifications.warn("No XP awards that needed to be reverted were found.");
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

            log.info(`Journal entry "${journalEntryName}: ${pageName}" being checked for enrichment...`);

            // Find all span elements with IDs that start with 'award-xp-enriched'
            const spans = doc.querySelectorAll('span[id^="award-xp-enriched"]');

            spans.forEach(span => {
                span.outerHTML = decodeURIComponent(span.getAttribute('data-original'));
            });

            if (spans.length > 0) {
                await page.update({'text.content': doc.body.innerHTML});
                await renderJournalEntrySheet(journalEntry, page);
                ui.notifications.info(`Journal entry "${journalEntryName}: ${pageName}" has been reverted to its original content.`);

                return true;
            }
        } else {
            ui.notifications.error(`Page or content not found in journal entry "${journalEntryName}".`);
        }
    } else {
        ui.notifications.error(`Journal entry "${journalEntryName}" not found.`);
    }
}

function stripAndTrimHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent.replace(/\n/g, ' ').trim().capitalize() || ""
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return ' ' + div.innerHTML;
}

async function renderJournalEntrySheet(journalEntry, page) {
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

    return journalApp;
}
