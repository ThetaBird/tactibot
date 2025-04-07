const { getSimpleEmbed } = require("./DeliveryUtil");

const { config } = require("dotenv");
config({ path: __dirname + "/.env" });

const axios = require("axios");
const { Axiom } = require("@axiomhq/js");

const IS_PROD = process.env.NODE_ENV === "production";
if (IS_PROD) console.log = () => {};

// Initialize the Axiom client
const axiomClient = IS_PROD
  ? new Axiom({
      token: process.env.AXIOMTOKEN,
      orgId: process.env.AXIOMORG,
    })
  : null;

const logInteraction = (client, logContent) => {
  const {
    type,
    identifier,
    options,
    action,
    values,
    decipheredFields,
    interaction,
  } = logContent;

  if (type == "AUTOCOMPLETE") return;

  const { user, channel, guild } = interaction;

  logAxiom({
    type,
    identifier,
    options,
    action,
    values,
    decipheredFields,
    user: {
      id: user?.id,
      name: user?.name,
    },
    channel: {
      id: channel?.id,
      name: channel?.name,
    },
    guild: {
      id: guild?.id,
      name: guild?.name,
    },
  })?.catch(() => {});

  const description =
    `\`${type}\`\n**${identifier}** | (${user.tag} | ${user.id}) | ` +
    (options?.length ? `${options.join(", ")} | ` : "") +
    (action ? `${action} | ` : "") +
    (values ? `${values} | ` : "") +
    (Object.keys(decipheredFields || {}).length
      ? `${JSON.stringify(decipheredFields)} | `
      : "") +
    `(${guild?.name} | ${guild?.id}) | (${channel?.name} | ${channel?.id})`;

  const embed = getSimpleEmbed({ description });
  client.logChannel.send({ embeds: [embed] }).catch(console.error);
};

const logGuildAction = (client, guild, action) => {
  const title = action == "join" ? "Joined Server" : "Left Server";
  const description =
    action == "join"
      ? "Bot has been added to a server."
      : "Bot has been removed from a server.";
  const color = action == "join" ? "#00FF00" : "#FF0000";
  const fields = [
    { name: "Server Name", value: `${guild.name}, ${guild.id}` },
    { name: "Member Count", value: `${guild.memberCount}` },
    { name: "Owner", value: `<@${guild.ownerId}>, ${guild.ownerId}` },
  ];

  const embed = getSimpleEmbed({ description, title, fields, color });
  client.guildLogChannel.send({ embeds: [embed] });
};

async function logAxiom(data) {
  if (!IS_PROD) return;

  try {
    // Convert to array if it's not already
    const events = Array.isArray(data) ? data : [data];

    // Ingest the events to the dataset
    axiomClient.ingest(process.env.AXIOMDATASET || "tacti_frontend", events);
    await axiomClient.flush();
  } catch (error) {
    // Silently fail in production, but still return the error
    return error;
  }
}

axios.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => {
    try {
      response.config.metadata.endTime = new Date();
      response.duration =
        response.config?.metadata.endTime - response.config?.metadata.startTime;
      return response;
    } catch (err) {
      console.error(err);
    }
  },
  (error) => {
    if (error.config) {
      error.config.metadata.endTime = new Date();
      error.duration =
        error.config?.metadata.endTime - error.config?.metadata.startTime;
    }
    return Promise.reject(error);
  }
);

module.exports = { logInteraction, logGuildAction, logAxiom, IS_PROD };
