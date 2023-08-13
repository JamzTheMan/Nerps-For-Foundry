export const MODULE_NAME = 'nerps-for-foundry';
export const MODULE_PATH = `modules/${MODULE_NAME}`;
export const JOURNAL_MARKER = `<footer style="visibility: hidden;">Infused with Nerps!</footer>`;
// alt marker <footer style="color: #ced4d9; text-align: right;"><small><em>Infused with Nerps!&trade; </em></small></footer>

export let DEFAULT_RULES = [
  {
    "name": "Remove classes and styles except specified classes",
    "findExpression": '(?<=<\\w+) (class|style)=".*(?<!(fumble-deck|critical-deck))"(?=>)',
    "replaceExpression": "",
    "doOnce": true
  },
  {
    "name": "Remove back to back strong elements from MS Word",
    "findExpression": '<\\/strong><strong>',
    "replaceExpression": "",
    "doOnce": true
  },
  {
    "name": "Replace nbsp",
    "findExpression": '&nbsp;',
    "replaceExpression": " ",
    "doOnce": true
  },
  {
    "name": "Replace &rsquo;",
    "findExpression": '&rsquo;',
    "replaceExpression": "'",
  },
  {
    "name": "Remove double spaces",
    "findExpression": '  ',
    "replaceExpression": " ",
  },
  {
    "name": "Fix f word copy issue",
    "findExpression": ' f ',
    "replaceExpression": " f",
    "doOnce": true
  },
  {
    "name": "Add paragraph breaks",
    "findExpression": "(?<=[.!])[\\r\\n]",
    "replaceExpression": '</p><p class="nerps-ident">'
  }
]

export let LINK_RULES = [
  {
    "name": "Create Fortitude Save @Check",
    "findExpression": " fortitude (save|saving throw)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Check[type:fortitude]"
  },
  {
    "name": "Create Reflex Save @Check",
    "findExpression": " reflex (save|saving throw)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Check[type:reflex]"
  },
  {
    "name": "Create Will Save @Check",
    "findExpression": " will (save|saving throw)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Check[type:will]"
  },
  {
    "name": "Create Skill @Check",
    "findExpression": " DC ([0-9]+) (Athletics)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Check[type:$2|dc:$1]"
  },
  {
    "name": "Create Persistent Damage link",
    "findExpression": " ([0-9]+|[0-9]+d[0-9]+) persistent (bleed) damage",
    "lowerCaseFirst": true,
    // "replaceExpression": " [[/r $1#persistent $2]]"
    "replaceExpression": " @Localize[PF2E.PersistentDamage.Bleed$1.success]"
  },
  {
    "name": "Create Typed Damage link",
    "findExpression": " ([0-9]+d?[0-9]+?) (\\w+) damage",
    "lowerCaseFirst": true,
    "replaceExpression": " [[/r {$1}[$2]]] damage"
  },
  {
    "name": "Create die roll link",
    "findExpression": " ([0-9]+d[0-9]+) ",
    "lowerCaseFirst": true,
    "replaceExpression": " [[/r $1]] "
  },
  {
    "name": "Link Blinded to Compendium",
    "findExpression": " (Blinded) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.XgEqL1kFApUbl5Z2]{Blinded}"
  },
  {
    "name": "Link Controlled to Compendium",
    "findExpression": " (Controlled) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.9qGBRpbX9NEwtAAr]{Controlled}"
  },
  {
    "name": "Link Dazzled to Compendium",
    "findExpression": " (dazzled) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.TkIyaNPgTZFBCCuh]{Dazzled}"
  },
  {
    "name": "Link Deafened to Compendium",
    "findExpression": " (deafened) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.9PR9y0bi4JPKnHPR]{Deafened}"
  },
  {
    "name": "Link Drained to Compendium",
    "findExpression": " (drained) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.4D2KBtexWXa6oUMR]{Drained $2}"
  },
  {
    "name": "Link Enfeebled to Compendium",
    "findExpression": " (enfeebled) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.MIRkyAjyBeXivMa7]{Enfeebled $2}"
  },
  {
    "name": "Link Frightened to Compendium",
    "findExpression": " (frightened) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.TBSHQspnbcqxsmjL]{Frightened $2}"
  },
  {
    "name": "Link Invisible to Compendium",
    "findExpression": " (invisible) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.zJxUflt9np0q4yML]{Invisible}"
  },
  {
    "name": "Link Confused to Compendium",
    "findExpression": " (Confused) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.yblD8fOR1J8rDwEQ]{Confused}"
  },
  {
    "name": "Link Slowed to Compendium",
    "findExpression": " (slowed) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.xYTAsEpcJE1Ccni3]{Slowed $2}"
  },
  {
    "name": "Link Sickened to Compendium",
    "findExpression": " (sickened) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.fesd1n5eVhpCSS18]{Sickened $2}"
  },
  {
    "name": "Link Clumsy to Compendium",
    "findExpression": " (Clumsy) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.i3OJZU2nk64Df3xm]{Clumsy $2}"
  },
  {
    "name": "Link Doomed to Compendium",
    "findExpression": " (Doomed) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.3uh1r86TzbQvosxv]{Doomed $2}"
  },
  {
    "name": "Link Encumbered to Compendium",
    "findExpression": " (Encumbered) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.D5mg6Tc7Jzrj6ro7]{Encumbered}"
  },
  {
    "name": "Link Fatigued to Compendium",
    "findExpression": " (Fatigued) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.HL2l2VRSaQHu9lUw]{Fatigued}"
  },
  {
    "name": "Link Flat-Footed to Compendium",
    "findExpression": " (flat-footed) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.AJh5ex99aV6VTggg]{Flat-Footed}"
  },
  {
    "name": "Link Grab to Compendium",
    "findExpression": " (Grab) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.bestiary-ability-glossary-srd.Tkd8sH4pwFIPzqTr]{Grab}"
  },
  {
    "name": "Link Grapple to Compendium",
    "findExpression": " (Grapple) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.actionspf2e.PMbdMWc2QroouFGD]{Grapple}"
  },
  {
    "name": "Link Grapple to Compendium",
    "findExpression": " (Restrained) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.VcDeM8A5oI6VqhbM]{Restrained}"
  },
  {
    "name": "Link Prone to Compendium",
    "findExpression": " (prone) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.j91X7x0XSomq8d60]{Prone}"
  },
  {
    "name": "Link Stupefied to Compendium",
    "findExpression": " (stupefied) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.e1XGnhKNSQIm5IXg]{Stupefied $2}"
  },
  {
    "name": "Link Stunned to Compendium",
    "findExpression": " (stunned) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.dfCMdR4wnpbYNTix]{Stunned $2}"
  },
  {
    "name": "Link Trip to Compendium",
    "findExpression": " (Trip) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.actionspf2e.ge56Lu1xXVFYUnLP]{Trip}"
  },
  {
    "name": "Link Shove to Compendium",
    "findExpression": " (Shove) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.actionspf2e.7blmbDrQFNfdT731]{Shove}"
  },
  {
    "name": "Link Unconscious to Compendium",
    "findExpression": " (unconscious) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.fBnFDH2MTzgFijKf]{Unconscious}"
  },
  {
    "name": "Link Unconscious to Compendium",
    "findExpression": " (Interact) ",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.actionspf2e.pvQ5rY2zrtPI614F]{Interact}"
  },
  {
    "name": "Link Wounded to Compendium",
    "findExpression": " (wounded) ([0-9]+)",
    "lowerCaseFirst": true,
    "replaceExpression": " @Compendium[pf2e.conditionitems.Yl48xTdMh3aeQYL2]{Wounded $2}"
  }
]

