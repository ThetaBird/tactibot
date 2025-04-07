const axios = require("axios");
const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, MessageComponentInteraction } = require("discord.js");
const { createAlreadyLinkedMenu, createLinkModal } = require("../LinkDelivery");

class LinkBeginButton {
  /**
   * Creates an instance of LinkBeginButton.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {MessageComponentInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    // Can't defer reply because the modal will not show
  }

  process = async (fromView = false) => {
    this.parse();
    console.warn("parse");
    const response = await this.fetchData();
    console.warn("fetchData");
    const { data } = response?.data;
    console.warn("data");

    const delivery = data
      ? createAlreadyLinkedMenu(this.locale, data.pu_id, false)
      : createLinkModal(this.locale, fromView);
    if (data) {
      await this.interaction.reply(delivery.initial);
      return;
    }

    await this.interaction.showModal(delivery.modal);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };

  fetchData = async () => {
    try {
      return axios({
        method: "get",
        url: `${process.env.BACKEND_URL}/link?userId=${this.userId}`,
        timeout: 2500,
      }).catch(async () => {
        const delivery = getErrorEmbed();
        await this.interaction.reply(delivery.initial);
        return null;
      });
    } catch (err) {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.reply(delivery.initial);
    }
  };
}

module.exports = { LinkBeginButton };
