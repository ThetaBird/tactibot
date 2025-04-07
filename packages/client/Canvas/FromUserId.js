const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const {
  getFileFromPath,
  getImageFromComponentList,
  getImageFromIMGURL,
  getImageComponent,
  getTextComponent,
  getTemplate,
  Colors,
  getMatrixComponent,
} = require("./_Util");

const width = 1000; // define width and height of canvas
const height = 1000;
const backgroundColour = "rgba(0,0,0,0)";
let template;
let emptytemplate;

const loadImages = async () => {
  template = await getTemplate("Stat_Template");
  emptytemplate = await getTemplate("Stat_Template_Op");
};
loadImages();

const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

const displayLabels = {
  smg: "SMG",
  shotgun: "Shotgun",
  assault: "Assault",
  sniper: "Sniper",
  machinegun: "LMG",
  prototypes: "Prototype",
  secondary: "Pistol",
  melee: "Melee",
  vehicle: "Vehicle",
  explosive: "Explosive",
  physics: "Physics",
};

const iconIdPath = `assets/clan_icons`;
const avatarPath = `assets/avatars`;
const countryFlagPath = `assets/country_flags`;
const clanCountryFlagPath = `assets/country_flags`;

const talentColors = [
  Colors.common,
  Colors.uncommon,
  Colors.rare,
  Colors.epic,
  Colors.legendary,
];

const createFromUserIdImage = async (player, clan, presets) => {
  try {
    const imageComponentPromise = getImageComponents(player, clan, presets);
    const imageComponents = await imageComponentPromise;

    const fromUserIdBuffer = getImageFromComponentList(
      1280,
      705,
      imageComponents
    );
    return fromUserIdBuffer;
  } catch (error) {
    console.error(error);
  }
};

