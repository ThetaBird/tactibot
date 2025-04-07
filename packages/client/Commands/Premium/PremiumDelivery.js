const {
  createMissionPointContent,
  createOnlinePlayerContent,
  getGuildMemberIdList,
} = require("../../Canvas/CurrentMissionPoints");
const {
  createClanMissionProgressImage,
} = require("../../Canvas/ClanMissionProgress");
const { Colors } = require("../../Canvas/_Util");
const { Content } = require("../../Content/_Map");
const {
  getRow,
  Emoji,
  getAttachment,
  getSimpleEmbed,
} = require("../../DeliveryUtil");
const {
  _PlacementsButton,
  _MetricsButton,
  _SettingsButton,
  _PlacementsForwardButton,
  _PlacementsConfirmButton,
  _PlacementsBackwardButton,
  _PlacementsInitialMissionsSelect,
  _MetricsDashboardSelect,
  _PremiumButton,
  _MetricsPinButton,
  _SettingsClanButton,
  _SettingsWhitelistButton,
  _SettingsPreferencesButton,
  _SettingsDisplayButton,
  _SettingsWhitelistManagersButton,
  _SettingsWhitelistMembersButton,
  _PlacementsCompletedMissionsSelect,
  _SettingsWhitelistUserSelect,
  _SettingsEditPreferencesModal,
  _SettingsEditDisplayModal,
} = require("./Components/_PremiumComponentDetails");
const {
  premiumDashboardEmbed,
  createMissionsMenuEmbed,
  createMetricsDashboardEmbed,
  createSettingsDashboardEmbed,
  createClanSettingsDashboardEmbed,
  createWhitelistSettingsDashboardEmbed,
  createPreferenceSettingsDashboardEmbed,
  createFormatSettingsDashboardEmbed,
  waitingEmbed,
} = require("./PremiumEmbeds");
const numbers = [
  "<:t_one:1004993700197322823>",
  "<:t_two:1004993704949465200>",
  "<:t_three:1004993704299347999>",
  "<:t_four:1004993699173908610>",
  "<:t_five:1004993697961738260>",
  "<:t_six:1004993702915211306>",
  "<:t_seven:1004993701484953610>",
  "<:t_eight:1004993696934137967>",
];
const arrow = "<:left_arrow_small:1004993731235164212>";

const displayFormat = {
  image: "Image",
  embed: "Embed",
  rText: "Raw Text",
  sText: "Split Text",
};
const displayEnforcement = {
  none: "None",
  button: "Button",
  reaction: "Reaction",
};
const displayMissionPriority = {
  last: "Right",
  first: "Left",
  middle: "Balanced",
};
const displayEpicMissionPriority = {
  last: "Last",
  prelast: "Prelast",
  first: "First",
  ignore: "Ignore",
};

const createWaitingMenu = (language) => {
  const embed = waitingEmbed(language);

  return {
    initial: {
      ephemeral: false,
      embeds: [embed],
      files: [],
    },
  };
};

const createPremiumMenu = (locale, data) => {
  const { clan_tag, clan_name, call_name } = data.clanData;
  const { clan_color } = data.displayPreferences;
  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const selectText = `**Clan Dashboard** \n\n`;

  const dashboardFields = [
    { name: `\u200B`, value: "## Select Action" },
    {
      name: `> ### Placements: <:placements:${Emoji.placements}>`,
      value: "> Post operator instructions for clan missions.\n> \u200B",
    },
    {
      name: `> ### Metrics: <:metrics:${Emoji.metrics}>`,
      value:
        "> **[TEMPORARILY UNAVAILABLE]** Show mission performance metrics.\n> \u200B",
    },
    {
      name: `> ### Settings: <:settings:${Emoji.settings}>`,
      value: `> Manage settings for /${call_name}.`,
    },
  ];

  const color = Colors[`tag_${clan_color}`];
  const dashboardEmbed = premiumDashboardEmbed(
    locale,
    displayClanName,
    selectText,
    dashboardFields,
    color
  );

  const dashboardButtons = [
    _PlacementsButton(call_name),
    _MetricsButton(call_name),
    _SettingsButton(call_name),
  ];

  const controlsRow = getRow(dashboardButtons);

  return {
    initial: {
      ephemeral: true,
      embeds: [dashboardEmbed],
      components: [controlsRow],
      files: [],
    },
  };
};

