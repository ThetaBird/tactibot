const axios = require("axios");
const { getErrorEmbed } = require("../../DeliveryUtil");
const {
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  RoleSelectMenuInteraction,
  ButtonInteraction,
} = require("discord.js");

/**
 * Description placeholder
 * @date 1/6/2024 - 11:12:21 PM
 *
 * @param {ChatInputCommandInteraction | StringSelectMenuInteraction | ButtonInteraction} interaction
 * @param {string} userId
 * @async
 */
const fetchClan = async (interaction, userId, commandName) => {
  try {
    return axios({
      method: "get",
      url: `${process.env.BACKEND_URL}/getClan?callName=${commandName}&userId=${userId}`,
      timeout: 10000,
    }).catch(() => {
      const delivery = getErrorEmbed();
      interaction.reply(delivery.initial);
      return null;
    });
  } catch (error) {
    console.error(err);
    const delivery = getErrorEmbed();
    interaction.reply(delivery.initial);
    return null;
  }
};

/**
 * Description placeholder
 * @date 1/6/2024 - 11:12:21 PM
 *
 * @param {StringSelectMenuInteraction} interaction
 * @param {string} metricType
 * @async
 */
const fetchMetrics = async (
  interaction,
  metricType,
  commandName,
  gId,
  cId,
  mId
) => {
  try {
    await axios({
      method: "get",
      url: `${process.env.BACKEND_URL}/metrics?callName=${commandName}&metricType=${metricType}&gId=${gId}&cId=${cId}&mId=${mId}`,
      timeout: 10000,
    });
  } catch (error) {
    console.error(err);
    const delivery = getErrorEmbed();
    interaction.reply(delivery.initial);
    return null;
  }
};

const updateMissionData = async (
  interaction,
  callName,
  missions,
  focused_num,
  persist,
  update
) => {
  try {
    const userId = interaction.user.id;
    const selected = update ? missions : undefined;
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/updateMissionData`,
      data: {
        userId,
        callName,
        missions,
        focused_num,
        persist,
        selected,
      },
      timeout: 10000,
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

const confirmCompletedMissions = async (interaction, callName) => {
  try {
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/updateMissionData`,
      data: {
        callName,
        confirmCompleted: true,
      },
      timeout: 10000,
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

const updateWhitelist = async (interaction, callName, type, members) => {
  try {
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/updateWhitelistData`,
      data: {
        callName,
        type,
        members,
      },
      timeout: 10000,
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

const updatePreferences = async (interaction, callName, data) => {
  try {
    const {
      ignore_missions,
      mission_count,
      operator_priority,
      epic_position,
      show_movements,
    } = data;
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/updatePreferenceData`,
      data: {
        callName,
        ignore_missions,
        mission_count,
        operator_priority,
        epic_position,
        show_movements,
      },
      timeout: 10000,
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

const updateDisplaySettings = async (interaction, callName, data) => {
  try {
    const {
      custom_message,
      output_languages,
      output_format,
      enforce_placements,
    } = data;
    return axios({
      method: "post",
      url: `${process.env.BACKEND_URL}/updateDisplayData`,
      data: {
        callName,
        custom_message,
        output_languages,
        output_format,
        enforce_placements,
      },
      timeout: 10000,
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
  fetchClan,
  fetchMetrics,
  updateWhitelist,
  updateMissionData,
  updatePreferences,
  updateDisplaySettings,
  confirmCompletedMissions,
};
