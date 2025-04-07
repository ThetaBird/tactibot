const axios = require("axios");
const { getErrorEmbed } = require("../../DeliveryUtil");
const {
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  RoleSelectMenuInteraction,
} = require("discord.js");

/**
 * Description placeholder
 * @date 1/6/2024 - 11:12:21 PM
 *
 * @param {ChatInputCommandInteraction | StringSelectMenuInteraction} interaction
 * @param {string} userId
 * @async
 */
const fetchEntitlement = async (interaction, userId) => {
  try {
    return axios({
      method: "get",
      url: `${process.env.BACKEND_URL}/entitlement?userId=${userId}`,
      timeout: 15000,
    }).catch(() => {
      const delivery = getErrorEmbed();
      interaction.reply(delivery.initial);
      return null;
    });
  } catch (error) {
    console.error(error);
    const delivery = getErrorEmbed();
    interaction.reply(delivery.initial);
    return null;
  }
};

/**
 * Description placeholder
 * @date 1/6/2024 - 11:12:21 PM
 *
 * @param {RoleSelectMenuInteraction} interaction
 * @param {string} userId
 * @async
 */
const updateRoles = async (
  interaction,
  clanId,
  roles,
  target,
  reply = true
) => {
  try {
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/roles`,
      data: {
        clanId,
        roles,
        target,
        serverId: interaction.guildId,
      },
      timeout: 3000,
    }).catch(() => {
      const delivery = getErrorEmbed();
      interaction.reply(delivery.initial);
      return null;
    });
  } catch (error) {
    if (!reply) return null;
    const delivery = getErrorEmbed(errMsg);
    interaction.reply(delivery.initial);
    return null;
  }
};

const upsertEntitlementServer = (
  interaction,
  discordId,
  serverId,
  serverName
) => {
  try {
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/entitlementServer`,
      timeout: 3000,
      data: {
        discordId,
        serverId,
        serverName,
      },
    }).catch(() => {
      const delivery = getErrorEmbed();
      interaction.reply(delivery.initial);
      return null;
    });
  } catch (error) {
    if (!reply) return null;
    const delivery = getErrorEmbed(errMsg);
    interaction.reply(delivery.initial);
    return null;
  }
};

const createCommand = async (interaction, adminId, clanId, callName) => {
  try {
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/tactiClan`,
      data: {
        adminId,
        clanId,
        callName,
      },
      timeout: 3000,
    }).catch(() => {
      const delivery = getErrorEmbed();
      interaction.reply(delivery.initial);
      return null;
    });
  } catch (error) {
    if (!reply) return null;
    const delivery = getErrorEmbed(errMsg);
    interaction.reply(delivery.initial);
    return null;
  }
};

module.exports = {
  fetchEntitlement,
  updateRoles,
  upsertEntitlementServer,
  createCommand,
};
