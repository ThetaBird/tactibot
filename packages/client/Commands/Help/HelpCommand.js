//import axios from 'axios';
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { createHelpMenu } = require("./HelpDelivery");

const HelpCommand_Details = {
  name: "help",
  description: "Get helpful information about Tacti.",
};

class HelpCommand {
  /**
   * Creates an instance of HelpCommand.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async () => {
    this.parse();
    const delivery = createHelpMenu(this.locale);
    await this.interaction.reply(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };
}

module.exports = { HelpCommand, HelpCommand_Details };