const createPremiumPlacementsMenu = (locale, data) => {
  const {
    clanData,
    missionData,
    displayPreferences,
    missionPreferences,
    userLang,
  } = data;
  const { clan_tag, clan_name } = clanData;
  const { initial_missions, current_missions, focused_num } = missionData;
  const { clan_color } = displayPreferences;
  const { mission_count } = missionPreferences;

  const isCompletedMenu = current_missions.filter((v) => v != null).length > 1;
  if (isCompletedMenu)
    return createPremiumCompletedPlacementsMenu(locale, data);

  const focusedNum = parseInt(focused_num) || 0;
  const allMissionsSelected = focusedNum >= mission_count;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const selectText = `## Create Operator Placements \n\n > **Select Clan Missions Below.**`;

  const missionChoices = Content.Missions.missionChoices[userLang || "en"];
  const missionsText = initial_missions
    .map((value, index) => {
      const mission = missionChoices.find(
        (choice) => choice.value == `${value}`
      );

      const parenthesesIndex = mission.name.indexOf("(");
      const missionText =
        parenthesesIndex == -1
          ? mission.name
          : mission.name.substring(0, parenthesesIndex - 1);

      return `> ${numbers[index]}**\` ${missionText} \`** ${
        index == focusedNum ? `${arrow}` : ""
      }`;
    })
    .join("\n");

  const color = Colors[`tag_${clan_color}`];
  const initialMissionsMenuEmbed = createMissionsMenuEmbed(
    displayClanName,
    selectText,
    missionsText,
    color
  );

  let componentRows = [];

  const forwardButton = allMissionsSelected
    ? _PlacementsConfirmButton(locale, allMissionsSelected)
    : _PlacementsForwardButton(locale, focusedNum + 1);

  const backButton = _PlacementsBackwardButton(locale, focusedNum - 1);
  if (focusedNum == 0) backButton.setDisabled(true);

  if (focusedNum != initial_missions.length) {
    const initialMissionsMenuSelect = _PlacementsInitialMissionsSelect(locale, {
      missions: initial_missions,
      missionChoices,
      focusedNum,
    });
    const selectRow = getRow([initialMissionsMenuSelect]);
    componentRows.push(selectRow);
  }

  const controlsRow = getRow([backButton, forwardButton]);
  const cancelAndConfirmRow = getRow(_PremiumButton(locale, true));
  componentRows.push(controlsRow, cancelAndConfirmRow);

  return {
    initial: {
      ephemeral: true,
      embeds: [initialMissionsMenuEmbed],
      components: componentRows,
      files: [],
    },
  };
};

const createPremiumCompletedPlacementsMenu = (locale, data) => {
  const {
    clanData,
    missionData,
    displayPreferences,
    missionPreferences,
    userLang,
  } = data;
  const { clan_tag, clan_name } = clanData;
  let { current_missions, selected } = missionData;
  selected = (selected || []).map((v) => parseInt(v));
  const { clan_color } = displayPreferences;

  const color = Colors[`tag_${clan_color}`];
  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const selectText = `## Move Operators \n\n > **Select Completed Clan Missions Below.**`;

  const enMissions = Content.Missions.missionChoices["en"];
  const missionChoices = Content.Missions.missionChoices[userLang || "en"];

  let selectChoices = [];

  const missionsText = current_missions
    .map((value, index) => {
      if (value == null) return null;

      const enTargetMission = enMissions.find(
        (choice) => choice.value == `${value}`
      );

      const mission = missionChoices.find(
        (choice) => choice.value == `${enTargetMission.value}`
      );
      selectChoices.push({
        label: mission.name,
        value: `${index}`,
        emoji: numbers[index],
        default: selected.includes(index),
      });

      const parenthesesIndex = mission.name.indexOf("(");
      const missionText =
        parenthesesIndex == -1
          ? mission.name
          : mission.name.substring(0, parenthesesIndex - 1);

      return `> ${numbers[index]}**\` ${missionText} \`** ${
        selected.includes(index) ? `${arrow}` : ""
      }`;
    })
    .filter((value) => value != null)
    .join("\n");

  selectChoices = selectChoices.filter((option) => !option.label.includes("("));
  const completedMissionsMenuEmbed = createMissionsMenuEmbed(
    displayClanName,
    selectText,
    missionsText,
    color
  );
  const completedMissionsSelect = _PlacementsCompletedMissionsSelect(
    locale,
    selectChoices
  );
  const backButton = _PremiumButton(locale);
  const confirmButton = _PlacementsConfirmButton(
    locale,
    !!selected.length,
    true
  );

  return {
    initial: {
      ephemeral: true,
      embeds: [completedMissionsMenuEmbed],
      components: [
        getRow(completedMissionsSelect),
        getRow([backButton, confirmButton]),
      ],
      files: [],
    },
  };
};