const getImageComponents = async (player, clan, presets) => {
  const {
    publicID,
    countryCode,
    level,
    name,
    rating,
    avatarId,
    avgGamesPerWeek,
    killsPerGame,
    killData,
    matches,
    timePlayed,
    winRate,
  } = player;
  const {
    tag,
    tagColor,
    iconID,
    country,
    memberCount,
    capacity,
    minRating,
    avgRating,
    isPrivate,
    clanmateCount,
  } = clan;
  const clanName = clan.name;
  const { kills, assists, kdr } = killData;

  const presetComponents = [];
  const mainComponents = [];

  const PRESET_X_OFFSET = 100;
  const PRESET_X_DIFF = 400;

  const [ic_p, av_p, cf_p, ccf_p] = [
    getFileFromPath(iconIdPath, iconID),
    getFileFromPath(avatarPath, avatarId),
    getFileFromPath(countryFlagPath, countryCode?.toLowerCase() || "00"),
    getFileFromPath(clanCountryFlagPath, country ? country.toLowerCase() : ""),
  ];
  const [clanIcon, avatar, countryFlag, clanCountryFlag] = await Promise.all([
    ic_p,
    av_p,
    cf_p,
    ccf_p,
  ]);
  const PRIMARYCOLOR = tagColor ? Colors[`tag_${tagColor}`] : Colors.PZDGold;

  if (presets) {
    for (let i = 0; i < presets.length; i++) {
      const x = PRESET_X_OFFSET + PRESET_X_DIFF * i;
      let height = 275;
      const preset = presets[i];
      const {
        heroName,
        heroType,
        heroLevel,
        talentIds,
        special1Name,
        special1Level,
        special2Name,
        special2Level,
        primaryName,
        primarySkinName,
        primarySkinType,
        primaryLevel,
        primaryModules,
        secondaryName,
        secondarySkinName,
        secondarySkinType,
        secondaryLevel,
        secondaryModules,
      } = preset;
      const heroMatrix = [[], [], []];

      const foundTalentList = opTalents[heroName];
      const talentStats = {};
      for (let j = 0; j < 10; j++) {
        const idx = (talentIds || [])[j];
        const activeColor = talentColors[parseInt(j / 2)];
        heroMatrix[0].push(idx == 0 ? activeColor : Colors.empty);
        heroMatrix[1].push(idx == 1 ? activeColor : Colors.empty);
        heroMatrix[2].push(idx == 2 ? activeColor : Colors.empty);
        if (idx === undefined || !foundTalentList) continue;
        const foundTalent = foundTalentList[j][idx];
        if (!foundTalent) continue;
        const talentName = Object.keys(foundTalent)[0];
        talentStats[talentName] =
          (talentStats[talentName] || 0) + foundTalent[talentName];
      }
      const primaryMatrix = [[Colors.pzdg], [Colors.pzdg], [Colors.pzdg]].map(
        (e, i) => (primaryModules[i] ? [Colors.PZDBeige] : e)
      );
      const secondaryMatrix = secondaryModules?.length
        ? [[Colors.pzdg], [Colors.pzdg], [Colors.pzdg]].map((e, i) =>
            secondaryModules[i] ? [Colors.PZDBeige] : e
          )
        : null;

      let talentText = "";
      Object.keys(talentStats).forEach((key) => {
        const [percent, text] = globalUniqueTalentsObject[key] || [];
        if (!text) talentText += `${key}: ${talentStats[key]}\n`;
        else
          talentText += `${percent.replace("XX", talentStats[key])}${text}\n`;
      });

      const talentComponent = getTextComponent(
        `${talentText}`,
        x + 290,
        height - 5,
        Colors.PZDGrey,
        "bold 9pt panzerdog",
        "right"
      );
      const opTypeComponent = getTextComponent(
        `${(heroType || "UNKNOWN").toUpperCase()} • ${heroLevel}`,
        x,
        height,
        Colors[heroType] || Colors.PZDGold,
        "bold 17pt panzerdog"
      );
      const opNameComponent = getTextComponent(
        `${heroName || "UNKNOWN"}`,
        x,
        (height += 40),
        Colors.PZDWhite,
        "bold 30pt panzerdog",
        "left"
      );
      const opMatrixComponent = getMatrixComponent(
        heroMatrix,
        x,
        (height += 20)
      );

      const primarySkinNameComponent = getTextComponent(
        `${(primarySkinName || "STOCK").toUpperCase()}`,
        x,
        (height += 60),
        Colors[primarySkinType] || Colors.PZDWhite,
        "bold 14pt panzerdog"
      );
      const primaryLvlComponent = getTextComponent(
        ` • ${primaryLevel}`,
        x + primarySkinNameComponent.width,
        height,
        Colors.PZDWhite,
        "bold 12pt panzerdog"
      );

      const pMatrixComponent = getMatrixComponent(
        primaryMatrix,
        x,
        (height += 15)
      );
      const primaryNameComponent = getTextComponent(
        `${primaryName || "UNKNOWN"}`,
        x + 15,
        (height += 20),
        Colors.PZDWhite,
        "bold 24pt panzerdog"
      );

      const secondarySkinNameComponent = getTextComponent(
        `${(secondarySkinName || "STOCK").toUpperCase()}`,
        x,
        (height += 40),
        Colors[secondarySkinType] || Colors.PZDWhite,
        "bold 14pt panzerdog"
      );
      const secondaryLvlComponent = getTextComponent(
        ` • ${secondaryLevel}`,
        x + secondarySkinNameComponent.width,
        height,
        Colors.PZDWhite,
        "bold 12pt panzerdog"
      );
      const sMatrixComponent = secondaryMatrix
        ? [getMatrixComponent(secondaryMatrix, x, (height += 15))]
        : [];
      const secondaryNameComponent = getTextComponent(
        `${secondaryName || "UNKNOWN"}`,
        x + (secondaryMatrix ? 15 : 0),
        (height += secondaryMatrix ? 20 : 35),
        Colors.PZDWhite,
        "bold 24pt panzerdog"
      );

      const special1LvlComponent = getTextComponent(
        `SPECIAL ` + (special1Level ? `• ${special1Level}` : ""),
        x,
        (height += 30),
        Colors.PZDGrey,
        "12pt panzerdog"
      );
      const special1NameComponent = getTextComponent(
        `${special1Name || "UNKNOWN"}`,
        x,
        (height += 35),
        Colors.PZDWhite,
        "24pt panzerdog"
      );
      const special2LvlComponent = getTextComponent(
        `SPECIAL ` + (special2Level ? `• ${special2Level}` : ""),
        x,
        (height += 30),
        Colors.PZDGrey,
        "12pt panzerdog"
      );
      const special2NameComponent = getTextComponent(
        `${special2Name || "UNKNOWN"}`,
        x,
        (height += 35),
        Colors.PZDWhite,
        "24pt panzerdog"
      );

      presetComponents.push(
        talentComponent,
        opTypeComponent,
        opNameComponent,
        opMatrixComponent,
        primarySkinNameComponent,
        primaryLvlComponent,
        pMatrixComponent,
        primaryNameComponent,
        secondarySkinNameComponent,
        secondaryLvlComponent,
        ...sMatrixComponent,
        secondaryNameComponent,
        special1LvlComponent,
        special1NameComponent,
        special2LvlComponent,
        special2NameComponent
      );
    }
  } else {
    const clanComponents = [];
    if (clanName) {
      const clanTagComponent = getTextComponent(
        `[${tag}] `,
        140,
        620,
        PRIMARYCOLOR,
        "bold 36pt panzerdog"
      );
      const clanNameComponent = getTextComponent(
        `${clanName} `,
        140 + clanTagComponent.width,
        620,
        Colors.PZDWhite,
        "bold 36pt panzerdog"
      );
      const clanData = [
        memberCount && capacity ? `${memberCount}/${capacity} Members` : "",
        isPrivate || minRating
          ? `[ ${isPrivate ? "Private" : "Min. Rating: " + minRating} ]`
          : "",
        avgRating ? `[ Avg. Rating: ${avgRating} ]` : "",
        clanmateCount ? `${clanmateCount} Linked Members` : "",
      ].filter((d) => d.length);

      const clanDataText = clanData.length
        ? clanData.join(` • `)
        : `[ No Information Available ]`;
      clanComponents.push(
        getImageComponent(clanIcon, 70, 575, 63, 65),
        getImageComponent(clanCountryFlag, 85, 640, 30, 22),
        clanTagComponent,
        clanNameComponent,
        getTextComponent(
          clanDataText,
          140,
          660,
          Colors.PZDGrey,
          "bold 14pt panzerdog"
        )
      );
    } else {
      clanComponents.push(
        getTextComponent(
          `[ No Clan Found ]`,
          70,
          620,
          Colors.PZDGrey,
          "bold 36pt panzerdog"
        )
      );
    }
    const killDataRadar = await getImageFromIMGURL(
      await getKillDataRadar(killData, PRIMARYCOLOR)
    );
    mainComponents.push(
      getTextComponent(
        `${matches}`,
        130,
        330,
        Colors.PZDWhite,
        "bold 36pt panzerdog",
        "center"
      ),
      getTextComponent(
        winRate,
        340,
        330,
        Colors.PZDWhite,
        "bold 36pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${timePlayed}`,
        535,
        330,
        Colors.PZDWhite,
        "bold 36pt panzerdog",
        "center"
      ),

      getTextComponent(
        `${avgGamesPerWeek}`,
        130,
        455,
        PRIMARYCOLOR,
        "bold 26pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${killsPerGame}`,
        340,
        455,
        PRIMARYCOLOR,
        "bold 36pt panzerdog",
        "center"
      ),

      ...clanComponents,

      getImageComponent(killDataRadar, 750, 175, 480, 480),
      getTextComponent(
        `${kills}`,
        840,
        130,
        PRIMARYCOLOR,
        "bold 32pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${assists}`,
        1005,
        130,
        PRIMARYCOLOR,
        "bold 32pt panzerdog",
        "center"
      ),
      getTextComponent(
        `${kdr}`,
        1152,
        130,
        PRIMARYCOLOR,
        "bold 32pt panzerdog",
        "center"
      )
    );
  }

  const componentList = [];

  const publicIDComponent = getTextComponent(
    `${publicID}`,
    275,
    194,
    Colors.PZDBlack,
    "14pt panzerdog",
    "center"
  );
  const levelValueComponent = getTextComponent(
    `${level}`,
    410,
    197,
    PRIMARYCOLOR,
    "bold 17pt panzerdog"
  );
  const ratingComponent = getTextComponent(
    `  •  Rating  `,
    410 + levelValueComponent.width,
    197,
    Colors.PZDWhite,
    "bold 15pt panzerdog"
  );
  const ratingValueComponent = getTextComponent(
    `${rating}`,
    410 + levelValueComponent.width + ratingComponent.width,
    197,
    PRIMARYCOLOR,
    "bold 17pt panzerdog"
  );

  componentList.push(
    //image, x, y, width, height
    getImageComponent(presets ? emptytemplate : template, 0, 0, 1280, 705),
    ...presetComponents,
    ...mainComponents,

    getImageComponent(countryFlag, 63, 170, 40, 30),
    getImageComponent(avatar, 50, 50, 100, 100),
    getTextComponent(name, 160, 130, Colors.PZDWhite, "65pt panzerdog", "left"),

    publicIDComponent,
    getTextComponent(`Level`, 350, 197, Colors.PZDWhite, "bold 17pt panzerdog"),
    levelValueComponent,
    ratingComponent,
    ratingValueComponent
  );

  return componentList;
};

