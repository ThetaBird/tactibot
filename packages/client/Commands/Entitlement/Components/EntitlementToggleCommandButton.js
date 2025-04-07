const { Client, MessageComponentInteraction } = require("discord.js");
const { fetchEntitlement } = require("../EntitlementRequests");
const {
  createEntitlementManageCommandMenu,
} = require("../EntitlementDelivery");
const { getErrorEmbed } = require("../../../DeliveryUtil");

class EntitlementToggleCommandButton {
  /**
   * Creates an instance of EntitlementToggleCommandButton.
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

  process = async (tactiClanId) => {
    this.parse();
    const response = await fetchEntitlement(this.interaction, this.userId);
    if (!response) return;

    const { data } = response?.data;
    data.guildId = this.guildId;
    data.tactiClanId = tactiClanId;

    const foundClan = data.clans.find((clan) => clan._id == tactiClanId);
    if (!foundClan) {
      await this.interaction.update(getErrorEmbed().initial);
      return;
    }

    const { call_name, clan_tag, clan_name } = foundClan.clanData;
    const guildCommands = this.interaction.guild.commands;
    const foundCommand = guildCommands.cache.find((c) => c.name == call_name);
    if (foundCommand) await foundCommand.delete();
    else
      await guildCommands.create({
        name: call_name,
        description: `Premium Tacti Command for [${clan_tag}] ${clan_name}`,
      });

    const delivery = await createEntitlementManageCommandMenu(
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
  };
}

module.exports = { EntitlementToggleCommandButton };
