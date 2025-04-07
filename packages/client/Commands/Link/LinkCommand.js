//import axios from 'axios';
const axios = require("axios");
const { createLinkMenu, createAlreadyLinkedMenu } = require("./LinkDelivery");
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { getErrorEmbed } = require("../../DeliveryUtil");

const LinkCommand_Details = {
  name: "link",
  description: "Link your Tacticool account with Discord.",
};

class LinkCommand {
  /**
   * Creates an instance of LinkCommand.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.defer = this.interaction.deferReply({ ephemeral: true });
    this.interaction.reply = async (...a) =>
      await this.defer.then(async () => await this.interaction.editReply(...a));
  }

  process = async () => {
    this.parse();
    let response;
    try {
      console.warn("fetchData");
      response = await this.fetchData();
      console.warn("response");
    } catch (err) {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.reply(delivery.initial);
      return;
    }

    const { data } = response?.data;
    //console.log(data)
    const delivery = data
      ? createAlreadyLinkedMenu(this.locale, data.pu_id)
      : createLinkMenu(this.locale);
    console.warn("delivery");
    await this.interaction.reply(delivery.initial);
    console.warn("reply");
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
  };

  fetchData = async () => {
    return axios({
      method: "get",
      url: `${process.env.BACKEND_URL}/link?userId=${this.userId}`,
      timeout: 10000,
    }).catch(async (err) => {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.reply(delivery.initial);
      return null;
    });
  };
}

module.exports = { LinkCommand, LinkCommand_Details };
