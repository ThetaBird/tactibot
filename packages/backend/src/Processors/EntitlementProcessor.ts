import {
  AggregatedEntitlement,
  Entitlement,
  MongoDBClan,
  MongoDBServer,
} from "../Interfaces";
import { MongoDBManager } from "../Managers/MongoDBManager";

export class EntitlementProcessor {
  constructor(public mongoManager: MongoDBManager) {}

  fetchEntitlement(userId: string): AggregatedEntitlement {
    const foundUser = this.mongoManager.findLinkedUserInCache(userId);
    const foundEntitlements = this.mongoManager.entitlements.filter(
      (entitlement) => entitlement.discordId === userId
    );
    if (!foundEntitlements.length) return null;

    const providers: Array<string> = [];
    const callNames: Array<string> = [];
    let totalClans = 0;
    const maxServerCount = foundEntitlements.length;
    const servers: Array<string> = [];
    let expires = -1;

    foundEntitlements.forEach((entitlement) => {
      providers.push(entitlement.provider);
      totalClans += entitlement.purchasedClans;
      callNames.push(...entitlement.callNames);
      if (entitlement.serverId) servers.push(entitlement.serverId);
      expires = Math.max(entitlement.expires.valueOf(), expires);
    });

    const toRet: AggregatedEntitlement = {
      discordId: userId,
      userClanId: foundUser?.cl_id,
      maxServerCount,
      servers: servers.map((id) =>
        this.mongoManager.linkedServers.find((server) => server._id === id)
      ),
      providers: [...new Set(providers)],
      clans: [...new Set(callNames)]
        .map((id) =>
          this.mongoManager.tactiClans.find((clan) => clan._id === id)
        )
        .filter((clan) => clan != null),
      maxClanCount: totalClans,
      expires,
    };

    return toRet;
  }

  createEntitlement(
    discordId: string,
    purchasedClans: number,
    provider: string,
    guildId: string,
    entitlementId: string
  ) {
    const foundEntitlement = this.mongoManager.entitlements.find(
      (e) =>
        e.provider == provider &&
        e.discordId == discordId &&
        e.purchasedClans == purchasedClans
    );
    if (foundEntitlement) {
      foundEntitlement.expires = new Date(Date.now() + 2678400000); //31 days
      const query = { _id: foundEntitlement._id };
      const update = { $set: foundEntitlement };
      const options = { upsert: false };
      this.mongoManager.collections.entitlements.findOneAndUpdate(
        query,
        update,
        options
      );
      return;
    }

    const newEntitlement: Partial<Entitlement> = {
      discordId,
      unlimited: false,
      expires: new Date(Date.now() + 2678400000), //31 days,
      entitlementId: entitlementId || `${Date.now().valueOf()}`,
      serverId: guildId || "",
      callNames: [],
      purchasedClans,
      provider,
    };
    this.mongoManager.collections.entitlements.insertOne(newEntitlement as any);
    this.mongoManager.entitlements.push(newEntitlement as Entitlement);
  }

  updateEntitlementServer(
    userId: string,
    serverId: string,
    serverName: string
  ) {
    const foundEntitlements = this.mongoManager.entitlements.filter(
      (entitlement) => entitlement.discordId === userId
    );
    const serverlessEntitlement = foundEntitlements.find(
      (e) => e.serverId == ""
    );
    if (!serverlessEntitlement) return null;

    serverlessEntitlement.serverId = serverId;

    const query = { _id: serverlessEntitlement._id };
    const update = { $set: serverlessEntitlement };
    const options = { upsert: true };

    this.mongoManager.collections.entitlements.findOneAndUpdate(
      query,
      update,
      options
    );
    let entitlement = this.fetchEntitlement(userId);

    const foundServer = this.mongoManager.linkedServers.find(
      (server) => server._id == serverId
    );
    if (foundServer) return entitlement;

    const newServer: MongoDBServer = {
      _id: serverId,
      linkedRoles: [],
      linkedNicknames: "",
      server: serverName || "unknown",
    };

    this.mongoManager.linkedServers.push(newServer as any);
    this.mongoManager.collections.server.insertOne(newServer as any);

    entitlement = this.fetchEntitlement(userId);
    return entitlement;
  }

  async createEntitlementCommand(
    callName: string,
    clanId: string,
    adminId: string
  ): Promise<any> {
    try {
      const result = await this.mongoManager.createClan(
        adminId,
        clanId,
        callName
      );
      if (result?.error) return result;

      const { _id } = result as MongoDBClan;

      this.addTactiClanIdToEntitlement(adminId, _id);

      return this.fetchEntitlement(adminId);
    } catch (error) {
      console.error(error);
      return { error: "unknown" };
    }
  }

  addTactiClanIdToEntitlement(userId: string, clanId: string): any {
    const foundUser = this.mongoManager.findLinkedUserInCache(userId);
    const foundEntitlements = this.mongoManager.entitlements.filter(
      (entitlement) => entitlement.discordId === userId
    );
    if (!foundEntitlements.length) return null;

    let modifiedEntitlement = null;
    for (const entitlement of foundEntitlements) {
      const { callNames, purchasedClans } = entitlement;
      if (callNames.length >= purchasedClans) continue;

      callNames.push(clanId);
      modifiedEntitlement = entitlement;
      break;
    }

    if (!modifiedEntitlement) return;

    const query = { _id: modifiedEntitlement._id };
    const update = { $set: modifiedEntitlement };
    const options = { upsert: true };

    this.mongoManager.collections.entitlements.findOneAndUpdate(
      query,
      update,
      options
    );
  }
}
