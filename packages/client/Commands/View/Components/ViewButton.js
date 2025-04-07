const { createFromUserId, waitingMenu } = require("../ViewDelivery");
const { Client, ButtonInteraction } = require("discord.js");
const { fetchPlayerData } = require("../ViewRequests");

class ViewButton {
  /**
   * Creates an instance of ViewButton.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ButtonInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.defer = this.interaction.update(waitingMenu());
  }

  process = async (userId, presets = null) => {
    this.parse();
    const response = await fetchPlayerData(
      this.defer,
      this.interaction,
      userId
    );
    if (!response) return;

    const { data } = response?.data;
    const delivery = await createFromUserId(data, presets, this.locale);
    await this.defer;
    await this.interaction.editReply(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
  };
}

module.exports = { ViewButton };
