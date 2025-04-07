const { Client, MessageComponentInteraction } = require("discord.js");
const { upsertEntitlementServer } = require("../EntitlementRequests");
const { createEntitlementServerMenu } = require("../EntitlementDelivery");

class EntitlementActivateServerButton {
  /**
   * Creates an instance of EntitlementActivateServerButton.
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
    const response = await upsertEntitlementServer(
      this.interaction,
      this.userId,
      this.guildId,
      this.guildName
    );
    if (!response) return;

    const { data } = response?.data;
    console.log({ data });
    if (!data) {
      //should return error
      return;
    }
    data.guildId = this.guildId;

    const delivery = await createEntitlementServerMenu(
      this.locale,
      data,
      this.client
    );
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.guildName = this.interaction.guild.name;
  };
}

module.exports = { EntitlementActivateServerButton };
