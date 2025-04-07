const axios = require("axios");
const { getErrorEmbed } = require("../../DeliveryUtil");
const { Client, ChatInputCommandInteraction } = require("discord.js");
const { PlacementsManager } = require("../../Placements/PlacementsManager");
const {
  PlacementsDeliveryManager,
} = require("../../Placements/PlacementsDeliveryManager");
const {
  processOutputLanguages,
  processMissions,
  getDisplayTextInLanguage,
  getAfterTextInLanguages,
  processPlacementsInLanguages,
} = require("./GenProcessor_Util");

const GenCommand_Details = {
  name: "generate",
  description: "Generate mission instructions for Tacticool",
  type: 1,
  name_localizations: {
    "zh-CN": "生日",
    el: "γενέθλια",
  },
  options: [
    {
      name: "input_lang",
      description: "input lang",
      type: 3,
      required: true,
      choices: [
        { name: "English", value: "en" },
        { name: "Russian", value: "ru" },
        { name: "Portuguese (Brazil)", value: "ptb" },
        { name: "Portuguese (Portugal)", value: "ptp" },
        { name: "Italian", value: "it" },
        { name: "Polish", value: "pl" },
        { name: "French", value: "fr" },
        { name: "German", value: "deu" },
        { name: "Japanese", value: "ja" },
        { name: "Spanish", value: "es" },
        { name: "Turkish", value: "tr" },
        { name: "Indonesian", value: "id" },
      ],
    },
    {
      name: "m1",
      description: "Mission 1",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m2",
      description: "Mission 2",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m3",
      description: "Mission 3",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m4",
      description: "Mission 4",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m5",
      description: "Mission 5",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m6",
      description: "Mission 6",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m7",
      description: "Mission 7",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "m8",
      description: "Mission 8",
      type: 3,
      required: false,
      autocomplete: true,
    },

    {
      name: "lang",
      description: "output lang",
      type: 3,
      required: false,
      autocomplete: true,
    },
    {
      name: "format",
      description: "format",
      type: 3,
      required: false,
      choices: [
        { name: "Image (Default)", value: "image" },
        { name: "Embed", value: "text" },
        { name: "Split text", value: "sText" },
        { name: "Raw text", value: "rText" },
      ],
    },
  ],
};

//build(null,GenCommand_Details);

class GenCommand {
  /**
   * Creates an instance of GenCommand.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.defer = this.interaction.deferReply();
    this.interaction.reply = async (...a) =>
      await this.defer.then(async () => await this.interaction.editReply(...a));
  }

  process = async () => {
    console.log("processing");
    this.parse();
    const response = await this.getClan();
    console.log(response);
    if (!response) return;

    const { data } = response?.data;
    const tactiClan = data;

    const placementsManager = new PlacementsManager(tactiClan);
    const deliveryManager = new PlacementsDeliveryManager(tactiClan);

    try {
      const {
        locale,
        userId,
        mainLang,
        missions,
        responseFormat,
        responseLangs,
        callName,
      } = this;
      const delivery = processGenerate(placementsManager, deliveryManager, {
        locale,
        userId,
        mainLang,
        missions,
        responseFormat,
        responseLangs,
        callName,
        tactiClan,
      });
      console.log(delivery);
      await this.interaction.reply(delivery.initial);
      for (const followUp of delivery.followUp || []) {
        await this.interaction.channel.send(followUp);
      }
    } catch (error) {
      console.error(error);
      const delivery = getErrorEmbed(error?.message);
      await this.interaction.reply(delivery.initial);
    }
  };

  parse = () => {
    const { options, locale, user } = this.interaction;
    this.locale = locale;
    this.userId = user.id;

    this.mainLang = options.getString("input_lang") || "en";
    this.missions = [
      options.getString("m1"),
      options.getString("m2"),
      options.getString("m3"),
      options.getString("m4"),
      options.getString("m5"),
      options.getString("m6"),
      options.getString("m7"),
      options.getString("m8"),
    ];
    this.responseFormat = options.getString("format") || "image";
    this.responseLangs = options.getString("lang") || this.mainLang;
    this.callName = "generate";
  };

  getClan = async () => {
    try {
      return await axios({
        method: "get",
        url: `${process.env.BACKEND_URL}/getClan?callName=${this.callName}`,
        timeout: 10000,
      });
    } catch (error) {
      console.error(error);
      const delivery = getErrorEmbed();
      await this.interaction.reply(delivery.initial);
      return null;
    }
  };
}

/**
 * Process a generate request
 * @date 1/3/2024 - 11:55:00 PM
 *
 * @param {PlacementsManager} placementsManager
 * @param {PlacementsDeliveryManager} deliveryManager
 * */
const processGenerate = (placementsManager, deliveryManager, parsedOptions) => {
  const processedOutputLanguages = processOutputLanguages(
    parsedOptions.responseLangs
  );
  if (processedOutputLanguages.invalid)
    throw { name: "102", message: processedOutputLanguages.invalid.join(", ") };

  const processedMissions = processMissions(parsedOptions.missions);
  if (processedMissions.invalid)
    throw { name: "103", message: processedMissions.invalid.join(", ") };

  parsedOptions.responseLangs = processedOutputLanguages.valid;
  parsedOptions.missions = processedMissions.valid;
  parsedOptions.mainLang =
    parsedOptions.responseLangs[0] || parsedOptions.mainLang;
  parsedOptions.displayText = getDisplayTextInLanguage(parsedOptions.mainLang);
  parsedOptions.afterText = getAfterTextInLanguages(
    parsedOptions.responseLangs
  );
  parsedOptions.tactiClan = parsedOptions.tactiClan; //This line is unnecessary and is only here to verify the structure of parsedOptions.
  parsedOptions.completed = parsedOptions.completed; //This line is unnecessary and is only here to verify the structure of parsedOptions.

  const { missions, completed } = parsedOptions;
  const { formattedPlacements, specificMovements } =
    placementsManager.createPlacements(missions, completed);
  processPlacementsInLanguages(
    formattedPlacements,
    parsedOptions.responseLangs
  );

  const delivery = deliveryManager.manage(
    formattedPlacements,
    parsedOptions,
    specificMovements
  );
  return delivery;
};

module.exports = { GenCommand, GenCommand_Details, processGenerate };