const createPremiumMetricsMenu = async (locale, data, client) => {
  const { metricType, clanData, metrics } = data;

  const { clan_tag, clan_name } = clanData;

  const displayClanName = `[${clan_tag}] ${clan_name}`;

  const metricsFields = [
    { name: `\u200B`, value: "## Metrics Dashboard" },
    {
      name: metricType
        ? `> **Viewing ${(typeMap()[metricType] || metricType).replace(
            "HEADERCONTENT",
            ""
          )}**`
        : "> **Select Metric to Display** ",
      value: ``,
    },
  ];

  const completedMissionsMenuSelect = _MetricsDashboardSelect(locale);
  const controlsButtons = [_PremiumButton(locale)];

  let attachment = [];
  if (metricType) {
    controlsButtons.push(_MetricsPinButton(locale, metricType));
    const { buffer, textContent } = await getMetricTypeContent(
      metricType,
      metrics,
      client
    );
    if (buffer) attachment.push(getAttachment(buffer, `clan_metrics.png`));
    if (textContent) metricsFields.push({ name: "", value: textContent });
  }

  const selectRow = getRow([completedMissionsMenuSelect]);
  const controlsRow = getRow(controlsButtons);
  const completedMissionsMenuEmbed = createMetricsDashboardEmbed(
    displayClanName,
    metricsFields
  );

  return {
    initial: {
      ephemeral: true,
      embeds: [completedMissionsMenuEmbed],
      components: [selectRow, controlsRow],
      files: attachment,
    },
  };
};

const createPremiumMetricsUpdate = async (locale, data, client) => {
  const { metricType, clanData, metrics } = data;
  const { clan_tag, clan_name } = clanData?.clanData || {};
  const { buffer, textContent } = await getMetricTypeContent(
    metricType,
    metrics,
    client,
    true
  );
  const embed = textContent
    ? getSimpleEmbed({
        description: textContent,
        title: `[${clan_tag}] ${clan_name}`,
      })
    : null;

  return {
    files: buffer ? [getAttachment(buffer, `clan_metrics.png`)] : [],
    content: "",
    embeds: embed ? [embed] : [],
  };
};

const createPremiumSettingsMenu = (locale, data) => {
  const { clanData, displayPreferences } = data;
  const { clan_tag, clan_name, call_name } = clanData;
  const { clan_color } = displayPreferences;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const selectText = `**/${call_name} Settings**`;
  const settingsFields = [
    { name: "\u200B", value: "## Select Setting Category" },
    {
      name: `> ### Clan Information: <:clan:${Emoji.clan}>`,
      value: "> Linked Clan Tag, Name, & Tacti Plus Subscription.\n> \u200B",
    },
    {
      name: `> ### Whitelist: <:preferences:${Emoji.whitelist}>`,
      value: "> View & Add/Remove Allowed Users\n> \u200B",
    },
    {
      name: `> ### Placement Information: <:whitelist:${Emoji.preferences}>`,
      value:
        "> Mission Priority, Epic Operators, & Operator Movements\n> \u200B",
    },
    {
      name: `> ### Display Information: <:format:${Emoji.format}>`,
      value: "> Format, Languages, Custom Messages, & more.",
    },
  ];

  const settingsEmbed = createSettingsDashboardEmbed(
    displayClanName,
    clan_color,
    settingsFields
  );
  const settingsButtons = [
    _SettingsClanButton(locale),
    _SettingsWhitelistButton(locale),
    _SettingsPreferencesButton(locale),
    _SettingsDisplayButton(locale),
  ];
  const settingsSelect = getRow(settingsButtons);

  const controlsRow = getRow(_PremiumButton(locale));

  return {
    initial: {
      ephemeral: true,
      embeds: [settingsEmbed],
      components: [settingsSelect, controlsRow],
      files: [],
    },
  };
};

const createPremiumClanSettingsMenu = (locale, data) => {
  const { clanData, displayPreferences, userRole } = data;
  const { clan_tag, clan_name, call_name, clan_id, subscription_countdown } =
    clanData;
  const { clan_color } = displayPreferences;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const clanText = "**Clan Information**";

  const clanFields = [
    { name: "## Clan Information", value: `` },
    {
      name: "> \u200B",
      value: `> **[__TactiStats Link__](https://stats.tacticool.game/#clan/${clan_id})**`,
    },
    { name: "> ### Tag", value: `> [${clan_tag}]` },
    { name: "> ### Name", value: `> ${clan_name}` },
    { name: "> ### Command", value: `> /${call_name}` },
  ];

  const settingsEmbed = createClanSettingsDashboardEmbed(
    displayClanName,
    clanText,
    clan_color,
    clanFields
  );

  const componentRow = getRow(_SettingsButton(locale, true));

  return {
    initial: {
      ephemeral: true,
      embeds: [settingsEmbed],
      components: [componentRow],
      files: [],
    },
  };
};

