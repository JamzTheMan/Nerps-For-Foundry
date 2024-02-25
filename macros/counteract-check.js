export function counteractCheck() {
    let dialogContent = `
<div style="text-align: center; margin-bottom: 10px;">
  <h2>Counteract Check</h2>
</div>
<div>
  <form>
    <div class="form-group">
      <label style="display: block; text-align: left; margin-bottom: 5px;">Select the type:</label>
      <select id="counteractType" name="counteractType" style="width: 100%;">
	    <option value="counterspell">Counterspell</option>
	    <option value="cleverCounterspell">Clever Counterspell</option>
        <option value="spell">Spell</option>
	    <option value="effect">Effect</option>
      </select>
    </div>
    <div class="form-group">
      <label style="display: block; text-align: left; margin-bottom: 5px;">${"Level/Rank"}</label>
      <input type="number" id="levelRank" name="levelRank" value="45" min="${"effect" ? 0 : 1}" max="${"effect" ? 25 : 10}" step="1" style="width: 100%;">
    </div>
  </form>
</div>
`;

    new Dialog({
        title: "Counteract Check",
        content: dialogContent,
        buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: "Roll",
                callback: (html) => {
                    const counteractType = html.find('#counteractType').val();
                    const levelRank = parseInt(html.find('#levelRank').val()) || 0;

                    counteractCheck(counteractType, levelRank);
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
            },
        },
    }).render(true);

    function counteractCheck(counteractType, levelRank) {
        const counteractNotes = `
        <p><strong>Critical Failure</strong> You fail to counteract the target.</p>
        <p><strong>Failure</strong> Counteract the target if its counteract level is lower than your effect’s counteract level.</p>
        <p><strong>Success</strong> Counteract the target if its counteract level is no more than 1 level higher than your effect’s counteract level.</p>
        <p><strong>Critical Success</strong> Counteract the target if its counteract level is no more than 3 levels higher than your effect’s counteract level.</p>
    `;

        if (counteractType === 'counterspell') {
            const dc = levelRank;

            // Output the result
            ChatMessage.create({
                content: `@Check[type:spell|dc:${dc}]{Counterspell Check} ${counteractNotes}`,
            });

            return;
        }
        if (counteractType === 'cleverCounterspell') {
            const dc = levelRank;

            // Output the result
            ChatMessage.create({
                content: `@Check[type:spell|dc:${dc}|adjustment:2]{Clever Counterspell Check} ${counteractNotes}`,
            });

            return;
        }

        // Define the Counteract Ranks and DCs tables
        const effectTable = [
            {rank: 0, dc: 14},
            {rank: 1, dc: 15},
            {rank: 2, dc: 16},
            {rank: 3, dc: 18},
            {rank: 4, dc: 19},
            {rank: 5, dc: 20},
            {rank: 6, dc: 22},
            {rank: 7, dc: 23},
            {rank: 8, dc: 24},
            {rank: 9, dc: 26},
            {rank: 10, dc: 27},
            {rank: 11, dc: 28},
            {rank: 12, dc: 30},
            {rank: 13, dc: 31},
            {rank: 14, dc: 32},
            {rank: 15, dc: 34},
            {rank: 16, dc: 35},
            {rank: 17, dc: 36},
            {rank: 18, dc: 38},
            {rank: 19, dc: 39},
            {rank: 20, dc: 40},
            {rank: 21, dc: 42},
            {rank: 22, dc: 44},
            {rank: 23, dc: 46},
            {rank: 24, dc: 48},
            {rank: 25, dc: 50},
        ];

        const spellTable = [
            {rank: 1, dc: 15},
            {rank: 2, dc: 18},
            {rank: 3, dc: 20},
            {rank: 4, dc: 23},
            {rank: 5, dc: 26},
            {rank: 6, dc: 28},
            {rank: 7, dc: 31},
            {rank: 8, dc: 34},
            {rank: 9, dc: 36},
            {rank: 10, dc: 39},
        ];

        // Choose the appropriate table based on counteractType
        const counteractTable = counteractType === 'effect' ? effectTable : spellTable;

        // Find the entry for the chosen rank
        const entry = counteractTable.find((entry) => entry.rank === levelRank);

        // Check for valid levelRank
        if (!entry) {
            ui.notifications.warn(`Invalid ${counteractType === 'effect' ? 'Effect Level' : 'Spell Rank'}.`);
            return;
        }

        // Get DC from the chosen table
        const dc = entry.dc;

        // Output the result
        ChatMessage.create({
            content: `@Check[type:spell|dc:${dc}]{Counteract Check}`,
        });
    }
}