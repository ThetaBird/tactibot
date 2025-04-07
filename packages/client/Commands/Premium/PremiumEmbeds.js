const {
  getEmbed,
  getSimpleEmbed,
  getTotalServers,
  botAvatar,
  getDescriptionFromFields,
  Emoji,
} = require("../../DeliveryUtil");
const mainColor = "#fcf4ec";
const linkAvatarChoices = [
  { id: 2, name: "Ava_Biohazard", emoji: "<:2_:1006046425022476328>" },
  { id: 4, name: "Ava_Bullet", emoji: "<:4_:1006046423898411108>" },
  { id: 5, name: "Ava_Skull", emoji: "<:5_:1006046423072112712>" },
  { id: 6, name: "Ava_Eye", emoji: "<:6_:1006046421411188786>" },
  { id: 8, name: "Ava_Grenade", emoji: "<:8_:1006046426121379920>" },
];

const waitingEmbed = (language) => {
  const waitingText = `<a:loading:${Emoji.loading}> Loading...`;

  const waitingEmbedObj = {
    color: mainColor,
    description: waitingText,
  };

  return getSimpleEmbed(waitingEmbedObj);
};

const premiumDashboardEmbed = (
  locale,
  displayClanName,
  selectText,
  dashboardFields,
  clan_color
) => {
  const dashboardEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: selectText + getDescriptionFromFields(dashboardFields),
  };
  return getSimpleEmbed(dashboardEmbedObj);
};

const createMissionsMenuEmbed = (
  displayClanName,
  selectText,
  missionsText,
  clan_color
) => {
  const embedObj = {
    color: clan_color,
    title: displayClanName,
    description: selectText + "\n" + missionsText,
    thumbnail: botAvatar,
  };
  const embed = getEmbed(embedObj);
  return embed;
};

const createMetricsDashboardEmbed = (
  displayClanName,
  metricsFields,
  clan_color
) => {
  const completedMissionsMenuEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(metricsFields),
  };
  const embed = getSimpleEmbed(completedMissionsMenuEmbedObj);
  embed.setImage(`attachment://clan_metrics.png`);
  return embed;
};

const createSettingsDashboardEmbed = (
  displayClanName,
  clan_color,
  settingsFields
) => {
  const settingsEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(settingsFields),
    thumbnail: "https://i.ibb.co/KGXQWnp/Testing-PFP.png",
    //fields:settingsFields
  };
  return getSimpleEmbed(settingsEmbedObj);
};

const createClanSettingsDashboardEmbed = (
  displayClanName,
  clanText,
  clan_color,
  clanFields
) => {
  const clanSettingsEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(clanFields),
    thumbnail: "https://i.ibb.co/KGXQWnp/Testing-PFP.png",
    //fields:clanFields,
  };
  return getEmbed(clanSettingsEmbedObj);
};

const createWhitelistSettingsDashboardEmbed = (displayInfo, whitelistInfo) => {
  const { displayClanName, whitelistText, clan_color } = displayInfo;
  const { admin, moderators, whitelist } = whitelistInfo;

  const fields = [
    { name: `\u200B`, value: "## Whitelisted Users" },
    { name: "> ### Admin", value: `> - <@${admin.id}>` /* - ${admin.lang}`*/ },
    {
      name: "> ### Managers",
      value: moderators.length
        ? moderators.map((m) => `> - <@${m.id}>` /* - ${m.lang}`*/).join("\n")
        : "—",
    },
    {
      name: "> ### Members",
      value: whitelist.length
        ? whitelist.map((w) => `> - <@${w.id}>` /* - ${w.lang}`*/).join("\n")
        : "—",
    },
  ];

  const whitelistSettingsEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(fields),
    thumbnail: "https://i.ibb.co/KGXQWnp/Testing-PFP.png",
    //fields
  };
  const embed = getEmbed(whitelistSettingsEmbedObj);
  return embed;
};

const createPreferenceSettingsDashboardEmbed = (embedObj) => {
  const { displayClanName, clanText, clan_color, preferenceFields } = embedObj;
  const clanSettingsEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(preferenceFields),
    thumbnail: "https://i.ibb.co/KGXQWnp/Testing-PFP.png",
    //fields:preferenceFields,
  };
  return getEmbed(clanSettingsEmbedObj);
};

const createFormatSettingsDashboardEmbed = (embedObj) => {
  const { displayClanName, clanText, clan_color, formatFields } = embedObj;
  const clanSettingsEmbedObj = {
    color: clan_color,
    title: displayClanName,
    description: getDescriptionFromFields(formatFields),
    thumbnail: "https://i.ibb.co/KGXQWnp/Testing-PFP.png",
    //fields:formatFields,
  };
  return getEmbed(clanSettingsEmbedObj);
};

module.exports = {
  waitingEmbed,
  premiumDashboardEmbed,
  createMissionsMenuEmbed,
  createMetricsDashboardEmbed,
  createSettingsDashboardEmbed,
  createClanSettingsDashboardEmbed,
  createWhitelistSettingsDashboardEmbed,
  createPreferenceSettingsDashboardEmbed,
  createFormatSettingsDashboardEmbed,
};
