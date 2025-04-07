const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, ModalSubmitInteraction } = require("discord.js");
const { updateRoles, fetchEntitlement } = require("../EntitlementRequests");
const {
  createEntitlementServerRoleClanMenu,
} = require("../EntitlementDelivery");

class EntitlementNewClanModal {
  /**
   * Creates an instance of EntitlementNewClanModal.
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

    const regex = /#clan\/([a-f0-9]+)\//;
    const match = this.url.match(regex);
    const clanId = match ? match[1] : null;

    const errMsg = "Invalid TactiStats Clan ID.";
    const updateResponse = await updateRoles(
      this.interaction,
      clanId,
      null,
      "r_id",
      false
    );
    const { data } = updateResponse?.data;
    if (!data) {
      await this.interaction.update(getErrorEmbed(errMsg).initial);
      return;
    }

    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const responseData = response?.data?.data;
    responseData.guildId = this.guildId;

    const delivery = await createEntitlementServerRoleClanMenu(
      this.locale,
      responseData,
      clanId
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
  };
}

module.exports = { EntitlementNewClanModal };
