const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const {
  _EntitlementNewCommandModal,
} = require("./_EntitlementComponentDetails");

class EntitlementNewCommandModalButton {
  /**
   * Creates an instance of EntitlementNewCommandModalButton.
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
    const { userClanId } = data;

    const delivery = _EntitlementNewCommandModal(this.locale, userClanId);
    await this.interaction.showModal(delivery);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };
}

module.exports = { EntitlementNewCommandModalButton };