const createPremiumDisplaySettingsMenu = (locale, data) => {
  const { clanData, displayPreferences, userRole } = data;
  const { clan_tag, clan_name, clan_language } = clanData;
  const {
    clan_color,
    custom_message,
    output_languages,
    output_format,
    enforce_placements,
  } = displayPreferences;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const clanText = "**Display Settings**";

  const formatFields = [
    { name: `\u200B`, value: "## Output Settings" },
    {
      name: "> ### Message",
      value: `> ${custom_message.length ? custom_message : "-"}`,
    },
    {
      name: "> ### Languages",
      value: `> ${
        output_languages.length ? output_languages.join(", ") : clan_language
      }`,
    },
    { name: "> ### Format", value: `> ${displayFormat[output_format]}` },
    {
      name: "> ### Enforcement",
      value: `> ${displayEnforcement[enforce_placements]}`,
    },
  ];

  const settingsEmbed = createFormatSettingsDashboardEmbed({
    displayClanName,
    clanText,
    clan_color,
    formatFields,
  });

  const [backButton, editButton] = [
    _SettingsButton(locale, true),
    _SettingsDisplayButton(locale, true),
  ];

  const controls = [backButton, editButton];
  const componentRow = getRow(controls);

  return {
    initial: {
      ephemeral: true,
      embeds: [settingsEmbed],
      components: [componentRow],
      files: [],
    },
  };
};

const createPremiumPreferencesSettingsMenu = (locale, data) => {
  const { clanData, missionPreferences, placementPreferences, userRole } = data;
  const { clan_tag, clan_name, clan_color, call_name } = clanData;
  const { ignore_missions, mission_count } = missionPreferences;
  const { operator_priority, epic_position, show_movements } =
    placementPreferences;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const clanText = "**Operator Instruction Preferences**";

  const preferenceFields = [
    { name: `\u200B`, value: "## Mission Settings" },
    { name: "> ### Missions", value: `> ${mission_count}`, inline: true },
    {
      name: "> ### Ignore First X Missions",
      value: `> ${ignore_missions || "0"}`,
      inline: true,
    },
    { name: `\u200B`, value: "## Operator Settings" },
    {
      name: "> ### Priority",
      value: `> ${displayMissionPriority[operator_priority]}`,
      inline: true,
    },
    {
      name: "> ### Epics",
      value: `>  ${displayEpicMissionPriority[epic_position]}`,
      inline: true,
    },
    {
      name: "> ### All Movements",
      value: `> ${show_movements ? "Yes" : "No"}`,
      inline: true,
    },
  ];

  const settingsEmbed = createPreferenceSettingsDashboardEmbed({
    displayClanName,
    clanText,
    clan_color,
    preferenceFields,
  });

  const [backButton, editButton] = [
    _SettingsButton(locale, true),
    _SettingsPreferencesButton(locale, true),
  ];

  const controls = [backButton, editButton];
  const componentRow = getRow(controls);

  return {
    initial: {
      ephemeral: true,
      embeds: [settingsEmbed],
      components: [componentRow],
      files: [],
    },
  };
};

const createPremiumWhitelistSettingsMenu = (locale, data) => {
  const { clanData, whitelistPreferences, userRole, type } = data;
  const { clan_tag, clan_name, call_name, clan_color } = clanData;
  const { admin, moderators, whitelist } = whitelistPreferences;

  const displayClanName = `[${clan_tag}] ${clan_name}`;
  const whitelistText = `**/${call_name} — Whitelist**`;

  const editManagers = ["admin", "sudo"].includes(userRole);
  const editWhitelist = ["admin", "sudo", "manager"].includes(userRole);

  const settingsEmbed = createWhitelistSettingsDashboardEmbed(
    { displayClanName, whitelistText, clan_color },
    { admin, moderators, whitelist }
  );
  const componentRows = [];

  if (type) {
    const members = type == "managers" ? moderators : whitelist;
    const defaultUsers = members.map((member) => member.id);
    componentRows.push(
      getRow(_SettingsWhitelistUserSelect(locale, type, defaultUsers))
    );
  } else if (userRole && userRole != "whitelist") {
    const buttons = [];
    if (editManagers) buttons.push(_SettingsWhitelistManagersButton(locale));
    if (editWhitelist) buttons.push(_SettingsWhitelistMembersButton(locale));
    componentRows.push(getRow(buttons));
  }

  const controlsRow = getRow([
    type
      ? _SettingsWhitelistButton(locale, true)
      : _SettingsButton(locale, true),
  ]);
  componentRows.push(controlsRow);

  return {
    initial: {
      ephemeral: true,
      embeds: [settingsEmbed],
      components: componentRows,
      files: [],
    },
  };
};

