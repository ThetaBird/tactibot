import { NicknameObject } from "../Interfaces";
import { MongoDBManager, MongoDBUser } from "./MongoDBManager";

export class RoleManager {
  constructor(
    public guilds: any,
    public memberIds: Array<string>,
    public mongoManager: MongoDBManager
  ) {}

  async processUsers() {
    return checkUser(this.guilds, this.memberIds, this.mongoManager);
  }
  //async checkNicknames(){return checkNicknames(this.guilds, this.memberIds, this.mongoManager)}
}

const getGuildUpdateIds = (guilds: any, _id: string) => {
  const keys = Object.keys(guilds);
  const toRet = [];
  for (const serverId of keys) {
    if (guilds[serverId].includes(_id)) toRet.push(serverId);
  }
  return toRet;
};

const checkUser = async (
  guilds: any,
  memberIds: Array<string>,
  mongoManager: MongoDBManager
) => {
  const linkedServers = mongoManager.linkedServers;

  mongoManager.linkedUsers.forEach((user) => {
    const foundClan = mongoManager.getClanFromUUID(user.cl_uuid);
    const updateGuilds = getGuildUpdateIds(guilds, user._id);

    const { tag } = foundClan || {};
    mongoManager.linkedActionManager.processNickname(
      { ...user, tag } as NicknameObject,
      updateGuilds
    );
    mongoManager.linkedActionManager.processAuthRole(
      user._id,
      updateGuilds,
      false
    );
  });

  // We want to remove the authenticated role from users who are not linked with Tacti.
  // This is a very network-heavy task if the bot caters to many servers (like Tacti does)
  // const unlinkedUsers = memberIds.filter(
  //   (m) => !mongoManager.linkedUsers.find((u) => u._id == m)
  // );
  // unlinkedUsers.forEach((discordUserId) => {
  //   const updateGuilds = getGuildUpdateIds(guilds, discordUserId);
  //   mongoManager.linkedActionManager.processAuthRole(
  //     discordUserId,
  //     updateGuilds,
  //     true
  //   );
  // });

  //const mongoUsers: Array<MongoDBUser> = memberIds.map(m => ({...mongoManager.findLinkedUserInCache(m)})).filter(m => Object.keys(m).length)
  const targetClans: Array<string> = [];

  linkedServers.forEach((server) => {
    const roles = server.linkedRoles;
    roles.forEach((role) => {
      targetClans.push(role.cl_id);
    });
  });

  const uniqTargetClans = [...new Set(targetClans)];

  const clanPlayers: any = {};

  uniqTargetClans.forEach((cl_uuid) => {
    clanPlayers[cl_uuid] = mongoManager.getUsersFromClanUUID(cl_uuid);

    clanPlayers[cl_uuid].forEach((linkedUser: MongoDBUser) => {
      const updateGuilds = getGuildUpdateIds(guilds, linkedUser._id);

      if (!updateGuilds.length) return;
      mongoManager.linkedActionManager.processUser(linkedUser, updateGuilds);
    });
  });
};
