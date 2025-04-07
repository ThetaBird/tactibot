import * as mongoDB from "mongodb";

import {
  LinkedRole,
  Entitlement,
  MongoDBClan,
  WhitelistUser,
  MongoDBClanID,
  NicknameObject,
} from "../Interfaces";
import { LinkedActionProcessor } from "../Processors/LinkedActionProcessor";
import { RequestManager } from "./RequestManager";
import { SocketManager } from "./SocketManager";
import { v4 as uuidv4 } from "uuid";

/**
 * @deprecated
 * TactiStats is discontinued. Any function paths that use it are deprecated too.
 */
const statsAPIManager = new RequestManager(
  "https://api.stats.tacticool.game/api"
);

export class MongoDBUser {
  constructor(
    public _id: string,
    public pu_id: string,
    public pl_id?: string,
    public cl_id?: string,
    public cl_uuid?: string,
    public failover_uuid?: string,
    public name?: string,
    public bad_count?: number,
    public level?: number,
    public rating?: number
  ) {}
}

export class MongoDBServer {
  constructor(
    public _id: string,
    public linkedRoles: Array<LinkedRole>,
    public isDisabled: boolean
  ) {}
}

export class MongoDBManager {
  constructor(private socketManager: SocketManager) {}

  collections: {
    link?: mongoDB.Collection;
    server?: mongoDB.Collection;
    clan?: mongoDB.Collection;
    entitlements?: mongoDB.Collection;
    clanId?: mongoDB.Collection;
  } = {};

  linkedUsers: Array<MongoDBUser> = [];
  linkedServers: Array<MongoDBServer> = [];
  tactiClans: Array<MongoDBClan> = [];
  entitlements: Array<Entitlement> = [];
  clanId: Array<MongoDBClanID> = [];
  linkedActionManager: LinkedActionProcessor;

