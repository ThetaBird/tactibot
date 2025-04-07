const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchMetrics } = require("../PremiumRequests");
const {
  createPremiumMetricsUpdate,
  createWaitingMenu,
} = require("../PremiumDelivery");

class MetricsPinButton {
  /**
   * Creates an instance of MetricsPinButton.
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

  process = async (metricType) => {
    this.parse();
    this.interaction.deferUpdate();

    const channelDelivery = createWaitingMenu(this.locale);
    const message = await this.interaction.channel.send(
      channelDelivery.initial
    );

    const response = await fetchMetrics(
      this.interaction,
      metricType,
      this.commandName,
      this.guildId,
      this.channelId,
      message.id
    );
    if (!response) return;

    const { data } = response?.data;
    data.metricType = metricType;

    const delivery = await createPremiumMetricsUpdate(
      this.locale,
      data,
      this.client
    );

    await message.edit(delivery);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.channelId = this.interaction.channelId;
    this.commandName = this.interaction.message.interaction.commandName;
  };
}

module.exports = { MetricsPinButton };
