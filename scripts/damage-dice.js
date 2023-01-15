Hooks.on('diceSoNiceReady', (dice3d) => {
  // dice3d.addSystem({id: "PF2e Damage Dice", name: "PF2e Damage Dice"}, "default");

  // /r 3d12[electricity], 3d6[electricity], 3d4[electricity]
  dice3d.addTexture("Electricity", {
    name: "Electricity",
    composite: "multiply",
    source: "modules/Nerps-For-Foundry/images/dice/textures/lightning.jpg",
    bump: "modules/Nerps-For-Foundry/images/dice/textures/lightning.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'electricity',
      description: "Electricity",
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
    description: "Positive",
    category: "Damage Types",
    texture: "cloudy",
    foreground: "#ffffff",
    background: ["#d0e5ea", "#c3dee5", "#a4ccd6", "#8dafb7", "#80a4ad"],
    outline: "black",
    visibility: 'visible'
  }, "default");

  dice3d.addTexture("Good", {
    name: "Good",
    composite: "multiply",
    source: "modules/Nerps-For-Foundry/images/dice/textures/good.jpg",
    bump: "modules/Nerps-For-Foundry/images/dice/textures/good.jpg"
  }).then(() => {
    dice3d.addColorset({
      name: 'good',
      description: "Good",
      category: "Damage Types",
      texture: 'Good',
      foreground: '#0e0434',
      background: "#f7f497",
      outline: '#62569f',
      edge: '#ffffff',
      material: 'metal',
      font: 'Eczar',
      visibility: 'visible'
    }, "default");
  });

  // dice3d.addColorset({
  //   name: "good",
  //   description: "Good",
  //   category: "Damage Types",
  //   texture: "stone",
  //   foreground: "#FFD800",
  //   background: "#f6f6f3",
  //   outline: "#000000",
  //   visibility: 'visible'
  // }, "default");

  // dice3d.addTexture("icy", {
  //   name: "🐸 Streaks",
  //   composite: "overlay",
  //   source: "modules/lordudice/graphics/dice/icy.webp",
  //   bump: "modules/lordudice/graphics/dice/icy-bump.webp"
  // })
  //       .then(() => {
  //         dice3d.addColorset({
  //           name: 'LCD - Streaks colors',
  //           description: "🐸 Streaks",
  //           category: "LCD - Forbidden Knowledge",
  //           background: "#033529",
  //           foreground: '#ffffff',
  //           outline: '#1f3322',
  //           edge: '#8c8c8c',
  //           texture: 'icy',
  //           material: 'metal',
  //           font: "Metal Mania"
  //         }, "default");
  //       });

});