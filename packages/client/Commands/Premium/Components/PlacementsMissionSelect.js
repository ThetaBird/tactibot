const { Client, StringSelectMenuInteraction } = require("discord.js");
const { fetchClan, updateMissionData } = require("../PremiumRequests");
const { createPremiumPlacementsMenu } = require("../PremiumDelivery");

class PlacementsMissionSelect {
  /**
   * Creates an instance of PlacementsMissionSelect.
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

  process = async (update) => {
    this.parse();
    const response = await updateMissionData(
      this.interaction,
      this.commandName,
      this.missions,
      undefined,
      undefined,
      update
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
    this.missions = this.interaction.values;
  };
}

module.exports = { PlacementsMissionSelect };
