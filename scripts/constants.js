export const MODULE_NAME = "Nerps-For-Foundry";
export const MODULE_PATH = `modules/${MODULE_NAME}`;
export const JOURNAL_MARKER = `<footer style="visibility: hidden;">Infused with Nerps!</footer>`;
// alt marker <footer style="color: #ced4d9; text-align: right;"><small><em>Infused with Nerps!&trade; </em></small></footer>

export const DEFAULT_RULES = [
  {
    "name": "Remove classes and styles",
    "findExpression": '(?<=<\\w+) (class|style)=".*?"(?=>)',
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
    "replaceExpression": "@Check[type:arcana|dc:$1|traits:action:recall-knowledge]{Recall Knowledge: Arcana}"
  },
  {
    "name": "Migrate Knowledge (local) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(local\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:society|dc:$1|traits:action:recall-knowledge]{Recall Knowledge: Society}"
  },
  {
    "name": "Migrate Knowledge (nature) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(nature\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:nature|dc:$1|traits:action:recall-knowledge]{Recall Knowledge: Nature}"
  },
  {
    "name": "Migrate Knowledge (religion) checks @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\(religion\\)",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:religion|dc:$1|traits:action:recall-knowledge]{Recall Knowledge: Religion}"
  },
  {
    "name": "Migrate other Knowledge checks to lore @Check",
    "findExpression": "DC ([0-9]+) Knowledge \\((.*)\\) ",
    "lowerCaseFirst": true,
    "replaceExpression": "@Check[type:$2-lore|dc:$1]"
  }
]

export const RULES_UNUSED = [
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