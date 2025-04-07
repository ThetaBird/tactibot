const { Client } = require("discord.js");
const {
  getEmbed,
  getSimpleEmbed,
  supportContactFull,
  supportContactShort,
} = require("../../DeliveryUtil");
const mainColor = "#fcf4ec";

const noSubscriptionEmbed = (locale) => {
  const noSubscriptionText = `Looks like you don't have a subscription to Tacti Plus.
Unlock a ton of exciting features for your clan using one of the methods below.

**• [Patreon](https://www.patreon.com/tactigenerator)**
**• [Discord [WEB ONLY]](https://discord.com/channels/697219146169057301/shop)**
**• [App Directory](https://discord.com/application-directory/695821440167182386/premium)**

For assistance, contact ${supportContactFull}.`;

  const noSubscriptionEmbedObj = {
    color: mainColor,
    title: "Huh?!",
    description: noSubscriptionText,
  };

  return getSimpleEmbed(noSubscriptionEmbedObj);
};

const subscriptionEmbed = async (locale, data, client) => {
  const { discordId, maxServerCount, servers, providers, clans, maxClanCount } =
    data;

  const resolvedGuilds = await getResolvedGuilds(servers, client);

  const subscriptionText = `Owner: <@${discordId}>
Status: \`ACTIVE\`
Source: \`${providers.join(", ")}\`
Clans: ${clans.length} Enabled, ${maxClanCount - clans.length} Available
Servers: ${servers.length} Enabled, ${maxServerCount - servers.length} Available

Commands: ${clans
    .map((clan) => `**\`/${clan.clanData.call_name}\`**`)
    .join(", ")}
Servers: ${resolvedGuilds
    .map(
      (guild) =>
        `[${guild.name}](https://discord.com/channels/${guild.id}/${guild.systemChannelId})`
    )
    .join(" , ")}
`;

  const noSubscriptionEmbedObj = {
    color: mainColor,
    title: "Subscription",
    description: subscriptionText,
  };

  return getEmbed(noSubscriptionEmbedObj);
};

const serverEmbed = async (locale, data, client, editing) => {
  const { servers, guildId } = data;

  const resolvedGuilds = await getResolvedGuilds(servers, client);

  const title = editing
    ? "Manage Roles"
    : !servers.length
    ? "No Active Servers"
    : "Premium Servers";

  const currentServer = servers.find((server) => server._id == guildId);
  const otherServers = servers.filter((server) => server._id != guildId);

  const currentText = editing
    ? getLinkedRoleText(currentServer)
    : currentServer
    ? `### Active: ${getServerInfo(
        currentServer,
        resolvedGuilds
      )}\n${getLinkedRoleText(currentServer)}`
    : "";

  const otherText =
    !otherServers.length || editing
      ? ""
      : `### Other:\n ${otherServers.map((s) =>
          getServerInfo(s, resolvedGuilds)
        )}\n`;

  const serverEmbedObj = {
    color: mainColor,
    title,
    description: currentText + otherText,
  };

  return getEmbed(serverEmbedObj);
};

const manageClanRolesEmbed = (locale, data, clanId) => {
  const { servers, guildId } = data;
  const currentServer = servers.find((server) => server._id == guildId);
  const currentClan = currentServer.linkedRoles.find(
    (linkedRole) => linkedRole.cl_id == clanId
  );
  const manageClanRoleEmbedObj = {
    color: mainColor,
    title: `Manage Roles`,
    description: getClanLinkedRoleText(currentClan),
  };

  return getSimpleEmbed(manageClanRoleEmbedObj);
};

const newClanRoleEmbed = (locale) => {
  const ts = `https://stats.tacticool.game/`;
  const addClanText =
    `In order to link a clan to this server, you will need to open the clan's profile in [TactiStats](${ts}) and copy the link.\n\n` +
    "After that, you can press the **`Submit`** button and paste the link in the popup.";

  const addClanEmbedObj = {
    color: mainColor,
    title: "Add New Clan",
    description: addClanText,
  };

  return getSimpleEmbed(addClanEmbedObj);
};

const newCommandEmbed = (locale) => {
  const ts = `https://stats.tacticool.game/`;
  const addClanText =
    `In order to activate a command, you need to find the clan's profile in [TactiStats](${ts}) and copy the link.\n\n` +
    "After that, you can press the **`Submit`** button and paste the link in the popup.";

  const addClanEmbedObj = {
    color: mainColor,
    title: "Add New Command",
    description: addClanText,
  };

  return getSimpleEmbed(addClanEmbedObj);
};

const commandEmbed = async (locale, data, client) => {
  const { clans, guildId, tactiClanId } = data;

  if (tactiClanId == "new") return newCommandEmbed(locale);

  const resolvedGuild = await getResolvedGuild(guildId, client);

  const title = "Manage Commands";

  const guildCommands = resolvedGuild.commands.cache.map((c) => c.name);
  const text = getCommandListText(clans, guildCommands, tactiClanId);

  const serverEmbedObj = {
    color: mainColor,
    title,
    description: text,
  };

  return getEmbed(serverEmbedObj);
};

