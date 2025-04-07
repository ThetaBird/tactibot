const axios = require("axios");
const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, MessageComponentInteraction } = require("discord.js");
const { createCancelledMenu } = require("../LinkDelivery");

class LinkCancelButton {
  /**
   * Creates an instance of LinkCancelButton.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {MessageComponentInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async () => {
    this.parse();
    const delivery = createCancelledMenu(this.locale);
    await this.interaction.update(delivery.initial);
    await this.deleteLink();
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };

  deleteLink = async () => {
    try {
      return axios({
        method: "delete",
        url: `${process.env.BACKEND_URL}/link`,
        data: {
          userId: this.userId,
        },
      }).catch(async () => {
        const delivery = getErrorEmbed();
        await this.interaction.update(delivery.initial);
        return null;
      });
    } catch (err) {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.update(delivery.initial);
    }
  };
}

module.exports = { LinkCancelButton };
