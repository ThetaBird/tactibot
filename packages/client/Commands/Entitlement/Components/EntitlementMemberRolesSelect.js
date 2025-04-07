const { Client, RoleSelectMenuInteraction } = require("discord.js");
const { fetchEntitlement, updateRoles } = require("../EntitlementRequests");
const {
  createEntitlementServerRoleClanMenu,
} = require("../EntitlementDelivery");

class EntitlementRolesSelect {
  /**
   * Creates an instance of EntitlementRolesSelect.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {RoleSelectMenuInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async (cl_id, target) => {
    this.parse();
    await updateRoles(this.interaction, cl_id, this.roles, target);
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    data.guildId = this.guildId;

    const delivery = await createEntitlementServerRoleClanMenu(
      this.locale,
      data,
      cl_id
    );
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.roles = this.interaction.values;
  };
}

module.exports = { EntitlementRolesSelect };
