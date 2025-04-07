const {
  Emoji,
  getButton,
  getModal,
  getShortTextInput,
  getSelect,
  getUserSelect,
  getRow,
  getLongTextInput,
} = require("../../../DeliveryUtil");

const _PremiumButton = (locale, primary = false) =>
  getButton({
    customId: "premium_dashboard",
    label: "\u200B", //[locale]
    style: primary ? "Primary" : "Secondary",
    emoji: primary ? Emoji.dashboard : Emoji.backButton,
  });

const _PlacementsButton = (locale) =>
  getButton({
    customId: "premium_dashboardplacements",
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.placements,
  });

const _MetricsButton = (locale) =>
  getButton({
    customId: "premium_dashboardmetrics",
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.metrics,
    disabled: true,
  });

const _SettingsButton = (locale, back) =>
  getButton({
    customId: "premium_dashboardsettings",
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: back ? Emoji.backButton : Emoji.settings,
  });

const _PlacementsForwardButton = (locale, num) =>
  getButton({
    customId: `premium_placementsactivemission_${num}`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.forwardButton,
  });

const _PlacementsConfirmButton = (locale, enabled, repositions = false) =>
  getButton({
    customId: `premium_${repositions ? "repositions" : "placements"}confirm`,
    label: "\u200B", //[locale]
    style: enabled ? "Primary" : "Secondary",
    emoji: Emoji.confirmButton,
    disabled: !enabled,
  });

const _PlacementsBackwardButton = (locale, num) =>
  getButton({
    customId: `premium_placementsactivemission_${num}`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.backButton,
  });

const _PlacementsInitialMissionsSelect = (locale, selectObj) => {
  const { missions, missionChoices, focusedNum } = selectObj;
  const length = missions.length;
  const options = missionChoices
    .map((choice) => ({ label: choice.name, value: choice.value }))
    .filter(
      (option) =>
        !missions.includes(option.value) ||
        missions[focusedNum] == option.value ||
        `${option.value}` == "null"
    );

  return getSelect({
    customId: `premium_placementsmissionselect`,
    placeholder:
      focusedNum + 1 == length
        ? `Mission ${focusedNum + 1}`
        : `Missions ${focusedNum + 1} - ${length}:`,
    options,
    max: length - focusedNum || 1,
  });
};

const _PlacementsCompletedMissionsSelect = (locale, selectChoices) => {
  return getSelect({
    customId: `premium_placementscompletedselect`,
    placeholder: "Completed Missions:",
    options: selectChoices,
    max: selectChoices.length - 1,
  });
};

const _SettingsWhitelistUserSelect = (locale, type, defaultUsers) => {
  return getUserSelect({
    customId: `premium_settingswhitelistuserselect_${type}`,
    placeholder: type == "managers" ? "Managers" : "Members",
    max: type == "managers" ? 3 : 5,
    defaultUsers,
  });
};

const _MetricsDashboardSelect = (locale) =>
  getSelect({
    customId: "premium_metricsselect",
    placeholder: "--Empty--",
    options: [
      {
        label: "Mission Progress",
        description: "Show percentage completion of all missions.",
        value: `m-prog`,
      },
      {
        label: "Current Player Points",
        description: "Show current mission points for all players.",
        value: `m-current-points`,
      },
      //{label:"Top Player Points", description:"Show current best-performing players.", value:`m_current_points_top10`},
      //{label:"Bottom Player Points", description:"Show current worst-performing players.", value:`m_current_points_bot10`},
      {
        label: "Average Player Points",
        description: "Show 5-cycle mission point average for all players.",
        value: `m-avg-points`,
      },
      {
        label: "Online Players",
        description: "Show online players.",
        value: `p-online`,
      },
    ],
  });

const _MetricsPinButton = (locale, metricType) =>
  getButton({
    customId: `premium_metricpin_${metricType}`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.pinButton,
  });

const _SettingsClanButton = (locale, edit) =>
  getButton({
    customId: `premium_settings${edit ? "edit_" : ""}clan`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: edit ? Emoji.editButton : Emoji.clan,
  });

const _SettingsWhitelistButton = (locale, back) =>
  getButton({
    customId: `premium_settingswhitelist`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: back ? Emoji.backButton : Emoji.whitelist,
  });

const _SettingsWhitelistManagersButton = (locale) =>
  getButton({
    customId: `premium_settingswhitelistedit_managers`,
    label: "Set Managers", //[locale]
    style: "Secondary",
  });

const _SettingsWhitelistMembersButton = (locale) =>
  getButton({
    customId: `premium_settingswhitelistedit_members`,
    label: "Set Members", //[locale]
    style: "Secondary",
  });

const _SettingsPreferencesButton = (locale, edit) =>
  getButton({
    customId: `premium_settings${edit ? "edit_" : ""}preferences`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: edit ? Emoji.editButton : Emoji.preferences,
  });