export const MIGRATE_PF1E_SKILL_CHECKS = [
  {
    "name": "Migrate Saves to @Check",
    "findExpression": "DC ([0-9]+) (.*) save",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2|dc:$1|basic:true]"
  },
  {
    "name": "Migrate Perception DC to @Check",
    "findExpression": "DC ([0-9]+) Perception",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:perception|dc:$1|traits:action:search,secret]{Search}"
  },
  {
    "name": "Migrate Sense Motive DC to @Check",
    "findExpression": "DC ([0-9]+) Sense Motive",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:perception|dc:$1|traits:action:sense-motive,secret]{Sense Motive}"
  },
  {
    "name": "Migrate matching 1E skills to @Check",
    "findExpression": "DC ([0-9]+) (Acrobatics|Diplomacy|Stealth|Survival)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2|dc:$1]"
  },
  {
    "name": "Migrate Appraise @Check",
    "findExpression": "DC ([0-9]+) Appraise",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:crafting|dc:$1|traits:secret]"
  },
  {
    "name": "Migrate Bluff @Check",
    "findExpression": "DC ([0-9]+) Bluff",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:deception|dc:$1|traits:action:lie,secret]{Lie}"
  },
  {
    "name": "Migrate Craft @Check",
    "findExpression": "DC ([0-9]+) Craft",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:crafting|dc:$1|traits:action:craft]{Craft}"
  },
  {
    "name": "Migrate Disable Device @Check",
    "findExpression": "DC ([0-9]+) Disable Device",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:thievery|dc:$1|traits:action:disable-device]{Disable Device}"
  },
  {
    "name": "Migrate Sleight of Hand @Check",
    "findExpression": "DC ([0-9]+) Sleight of Hand",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:thievery|dc:$1|traits:action:palm-an-object]{Palm an Object}"
  },
  {
    "name": "Migrate Disguise @Check",
    "findExpression": "DC ([0-9]+) Disguise",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:deception|dc:$1|traits:action:impersonate,secret]{Impersonate}"
  },
  {
    "name": "Migrate Fly @Check",
    "findExpression": "DC ([0-9]+) Fly",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:acrobatics|dc:$1|traits:action:maneuver-in-flight]{Maneuver in Flight}"
  },
  {
    "name": "Migrate Handle Animal @Check",
    "findExpression": "DC ([0-9]+) Handle Animal",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:nature|dc:$1|traits:action:command-an-animal]{Command an Animal}"
  },
  {
    "name": "Migrate Heal @Check",
    "findExpression": "DC ([0-9]+) Heal",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:medicine|dc:$1]"
  },
  {
    "name": "Migrate Intimidate @Check",
    "findExpression": "DC ([0-9]+) Intimidate",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:intimidation|dc:$1|traits:action:coerce]{Coerce}"
  },
  {
    "name": "Migrate Perform @Check",
    "findExpression": "DC ([0-9]+) Perform",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:performance|dc:$1|traits:action:perform]{Perform}"
  },
  {
    "name": "Migrate Climb DC to @Check",
    "findExpression": "DC ([0-9]+) Climb",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:athletics|dc:$1|traits:action:climb]{Climb}"
  },
  {
    "name": "Migrate Swim DC to @Check",
    "findExpression": "DC ([0-9]+) Swim",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:athletics|dc:$1|traits:action:swim]{Swim}"
  },
  {
    "name": "Migrate Linguistics checks @Check",
    "findExpression": "DC ([0-9]+) Linguistics",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:society|dc:$1|traits:action:decipher-writing,secret]{Decipher Writing}"
  },
  {
    "name": "Migrate Ride checks @Check",
    "findExpression": "DC ([0-9]+) Ride",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:nature|dc:$1|traits:action:command-an-animal]{Command an Animal}"
  },
  {
    "name": "Migrate Knowledge (arcana) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(arcana\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:arcana|dc:$1|traits:action:recall-knowledge,secret]{Recall Knowledge: Arcana}"
  },
  {
    "name": "Migrate Knowledge (local) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(local\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:society|dc:$1|traits:action:recall-knowledge,secret]{Recall Knowledge: Society}"
  },
  {
    "name": "Migrate Knowledge (nature) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(nature\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:nature|dc:$1|traits:action:recall-knowledge,secret]{Recall Knowledge: Nature}"
  },
  {
    "name": "Migrate Knowledge (religion) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(religion\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:religion|dc:$1|traits:action:recall-knowledge,secret]{Recall Knowledge: Religion}"
  },
  {
    "name": "Migrate other Knowledge checks to lore @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\((.*)\\) ",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2-lore|dc:$1|traits:action:recall-knowledge,secret]"
  }
]

