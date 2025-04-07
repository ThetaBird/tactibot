const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  AttachmentBuilder,
  RoleSelectMenuBuilder,
} = require("discord.js");
const encdec = (a) => a;
const botAvatar =
  "https://cdn.discordapp.com/avatars/848481460297662485/5271f921ac93b205828df71f0673645d.webp";
const botInvite =
  "https://discord.com/api/oauth2/authorize?client_id=695821440167182386&permissions=8&scope=bot%20applications.commands";
let totalServers = 0;

const Emoji = {
  loading: "1063239860229517404",
  link: "1006401679534600224",
  newMissions: "1041859424005918790",
  dashboard: "1004581176608047114",
  backButton: "932481956183150663",
  cancelButton: "932478534268649502",
  forwardButton: "1002761429067255838",
  confirmButton: "932490473011019796",
  editButton: "1060464840096895026",
  pinButton: "1145870762834657400",
  placements: "1004581180278050856",
  settings: "1004581181980950598",
  metrics: "1004581177795031050",
  newMissions: "1041859424005918790",
  dashboard: "1004581176608047114",
  whitelist: "1054929094200008764",
  format: "1054929092471951370",
  clan: "1054929090651631666",
  preferences: "1054929095839973417",
};

const defaultButtonObj = {
  customId: "undefined_custom_id_button",
  label: "\u200B",
  emoji: null,
  style: "Secondary", // Primary, Success, Danger
  url: null,
  disabled: false,
};
const getButton = (buttonObj) => {
  mergeDefault(defaultButtonObj, buttonObj);
  const { customId, label, emoji, style, url, disabled } = buttonObj;
  const enc = encdec(customId);

  const button = new ButtonBuilder()
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);
  if (url) button.setURL(url);
  else button.setCustomId(enc);

  if (emoji) button.setEmoji(emoji);

  return button;
};

const defaultSelectObj = {
  customId: "undefined_custom_id_select",
  placeholder: "undefined placeholder",
  options: [{ label: "undefined option", value: "null" }],
  disabled: false,
  min: 1,
  max: 1,
  defaultRoles: [],
};
const getSelect = (selectObj) => {
  mergeDefault(defaultSelectObj, selectObj);
  const { customId, placeholder, options, disabled, min, max } = selectObj;
  const enc = encdec(customId);
  for (const o of options) o.value = encdec(o.value);

  const select = new StringSelectMenuBuilder()
    .setCustomId(enc)
    .setPlaceholder(placeholder)
    .addOptions(options)
    .setDisabled(disabled)
    .setMinValues(min)
    .setMaxValues(max);

  return select;
};

const getUserSelect = (selectObj) => {
  mergeDefault(defaultSelectObj, selectObj);
  const { customId, placeholder, disabled, min, max, defaultUsers } = selectObj;
  const enc = encdec(customId);

  const select = new UserSelectMenuBuilder()
    .setCustomId(enc)
    .setPlaceholder(placeholder)
    .setDisabled(disabled)
    .setMinValues(min)
    .setMaxValues(max)
    .setDefaultUsers(
      Array.isArray(defaultUsers) ? defaultUsers : [defaultUsers]
    );

  return select;
};

const getRoleSelect = (selectObj) => {
  mergeDefault(defaultSelectObj, selectObj);
  const { customId, placeholder, disabled, min, max, defaultRoles } = selectObj;
  const enc = encdec(customId);

  const select = new RoleSelectMenuBuilder()
    .setCustomId(enc)
    .setPlaceholder(placeholder)
    .setDisabled(disabled)
    .setMinValues(min)
    .setMaxValues(max)
    .setDefaultRoles(
      Array.isArray(defaultRoles) ? defaultRoles : [defaultRoles]
    );

  return select;
};

const defaultEmbedObj = {
  authorName: "Tacti",
  authorIconURL: botAvatar,
  authorURL: botInvite,
  color: "#1c1c1c",
  title: null,
  titleURL: null,
  description: null,
  thumbnail: botAvatar,
  fields: null,
  footer: null,
};
const getEmbed = (embedObj) => {
  mergeDefault(defaultEmbedObj, embedObj);
  const {
    authorName,
    authorIconURL,
    authorURL,
    color,
    title,
    titleURL,
    description,
    thumbnail,
    fields,
    footer,
  } = embedObj;

  const embed = new EmbedBuilder()
    .setAuthor({ name: authorName, iconURL: authorIconURL, url: authorURL })
    .setColor(color)
    .setTitle(title)
    .setURL(titleURL)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setFooter(footer);
  if (fields) embed.setFields(fields);

  return embed;
};