const getKillDataRadar = (killData, color) => {
  const {
    smg,
    shotgun,
    assault,
    sniper,
    machinegun,
    prototypes,
    vehicle,
    explosive,
    physics,
    melee,
  } = killData;
  const _data = {
    smg,
    shotgun,
    assault,
    sniper,
    machinegun,
    prototypes,
    melee,
    vehicle,
    explosive,
    physics,
  };
  const labels = Object.keys(_data).map((k) => displayLabels[k]);

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: Object.values(_data),
        backgroundColor: color,
      },
    ],
  };
  const config = {
    type: "radar",
    data: data,
    options: {
      scales: {
        r: {
          pointLabels: {
            display: true,
            color: "rgba(250, 247, 213, 0.3)",
            font: {
              size: 40,
            },
          },
          ticks: {
            color: "rgba(255,255,255,0.3)",
            backdropColor: "rgba(28, 28, 28, 0)",
            backdropPadding: 5,
            z: 1,
            font: {
              size: 32,
            },
          },
          grid: {
            color: "rgba(255,255,255,0.2)",
          },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
      },
    },
  };

  return chartJSNodeCanvas.renderToDataURL(config); // converts chart to image
};

module.exports = {
  createFromUserIdImage,
};

const opTalents = {
  MISHKA: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { quick_hands: 25 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { good_genetics: 25 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  ROOKIE: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  HAWK: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ sapper_intuition: 20 }, { pyrochemistry: 15 }, { weapon_tuning: 30 }],
    [{ locked_and_loaded: 60 }, { braced_for_impact: 50 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ double_reload: 1 }, { rpg_reload: 100 }],
  ],
  RICK: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { perfect_eyesight: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  BATYA: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { quick_hands: 25 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { good_genetics: 25 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  THOR: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  BORIS: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ sapper_intuition: 20 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  KLAUS: [
    [{ strong_health: 350 }, { military_training: 6 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ sapper_intuition: 20 }, { pyrochemistry: 15 }, { weapon_tuning: 30 }],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  SYNDROME: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ sapper_intuition: 20 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  JASON: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { perfect_eyesight: 6 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  SHI: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { perfect_eyesight: 6 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  VARG: [
    [{ strong_health: 350 }, { military_training: 6 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ sapper_intuition: 20 }, { pyrochemistry: 15 }, { weapon_tuning: 30 }],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  CAPISCE: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { quick_hands: 25 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { good_genetics: 25 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  SPENCER: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ painkillers: 100 }, { enhanced_fortification: 100 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ berserker_rage: 40 }, { heavy_handed: 100 }],
  ],
  VICTOR: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ sapper_intuition: 20 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  DAVID: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { perfect_eyesight: 6 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  ZLOY: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { sapper_intuition: 20 }, { quick_hands: 25 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ improved_valve: 15 }, { gas_mask: 4 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { good_genetics: 25 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ lightweight_cylinder: 1 }, { smoke_screen: 1 }],
  ],
  TRAVIS: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { perfect_eyesight: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  JOE: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { perfect_eyesight: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  DIANA: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ improved_scanner: 30 }, { boosted_radar: 20 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ drone_compartments: 1 }, { combat_drone: 4.5 }],
  ],
  MIRO: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ reinforced_grenade: 40 }, { contrast_filter: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ chemical_injuries: 35 }, { impulse_scanner: 1 }, { modified_visor: 1 }],
  ],
  VALERA: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { perfect_eyesight: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ special_ops: 10 }, { lucky: 2.5 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ special_ops: 15 }],
  ],
  DUTCH: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { perfect_eyesight: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ rtfm_specialist: 30 }, { radar_jammer: 25 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ improved_rtfm: 1 }, { modified_rtfm: 40 }],
  ],
  CHARON: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ melee_master: 25 }, { athletics_training: 7 }, { weapon_tuning: 30 }],
    [{ quiet_steps: 50 }, { quick_charge: 20 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { tactical_camo: 85 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ stealth: 7 }, { ambush_master: 1 }],
  ],
  RAY: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ healing_syringe: 55 }, { decoy_bomb: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ battery_saver: 50 }, { emergency_stealth: 10 }],
  ],
  SNEK: [
    [{ strong_health: 350 }, { military_training: 6 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ sapper_intuition: 20 }, { pyrochemistry: 15 }, { weapon_tuning: 30 }],
    [{ cover: 15 }, { sattelite: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ silent_missiles: 1 }, { hidden_spotter: 15 }],
  ],
  "CHEN LI": [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ deep_field_knowledge: 20 }, { high_voltage: 15 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ coherent_field: 1 }, { magnetic_bullets: 30 }],
  ],
  JB: [
    [{ strong_health: 350 }, { athletics_training: 6 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ military_training: 7 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [
      { military_training: 6 },
      { combat_intuition: 12 },
      { expanding_bullets: 4 },
    ],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ good_genetics: 35 }, { practical_equipment: 10 }],
  ],
  MOSES: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ sharpshooter: 10 }, { dexterity: 30 }, { sniper_training: 5 }],
    [{ weapon_tuning: 30 }, { athletics_training: 7 }, { good_genetics: 25 }],
    [{ endurance: 35 }, { ergonomic_shield: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ sharpshooter: 10 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ discretion: 30 }, { anointed: 50 }],
  ],
  PHOENIX: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ resurrection: 1 }, { agility: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ double_grenades: 1 }, { explosive_retreat: 1 }],
  ],
  APOLLON: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { explosives_expert: 25 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ explosive_break: 1 }, { emp_thrusters: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ backup_tank: 1 }],
  ],
  OWEN: [
    [
      { strong_health: 350 },
      { athletics_training: 7 },
      { military_training: 6 },
    ],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [
      { strong_health: 350 },
      { military_training: 6 },
      { explosives_expert: 25 },
    ],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ brawler: 1 }, { arsonist: 1 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [{ military_training: 6 }, { combat_intuition: 12 }, { melee_master: 25 }],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ watching_fire: 1 }, { pain_illusion: 1 }],
  ],
  MCMEAN: [
    [{ strong_health: 350 }, { athletics_training: 7 }, { acrobatics: 80 }],
    [{ tactical_gear: 6 }, { first_aid: 40 }, { martial_arts: 20 }],
    [{ acrobatics: 80 }, { military_training: 6 }, { explosives_expert: 25 }],
    [{ perfect_eyesight: 6 }, { dexterity: 30 }, { sniper_training: 5 }],
    [
      { weapon_tuning: 30 },
      { athletics_training: 7 },
      { sapper_intuition: 20 },
    ],
    [{ ambidexter: 30 }, { years_of_training: 15 }],
    [{ strong_health: 350 }, { fast_metabolism: 40 }, { martial_arts: 20 }],
    [
      { military_training: 6 },
      { combat_intuition: 12 },
      { expanding_bullets: 4 },
    ],
    [{ strong_health: 350 }, { engineer_knowledge: 10 }, { pyrochemistry: 15 }],
    [{ dirty_play: 1 }, { fast_reload: 1 }],
  ],
};

