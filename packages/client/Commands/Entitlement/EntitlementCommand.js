//import axios from 'axios';
const axios = require("axios");
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { getErrorEmbed } = require("../../DeliveryUtil");
const { createEntitlementDashboard } = require("./EntitlementDelivery");
const { fetchEntitlement } = require("./EntitlementRequests");
const { build } = require("../../Command");

const EntitlementCommand_Details = {
  name: "premium",
  description: "Manage Premium Tacti Settings.",
};

//build(null,EntitlementCommand_Details);

class EntitlementCommand {
  /**
   * Creates an instance of EntitlementCommand.
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
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    const delivery = await createEntitlementDashboard(
      this.locale,
      data,
      this.client
    );
    await this.interaction.reply(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
  };
}

module.exports = { EntitlementCommand, EntitlementCommand_Details };
