const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, ModalSubmitInteraction } = require("discord.js");
const { updatePreferences } = require("../PremiumRequests");
const { createPremiumPreferencesSettingsMenu } = require("../PremiumDelivery");
const displayMissionPriority = {
  right: "last",
  left: "first",
  middle: "middle",
};
const displayEpicMissionPriority = {
  last: "last",
  prelast: "prelast",
  first: "first",
  ignore: "ignore",
};

class SettingsEditPreferencesModal {
  /**
   * Creates an instance of SettingsEditPreferencesModal.
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
    console.log(this.interaction);

    const updateData = {
      ignore_missions:
        this.ignore_missions >= 0 && this.ignore_missions < 8
          ? parseInt(this.ignore_missions) || undefined
          : undefined,
      mission_count:
        this.mission_count > 1 && this.mission_count <= 8
          ? parseInt(this.mission_count) || undefined
          : undefined,
      operator_priority:
        displayMissionPriority[this.operator_priority.toLowerCase()],
      epic_position:
        displayEpicMissionPriority[this.epic_position.toLowerCase()],
      show_movements: this.show_movements.toLowerCase() == "yes" ? true : false,
    };

    const updateResponse = await updatePreferences(
      this.interaction,
      this.commandName,
      updateData
    );
    const { data } = updateResponse?.data;
    if (!data) {
      await this.interaction.reply(getErrorEmbed());
      return;
    }

    const delivery = createPremiumPreferencesSettingsMenu(this.locale, data);
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.commandName = this.interaction.message.interaction.commandName;

    this.ignore_missions =
      this.interaction.fields.getTextInputValue(`ignoremissions`);
    this.mission_count =
      this.interaction.fields.getTextInputValue(`nummissions`);
    this.operator_priority =
      this.interaction.fields.getTextInputValue(`priority`);
    this.epic_position = this.interaction.fields.getTextInputValue(`epic`);
    this.show_movements =
      this.interaction.fields.getTextInputValue(`repositions`);
  };
}

module.exports = { SettingsEditPreferencesModal };
