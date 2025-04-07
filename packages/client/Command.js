const { Client } = require("discord.js");

module.exports = {
  init,
  build,
  remove,
  clearIrrelevantCommands,
};

/**
 * @type {Client}
 */
let CLIENT;

async function getApp(guildId) {
  let app = CLIENT.application.commands;
  if (guildId) {
    app = CLIENT.guilds.cache.get(guildId)?.commands;
  }
  await app.fetch();
  return app;
}

async function clearIrrelevantCommands() {
  /*
  Array.from(CLIENT.guilds.cache.keys()).forEach(async (guildId) => {
    const app = await getApp(guildId)
    const commands = Array.from(app.cache.values())

    commands.forEach(c => {
      console.log(c.name)
      if(["tango","zulu","reign","bisha","jedi","jedi2","wshop","hk"].includes(c.name)) return
      c.delete()
    })
  })*/

  const globalApp = await getApp(null);
  Array.from(globalApp.cache.values()).forEach((c) => {
    console.log(c.name);
    if (["toggle", "manage"].includes(c.name)) c.delete();
  });
}

async function init(client) {
  CLIENT = client;
  //clearIrrelevantCommands()
  //build("<CUSTOM_GUILD_ID>",{name:"premium",description: `Premium Tacti Command for [Tacti] Tacti Bot`})
  //clear();
  //build(null,premiumBuild());
  //build("<CUSTOM_GUILD_ID>",buildViewSlash());
  //remove(null, "<GLOBAL_SLASH_COMMAND_ID>")
  //build(null, buildViewSlash());
  //build("<CUSTOM_GUILD_ID>",testBuild());
  //clear("<CUSTOM_GUILD_ID>")
  //build("<CUSTOM_GUILD_ID>", buildAdminSlash());
  //remove("<CUSTOM_GUILD_ID>","<GUILD_SPECIFIC_CUSTOM_COMMAND_ID>")
}

async function build(guildId, command) {
  setTimeout(async () => {
    console.log(command);
    let app = await getApp(guildId);
    app.create(command).catch(console.error);
  }, 10000);
}
async function remove(guildId, commandId) {
  let app = await getApp(guildId);
  app.delete(commandId);
}
async function clear(guildId) {
  let guild = await getApp(guildId);
  guild.set([]);
}

function buildAdminSlash() {
  return {
    name: "admin",
    description: "Admin Controls for Tacti.",
    options: [
      {
        name: "create",
        description: "Create TactiClan",
        type: 1,
        options: [
          {
            name: "callname",
            description: "Call Name for clan",
            type: 3,
            required: true,
          },
          {
            name: "clanid",
            description: "Clan ID",
            type: 3,
            required: true,
          },
          {
            name: "adminid",
            description: "Admin ID",
            type: 3,
            required: true,
          },
        ],
      },
      {
        name: "link",
        description: "Create TactiClan",
        type: 1,
        options: [
          {
            name: "_id",
            description: "Discord User ID",
            type: 3,
            required: true,
          },
          {
            name: "pl_id",
            description: "Tacticool Player ID",
            type: 3,
            required: true,
          },
          {
            name: "pu_id",
            description: "Tacticool Public ID",
            type: 3,
            required: true,
          },
        ],
      },
    ],
  };
}
