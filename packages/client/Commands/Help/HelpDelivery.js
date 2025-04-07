const { getRow } = require("../../DeliveryUtil");
const { _HelpSelect } = require("./Components/_HelpComponentDetails");
const {
  helpPremiumEmbed,
  helpViewEmbed,
  helpGenerateEmbed,
  helpLinkEmbed,
  helpEmbed,
} = require("./HelpEmbeds");

const createHelpMenu = (locale, type = "main") => {
  //Embed with help locale prompt + locale select & cancel button
  const embed =
    type == "link"
      ? helpLinkEmbed(locale)
      : type == "missions"
      ? helpGenerateEmbed(locale)
      : type == "metrics"
      ? helpViewEmbed(locale)
      : type == "premium"
      ? helpPremiumEmbed(locale)
      : helpEmbed(locale);

  const selectRow = getRow([_HelpSelect(locale, type == "main")]);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [selectRow],
      files: [],
    },
  };
};

module.exports = {
  createHelpMenu,
};
