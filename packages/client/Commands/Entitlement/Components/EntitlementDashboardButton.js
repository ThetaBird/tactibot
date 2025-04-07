const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const { createEntitlementDashboard } = require("../EntitlementDelivery");

class EntitlementDashboardButton {
  /**
   * Creates an instance of EntitlementDashboardButton.
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
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    data.guildId = this.guildId;

    const delivery = await createEntitlementDashboard(
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
  };
}

module.exports = { EntitlementDashboardButton };
