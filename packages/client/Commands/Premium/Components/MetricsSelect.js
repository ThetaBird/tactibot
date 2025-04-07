const { Client, StringSelectMenuInteraction } = require("discord.js");
const { fetchMetrics } = require("../PremiumRequests");
const { createPremiumMetricsMenu } = require("../PremiumDelivery");

class MetricsSelect {
  /**
   * Creates an instance of MetricsSelect.
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

  process = async () => {
    this.parse();

    const response = await fetchMetrics(
      this.interaction,
      this.metricType,
      this.commandName,
      this.guildId
    );
    if (!response) return;

    const { data } = response?.data;
    console.log(data);
    data.metricType = this.metricType;

    const delivery = await createPremiumMetricsMenu(
      this.locale,
      data,
      this.client
    );

    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.channelId = this.interaction.channelId;
    this.commandName = this.interaction.message.interaction.commandName;
    this.metricType = this.interaction.values.at(0);
  };
}

module.exports = { MetricsSelect };