  async connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
      process.env.DB_CONN_STRING || ""
    );
    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const linkCollection: mongoDB.Collection = db.collection(
      process.env.LINK_COLLECTION_NAME || ""
    );
    const serverCollection: mongoDB.Collection = db.collection(
      process.env.SERVER_COLLECTION_NAME || ""
    );
    const clanCollection: mongoDB.Collection = db.collection(
      process.env.CLAN_COLLECTION_NAME || ""
    );
    const entitlementCollection: mongoDB.Collection = db.collection(
      process.env.ENTITLEMENT_COLLECTION_NAME || ""
    );
    const clanIdCollection: mongoDB.Collection = db.collection(
      process.env.CLANID_COLLECTION_NAME || ""
    );

    this.collections.link = linkCollection;
    this.collections.server = serverCollection;
    this.collections.clan = clanCollection;
    this.collections.entitlements = entitlementCollection;
    this.collections.clanId = clanIdCollection;

    await this.refreshData();

    console.info(this.linkedUsers.length, " users in cache");

    this.linkedActionManager = new LinkedActionProcessor(
      this.linkedServers,
      this.socketManager
    );

    console.log(
      `Successfully connected to database: ${db.databaseName} and collections: ${linkCollection.collectionName} + ${serverCollection.collectionName}`
    );
  }

  getUsersFromClanUUID(uuid: string) {
    return this.linkedUsers
      .filter((user) => user.cl_uuid == uuid)
      .map((user) => ({ ...user }));
  }

  getClanUUID(data: Partial<MongoDBClanID>) {
    if (!data) return "";

    const { name, tag, tagColor, iconId, flagId } = data;
    const foundClanLink = this.clanId.find(
      (c) =>
        c.name == name &&
        c.tag == tag &&
        c.tagColor == tagColor &&
        c.iconId == iconId &&
        c.flagId == flagId
    );

    let toRet = foundClanLink?._id;
    if (!foundClanLink) {
      const _id = uuidv4();

      const query = { _id: _id };
      const update = { $set: { _id, name, tag, tagColor, iconId, flagId } };
      const options = { upsert: true };

      this.clanId.push({ _id, name, tag, tagColor, iconId, flagId });
      this.collections.clanId.findOneAndUpdate(query, update, options);

      toRet = _id;
    }

    return toRet;
  }

  getClanFromUUID(uuid: string) {
    return this.clanId.find((c) => c._id == uuid);
  }

  async updateClanUUID(cl_uuid: string, newcl_uuid: string) {
    if (cl_uuid == newcl_uuid) return;
    const foundNewClanLinkIndex = this.clanId.findIndex(
      (c) => c._id == newcl_uuid
    );
    const foundOldClanLinkIndex = this.clanId.findIndex(
      (c) => c._id == cl_uuid
    );
    if (foundOldClanLinkIndex == -1 || foundNewClanLinkIndex == -1) return;

    const foundNewClanLink = this.clanId[foundNewClanLinkIndex];
    foundNewClanLink._id = cl_uuid;

    // Since foundNewClanLink now has the old clanId, we don't need the old clan object anymore
    this.clanId.splice(foundOldClanLinkIndex, 1);

    // Since we're updating the new clan db object with the old clanId, we don't need the new clan db object anymore
    await this.collections.clanId.deleteOne({ _id: newcl_uuid });

    // Update the clan db object w/ new values
    const old_query = { _id: cl_uuid };
    const old_update = { $set: foundNewClanLink };
    const old_options = { upsert: false };
    await this.collections.clanId.findOneAndUpdate(
      old_query,
      old_update,
      old_options
    );

    // If the logic incorrectly updates the clanId of a clan to a new id instead of keeping the old id w/ new data,
    // loop through each server and update the linkedRole to the new cl_id as needed.
    // This is purely to avoid mass role removals.
    this.linkedServers.forEach((server) => {
      let update = false;
      server.linkedRoles.forEach((role) => {
        if (role.cl_id == newcl_uuid) {
          update = true;
          role.cl_id = cl_uuid;
        }
      });
      if (update)
        this.collections.server.findOneAndUpdate(
          { _id: server._id },
          { $set: server }
        );
    });
  }

  async getLinkedUser(_id?: string, pl_id?: string): Promise<MongoDBUser> {
    try {
      const query = _id ? { _id } : { pl_id };
      const linkedUser = (await this.collections.link.findOne(
        query
      )) as unknown as MongoDBUser;

      return linkedUser ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  findLinkedUserInCache(_id: string): MongoDBUser {
    const foundUser = this.linkedUsers.find((user) => user._id == _id);
    return foundUser ?? null;
  }

  findLinkedUserByPL_ID(pl_id: string): MongoDBUser {
    const foundUser = this.linkedUsers.find((user) => user.pl_id == pl_id);
    return foundUser ?? null;
  }

  async updateLinkedUser(
    user: MongoDBUser,
    forceGuilds: Array<string> = [],
    bad_count = 0
  ): Promise<any> {
    try {
      let checkRoles = false;
      let checkName = false;

      const foundUser = this.linkedUsers.find((l) => l._id == user._id);
      if (!foundUser) {
        this.linkedUsers.push(user);
        checkRoles = true;
      } else {
        foundUser.bad_count = bad_count;
        checkRoles = foundUser.cl_uuid != user.cl_uuid;
        foundUser.cl_uuid = user.cl_uuid;

        checkName = foundUser.name != user.name && user.name != null;
        foundUser.name = user.name;
      }

      if (checkRoles || checkName || forceGuilds.length) {
        const foundClan = this.getClanFromUUID(user.cl_uuid);
        this.linkedActionManager.processUser(user, forceGuilds, {
          priority: true,
        });
        this.linkedActionManager.processNickname(
          { ...user, tag: foundClan?.tag } as NicknameObject,
          forceGuilds,
          { priority: true }
        );
      }

      if (!checkRoles && !checkName) return user;

      const query = { _id: user._id };
      const update = { $set: user };
      const options = { upsert: true };

      this.collections.link.findOneAndUpdate(query, update, options);

      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateLinkedServer(
    serverId: string,
    clanId: string,
    target: string,
    roles: Array<string>
  ): Promise<any> {
    try {
      const foundServer = this.linkedServers.find(
        (server) => server._id == serverId
      );
      if (!foundServer) return null;

      const foundClan = foundServer.linkedRoles?.find(
        (role) => role.cl_id == clanId
      );
      if (foundClan) {
        if (roles === null) return foundServer;
        (foundClan as any)[target] = target == "r_id" ? roles : roles[0];
      } else {
        const clanRequest = await statsAPIManager.get(
          `clans/${clanId}`,
          "check=true"
        );
        if (clanRequest.status != 200) return null;

        const { clan } = clanRequest.data;
        if (!clan) return null;

        const cl_name = `[${clan.tag}] ${clan.name}`;

        const newClan: LinkedRole = {
          r_id: target == "r_id" ? (roles !== null ? roles : []) : [], //discord id of role
          cl_id: clanId, //tacticool id of clan
          cl_name, //tacticool name of clan
          nickname: "[$1] $2", //discord nickname format
          online_r_id: target == "online_r_id" ? roles[0] : undefined, //discord id of role if online
          zero_points_r_id: target == "zero_points_r_id" ? roles[0] : undefined, //discord id of role if no progress points
        };
        foundServer.linkedRoles.push(newClan);
      }

      const query = { _id: serverId };
      const update = { $set: foundServer };
      const options = { upsert: true };

      await this.collections.server.findOneAndUpdate(query, update, options);
      //await this.refreshServers()
      return foundServer;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async forceLinkedUser(
    _id: string,
    pl_id: string,
    pu_id: string
  ): Promise<any> {
    try {
      const user = new MongoDBUser(_id, pu_id, pl_id);
      const query = { _id: _id };
      const update = { $set: user };
      const options = { upsert: true };

      const result = await this.collections.link.findOneAndUpdate(
        query,
        update,
        options
      );
      if (!result.ok) return null;
      this.linkedUsers.push(user);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async refreshData() {
    this.linkedUsers = (await this.collections.link
      .find()
      .toArray()) as unknown as Array<MongoDBUser>;
    this.linkedServers = (
      (await this.collections.server
        .find()
        .toArray()) as unknown as Array<MongoDBServer>
    ).filter((server) => !server.isDisabled);
    this.tactiClans = (await this.collections.clan
      .find()
      .toArray()) as unknown as Array<MongoDBClan>;
    this.tactiClans = (await this.collections.clan
      .find()
      .toArray()) as unknown as Array<MongoDBClan>;
    this.entitlements = (await this.collections.entitlements
      .find()
      .toArray()) as unknown as Array<Entitlement>;
    this.clanId = (await this.collections.clanId
      .find()
      .toArray()) as unknown as Array<MongoDBClanID>;
  }

  async refreshServers() {
    this.linkedServers = (
      (await this.collections.server
        .find()
        .toArray()) as unknown as Array<MongoDBServer>
    ).filter((server) => !server.isDisabled);
  }

  getPremiumClanIds(): Array<string> {
    return this.tactiClans
      .map((tactiClan) => tactiClan.clanData.clan_id)
      .filter((id) => id.length);
  }

  getPremiumClanTactiIds(): Array<string> {
    return this.tactiClans.map((tactiClan) => tactiClan._id);
  }

  findClanByCallName(
    callName: string,
    userId?: string
  ): MongoDBClan & { userRole?: string; userLang?: string } {
    const foundClan = this.tactiClans.find(
      (clan) => clan.clanData?.call_name == callName
    );
    if (!userId) return foundClan;
    if (!foundClan) return null;
    const { whitelistPreferences } = foundClan;
    const { admin, moderators, whitelist } = whitelistPreferences;

    const foundAdmin = admin.id == userId ? admin : undefined;
    const foundMod = moderators.find((m: any) => m.id == userId);
    const foundWhitelist = whitelist.find((w: any) => w.id == userId);

    const role =
      userId == process.env.SUDO_ID
        ? "sudo"
        : foundAdmin
        ? "admin"
        : foundMod
        ? "moderator"
        : foundWhitelist
        ? "whitelist"
        : null;

    const foundData =
      foundAdmin || foundMod || foundWhitelist || ({} as WhitelistUser);
    const { lang } = foundData;

    foundClan.userRole = undefined;
    return { ...foundClan, userRole: role, userLang: lang };
  }

  updateClanMissionData(
    callName: string,
    missions: Array<string>,
    focused_num: number,
    persist: boolean,
    selected: Array<string>,
    confirmCompleted: boolean
  ): MongoDBClan {
    const foundClan = this.findClanByCallName(callName);
    const { missionData, missionPreferences } = foundClan;

    if (!foundClan) return null;
    let toRet = foundClan;

    if (confirmCompleted) {
      toRet = JSON.parse(JSON.stringify(foundClan));
      const toMove = (missionData.selected || []).map((v) => parseInt(v));
      toMove.forEach((index) => (missionData.current_missions[index] = null));
      const nonNull = missionData.current_missions.filter(
        (m) => `${m}` != "null"
      );
      if (nonNull.length <= 1) {
        missionData.current_missions = new Array(
          missionPreferences.mission_count
        ).fill(null);
        missionData.initial_missions = new Array(
          missionPreferences.mission_count
        ).fill(null);
        missionData.focused_num = 0;
      }
      this.updateClan(foundClan);
    } else if (selected) {
      missionData.selected = selected;
    } else if (persist) {
      missionData.current_missions = [
        ...missionData.initial_missions.map((m) =>
          `${m}` == "null" ? null : m
        ),
      ];
      missionData.selected = [];
      missionData.focused_num = 0;
      this.updateClan(foundClan);
    } else if (focused_num !== undefined) {
      missionData.focused_num = focused_num;
    } else {
      const num = missionData.focused_num || 0;
      missionData.initial_missions.splice(num, missions.length, ...missions);
      missionData.focused_num =
        (parseInt(missionData.focused_num as unknown as string) || 0) +
        missions.length;
    }

    return toRet;
  }

  updateClanWhitelistData(
    callName: string,
    type: string,
    members: Array<string>
  ): MongoDBClan {
    const foundClan = this.findClanByCallName(callName);
    const { whitelistPreferences } = foundClan;

    if (!foundClan) return null;

    if (type == "managers") {
      whitelistPreferences.moderators = members.map((m) => ({
        id: m,
        lang: "en",
      }));
    } else if (type == "members") {
      whitelistPreferences.whitelist = members.map((m) => ({
        id: m,
        lang: "en",
      }));
    }

    this.updateClan(foundClan);
    return foundClan;
  }

  updatePreferenceData(
    callName: string,
    ignore: number,
    missions: number,
    priority: string,
    epic: string,
    repo: boolean
  ): MongoDBClan {
    const foundClan = this.findClanByCallName(callName);
    const { missionPreferences, placementPreferences } = foundClan;
    if (!foundClan) return null;

    if (ignore != undefined) missionPreferences.ignore_missions = ignore;
    if (missions != undefined) missionPreferences.mission_count = missions;
    if (priority != undefined)
      placementPreferences.operator_priority = priority;
    if (epic != undefined) placementPreferences.epic_position = epic;
    if (repo != undefined) placementPreferences.show_movements = repo;

    this.updateClan(foundClan);
    return foundClan;
  }

  updateDisplayData(
    callName: string,
    msg: string,
    langs: Array<string>,
    format: string,
    enforce: string
  ): MongoDBClan {
    const foundClan = this.findClanByCallName(callName);
    const { displayPreferences } = foundClan;
    if (!foundClan) return null;

    if (msg != undefined) displayPreferences.custom_message = msg;
    if (langs != undefined) displayPreferences.output_languages = langs;
    if (format != undefined) displayPreferences.output_format = format;
    if (enforce != undefined) displayPreferences.enforce_placements = enforce;

    this.updateClan(foundClan);
    return foundClan;
  }

  async updateClan(tactiClan: MongoDBClan) {
    const query = { _id: tactiClan._id };
    const update = { $set: tactiClan };
    const options = { upsert: true };
    this.collections.clan.findOneAndUpdate(query, update, options);
  }

  async createClan(
    adminId: string,
    clanId: string,
    callName: string
  ): Promise<any> {
    const foundClanByCallName = this.findClanByCallName(callName);
    if (foundClanByCallName) return { error: "taken_callname" };

    const tactiIds = this.getPremiumClanTactiIds();
    let tactiClanId;
    for (let i = 0; i < 5; i++) {
      tactiClanId = `${Math.floor(Math.random() * 99999)}`;
      if (!tactiIds.includes(tactiClanId)) break;
    }
    if (tactiIds.includes(`${tactiClanId}`)) return { error: "failed_insert" };

    const tactiClan: any = {
      _id: "",

      clanData: {
        call_name: "",
        clan_id: "",

        clan_tag: "",
        clan_name: "",
        clan_language: "en",
        clan_flag: 0,
        clan_color: 0,

        unlimited_uses: false,
        subscription_countdown: 0,
      },

      missionData: {
        initial_missions: [null, null, null, null, null, null, null, null],
        current_missions: [null, null, null, null, null, null, null, null],
        latest_instructions: {},
      },

      whitelistPreferences: {
        admin: { id: "", lang: "en" },
        moderators: [{ id: "", lang: "en" }],
        whitelist: [{ id: "", lang: "en" }],
      },

      missionPreferences: {
        ignore_missions: 0,
        mission_count: 8,
      },

      placementPreferences: {
        operator_priority: "last",
        epic_position: "ignore",
        show_movements: true,
      },

      displayPreferences: {
        custom_message: "",
        output_languages: [],
        output_format: "image",
        message_reaction: null,
        embed_thumbnail: "",

        enforce_placements: false,
        send_inGame: false,
      },

      automatePreferences: {
        automate_placements: false,
        automate_server: "",
        automate_channel: "",
        mission_threshold: 0,
        eta_threshold: 0,
      },

      analytics: {
        generate_calls: 0,
        clan_calls: 0,
        player_calls: 0,
      },
    };

    console.log({ tactiClan });
    tactiClan._id = tactiClanId;
    tactiClan.whitelistPreferences.admin = { id: adminId, lang: "en" };
    tactiClan.clanData.call_name = callName;
    tactiClan.clanData.clan_id = clanId;

    const clanRequest = await statsAPIManager.get(
      `clans/${clanId}`,
      "check=true"
    );
    if (clanRequest.status != 200) return { error: "invalid_url" };

    const clanData = clanRequest.data?.clan;
    if (!clanData) return { error: "invalid_url" };

    const { tag, name } = clanData;

    tactiClan.clanData.clan_tag = tag;
    tactiClan.clanData.clan_name = name;

    const query = { _id: tactiClan._id };
    const update = { $set: tactiClan };
    const options = { upsert: true };

    const result = await this.collections.clan.findOneAndUpdate(
      query,
      update,
      options
    );
    if (!result.ok) return { error: "failed_insert" };

    this.tactiClans.push(tactiClan);
    this.refreshData();

    return tactiClan;
  }
}
