const {
  getEmbed,
  getSimpleEmbed,
  getTotalServers,
  botAvatar,
} = require("../../DeliveryUtil");
const mainColor = "#fcf4ec";
const linkAvatarChoices = [
  { id: 2, name: "Ava_Biohazard", emoji: "<:2_:1006046425022476328>" },
  { id: 4, name: "Ava_Bullet", emoji: "<:4_:1006046423898411108>" },
  { id: 5, name: "Ava_Skull", emoji: "<:5_:1006046423072112712>" },
  { id: 6, name: "Ava_Eye", emoji: "<:6_:1006046421411188786>" },
  { id: 8, name: "Ava_Grenade", emoji: "<:8_:1006046426121379920>" },
];

const linkEmbed = (locale) => {
  const linkEmbedObj = {
    color: mainColor,
    title: "Link Tacticool Account",
    description: "Press **`Begin Link`** to get started.", //"Linking instructions: (+ video)",
    //thumbnail: botAvatar
  };
  return getEmbed(linkEmbedObj);
};

const cancelEmbed = (locale) => {
  const cancelEmbedObj = {
    description: "**Cancelled.**",
  };
  return getSimpleEmbed(cancelEmbedObj);
};

const pinEmbed = (locale) => {
  const cancelEmbedObj = {
    description: "Pinned.",
  };
  return getSimpleEmbed(cancelEmbedObj);
};

const publicLinkEmbed = (locale) => {
  const linkEmbedObj = {
    color: "#fcf4ec",
    title: "Tacti Link",
    description: `Connect your Public ID to your Discord account across over ${getTotalServers()} Tacti servers.`, //"Linking instructions: (+ video)",
    //thumbnail: botAvatar,
    authorName: null,
    authorIconURL: null,
    authorURL: null,
    footer: { text: "Tacti", iconURL: botAvatar },
  };
  return getEmbed(linkEmbedObj);
};

const alreadyLinkedEmbed = (locale, publicId, pinButton = true) => {
  const alreadyLinkedEmbedObj = {
    title: "Link Tacticool Account",
    description: `You have already linked a Tacticool account with Public ID **${publicId}**.`,
    //thumbnail: botAvatar,
  };
  if (pinButton)
    alreadyLinkedEmbedObj.footer = {
      text: "(You can use PIN to make it easier for others to link their accounts.)",
    };
  return getEmbed(alreadyLinkedEmbedObj);
};

const awaitingActionEmbed = (locale, name, pfp) => {
  const pfpChoice = linkAvatarChoices.find((choice) => choice.id == pfp);
  if (!pfpChoice) throw { name: "Invalid pfp" };
  const descString = `**Hey ${name}!**\n\nTo verify your account, please change your Tacticool Avatar to the one shown. ${
    pfpChoice.emoji
  } \n(You can change it back once the process is complete.)\n\n**Expires <t:${
    Math.floor(Date.now() / 1000) + 180
  }:R>**`;
  const awaitingActionEmbedObj = {
    color: mainColor,
    titie: "Link Tacticool Account",
    description: descString,
    thumbnail: `https://club.tacticool.game/assets/avatars/${pfpChoice.id}.png`,
  };
  return getSimpleEmbed(awaitingActionEmbedObj);
};

const linkTimeoutEmbed = (locale) => {
  const linkTimeoutEmbedObj = {
    title: "Link Tacticool Account",
    description: "Verification Expired. Please try again.",
  };
  return getEmbed(linkTimeoutEmbedObj);
};

const linkPinConfirmationEmbed = (locale) => {
  const linkPinConfirmation = {
    description: "Pinned.",
  };
  return getSimpleEmbed(linkPinConfirmation);
};

const linkSuccessEmbed = (locale, name) => {
  const descString = `**You're all set, ${name}!**\n\nYou can view performance metrics by using the **/view** command.\nFeel free to change your avatar back to what it was previously.`;
  const linkSuccessEmbed = {
    color: mainColor,
    description: descString,
  };
  return getEmbed(linkSuccessEmbed);
};

module.exports = {
  linkEmbed,
  publicLinkEmbed,
  alreadyLinkedEmbed,
  linkTimeoutEmbed,
  awaitingActionEmbed,
  linkPinConfirmationEmbed,
  linkSuccessEmbed,
  cancelEmbed,
  pinEmbed,
};
