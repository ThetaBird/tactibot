const { Client, StringSelectMenuInteraction } = require("discord.js");
const { updateWhitelist } = require("../PremiumRequests");
const { createPremiumWhitelistSettingsMenu } = require("../PremiumDelivery");

class SettingsWhitelistUserSelect {
  /**
   * Creates an instance of SettingsWhitelistUserSelect.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {StringSelectMenuInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async (type) => {
    this.parse();
    const response = await updateWhitelist(
      this.interaction,
      this.commandName,
      type,
      this.members
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
    this.members = this.interaction.values;
  };
}

module.exports = { SettingsWhitelistUserSelect };
