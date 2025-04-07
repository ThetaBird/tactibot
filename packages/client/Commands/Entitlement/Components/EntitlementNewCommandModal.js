const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, ModalSubmitInteraction } = require("discord.js");
const { createCommand } = require("../EntitlementRequests");
const {
  createNewCommandErrorMenu,
  createEntitlementCommandMenu,
} = require("../EntitlementDelivery");

class EntitlementNewCommandModal {
  /**
   * Creates an instance of EntitlementNewCommandModal.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ModalSubmitInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async () => {
    this.parse();

    const regex = /#clan\/([a-f0-9]+)/;
    const match = this.url.match(regex);
    const clanId = match ? match[1] : null;
    const callName = this.callName.replace(/\//g, "");

    if (
      ["generate", "premium", "settings", "help", "link", "view"].includes(
        callName
      )
    ) {
      const delivery = createNewCommandErrorMenu(this.locale, {
        error: "taken_callname",
      });
      await this.interaction.update(delivery.initial);
      return;
    }
    if (!clanId) {
      console.log(match, this.url, callName);
      const delivery = createNewCommandErrorMenu(this.locale, {
        error: "invalid_url",
      });
      await this.interaction.update(delivery.initial);
      return;
    }

    const updateResponse = await createCommand(
      this.interaction,
      this.userId,
      clanId,
      callName
    );
    const { data } = updateResponse?.data;
    if (!data) {
      await this.interaction.update(getErrorEmbed().initial);
      return;
    }
    if (data.error) {
      const delivery = createNewCommandErrorMenu(this.locale, data);
      await this.interaction.update(delivery.initial);
      return;
    }

    data.guildId = this.guildId;

    const delivery = await createEntitlementCommandMenu(
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
    this.url = this.interaction.fields.getTextInputValue(
      `entitlement_newclanURL`
    );
    this.callName = this.interaction.fields.getTextInputValue(
      `entitlement_newcallname`
    );
  };
}

module.exports = { EntitlementNewCommandModal };
