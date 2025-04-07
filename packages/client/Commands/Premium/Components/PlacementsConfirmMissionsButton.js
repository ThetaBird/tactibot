const { Client, MessageComponentInteraction } = require("discord.js");
const {
  confirmCompletedMissions,
  updateMissionData,
} = require("../PremiumRequests");
const {
  createPremiumPlacementsMenu,
  createPremiumMenu,
} = require("../PremiumDelivery");
const { PlacementsManager } = require("../../../Placements/PlacementsManager");
const {
  PlacementsDeliveryManager,
} = require("../../../Placements/PlacementsDeliveryManager");
const { processGenerate } = require("../../Generate/GenCommand");
const { getErrorEmbed } = require("../../../DeliveryUtil");

class PlacementsConfirmMissionsButton {
  /**
   * Creates an instance of PlacementsConfirmMissionsButton.
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

  process = async (reposition) => {
    this.parse();
    const response = reposition
      ? await confirmCompletedMissions(this.interaction, this.commandName)
      : await updateMissionData(
          this.interaction,
          this.commandName,
          undefined,
          undefined,
          true
        );
    if (!response) return;

    const { data } = response?.data;

    const delivery = createPremiumMenu(this.locale, data);
    await this.interaction.update(delivery.initial);

    const placementsManager = new PlacementsManager(data);
    const deliveryManager = new PlacementsDeliveryManager(data);

    try {
      const { clanData, displayPreferences, missionData } = data;
      const { clan_language } = clanData;
      const { output_languages, output_format } = displayPreferences;

      const parsedOptions = {
        locale: this.locale,
        userId: this.userId,
        mainLang: clan_language,
        missions: missionData.current_missions,
        responseFormat: output_format,
        responseLangs: (output_languages || []).join(" "),
        callName: this.commandName,
        tactiClan: data,
        completed: (missionData.selected || []).sort(),
      };
      const delivery = processGenerate(
        placementsManager,
        deliveryManager,
        parsedOptions
      );
      console.log({ delivery });
      await this.interaction.channel.send(delivery.initial);
      for (const followUp of delivery.followUp || [])
        await this.interaction.channel.send(followUp);
    } catch (error) {
      console.error(error);
      const delivery = getErrorEmbed(error?.message);
      await this.interaction.update(delivery.initial);
    }
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.commandName = this.interaction.message.interaction.commandName;
  };
}

module.exports = { PlacementsConfirmMissionsButton };
