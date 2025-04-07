const { Client, GatewayIntentBits } = require("discord.js");
const { config } = require("dotenv");
const { getSimpleEmbed } = require("./DeliveryUtil");
const { upsertEntitlement } = require("./TriggerRequests");
const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers];
const client = new Client({
  intents,
  allowedMentions: { parse: ["everyone", "users", "roles"], repliedUser: true },
});

config({ path: __dirname + "/.env" });

client.on("ready", async () => {
  console.log("Online");
});

const ROLE_DETAILS = {
  //people who bought premium through the bot only get the generic premium role
  "1128558695953989633": {
    //Tacti Plus • 1 Clan (server)
    purchasedClans: 1,
    provider: "server",
  },
  "1048378803916898438": {
    //Tacti Plus • 2 Clans (server)
    purchasedClans: 2,
    provider: "server",
  },
  "759182793660956694": {
    // 1 Clan (patreon)
    purchasedClans: 1,
    provider: "patreon",
  },
  "759183149804158976": {
    // 2 Clans (patreon)
    purchasedClans: 2,
    provider: "patreon",
  },
  "759183196679307286": {
    // 4 Clans (patreon)
    purchasedClans: 4,
    provider: "patreon",
  },
};

client.on("guildMemberUpdate", (oldMember, newMember) => {
  if (newMember.guild.id != "697219146169057301") {
    return;
  }

  const oldRoles = Array.from(oldMember.roles.cache.keys());
  const newRoles = Array.from(newMember.roles.cache.keys());

  const lostRoles = oldRoles.filter((role) => !newRoles.includes(role));
  const foundRoles = newRoles.filter((role) => !oldRoles.includes(role));

  if (!lostRoles.length && !foundRoles.length) return;

  foundRoles.forEach((role) => {
    const foundPremiumRole = ROLE_DETAILS[role];
    if (!foundPremiumRole) return;

    const { purchasedClans, provider } = foundPremiumRole;
    upsertEntitlement(newMember.user.id, purchasedClans, provider);
  });

  const fields = [];
  if (lostRoles.length)
    fields.push({
      name: "Removed Role",
      value: lostRoles.map((r) => `<@&${r}>`).join("\n"),
    });
  if (foundRoles.length)
    fields.push({
      name: "Added Role",
      value: foundRoles.map((r) => `<@&${r}>`).join("\n"),
    });
  const embed = getSimpleEmbed({
    title: "Role Change",
    fields,
    authorName: newMember.user.username,
    authorIconURL: newMember.user.avatarURL(),
    //authorURL: `https://discord.com/users/${newMember.user.id}`
  });

  client.channels.cache.get("782009688292065330").send({ embeds: [embed] });
});

client.login(process.env.SUBTOKEN);
