import { SocketManager } from "../Managers/SocketManager";
import { MongoDBServer, MongoDBUser, NicknameObject } from "../Interfaces";

export class LinkedActionProcessor {
  constructor(
    private linkedServers: Array<MongoDBServer>,
    private socketManager: SocketManager
  ) {}

  processAuthRole(
    discordUserId: string,
    forceGuilds: Array<string>,
    notLinked: boolean = false
  ) {
    const updateServers = forceGuilds.length
      ? this.linkedServers.filter((s) => forceGuilds.includes(s._id))
      : this.linkedServers;

    const _id = discordUserId;
    const data: any = {
      _id,
      servers: [],
    };
    for (const server of updateServers) {
      const authRoles = server.authRoles || [];
      if (!authRoles.length) continue;

      const s = {
        _id: server._id,
        add: !notLinked ? [...new Set(authRoles)] : [],
        remove: notLinked ? [...new Set(authRoles)] : [],
      };
      data.servers.push(s);
    }
    if (!data.servers.length) return;

    this.socketManager.emit("role_update", data);
  }

  processUser(
    mongoUser: MongoDBUser,
    forceGuilds: Array<string>,
    options: any = {}
  ) {
    const { _id, cl_uuid } = mongoUser;
    const data: any = {
      _id,
      servers: [],
      priority: Boolean(options.priority),
    };

    const updateServers = forceGuilds.length
      ? this.linkedServers.filter((s) => forceGuilds.includes(s._id))
      : this.linkedServers;

    for (const server of updateServers) {
      const authRoles = server.authRoles || [];
      const addRoles = server.linkedRoles.filter((r) => r.cl_id == cl_uuid);
      const removeRoles = server.linkedRoles.filter((r) => r.cl_id != cl_uuid);

      const remove = removeRoles.flatMap((r) => {
        const rolesToRemove = [...r.r_id];
        //if(r.online_r_id) rolesToRemove.push(r.online_r_id)
        //if(r.zero_points_r_id) rolesToRemove.push(r.zero_points_r_id)
        return rolesToRemove;
      });

      const add = addRoles.flatMap((r) => {
        const rolesToAdd = [...r.r_id];
        //if(r.online_r_id && options.online !== undefined) options.online ? rolesToAdd.push(r.online_r_id) : remove.push(r.online_r_id)
        //if(r.zero_points_r_id && options.zeroPoints !== undefined) options.zeroPoints ? rolesToAdd.push(r.zero_points_r_id) : remove.push(r.zero_points_r_id)
        return rolesToAdd;
      });

      const s = {
        _id: server._id,
        add: [...new Set([...add, ...authRoles])],
        remove: [...new Set(remove.filter((r_id) => !add.includes(r_id)))],
      };

      data.servers.push(s);
    }

    this.socketManager.emit("role_update", data);
  }

  processNickname(
    user: NicknameObject,
    forceGuilds: Array<string>,
    options: any = {}
  ) {
    const { _id, cl_uuid, name, tag, ignoreNicknames, level, rating, pu_id } =
      user;
    const data: any = {
      _id,
      servers: [],
      priority: Boolean(options.priority),
    };
    const updateServers = forceGuilds.length
      ? this.linkedServers.filter((s) => forceGuilds.includes(s._id))
      : this.linkedServers;

    for (const server of updateServers) {
      const { linkedNicknames, linkedRoles } = server;
      const foundLinkedRole = linkedRoles.find((role) => role.cl_id == cl_uuid);

      const nicknameFormat = foundLinkedRole?.nickname || linkedNicknames;
      if (
        !nicknameFormat?.length ||
        (!foundLinkedRole && ignoreNicknames?.includes(server._id))
      ) {
        continue;
      }

      const nickname = name
        ? nicknameFormat
            .replace("$1", tag || "")
            .replace("$2", name || "")
            .replace("$3", `${level}` || "")
            .replace("$4", `${rating}` || "")
            .replace("$5", `${pu_id}` || "")
        : null;
      const s = {
        _id: server._id,
        nickname,
      };

      data.servers.push(s);
    }

    this.socketManager.emit("nickname_update", data);
  }
}