const newCommandErrorEmbed = (locale, error) => {
  const errorMsg =
    error == "taken_callname"
      ? `This command name is already taken - please try a different one.`
      : error == "invalid_url"
      ? `The link you provided was invalid - please make sure it's a valid clan profile!`
      : "Something went wrong... Please try again";
  const errorObj = {
    color: mainColor,
    title: "Whoops!",
    description: errorMsg,
    footer: { text: `Contact ${supportContactShort} for assistance.` },
  };

  return getSimpleEmbed(errorObj);
};

module.exports = {
  noSubscriptionEmbed,
  subscriptionEmbed,
  serverEmbed,
  newClanRoleEmbed,
  manageClanRolesEmbed,
  commandEmbed,
  newCommandErrorEmbed,
};

//-- HELPER -----------------------------------------------
const getServerInfo = (server, resolvedGuilds) => {
  const ch = "https://discord.com/channels/";
  const foundGuild = resolvedGuilds.find((guild) => guild.id === server._id);
  if (!foundGuild) return `[${server._id}](${ch}${server._id})`;
  return `[${foundGuild.name}](${ch}${foundGuild.id})`;
};

const getLinkedRoleText = (server) => {
  if (!server.linkedRoles.length) return "> *(No Linked Roles)*\n";
  let text = "**__Linked Roles:__**\n";
  server.linkedRoles.forEach((linkedRole) => {
    text += getClanLinkedRoleText(linkedRole);
  });

  return text;
};

const getClanLinkedRoleText = (linkedRole) => {
  let text = "";
  const { r_id, cl_id, cl_name, nickname, online_r_id, zero_points_r_id } =
    linkedRole;
  text += `> [■](https://stats.tacticool.game/#clan/${cl_id}/overview) **${cl_name}** ${
    nickname ? " (" + nickname + ")" : ""
  }\n`;
  r_id.forEach((r) => (text += `>   \`Member: \` <@&${r}>\n`));
  if (online_r_id) text += `>   \`Online: \` <@&${online_r_id}>\n`;
  if (zero_points_r_id) text += `>   \`No Points: \` <@&${zero_points_r_id}>\n`;
  text += "\n";
  return text;
};

const getCommandListText = (clans, guildCommands, tactiClanId) => {
  if (!clans.length) return "> *(No Activated Clans)*";
  let text = "**__Active Commands:__**\n";
  clans.forEach((clan) => {
    if (tactiClanId && clan._id != tactiClanId) return;
    const isActiveCommand = guildCommands.includes(clan.clanData.call_name);
    text += getCommandText(clan, isActiveCommand);
  });

  return text;
};

const getCommandText = (clan, isActiveCommand) => {
  let text = "";
  const { clanData } = clan;
  const { call_name, clan_id, clan_tag, clan_name } = clanData;

  text += `> **/${call_name}**${isActiveCommand ? " *(In Server)*" : ""}\n`;
  text += `> [■](https://stats.tacticool.game/#clan/${clan_id}/overview) **[${clan_tag}] ${clan_name}**\n\n`;
  return text;
};

const serverToList = (guildId, server, resolvedGuilds) => {
  const foundGuild = resolvedGuilds.find((guild) => guild.id === server._id);
  if (!foundGuild) return "";

  let guildText = `**[■](https://discord.com/channels/${foundGuild.id}/${foundGuild.systemChannelId}) ${foundGuild.name}**\n`;
  if (guildId !== server._id) return guildText;

  if (server.linkedRoles.length === 0) return guildText + "- No Linked Roles\n";

  server.linkedRoles.forEach((linkedRole) => {
    const { r_id, cl_id, cl_name, nickname, online_r_id, zero_points_id } =
      linkedRole;
    guildText += `> [■](https://stats.tacticool.game/#clan/${cl_id}/overview) **__${cl_name}__** ${
      nickname ? " (" + nickname + ")" : ""
    }\n`;
    r_id.forEach((r) => (guildText += `>   <@&${r}>\n`));
    if (online_r_id) guildText += `>   <@&${online_r_id}> \`(Online)\`\n`;
    if (zero_points_id)
      guildText += `>   <@&${zero_points_id}> \`(No Points)\`\n`;
    guildText += "> \n";
  });

  return guildText;
};

const getResolvedGuilds = async (servers, client) => {
  const guilds = [];
  servers.forEach((server) => {
    if (server) guilds.push(client.guilds.fetch(server._id));
  });
  const resolvedGuilds = [];

  await Promise.allSettled(guilds).then((results) =>
    results.forEach((result) => {
      if (result.status == "fulfilled") resolvedGuilds.push(result.value);
    })
  );

  return resolvedGuilds;
};

/**
 * Description placeholder
 * @date 1/7/2024 - 11:00:25 PM
 *
 * @param {Client} client
 * @async
 */
const getResolvedGuild = async (guildId, client) => {
  const guild = await client.guilds.fetch(guildId);
  await guild.commands.fetch();
  return guild;
};
