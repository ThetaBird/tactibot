const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, ModalSubmitInteraction } = require("discord.js");
const { updateDisplaySettings } = require("../PremiumRequests");
const { createPremiumDisplaySettingsMenu } = require("../PremiumDelivery");
const displayFormat = {
  image: "image",
  embed: "embed",
  "raw text": "rText",
  "split text": "sText",
};
const displayEnforcement = {
  none: "None",
  button: "Button",
  reaction: "Reaction",
};

class SettingsEditDisplayModal {
  /**
   * Creates an instance of SettingsEditDisplayModal.
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
    const ValidLangs = [
      "en",
      "ru",
      "fr",
      "pl",
      "deu",
      "it",
      "es",
      "ptp",
      "ptb",
      "tr",
      "id",
      "ja",
    ];

    const updateData = {
      custom_message: this.custom_message,
      output_languages: this.output_languages
        .toLowerCase()
        .split(",")
        .map((v) => v.replace(" ", ""))
        .filter((v) => ValidLangs.includes(v)),
      output_format: displayFormat[this.output_format.toLowerCase()],
    };

    const updateResponse = await updateDisplaySettings(
      this.interaction,
      this.commandName,
      updateData
    );
    const { data } = updateResponse?.data;
    if (!data) {
      await this.interaction.reply(getErrorEmbed());
      return;
    }

    const delivery = createPremiumDisplaySettingsMenu(this.locale, data);
    await this.interaction.update(delivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.guildId = this.interaction.guildId;
    this.commandName = this.interaction.message.interaction.commandName;

    this.custom_message =
      this.interaction.fields.getTextInputValue(`custommessage`);
    this.output_languages =
      this.interaction.fields.getTextInputValue(`outputlangs`);
    this.output_format =
      this.interaction.fields.getTextInputValue(`outputformat`);
  };
}

module.exports = { SettingsEditDisplayModal };
