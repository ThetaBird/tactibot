const {
  Client,
  StringSelectMenuInteraction,
  StringSelectMenuBuilder,
} = require("discord.js");
const { createHelpMenu } = require("../HelpDelivery");

class HelpSelect {
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
    const delivery = createHelpMenu(this.locale, this.target);
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.target = this.interaction.values?.at(0);
  };
}

module.exports = { HelpSelect };
