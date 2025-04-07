const { createPremiumMenu } = require("./PremiumDelivery");
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { fetchClan } = require("./PremiumRequests");

const PremiumCommand_Details = {
  name: "link",
  description: "Link your Tacticool account with Discord.",
};

class PremiumCommand {
  /**
   * Creates an instance of PremiumCommand.
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
    const response = await fetchClan(
      this.interaction,
      this.userId,
      this.commandName
    );
    const { data } = response?.data;
    const { userRole } = data || {};

    if (!userRole) {
      const { id, token } = this.interaction;

      return this.client.rest
        .post(`/interactions/${id}/${token}/callback`, {
          body: { type: 10, data: {} },
        })
        .then(() => (this.interaction.replied = true));
    }

    const delivery = createPremiumMenu(this.locale, data);
    await this.interaction.reply(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.commandName = this.interaction.commandName;
  };
}

module.exports = { PremiumCommand, PremiumCommand_Details };
