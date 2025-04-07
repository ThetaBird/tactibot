const getGuildMemberIdList = async (client, guildId) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    const members = [];
    guild.members.cache.each((member) => {
      const { nickname, user } = member;
      const { id, username } = user;
      members.push({ nickname: nickname || username, id });
    });

    return members;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const createMissionPointContent = (data, guildMembers) => {
  const { players } = data;
  return (
    "**" +
    players
      .map((player, index) => {
        const { name, pl_id, _id, mPoints } = player;
        //return `${getDisplayName(guildMembers, name, _id)} • \`${mPoints}\``
        return `${
          _id ? `<@${_id}>` : "" + name.replaceAll(/([|`*_])/g, "\\$1")
        } • ${mPoints}`;
      })
      .join("\n") +
    "**"
  );
};
/*
const createTopTenCurrentMissionPointContent = (data) => {
    const {players} = data;
    return players.slice(0,5).map((player, index) => {
        const {name, pl_id, _id, mPoints} = player
        return `> ### ${_id ? `<@${_id}>` : name} • \`${mPoints}\``
    }).join("\n")
}

const createBottomTenCurrentMissionPointContent = (data) => {
    const {players} = data;
    return players.slice(-5).map((player, index) => {
        const {name, pl_id, _id, mPoints} = player
        return `> ### ${_id ? `<@${_id}>` : name} • \`${mPoints}\``
    }).join("\n")
}
*/
const createOnlinePlayerContent = (data, guildMembers) => {
  const { players } = data;

  if (!players?.length) return { textContent: "———" };
  const textContent =
    `\nUpdated <t:${Math.floor(Date.now() / 1000)}:R>\n` +
    "**" +
    players
      .map((player, index) => {
        const { name, pl_id, _id } = player;
        return getDisplayName(guildMembers, name, _id);
      })
      .join("\n") +
    "**";

  const headerContent = `(${players.length})`;

  return { textContent, headerContent };
};

const getDisplayName = (guildMembers, name, _id) => {
  const guildMember = guildMembers.find((member) => member.id == _id);
  const displayName = name.replaceAll(/([|`*_])/g, "\\$1");
  return `${
    _id
      ? guildMember
        ? `[@${guildMember.nickname}](https://discord.com/users/${_id})`
        : `[${displayName}](https://discord.com/users/${_id})`
      : "> " + displayName
  }`;
};

module.exports = {
  createMissionPointContent,
  createOnlinePlayerContent,
  getGuildMemberIdList,
};