const createPreferencesModal = (locale, data) => {
  const { clanData, missionPreferences, placementPreferences } = data;
  const { call_name } = clanData;
  const { ignore_missions, mission_count } = missionPreferences;
  const { operator_priority, epic_position, show_movements } =
    placementPreferences;

  const modalObj = {
    callName: `${call_name}`,
    numMissions: `${mission_count}` || "8",
    ignoreMissions: `${ignore_missions}` || "",
    priority: displayMissionPriority[operator_priority] || "Right",
    epic: displayEpicMissionPriority[epic_position] || "Ignore",
    showRepositions: show_movements ? "Yes" : "No",
  };

  return _SettingsEditPreferencesModal(locale, modalObj);
};

const createDisplayModal = (locale, data) => {
  const { clanData, displayPreferences } = data;
  const { call_name } = clanData;
  const { custom_message, output_format, output_languages } =
    displayPreferences;

  const modalObj = {
    callName: `${call_name}`,
    custommessage: `${custom_message}` || "",
    outputlangs: `${output_languages.join(", ")}` || "",
    outputformat: displayFormat[output_format] || "Image",
  };

  return _SettingsEditDisplayModal(locale, modalObj);
};

module.exports = {
  createWaitingMenu,
  createPremiumMenu,
  createPremiumPlacementsMenu,
  createPremiumMetricsMenu,
  createPremiumMetricsUpdate,
  createPremiumSettingsMenu,
  createPremiumClanSettingsMenu,
  createPremiumDisplaySettingsMenu,
  createPremiumPreferencesSettingsMenu,
  createPremiumWhitelistSettingsMenu,
  createPreferencesModal,
  createDisplayModal,
};

//--- HELPER --------------------------------------------

const typeMap = () => ({
  "m-prog": "Mission Progress",
  "m-current-points": `Clan Leaderboard • Points\n**(Current Cycle)\nUpdated <t:${Math.floor(
    Date.now() / 1000
  )}:R>**`,
  "m-avg-points": `Clan Leaderboard • Points\n**(Past 5 Cycles)\nUpdated <t:${Math.floor(
    Date.now() / 1000
  )}:R>**`,
  "m-current-points-top10": `Top Clan Leaderboard • Points\n> (Current Cycle)\nUpdated <t:${Math.floor(
    Date.now() / 1000
  )}:R>`,
  "m-current-points-bot10": `Bottom Clan Leaderboard • Points\n> (Current Cycle)\nUpdated <t:${Math.floor(
    Date.now() / 1000
  )}:R>`,
  "p-online": `Online Teammates HEADERCONTENT`,
});

const getMetricTypeContent = async (
  metricType,
  data,
  client,
  isMetricUpdate = false
) => {
  let toRet;

  const guildMembers = await getGuildMemberIdList(client, data.guildId);
  switch (metricType) {
    case "m-prog":
      toRet = { buffer: await createClanMissionProgressImage(data) };
      break;
    case "m-current-points":
    case "m-avg-points":
      toRet = { textContent: createMissionPointContent(data, guildMembers) };
      break; /*
        case "m-current-points-top10":
            toRet = {textContent: createTopTenCurrentMissionPointContent(data)}
            break;
        case "m-current-points-bot10":
            toRet = {textContent: createBottomTenCurrentMissionPointContent(data)}
            break;*/
    case "p-online":
      const { textContent, headerContent } = createOnlinePlayerContent(
        data,
        guildMembers
      );
      toRet = { textContent, headerContent };
      break;
    default:
      throw { name: "Invalid metric type for getMetricTypeContent" };
  }

  if (toRet.textContent && isMetricUpdate)
    toRet.textContent = `## ${(
      typeMap()[metricType] || metricType
    ) /*.replace("(","### (")*/
      .replace(
        "HEADERCONTENT",
        toRet.headerContent ? toRet.headerContent : ""
      )}\n\n${toRet.textContent}`;

  if (toRet.textContent && toRet.textContent.length > 4096)
    toRet.textContent = toRet.textContent.substring(0, 4096);
  return toRet;
};
