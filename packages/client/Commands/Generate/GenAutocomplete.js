const { Client, AutocompleteInteraction } = require("discord.js");
const {
  getAutocompleteMissionChoices,
  getAutocompleteLanguageChoices,
} = require("./GenProcessor_Util");

class GenAutocomplete {
  /**
   * Creates an instance of GenAutocomplete.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {AutocompleteInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
  }

  process = async () => {
    this.parse();
    const choices = this.focusedOption?.name?.startsWith("m")
      ? getAutocompleteMissionChoices(
          this.autocompleteLang,
          this.focusedOption.value,
          this.missionOptions
        )
      : getAutocompleteLanguageChoices(this.focusedOption.value);

    this.interaction.respond(choices);
  };

  parse = () => {
    const { options, locale } = this.interaction;

    this.focusedOption = options.getFocused(true);
    console.log(this.focusedOption);
    this.missionOptions = options.data
      .filter((option) => option.name.startsWith("m") && !option.focused)
      .map((option) => (option.value == "null" ? null : option.value));

    this.outputLang = options.getString("lang");
    this.autocompleteLang = options.getString("input_lang");
    this.locale = locale;
    this.target_user = options.getUser("user");
  };
}

module.exports = { GenAutocomplete };
