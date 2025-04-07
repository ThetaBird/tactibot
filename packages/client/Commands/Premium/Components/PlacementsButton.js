const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchClan } = require("../PremiumRequests");
const { createPremiumPlacementsMenu } = require("../PremiumDelivery");

class PlacementsButton {
  /**
   * Creates an instance of PlacementsButton.
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
    const response = await fetchClan(
      this.interaction,
      this.userId,
      this.commandName
    );
    if (!response) return;

    const { data } = response?.data;

    const delivery = createPremiumPlacementsMenu(this.locale, data);
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.commandName = this.interaction.message.interaction.commandName;
  };
}

module.exports = { PlacementsButton };