const globalUniqueTalentsObject = {
  acrobatics: ["+XX%", " Dodge Cooldown"],
  agility: ["", " Recharge Dodge on Grenade Throw"],
  ambidexter: ["+XX%", " Fire Rate w/ Two Targets"],
  ambush_master: ["", " Special Weapons while Cloaked"],
  anointed: ["XX%", " Resistance on Last Stand Still"],
  arsonist: ["", "Dash Leaves Fire Trail"],
  athletics_training: ["+XX%", " Movement Speed"],
  backup_tank: ["", "+2 Jump Charges, -30% Cooldown"],
  battery_saver: ["-XX%", " Decoy Cooldown on Deactivation"],
  berserker_rage: ["+XX%", " Firerate After Kill"],
  boosted_radar: ["+XX%", " Scanner Radius"],
  braced_for_impact: ["-XX%", " Incoming Damage While Reload"],
  brawler: ["", "Dash Deals Damage"],
  chemical_injuries: ["+XX%", " Bleed Duration"],
  coherent_field: ["", "EMP Blast Blinds Enemies"],
  combat_drone: ["", "Unlimited Drone Projectiles"],
  combat_intuition: ["+XX%", " Aim Area"],
  contrast_filter: ["", "Accuracy/Aim Boost In Smoke"],
  cover: ["+XX%", " Firerate & Movement on Crouch"],
  decoy_bomb: ["", "Exploding Decoy"],
  deep_field_knowledge: ["+XX%", " Field Durability"],
  dexterity: ["+XX%", " Reload Speed"],
  dirty_play: ["", "Reloads 50% Ammo on 'Nade Throw"],
  discretion: ["XX%", " Mine Defusal Chance on Activation"],
  double_grenades: ["", "Double Grenades at Once"],
  double_reload: ["", "Reload Random Special Weapon"],
  drone_compartments: ["+XX", " Drone Projectile"],
  emergency_stealth: ["", "10 sec Stealth on Low Health"],
  emp_thrusters: ["", "EMP Thrusters"],
  endurance: ["+XX%", "Last Stand Duration/Health"],
  engineer_knowledge: ["-XX%", " Special Cooldown"],
  enhanced_fortification: ["+XX%", " Razor Wire Cooldown"],
  explosive_break: ["", "Explosion on Landing"],
  explosive_retreat: ["", "Cluster Grenade on Dodge"],
  explosives_expert: ["+XX%", " Explosives Power"],
  fast_metabolism: ["-XX%", " Regeneration Delay"],
  fast_reload: ["", "Full Ammo on Weapon Switch"],
  first_aid: ["+XX%", " Gas/Bleed Resistance"],
  gas_mask: ["+XX%", " Health/sec in Gas/Smoke"],
  good_genetics: ["-XX%", " Negative Effects Duration"],
  healing_syringe: ["+55%", " Health on Stealth Activation"],
  heavy_handed: ["+XX%", " Grenade Throw Range"],
  hidden_spotter: ["", "Missiles Grant Invisibility, +15% Cooldown"],
  high_voltage: ["+XX%", " EMP Blast Radius"],
  improved_rtfm: ["+XX", " RTFM Charge"],
  improved_scanner: ["XX%", " Detected Mine Defusal Chance"],
  improved_valve: ["+XX%", " Smoke/Gas Emitter Radius"],
  impulse_scanner: ["", "Detects Explosives & Devices"],
  lightweight_cylinder: ["+XX", " Gas/Smoke Emitter Charges"],
  locked_and_loaded: ["+XX%", " Post-Reload Firerate (1 sec)"],
  lucky: ["+XX%", " Game Rewards"],
  martial_arts: ["+XX%", " Melee Resistance"],
  magnetic_bullets: ["", "Magnetic Bullets"],
  melee_master: ["+XX%", " Melee Damage"],
  military_training: ["+XX%", " Firerate"],
  modified_rtfm: ["", "8 RTFM Missiles (-40% Power Each)"],
  modified_visor: ["", "Detects Cloaked Operators"],
  pain_illusion: ["XX%", " Dash Damage Resistance"],
  painkillers: ["+XX%", " Regeneration Speed"],
  perfect_eyesight: ["+XX%", " Vision Range"],
  practical_equipment: ["", " 3 sec Movement Boost on Swap"],
  pyrochemistry: ["+XX%", " Mine Radius"],
  quick_charge: ["+XX%", " Cloak Recovery"],
  quick_hands: ["+XX%", " Weapon Swap Speed"],
  quiet_steps: ["XX%", " Mine Evasion when Cloaked"],
  radar_jammer: ["", "RTFM Avoids Missile Defense"],
  resurrection: ["", "Resurrected Upon Post-Death Kill"],
  reinforced_grenade: ["+XX%", "Flash/Gas Bleed Damage"],
  rpg_reload: ["+XX%", " RPG Reload Speed"],
  rtfm_specialist: ["-XX%", " RTFM Cooldown"],
  sapper_intuition: ["+XX%", " Explosion Resistance"],
  sattelite: ["", "Super Weapon Marks Enemies"],
  sharpshooter: ["+XX%", " Accuracy"],
  silent_missiles: ["", "No Missile Ground Marks"],
  sniper_training: ["+XX%", " Range"],
  smoke_screen: ["", "Smoke Emits Instead of Gas"],
  special_ops: ["+XX%", " Clan Mission"],
  stealth: ["-XX", " sec Cloak Cooldown on Kill"],
  strong_health: ["+XX", " Health"],
  tactical_camo: ["-XX%", " Detection Duration"],
  tactical_gear: ["+XX%", " Bullet Resistance"],
  watching_fire: ["", "Fire/Physics Kills Restore Health"],
  weapon_tuning: ["+XX%", " Clip Capacity"],
  years_of_training: ["+XX%", " Accuracy & Firerate"],
};

