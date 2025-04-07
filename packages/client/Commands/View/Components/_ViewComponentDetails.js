const { Emoji, getButton } = require("../../../DeliveryUtil");

const _ViewPresetsButton = (locale, userId) =>
  getButton({
    customId: `view_presets_${userId}`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.dashboard,
  });

const _ViewMainButton = (locale, userId) =>
  getButton({
    customId: `view_main_${userId}`,
    label: "\u200B", //[locale]
    style: "Secondary",
    emoji: Emoji.backButton,
  });

module.exports = {
  _ViewPresetsButton,
  _ViewMainButton,
};
