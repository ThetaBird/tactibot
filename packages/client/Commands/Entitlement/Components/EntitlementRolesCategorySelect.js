const { Client, StringSelectMenuInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const {
  createEntitlementServerRoleClanMenu,
  createEntitlementManageRolesMenu,
} = require("../EntitlementDelivery");

class EntitlementRolesCategorySelect {
  /**
   * Creates an instance of EntitlementRolesCategorySelect.
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

  process = async (cl_id) => {
    this.parse(cl_id);
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    data.guildId = this.guildId;

    const delivery = await createEntitlementManageRolesMenu(
      this.locale,
      data,
      this.cl_id,
      this.target
    );
    await this.interaction.update(delivery.initial);
  };

  parse = (cl_id) => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.target = this.interaction.values?.at(0);
    this.cl_id = cl_id;
  };
}

module.exports = { EntitlementRolesCategorySelect };
