const {
  Emoji,
  getButton,
  getModal,
  getShortTextInput,
  getRow,
} = require("../../../DeliveryUtil");

const _LinkBeginButton = (locale) =>
  getButton({
    customId: "link_begin",
    label: "Begin Link", //[locale]
    style: "Success",
    emoji: Emoji.link,
  });

const _LinkCancelButton = (locale) =>
  getButton({
    customId: "link_cancel",
    label: `\u200B`, //[locale]
    style: "Secondary",
    emoji: Emoji.cancelButton,
  });

const _LinkModal_PublicIDField = (locale) =>
  getShortTextInput({
    customId: "publicid",
    label: "Tacticool Public ID", //[locale]
    max: 8,
    min: 5,
    required: true,
    placeholder: "Example: F76WZ42C", //[locale]
  });

const _LinkModal = (locale, fromView) =>
  getModal({
    customId: `link_modal${fromView ? "_fromview" : ""}`,
    title: "Link Tacticool Account", //[locale]
    components: getRow([_LinkModal_PublicIDField(locale)]),
  });

const _LinkPinButton = (locale) =>
  getButton({
    customId: "link_pin",
    label: `Pin`, //[locale]
    style: "Secondary",
    emoji: Emoji.pinButton,
  });

module.exports = {
  _LinkBeginButton,
  _LinkCancelButton,
  _LinkModal_PublicIDField,
  _LinkModal,
  _LinkPinButton,
};
