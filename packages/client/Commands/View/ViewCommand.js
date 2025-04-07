//import axios from 'axios';
const axios = require("axios");
const { createFromUserId, waitingMenu } = require("./ViewDelivery");
const { getErrorEmbed } = require("../../DeliveryUtil");
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { build } = require("../../Command");
const { fetchPlayerData } = require("./ViewRequests");

const ViewCommand_Details = {
  name: "view",
  description: "View a user's Tacticool account.",
  options: [
    {
      name: "user",
      description: "User to view.",
      type: 6, //User
      required: true,
    },
  ],
};
//build(null,ViewCommand_Details);

class ViewCommand {
  /**
   * Creates an instance of ViewCommand.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.defer = this.interaction.reply(waitingMenu());
  }

  process = async (presets = null) => {
    this.parse();
    const response = await fetchPlayerData(
      this.defer,
      this.interaction,
      this.target_user.id
    );
    if (!response) return;

    const { data } = response?.data;
    const delivery = await createFromUserId(data, presets, this.locale);
    await this.defer;
    await this.interaction.editReply(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.target_user = this.interaction.options.getUser("user");
  };
}

module.exports = { ViewCommand, ViewCommand_Details };
