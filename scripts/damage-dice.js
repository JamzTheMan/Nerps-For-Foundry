Hooks.on('diceSoNiceReady', (dice3d) => {
  // dice3d.addSystem({id: "PF2e Damage Dice", name: "PF2e Damage Dice"}, "default");

  /*
/r 2d12[spirit],3d8[void],2d6[vitality],2d10[holy],2d10[unholy],1d6[fire],1d6[cold],1d6[acid],1d6[electricity],1d6[sonic],1d6[force],1d6[poison],1d6[positive],1d6[negative],1d6[good],1d6[evil],1d6[lawful],1d6[chaotic],1d6[bleed],1d6[mental]
   */

  // /r 3d12[electricity], 3d6[electricity], 3d4[electricity]
  dice3d.addTexture("Electricity", {
    name: "Electricity",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/lightning.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/lightning.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'electricity',
      description: "Electricity [PF2e]",
      category: "Damage Types",
      texture: 'Electricity',
      foreground: '#FFFFFF',
      background: "#e6e6e6",
      outline: '#3b56ba',
      edge: '#3b56ba',
      material: 'metal',
      font: '📱 Iceberg',
      visibility: 'visible'
    }, "default");
  });

  // /r 3d6[positive]
  dice3d.addColorset({
    name: "positive",
    description: "Positive [PF2e]",
    category: "Damage Types",
    texture: "cloudy",
    foreground: "#ffffff",
    background: ["#d0e5ea", "#c3dee5", "#a4ccd6", "#8dafb7", "#80a4ad"],
    outline: "black",
    visibility: 'visible'
  }, "default");

  // /r 3d6[negative]
  dice3d.addColorset({
    name: "negative",
    description: "Negative [PF2e]",
    category: "Damage Types",
    texture: "cloudy",
    foreground: "#ffffff",
    background: ["#000000"],
    outline: "black",
    visibility: 'visible'
  }, "default");

  // /r 3d6[vitality]
  dice3d.addColorset({
    name: "vitality",
    description: "Vitality [PF2e]",
    category: "Damage Types",
    texture: "cloudy",
    foreground: "#ffffff",
    background: ["#d0e5ea", "#c3dee5", "#a4ccd6", "#8dafb7", "#80a4ad"],
    outline: "black",
    visibility: 'visible'
  }, "default");

  // /r 3d6[void]
  dice3d.addColorset({
    name: "void",
    description: "Void [PF2e]",
    category: "Damage Types",
    texture: "cloudy",
    foreground: "#ffffff",
    background: ["#000000"],
    outline: "black",
    visibility: 'visible'
  }, "default");

  // /r 3d6[good]
  dice3d.addTexture("Good", {
    name: "Good",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/good.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/good.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'good',
      description: "Good [PF2e]",
      category: "Damage Types",
      texture: 'Lavash',
      foreground: '#ffffff',
      background: "#ffe433",
      outline: '#703c00',
      edge: '#ffffff',
      material: 'metal',
      font: 'Eczar',
      visibility: 'visible'
    }, "default");
  });

  // /r 3d6[holy]
  dice3d.addTexture("holy", {
    name: "holy",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/good.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/good.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'holy',
      description: "Holy [PF2e]",
      category: "Damage Types",
      texture: 'holy',
      foreground: '#ffffff',
      background: "#ffe433",
      outline: '#703c00',
      edge: '#ffffff',
      material: 'metal',
      font: 'Eczar',
      visibility: 'visible'
    }, "default");
  });

  // /r 3d6[poison], 6d8[poison]
  dice3d.addTexture("Poison", {
    name: "Poison",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/poison2.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/poison2.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: "poison",
      description: "Poison [PF2e]",
      category: "Damage Types",
      texture: "Poison",
      foreground: '#ff0000',
      background: "#a1ac11",
      outline: '#8fd624',
      edge: '#eeff00',
      material: 'metal',
      visibility: 'visible'
    }, "default");
  });


  // // /r 3d6[poison]
  // dice3d.addTexture("Poison", {
  //   name: "Poison",
  //   composite: "multiply",
  //   source: "modules/nerps-for-foundry/images/dice/textures/poison.jpg",
  //   bump: "modules/nerps-for-foundry/images/dice/textures/bump/poison.jpg"
  // }).then(() => {
  //   dice3d.addColorset({
  //     name: "poison",
  //     description: "Poison [PF2e]",
  //     category: "Damage Types",
  //     texture: "Poison",
  //     foreground: "#ffffff",
  //     background: "#4e9018",
  //     outline: "#c8d421",
  //     edge: "#c8d421",
  //     visibility: 'visible'
  //   }, "default");
  // });

  // /r 3d6[bleed]
  dice3d.addTexture("Bleed", {
    name: "Bleed",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/bleed.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/bleed.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'bleed',
      description: "Bleed [PF2e]",
      category: "Damage Types",
      texture: 'Bleed',
      foreground: '#ffffff',
      background: "#ff4000",
      outline: '#ff8800',
      edge: '#cc7700',
      material: 'metal',
      font: 'Fire',
      fontScale: {
        "d6": 1.1,
        "df": 2.5
      },
      visibility: 'visible'
    }, "default");
  });

  /*
/r 3d6[lawful]
/r 3d6[chaotic],3d6[lawful]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[lawful]
*/
  dice3d.addTexture("Lawful", {
    name: "Lawful",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/lawful.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/lawful.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'lawful',
      description: "Lawful [PF2e]",
      category: "Damage Types",
      texture: 'Lawful',
      foreground: '#0a82c2',
      background: "#ffffff",
      outline: '#0a82c2',
      edge: '#ffffff',
      material: 'plastic',
      font: 'Lumber',
      fontScale: {
        "d8": 0.9
      },
      visibility: 'visible'
    }, "default");
  });

  /*
/r 3d6[chaotic]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[chaotic]
  */
  dice3d.addTexture("Chaotic", {
    name: "Chaotic",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/chaotic.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'chaotic',
      description: "Chaotic [PF2e]",
      category: "Damage Types",
      texture: 'Chaotic',
      foreground: '#ffffff',
      background: "#ffffff",
      outline: '#000000',
      edge: '#ffffff',
      material: 'metal',
      font: 'Lumber',
      fontScale: {
        "d8": 0.9
      },
      visibility: 'visible'
    }, "default");
  });

  /*
/r 3d6[sonic]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[sonic]
  */
  dice3d.addTexture("Sonic", {
    name: "Sonic",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/sonic.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/sonic.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'sonic',
      description: "Sonic [PF2e]",
      category: "Damage Types",
      texture: 'Sonic',
      foreground: '#ffffff',
      background: "#ff2ef8",
      outline: '#000000',
      edge: '#000000',
      material: 'iridescent',
      font: 'Lumber',
      visibility: 'visible'
    }, "default");
  });

  /*
/r 3d6[mental]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[mental]
  */
  dice3d.addTexture("Mental", {
    name: "Mental",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/fabulous.jpg",
    bump: "modules/nerps-for-foundry/images/dice/textures/fabulous.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'mental',
      description: "Mental [PF2e]",
      category: "Damage Types",
      texture: 'Mental',
      foreground: '#ffffff',
      background: "#c688e2",
      outline: '#000000',
      edge: '#000000',
      material: 'metal',
      font: 'Lumber',
      visibility: 'visible'
    }, "default");
  });

  /*
/r 3d6[evil]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[evil]
  */
  dice3d.addTexture("Evil", {
    name: "Evil",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/madness.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/madness-bump.webp"
  }).then(() => {
    dice3d.addColorset({
      name: 'evil',
      description: "Evil [PF2e]",
      category: "Damage Types",
      background: "#5e3636",
      foreground: '#a20606',
      outline: '#330000',
      edge: '#1a1a1a',
      texture: 'Evil',
      material: 'metal',
      fontScale: {
        "d100": 0.8,
        "d20": 0.9,
        "d12": 1.0,
        "d10": 0.9,
        "d8": 0.9,
        "d6": 1.2,
        "d2": 1.3
      },
      font: "Metamorphous"
    }, "default");
  });

