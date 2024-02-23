import {adjustShieldHP} from "../macros/adjust-shield-hp.js";
import {combineDamage} from "../macros/combine-damage.js";
import {measureTokenDistance} from "../macros/measure-token-distances.js";
import {repairTargetsShield} from "../macros/repair-targets-shield.js";
import {setTokenBarsAndNameplates} from "../macros/set-token-bars-and-nameplates.js";
import {JOURNAL_MARKER, MODULE_NAME} from "./constants.js";
import {registerSettings} from "./settings-for-nerps.js";
import {getSetting, setSetting} from "./utils/extensions.js";
import {NerpsForFoundry, log} from "./nerps-for-foundry.js";
import {autoCorrectJournalContent} from "./autocorrect-journal-content.js"

let socket;

/*
    __  __            __
   / / / /___  ____  / /_______
  / /_/ / __ \/ __ \/ //_/ ___/
 / __  / /_/ / /_/ / ,< (__  )
/_/ /_/\____/\____/_/|_/____/
                               */
Hooks.once('init', async function () {
  console.log(`%c

  _  _                     _ _      ___                 _          
 | \\| |___ _ _ _ __ ______| | | ___| __|__ _  _ _ _  __| |_ _ _  _ 
 | .\` / -_) '_| '_ (_-<___|_  _|___| _/ _ \\ || | ' \\/ _\` | '_| || |
 |_|\\_\\___|_| | .__/__/     |_|    |_|\\___/\\_,_|_||_\\__,_|_|  \\_, |
              |_|                                             |__/                                                   
v${game.modules.get(MODULE_NAME).version}
`, `font-family: monospace`); // Small

  registerSettings();

  if (getSetting('journal-editor-tools')) {
    tinymce.PluginManager.add("nerpsJournalFix", function (editor) {
      editor.ui.registry.addButton("nerpsJournalFix", {
        tooltip: "Apply autocorrections to journal, infused with Nerps.",
        icon: "format-painter",
        onAction: function () {
          editor.setDirty(true)
          const selectedContent = editor.selection.getContent();
          if (selectedContent === "") {
            const newJournalContent = autoCorrectJournalContent(editor.getContent());
            editor.setContent(newJournalContent);
          } else {
            const newSelectedContent = autoCorrectJournalContent(selectedContent);
            editor.selection.setContent(newSelectedContent);
          }

          const newContent = editor.getContent().replaceAll(JOURNAL_MARKER, "");
          editor.setContent(`${newContent}`);
          // editor.setContent(`${newContent}\n${JOURNAL_MARKER}`);
        },
      });
    });

    tinymce.PluginManager.add("nerpsJournalPasteAndFix", function (editor) {
      editor.ui.registry.addButton("nerpsJournalPasteAndFix", {
        tooltip: "Paste from clipboard with autocorrections, infused with Nerps, to the journal.",
        icon: "paste",
        onAction: function () {
          editor.setDirty(true)
          navigator.clipboard.readText().then(pasteContent => {
            editor.insertContent(autoCorrectJournalContent(pasteContent));
            const newContent = editor.getContent().replaceAll(JOURNAL_MARKER, "");
            editor.setContent(`${newContent}`);
            // editor.setContent(`${newContent}\n${JOURNAL_MARKER}`);
          })
        },
      });
    });

    // Convenience button to set text to block quote and font size 14
    tinymce.PluginManager.add("nerpsJournalBlockquote", function (editor) {
      editor.ui.registry.addButton("nerpsJournalBlockquote", {
        tooltip: "Format selected text, infused with Nerps, to the journal.",
        icon: "quote",
        onAction: function () {
          const selectedContent = editor.selection.getContent();
          if (selectedContent !== "") {
            editor.setDirty(true)
            editor.execCommand("mceBlockQuote");
            editor.execCommand('FontSize', false, '14pt');
          }
        },
      });
    });

    CONFIG.TinyMCE.plugins = CONFIG.TinyMCE.plugins + " nerpsJournalFix nerpsJournalPasteAndFix nerpsJournalBlockquote";
    CONFIG.TinyMCE.toolbar = CONFIG.TinyMCE.toolbar + " nerpsJournalFix nerpsJournalPasteAndFix nerpsJournalBlockquote";
  }

  /*
    Export out functions to be used in macro scripts...
   */
  log.info("Exposing macro functions...")
  game.nerps = mergeObject(game.nerps ?? {}, {
    "measureTokenDistance": measureTokenDistance,
    "repairTargetsShield": repairTargetsShield,
    "adjustShieldHP": adjustShieldHP,
    "combineDamage": combineDamage,
    "setTokenBarsAndNameplates": setTokenBarsAndNameplates
  });

  log.info("### Initialized! ###");
});

Hooks.once('ready', async function () {
  window.NerpsForFoundry = new NerpsForFoundry();

  if (getSetting('load-custom-css-override')) {
    window.NerpsForFoundry.loadCustomCssOverrides();
  }

  log.info("### Ready! ###");
});

Hooks.on("pf2e.startTurn", async (combatant, _combat, userId) => {
  if (canvas.ready) {
     if (getSetting("auto-remove-reaction-effects")) {
       // await removeReactions(combatant, 'turn-start');
       await socket.executeAsGM(removeReactions, combatant.actorId, 'turn-start');
    }
  }
});

Hooks.on("pf2e.endTurn", async (combatant, _combat, userId) => {
  if (canvas.ready) {
    if (getSetting("auto-remove-reaction-effects")) {
      await socket.executeAsGM(removeReactions, combatant.actorId, 'turn-end');
    }
  }
});

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule(MODULE_NAME);
  socket.register("removeReactions", removeReactions);
  log.info("SocketLib ready!");
});

async function removeReactions(combatantActorId, expiryText) {
  await window.NerpsForFoundry.RemoveReactionEffects(combatantActorId, expiryText);
}