const defaultSimpleEmbedObj = {
  authorName: null,
  authorIconURL: null,
  authorURL: null,
  color: "#1c1c1c",
  title: null,
  titleURL: null,
  description: null,
  thumbnail: null,
  fields: null,
  footer: null,
};
const getSimpleEmbed = (embedObj) => {
  mergeDefault(defaultSimpleEmbedObj, embedObj);
  const {
    authorName,
    authorIconURL,
    authorURL,
    color,
    title,
    titleURL,
    description,
    thumbnail,
    fields,
    footer,
  } = embedObj;

  const embed = new EmbedBuilder()
    .setAuthor({ name: authorName, iconURL: authorIconURL, url: authorURL })
    .setColor(color)
    .setTitle(title)
    .setURL(titleURL)
    .setDescription(description)
    .setThumbnail(thumbnail)
    .setFooter(footer);
  if (fields) embed.setFields(fields);

  return embed;
};

const defaultTextInputObj = {
  customId: "undefined_textinput_customid",
  label: "textinput label",
  max: 100,
  min: 1,
  required: true,
  placeholder: "TextInput Placeholder",
  value: undefined,
};
const getShortTextInput = (textInputObj) => {
  mergeDefault(defaultTextInputObj, textInputObj);
  const style = TextInputStyle.Short;
  const { customId, label, max, min, required, placeholder, value } =
    textInputObj;
  const enc = encdec(customId);

  const textInput = new TextInputBuilder()
    .setCustomId(enc)
    .setLabel(label)
    .setMaxLength(max)
    .setMinLength(min)
    .setRequired(required)
    .setStyle(style)
    .setPlaceholder(placeholder);

  if (typeof value != "undefined") textInput.setValue(value);

  return textInput;
};
const getLongTextInput = (textInputObj) => {
  const textInput = getShortTextInput(textInputObj);
  textInput.setStyle(TextInputStyle.Paragraph);
  return textInput;
};

const getModal = (modalObj) => {
  const { customId, title, components } = modalObj;
  const enc = encdec(customId);

  const modal = new ModalBuilder()
    .setCustomId(enc)
    .setTitle(title)
    .addComponents(components);
  return modal;
};

const getRow = (components) => {
  const toAdd = Array.isArray(components) ? components : [components];
  return new ActionRowBuilder().addComponents(...toAdd);
};

const getAttachment = (buffer, name) => {
  return new AttachmentBuilder(buffer, { name });
};

const getDescriptionFromFields = (fields) => {
  return fields
    .map(({ name, value }) => {
      return `${name}\n${value}`;
    })
    .join("\n");
};

const getErrorEmbed = (message) => {
  const description =
    message || `**Whoops!**\n Something went wrong. Please try again later.`;
  const embed = getSimpleEmbed({ description });
  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [],
    },
  };
};

const getTotalServers = () => totalServers;
const setTotalServers = (num) => (totalServers = num);

const supportContactFull = "the developer"; //Replace with proper link. Example: "[@Tacti](https://discord.com/users/695821440167182386)"
const supportContactShort = "the developer"; //Replace with proper username. Example: "@Tacti"

module.exports = {
  getButton,
  getSelect,
  getUserSelect,
  getRoleSelect,
  getEmbed,
  getSimpleEmbed,
  getShortTextInput,
  getLongTextInput,
  getModal,
  getRow,
  getAttachment,
  getDescriptionFromFields,
  getTotalServers,
  setTotalServers,
  getErrorEmbed,
  Emoji,
  botAvatar,
  supportContactFull,
  supportContactShort,
};

const mergeDefault = (defaultObj, passedObj) => {
  const keys = Object.keys(defaultObj);
  for (const key of keys) {
    passedObj[key] =
      typeof passedObj[key] == "undefined" ? defaultObj[key] : passedObj[key];
  }
};