export const RULES_UNUSED = [
  {
    "name": "Remove H3 headers from Crit Tables",
    "findExpression": "(?<!Bludgeoning|Piercing|Slashing|Bomb or Spell|Melee|Ranged|Unarmed|Spell)<\\/?h3>(?!Bludgeoning|Piercing|Slashing|Bomb or Spell|Melee|Ranged|Unarmed|Spell)",
    "lowerCaseFirst": true,
    "replaceExpression": ""
  },
  {
    "name": "Add H3 headers back to Crit Tables Headers",
    "findExpression": "(?<=<th><strong>)(Name|Crit Effect|Type)",
    "lowerCaseFirst": false,
    "replaceExpression": "<h3>$1</h3>"
  },
  {
    "name": "Remove paragraph tags",
    "findExpression": '<p( style=".*")?>',
    "replaceExpression": ""
  },
  {
    "name": "Remove paragraph end tags",
    "findExpression": "</p>",
    "replaceExpression": ""
  },
  {
    "name": "Replace non breaking spaces",
    "findExpression": "&nbsp;",
    "replaceExpression": " "
  },
  {
    "name": "Remove double spaces",
    "findExpression": "[ ]+",
    "replaceExpression": " "
  },
  {
    "name": "Remove trailing and leading whitespace",
    "findExpression": "^s*(.*)s*$",
    "replaceExpression": "$1"
  },
  {
    "name": "Add paragraph breaks",
    "findExpression": "\\.([A-Z])",
    "replaceExpression": ".</p>\n<p>$1"
  },
  {
    "name": "Fix stupid F",
    "findExpression": " f ",
    "replaceExpression": " f"
  },
  {
    "name": "Fix stupid Jorgenfist",
    "findExpression": "Jorgenf ist",
    "replaceExpression": "Jorgenfist"
  },
  {
    "name": "Find Special Keywords",
    "findExpression": "(TRAP|DEVELOPMENT|CREATURE|CREATURES|TREASURE|TACTICS|HAUNT|STORY AWARD)(: )",
    "replaceExpression": "</p><h4>$1</h4><p>"
  },
  {
    "name": "Find Tactics",
    "findExpression": "(TACTICS)",
    "replaceExpression": "</p>\n<br />\n<h4>$1</h4>\n<p>"
  },
  {
    "name": "Migrate Saves to @Check",
    "findExpression": "DC ([0-9]+) (.*) save",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2|dc:$1|basic:true]"
  },
  {
    "name": "Migrate to Knowledge checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\((.*)\\) ",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2-lore|dc:$1]"
  }
]