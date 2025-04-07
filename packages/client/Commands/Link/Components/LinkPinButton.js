const { Client, MessageComponentInteraction } = require("discord.js");
const { createPublicLinkMenu } = require("../LinkDelivery");

class LinkPinButton {
  /**
   * Creates an instance of LinkPinButton.
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

    const delivery = createPublicLinkMenu(this.locale);
    await Promise.all([
      this.interaction.update(delivery.initial),
      this.interaction.channel.send(delivery.channel),
    ]);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };
}

module.exports = { LinkPinButton };
