const axios = require("axios");
const { getErrorEmbed } = require("../../DeliveryUtil");

const {
  ChatInputCommandInteraction,
  ButtonInteraction,
} = require("discord.js");

/**
 * Description placeholder
 * @date 1/6/2024 - 11:12:21 PM
 *
 * @param {ChatInputCommandInteraction | ButtonInteraction} interaction
 * @param {string} userId
 * @async
 */
const fetchPlayerData = async (defer, interaction, userId) => {
  try {
    return axios({
      method: "get",
      url: `${process.env.BACKEND_URL}/fromUserId?userId=${userId}`,
      timeout: 7000,
    }).catch(() => {
      const delivery = getErrorEmbed();
      defer.then(() => interaction.editReply(delivery.initial));
      return null;
    });
  } catch (error) {
    console.error(err);
    const delivery = getErrorEmbed();
    interaction.reply(delivery.initial);
    return null;
  }
};

module.exports = {
  fetchPlayerData,
};
