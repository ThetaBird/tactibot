const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const {
  _EntitlementEditCommandModal,
} = require("./_EntitlementComponentDetails");

class EntitlementEditCallnameModalButton {
  /**
   * Creates an instance of EntitlementEditCallnameModalButton.
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

  process = async (tactiClanId) => {
    this.parse();
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    const { clans } = data;
    const foundClan = clans.find((c) => c._id == tactiClanId);
    const cl_id = foundClan.clanData.clan_id;

    const delivery = _EntitlementEditCommandModal(this.locale, cl_id);
    await this.interaction.showModal(delivery);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };
}

module.exports = { EntitlementEditCallnameModalButton };