const _SettingsDisplayButton = (locale, edit) =>
  getButton({
    customId: `premium_settings${edit ? "edit_" : ""}display`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: edit ? Emoji.editButton : Emoji.format,
  });

const _SettingsPreferencesModal_IgnoreMissions = (locale, value) =>
  getShortTextInput({
    customId: "ignoremissions",
    label: "Ignore first [X] Missions", //[locale]
    max: 1,
    min: 0,
    required: false,
    placeholder: `2 | 3 | 4 | 5 | 6 | 7 | 8`, //[locale]
    value,
  });

const _SettingsPreferencesModal_Priority = (locale, value) =>
  getShortTextInput({
    customId: "priority",
    label: "Operator Priority", //[locale]
    max: 6,
    min: 4,
    required: true,
    placeholder: `Left | Middle | Right`, //[locale]
    value,
  });

const _SettingsPreferencesModal_Epic = (locale, value) =>
  getShortTextInput({
    customId: "epic",
    label: "Epic Position", //[locale]
    max: 7,
    min: 4,
    required: true,
    placeholder: `Last | Prelast | First | Ignore`, //[locale]
    value,
  });

const _SettingsPreferencesModal_NumMissions = (locale, value) =>
  getShortTextInput({
    customId: "nummissions",
    label: "Number of Missions", //[locale]
    max: 1,
    min: 1,
    required: true,
    placeholder: `2 | 3 | 4 | 5 | 6 | 7 | 8`, //[locale]
    value,
  });

const _SettingsPreferencesModal_ShowRepositions = (locale, value) =>
  getShortTextInput({
    customId: "repositions",
    label: "Show all operator movements", //[locale]
    max: 3,
    min: 2,
    required: true,
    placeholder: `Yes | No`, //[locale]
    value,
  });

const _SettingsEditPreferencesModal = (locale, data) => {
  const {
    callName,
    numMissions,
    ignoreMissions,
    priority,
    epic,
    showRepositions,
  } = data;
  return getModal({
    customId: `settings_editpreferences`,
    title: `/${callName}: Edit Preferences`, //[locale]
    components: [
      getRow(_SettingsPreferencesModal_NumMissions(locale, numMissions)),
      getRow(_SettingsPreferencesModal_IgnoreMissions(locale, ignoreMissions)),
      getRow(_SettingsPreferencesModal_Priority(locale, priority)),
      getRow(_SettingsPreferencesModal_Epic(locale, epic)),
      getRow(
        _SettingsPreferencesModal_ShowRepositions(locale, showRepositions)
      ),
    ],
  });
};

const _SettingsDisplayModal_CustomMessage = (locale, value) =>
  getLongTextInput({
    customId: "custommessage",
    label: "Custom Message", //[locale]
    max: 1024,
    min: 0,
    required: false,
    placeholder: `Example: Make sure to move your operators!`, //[locale]
    value,
  });

const _SettingsDisplayModal_OutputLangs = (locale, value) =>
  getShortTextInput({
    customId: "outputlangs",
    label: "Output Languages (Separated List)", //[locale]
    max: 20,
    min: 0,
    required: false,
    placeholder: `Example: en, ru, fr, pl, deu, it, es, ptp, ptb, tr, id, ja`, //[locale]
    value,
  });

const _SettingsDisplayModal_OutputFormat = (locale, value) =>
  getShortTextInput({
    customId: "outputformat",
    label: "Output Format", //[locale]
    max: 10,
    min: 5,
    required: true,
    placeholder: `Image | Embed | Split Text | Raw Text`, //[locale]
    value,
  });

const _SettingsEditDisplayModal = (locale, data) => {
  const { callName, custommessage, outputlangs, outputformat } = data;
  return getModal({
    customId: `settings_editdisplay`,
    title: `/${callName}: Edit Placement Output`, //[locale]
    components: [
      getRow(_SettingsDisplayModal_CustomMessage(locale, custommessage)),
      getRow(_SettingsDisplayModal_OutputLangs(locale, outputlangs)),
      getRow(_SettingsDisplayModal_OutputFormat(locale, outputformat)),
    ],
  });
};

module.exports = {
  _PremiumButton,
  _PlacementsButton,
  _MetricsButton,
  _SettingsButton,
  _PlacementsForwardButton,
  _PlacementsBackwardButton,
  _PlacementsConfirmButton,
  _PlacementsInitialMissionsSelect,
  _PlacementsCompletedMissionsSelect,
  _MetricsDashboardSelect,
  _MetricsPinButton,
  _SettingsClanButton,
  _SettingsWhitelistButton,
  _SettingsPreferencesButton,
  _SettingsDisplayButton,
  _SettingsWhitelistManagersButton,
  _SettingsWhitelistMembersButton,
  _SettingsWhitelistUserSelect,
  _SettingsEditPreferencesModal,
  _SettingsEditDisplayModal,
};
