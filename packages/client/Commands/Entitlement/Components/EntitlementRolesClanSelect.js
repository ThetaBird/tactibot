const { Client, StringSelectMenuInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const {
  createEntitlementServerRoleClanMenu,
} = require("../EntitlementDelivery");

class EntitlementRolesClanSelect {
  /**
   * Creates an instance of LinkBeginButton.
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
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    data.guildId = this.guildId;

    const delivery = await createEntitlementServerRoleClanMenu(
      this.locale,
      data,
      this.target
    );
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.target = this.interaction.values?.at(0);
  };
}

module.exports = { EntitlementRolesClanSelect };
