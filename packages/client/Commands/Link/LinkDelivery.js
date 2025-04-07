const { getRow } = require("../../DeliveryUtil");
const {
  _LinkModal,
  _LinkPinButton,
  _LinkBeginButton,
  _LinkCancelButton,
} = require("./Components/_LinkComponentDetails");
const {
  linkEmbed,
  publicLinkEmbed,
  alreadyLinkedEmbed,
  awaitingActionEmbed,
  linkTimeoutEmbed,
  linkPinConfirmationEmbed,
  linkSuccessEmbed,
  pinEmbed,
  cancelEmbed,
} = require("./LinkEmbeds");

const createLinkMenu = (locale) => {
  //Embed with link instructions + begin & cancel buttons
  const embed = linkEmbed(locale);
  const controls = [_LinkBeginButton(locale), _LinkCancelButton(locale)];
  const controlRow = getRow(controls);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [controlRow],
      files: [],
    },
  };
};

const createLinkConfirmationMenu = (locale) => {
  const embed = linkPinConfirmationEmbed(locale);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [],
      files: [],
    },
  };
};

const createLinkModal = (locale, fromView) => {
  const modal = _LinkModal(locale, fromView);
  return { modal };
};

const createAlreadyLinkedMenu = (locale, publicId, pinButton = true) => {
  //embed with "already linked" message as well as cancel + unlink buttons
  const embed = alreadyLinkedEmbed(locale, publicId, pinButton);
  const controls = [];
  if (pinButton) controls.push(_LinkPinButton(locale));
  const controlRow = controls.length ? [getRow(controls)] : [];

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [...controlRow],
      files: [],
    },
  };
};

const createPublicLinkMenu = (locale) => {
  const pinnedEmbed = pinEmbed(locale);

  //Embed with link instructions + begin & cancel buttons
  const embed = publicLinkEmbed(locale);
  const controls = [_LinkBeginButton(locale)]; //link_pinned
  const controlRow = getRow(controls);

  return {
    initial: {
      ephemeral: true,
      embeds: [pinnedEmbed],
      components: [],
      files: [],
    },
    channel: {
      ephemeral: false,
      embeds: [embed],
      components: [controlRow],
      files: [],
    },
  };
};

const createCancelledMenu = (locale) => {
  const embed = cancelEmbed(locale);
  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [],
    },
  };
};

const createAwaitingActionMenu = (locale, name, pfp) => {
  const embed = awaitingActionEmbed(locale, name, pfp);
  const controls = [_LinkCancelButton(locale)];
  const controlRow = getRow(controls);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [controlRow],
      files: [],
    },
  };
};

const createLinkSuccessMenu = (locale, name) => {
  const embed = linkSuccessEmbed(locale, name);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [],
      files: [],
    },
  };
};

const createLinkExpiredMenu = (locale) => {
  const embed = linkTimeoutEmbed(locale);

  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [],
      files: [],
    },
  };
};

module.exports = {
  createAlreadyLinkedMenu,
  createLinkMenu,
  createLinkConfirmationMenu,
  createLinkModal,
  createPublicLinkMenu,
  createCancelledMenu,
  createAwaitingActionMenu,
  createLinkSuccessMenu,
  createLinkExpiredMenu,
};
