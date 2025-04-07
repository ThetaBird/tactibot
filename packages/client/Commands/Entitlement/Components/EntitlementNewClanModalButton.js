const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const { _EntitlementNewClanModal } = require("./_EntitlementComponentDetails");

class EntitlementNewClanModalButton {
  /**
   * Creates an instance of EntitlementNewClanModalButton.
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
    const { data } = response?.data;
    const { userClanId } = data;

    const delivery = _EntitlementNewClanModal(this.locale, userClanId);
    await this.interaction.showModal(delivery);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };
}

module.exports = { EntitlementNewClanModalButton };