const moduleIds = {
  //SMG MUZZLE
  78: { type: "epic", accuracy: 7 },
  81: { type: "rare", accuracy: 5 },
  79: { type: "uncommon", accuracy: 3 },
  77: { type: "common", accuracy: 3 },
  //SMG RECEIVER
  105: { type: "rare", clip_capacity: 15 },
  104: { type: "uncommon", clip_capacity: 10 },
  103: { type: "common", clip_capacity: 6 },
  //SMG SCOPE
  92: { type: "common", accuracy: 2 },
  91: { type: "rare", accuracy: 5 },
  90: { type: "uncommon", accuracy: 3 },

  //SG GRIP
  184: { type: "rare", firerate: 5 },
  183: { type: "uncommon", firerate: 3 },
  182: { type: "common", firerate: 2 },
  196: { type: "rare", accuracy: 7 },
  195: { type: "uncommon", accuracy: 5 },
  194: { type: "common", accuracy: 3 },
  //SG SCOPE
  202: { type: "common", accuracy: 2, range: 2 },
  203: { type: "uncommon", accuracy: 3, range: 3 },
  204: { type: "rare", accuracy: 4, range: 4 },
  192: { type: "rare", accuracy: 7 },
  191: { type: "uncommon", accuracy: 5 },
  190: { type: "common", accuracy: 3 },
};
