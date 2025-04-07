const {
  GatewayDispatchEvents,
  GatewayIntentBits,
  Client,
  ActivityType,
  PresenceUpdateStatus,
} = require("discord.js");
const { init } = require("./Command");

const { config } = require("dotenv");
const { io } = require("socket.io-client");

config({ path: __dirname + "/.env" });

const { logAxiom, logGuildAction, IS_PROD } = require("./Log");

console.warn(`Running in ${process.env.NODE_ENV ?? "unknown"} mode`);

// Disable logging in production
if (IS_PROD) console.log = () => {};

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const client = new Client({
  intents,
  allowedMentions: { parse: ["everyone", "users", "roles"], repliedUser: true },
});

const socket = io(`${process.env.WEBSOCKET_URL}/`, {});

const { Logic } = require("./Logic");
const { setTotalServers } = require("./DeliveryUtil");
const { upsertEntitlement } = require("./TriggerRequests");
const logic = new Logic(client);

/*[CATCH BOT ERRORS]*/
process.on("unhandledRejection", async (error) => {
  console.error("Unhandled promise rejection:", error);
  try {
    logAxiom({
      type: "REJECTION",
      message: error.message || error.name || error,
    })?.catch(console.error);
    client.errorChannel
      ?.send(error.toString().substring(0, 2000))
      .catch((e) => console.error(e));
  } catch (error) {
    console.error(error);
  }
});

process.on("uncaughtException", function (err) {
  console.error(err);
  try {
    logAxiom({
      type: "EXCEPTION",
      message: err.message || err.name || err,
    })?.catch(console.error);
    client.errorChannel
      ?.send(err.toString().substring(0, 2000))
      .catch((e) => console.error(e));
  } catch (error) {
    console.error(error);
  }
});
/*[END OF CATCH BOT ERRORS]*/

client.on("interactionCreate", async (interaction) => {
  await logic.processInteraction(interaction);
});

client.on("ready", async () => {
  await client.application?.fetch();
  await client.guilds.fetch();
  init(client);
  client.user.setActivity("An Update", ActivityType.Watching);
  client.user.setStatus(PresenceUpdateStatus.DoNotDisturb);

  setTimeout(function () {
    cycleStatus();
  }, 15000);

  client.logChannel = await client.channels.fetch("760045313389101066");
  client.guildLogChannel = await client.channels.fetch("732836100459987045");
  client.errorChannel = await client.channels.fetch("1197399223948300408");

  // For any command changes (adding/modifying/removing commands), call Command.process() on init
  // Command.process();
  console.log("Online");
});

client.on("guildCreate", async (guild) => {
  logGuildAction(client, guild, "join");
});

client.on("guildDelete", async (guild) => {
  logGuildAction(client, guild, "leave");
});

client.ws.on(GatewayDispatchEvents.EntitlementCreate, (data) => {
  const { user_id, subscription_id, guild_id } = data;
  upsertEntitlement(user_id, 2, "bot", guild_id, subscription_id);
});

client.ws.on(GatewayDispatchEvents.EntitlementUpdate, (data) => {
  const { user_id, subscription_id, guild_id } = data;
  upsertEntitlement(user_id, 2, "bot", guild_id, subscription_id);
});

socket.onAny((eventName, data) => {
  logic.processSocket(eventName, data);
});

function cycleStatus() {
  setInterval(function () {
    var cacheSize = client.guilds.cache.size;
    setTotalServers(cacheSize);
    client.user.setActivity(
      `/help || ${cacheSize} Servers`,
      ActivityType.Listening
    );
    client.user.setStatus(PresenceUpdateStatus.Online);
    //client.user.setActivity({activities:[{name: `/help || ${cacheSize} Servers`,type:"LISTENING"}], status:'online'});
  }, 10000);
}

client.login(IS_PROD ? process.env.TOKEN : process.env.BETATOKEN);

client.on("error", (error) => {
  logAxiom({ type: "ERROR", message: error.message || error.name })?.catch(
    console.error
  );
});

client.on("warn", (warning) => {
  logAxiom({ type: "WARN", message: warning || error.name })?.catch(
    console.error
  );
});

require("./subscription");