/*
/r 3d6[unholy]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[unholy]
  */
  dice3d.addTexture("Unholy", {
    name: "Unholy",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/madness.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/madness-bump.webp"
  }).then(() => {
    dice3d.addColorset({
      name: 'unholy',
      description: "Unholy [PF2e]",
      category: "Damage Types",
      background: "#5e3636",
      foreground: '#a20606',
      outline: '#330000',
      edge: '#1a1a1a',
      texture: 'Unholy',
      material: 'metal',
      fontScale: {
        "d100": 0.8,
        "d20": 0.9,
        "d12": 1.0,
        "d10": 0.9,
        "d8": 0.9,
        "d6": 1.2,
        "d2": 1.3
      },
      font: "Metamorphous"
    }, "default");
  });

/*
/r 3d6[spirit]
/r {1d4,1d6,1d8,1d10,1d12,1d20}[spirit]
  */
  dice3d.addTexture("Spirit", {
    name: "Spirit",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/spirit.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/spirit.png"
  }).then(() => {
    dice3d.addColorset({
      name: 'spirit',
      description: "Spirit [PF2e]",
      category: "Damage Types",
      foreground: '#ffffff',
      background: "#7b94e7",
      outline: '#818181',
      edge: '#000000',
      texture: 'Spirit',
      material: 'metal',
      fontScale: {
        "d100": 0.8,
        "d20": 0.9,
        "d12": 1.0,
        "d10": 0.9,
        "d8": 0.9,
        "d6": 1.2,
        "d2": 1.3
      },
      font: "Metamorphous"
    }, "default");
  });

    dice3d.addTexture("Rusthenge 1", {
        name: "Rusthenge 1",
        composite: "multiply",
        source: "modules/nerps-for-foundry/images/dice/textures/rust-1.webp",
        bump: "modules/nerps-for-foundry/images/dice/textures/bump/rust-1.webp"
    }).then(() => {
        dice3d.addColorset({
            name: 'rusthenge-1',
            description: "Rusthenge 1",
            category: "Nerps for Dice",
            foreground: '#ffffff',
            background: "#cccccc",
            outline: '#000000',
            edge: '#ffffff',
            texture: 'Rusthenge 1',
            material: 'Stone',
            font: "Eczar"
        }, "default");
    });

    dice3d.addTexture("Rusthenge 2", {
        name: "Rusthenge 2",
        composite: "multiply",
        source: "modules/nerps-for-foundry/images/dice/textures/rust-2.webp",
        bump: "modules/nerps-for-foundry/images/dice/textures/bump/rust-2.webp"
    }).then(() => {
        dice3d.addColorset({
            name: 'rusthenge-2',
            description: "Rusthenge 2",
            category: "Nerps for Dice",
            foreground: '#ffffff',
            background: "#ca9563",
            outline: '#000000',
            edge: '#ffffff',
            texture: 'Rusthenge 2',
            material: 'Stone',
            font: "Eczar"
        }, "default");
    });

  dice3d.addTexture("Rusthenge 3", {
    name: "Rusthenge 3",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/rust-3.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/rust-3.webp"
  }).then(() => {
    dice3d.addColorset({
      name: 'rusthenge-3',
      description: "Rusthenge 3",
      category: "Nerps for Dice",
      foreground: '#000000',
      background: "#ffffff",
      outline: '#ffffff',
      edge: '#ffffff',
      texture: 'Rusthenge 3',
      material: 'Stone',
      font: "Modesto Condensed"
    }, "default");
  });

  dice3d.addTexture("Rusthenge 4", {
    name: "Rusthenge 4",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/rust-4.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/rust-4.webp"
  }).then(() => {
    dice3d.addColorset({
      name: 'rusthenge-4',
      description: "Rusthenge 4",
      category: "Nerps for Dice",
      foreground: '#ffffff',
      background: "#e6e6e6",
      outline: '#000000',
      edge: '#ffffff',
      texture: 'Rusthenge 4',
      material: 'Stone',
      font: "Eczar"
    }, "default");
  });

  dice3d.addTexture("Rusthenge 5", {
    name: "Rusthenge 5",
    composite: "multiply",
    source: "modules/nerps-for-foundry/images/dice/textures/rust-5.webp",
    bump: "modules/nerps-for-foundry/images/dice/textures/bump/rust-5.webp"
  }).then(() => {
    dice3d.addColorset({
      name: 'rusthenge-5',
      description: "Rusthenge 5",
      category: "Nerps for Dice",
      foreground: '#ffffff',
      background: "#cccccc",
      outline: '#000000',
      edge: '#ffffff',
      texture: 'Rusthenge 5',
      material: 'Stone',
      font: "Eczar"
    }, "default");
  });
});