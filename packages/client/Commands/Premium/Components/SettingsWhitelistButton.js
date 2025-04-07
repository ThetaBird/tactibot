const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchClan } = require("../PremiumRequests");
const { createPremiumWhitelistSettingsMenu } = require("../PremiumDelivery");

class SettingsWhitelistButton {
  /**
   * Creates an instance of SettingsWhitelistButton.
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

  process = async (type) => {
    this.parse();
    const response = await fetchClan(
      this.interaction,
      this.userId,
      this.commandName
    );
    if (!response) return;

    const { data } = response?.data;
    data.type = type;
    const delivery = createPremiumWhitelistSettingsMenu(this.locale, data);
    console.log(delivery);
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.commandName = this.interaction.message.interaction.commandName;
  };
}

module.exports = { SettingsWhitelistButton };
