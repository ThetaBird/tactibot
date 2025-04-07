const {
  getSimpleEmbed,
  getAttachment,
  getButton,
  getRow,
  Emoji,
} = require("../../DeliveryUtil");
const { createFromUserIdImage } = require("../../Canvas/FromUserId");
const {
  _ViewMainButton,
  _ViewPresetsButton,
} = require("./Components/_ViewComponentDetails");

const linkButton = (linkText, id) => {
  return getButton({
    customId: id,
    label: linkText,
    style: "Success",
    emoji: Emoji.link,
  });
};

const createFromUserId = async (data, p, locale) => {
  const { userId, player, clan, presets } = data;

  if (!player) {
    const failText = `**<@${userId}> is not linked to any Tacticool account.**\nThey can do so with the </link:1200151409342038088> command.`;
    const failEmbedObj = {
      description: failText,
    };
    const failEmbed = getSimpleEmbed(failEmbedObj);
    const [linkText] = ["Link"];
    const controls = [linkButton(linkText, "link_fromview")];
    const controlRow = getRow(controls);

    return {
      initial: {
        ephemeral: false,
        embeds: [failEmbed],
        components: [controlRow],
        files: [],
      },
    };
  }

  const fileName = `metrics_${userId}.png`;

  const buffer = await createFromUserIdImage(player, clan, p ? presets : null);
  const attachment = getAttachment(buffer, fileName);
  const button = p
    ? _ViewMainButton(locale, userId)
    : _ViewPresetsButton(locale, userId);

  //embed.setImage(`attachment://${fileName}`)

  return {
    initial: {
      content: `Viewing <@${userId}>`,
      allowedMentions: { parse: [] },
      ephemeral: false,
      embeds: [],
      files: [attachment],
      components: [getRow(button)],
    },
  };
};

const waitingMenu = (locale) => {
  const waitingText = `<a:loading:${Emoji.loading}> Loading...`;

  const waitingEmbedObj = {
    color: "#1c1c1c",
    description: waitingText,
  };

  return {
    embeds: [getSimpleEmbed(waitingEmbedObj)],
    files: [],
    components: [],
  };
};

module.exports = { createFromUserId, waitingMenu };
