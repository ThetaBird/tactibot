const throttledQueue = require("throttled-queue");
const requestThrottle = throttledQueue(20, 1000, true);
const axios = require("axios");
const { Client } = require("discord.js");
const {
  createPremiumMetricsUpdate,
} = require("../Commands/Premium/PremiumDelivery");
const { logAxiom } = require("../Log");
const queue = {
  count: 0,
  limited: false,
};
const badNicknameConverter = {};
let badNicknameConverterSize = {
  old: 0,
  new: 0,
};

const QUEUE_LIMIT_TRIGGER = 200;
const QUEUE_LIMIT_RECOVERY = 20;
const QUEUE_AXIOM_LOG_INTERVAL = 20000;

setInterval(() => {
  logAxiom({ type: "UPDATE_BACKLOG", count: queue.count })?.catch(
    console.error
  );
  if (badNicknameConverterSize.new)
    logAxiom({
      type: "BAD_NICKNAME_CONVERTER_SIZE",
      size: badNicknameConverterSize.new,
    })?.catch(console.error);
  if (badNicknameConverterSize.old !== badNicknameConverterSize.new) {
    console.info(badNicknameConverter);
    badNicknameConverterSize.old = badNicknameConverterSize.new;
  }
}, QUEUE_AXIOM_LOG_INTERVAL);

class SocketActionManager {
  static role_update = (client, args) => {
    return throttledRoleUpdateAction(client, args);
  };
  static nickname_update = (client, args) => {
    return throttledNicknameUpdateAction(client, args);
  };
  static linked_server_members = (client, args) => {
    return getServerMembers(client, args);
  };
  static metrics_update = (client, args) => {
    return updateMetrics(client, args);
  };
}

module.exports = { SocketActionManager };

const terminateCall = () => {
  if (queue.count > QUEUE_LIMIT_TRIGGER) {
    queue.limited = true;
    return true;
  }
  if (queue.count < QUEUE_LIMIT_RECOVERY) {
    queue.limited = false;
    return false;
  }
  return queue.limited;
};
/**
 *
 * @param {Client} client
 * @param {*} args
 * @returns
 */
const updateMetrics = async (client, args) => {
  const { guildId, channelId, messageId, identifier, data } = args;
  const g = client.guilds.cache.get(guildId);
  if (!g) return;

  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return;

    const channel = await guild.channels.fetch(channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(messageId);
    if (!message) return;

    //Doing a little reformatting for compatability with createPremiumMetricsUpdate

    const { metricType } = data.metrics;
    data.metricType = metricType;

    const delivery = await createPremiumMetricsUpdate("en", data, client);
    message.edit(delivery);
  } catch (error) {
    console.error(error);
  }
};

/**
 *
 * @param {Client} client
 * @param {*} args
 */
const throttledRoleUpdateAction = (client, args) => {
  const { servers, priority } = args;

  if (terminateCall() && !priority) return;
  const userId = args._id;

  servers.forEach((server) => {
    const { _id, add, remove } = server;
    const guild = client.guilds.cache.get(_id);
    if (!guild) return;

    try {
      var member = guild.members.cache.get(userId);
    } catch {
      return;
    }
    if (!member) return;

    const roles = [...member.roles.cache.keys()];
    const { newRoles, update } = _roleHelper(roles, add, remove);

    if (!update) return;

    const updateRoles = () => {
      queue.count++;
      member.roles
        .set(newRoles)
        .catch(() => {})
        .finally(() => {
          queue.count--;
        });
    };
    priority ? updateRoles() : requestThrottle(updateRoles);
  });
};

const getServerMembers = async (client, args) => {
  const toRet = [];
  const guilds = {};
  for (const id of args.serverIds) {
    try {
      const g = client.guilds.cache.get(id);
      if (!g) continue;
      var guild = await client.guilds.fetch(id);
    } catch (error) {
      console.error(error);
      continue;
    }
    if (!guild) continue;

    try {
      const members = await guild.members.fetch();
      if (!members) continue;

      guilds[id] = members.map((m) => m.id);
      toRet.push(...guilds[id]);
    } catch (error) {
      console.error(error);
      continue;
    }
  }
  const uniq = [...new Set(toRet)];

  return axios({
    method: "post",
    url: `${process.env.BACKEND_URL}/linked_server_members`,
    data: { uniq, guilds },
    timeout: 3000,
  }).catch((e) => {
    console.error(e);
    return null;
  });
};

const _roleHelper = (roles, add, remove) => {
  let update = false;
  const newRoles = [
    ...new Set(
      [...roles, ...add].filter((role) => {
        const includes = remove.includes(role);
        if (includes) update = true;
        return !includes;
      })
    ),
  ];

  if (newRoles.length != roles.length) update = true;
  return { newRoles, update };
};

/**
 *
 * @param {Client} client
 * @param {*} args
 */
const throttledNicknameUpdateAction = (client, args) => {
  const { servers, priority } = args;
  if (terminateCall() && !priority) return;

  const userId = args._id;
  servers.forEach((server) => {
    const { _id, nickname } = server;

    const guild = client.guilds.cache.get(_id);
    if (!guild) return;

    try {
      var member = guild.members.cache.get(userId);
    } catch (error) {
      console.error(error);
      return;
    }
    if (!member) return;
    if (!member.manageable) return;

    const newNick = badNicknameConverter[nickname] || nickname;
    const update = member.nickname != newNick;

    if (!update) return;

    const updateNicknames = () => {
      queue.count++;
      member
        .setNickname(nickname)
        .then((updatedMember) => {
          if (updatedMember.nickname && updatedMember.nickname != newNick) {
            badNicknameConverter[newNick] = updatedMember.nickname;
            badNicknameConverterSize.new++;
          }
        })
        .catch(() => {})
        .finally(() => {
          queue.count--;
        });
    };
    priority ? updateNicknames() : requestThrottle(updateNicknames);
  });
};
