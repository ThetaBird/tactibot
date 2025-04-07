import { MongoDBManager, MongoDBUser } from "../Managers/MongoDBManager";
import { WSResponse, LinkStatus } from "../Interfaces";
import { PendingLinkManager } from "../Managers/PendingLinkManager";
import { Response } from "express";
import { PlayersClubManager } from "../Managers/PlayersClubManager";

const clubManager = new PlayersClubManager();

const linkAvatarChoices = [4, 6, 8];

export class LinkProcessor {
  constructor(
    public mongoManager: MongoDBManager,
    public pendingManager: PendingLinkManager
  ) {}

  async processLinkStart(userId: string, publicId: string): Promise<any> {
    const { avatarId, name, clan } = await clubManager.getMinimalPlayerInfo(
      publicId
    );
    console.log({ avatarId, name });
    if (!avatarId || !name) return { data: { error: true } };

    const filteredLinkAvatarChoices = linkAvatarChoices.filter(
      (num) => num != avatarId
    );
    const expectedAvatarIndex =
      avatarId === 4
        ? Math.floor(Math.random() * filteredLinkAvatarChoices.length)
        : 0;
    const expectedAvatar: number =
      filteredLinkAvatarChoices[expectedAvatarIndex];

    const statusData: LinkStatus = {
      status: "avatar",
      data: { expectedAvatar, name },
    };
    const reply: WSResponse = { data: statusData, delete: false };
    //this.socketManager.emit("link_status", reply);

    const foundClanUUID = this.mongoManager.getClanUUID(clan);
    const hypotheticalMongoUser = new MongoDBUser(
      userId,
      publicId,
      "",
      "",
      foundClanUUID,
      "",
      name,
      0,
      0,
      0
    );
    const pendingLink = new PendingLink(
      expectedAvatar,
      userId,
      publicId,
      name,
      hypotheticalMongoUser,
      this.mongoManager
    );
    this.pendingManager.addPendingLink(userId, pendingLink);

    return reply;
  }

  attachResToPendingLink(interactionId: string, res: any) {
    this.pendingManager.attachLinkEndpoint(interactionId, res);
  }

  processLinkGet(userId: string): MongoDBUser {
    const mongoUser = this.mongoManager.findLinkedUserInCache(userId);
    if (!mongoUser || !mongoUser.pu_id) return null;
    return mongoUser;
  }
}
/*
const apiQueryPublicId = async (publicId: string, force: boolean) => {
    const {status, data} = await statsManager.get(`search/players/${publicId}`, force ? "check=true" : '')
    if(status != 200) return {status};

    return data;
}
*/
const CHECK_AVATAR_RETRYCOUNT = 11;
const CHECK_AVATAR_INTERVAL = 10000; //15 Seconds

type PendingLinkStatus = "pending" | "success" | "expired";

export class PendingLink {
  constructor(
    private expectedAvatar: number,
    public userId: string,
    private publicId: string,
    private userName: string,
    private mongoUser: MongoDBUser,
    private mongoManager: MongoDBManager
  ) {}

  timer: NodeJS.Timeout;
  public date = Date.now();
  public status: PendingLinkStatus = "pending"; // || "success" || "expired"
  public retries: number = 0;
  private res: Response = null;

  stopTimer() {
    clearInterval(this.timer);
  }

  startTimer() {
    this.timer = setInterval(
      async () => await this.checker(),
      CHECK_AVATAR_INTERVAL
    );
  }

  async checker() {
    if (this.retries > CHECK_AVATAR_RETRYCOUNT) return this.expire();

    const { avatarId } = await clubManager.getLinkPlayerInfo(this.publicId);

    if (!avatarId) return this.expire();
    if (avatarId == this.expectedAvatar) return this.succeed();

    this.retries += 1;
  }

  attachEndpoint(res: Response) {
    this.res = res;
  }

  expire() {
    this.stopTimer();
    const statusData: LinkStatus = { status: "expired", data: {} };
    const reply: WSResponse = { data: statusData, delete: true };
    this.res?.json(reply);
    this.status = "expired";
  }

  succeed() {
    this.stopTimer();
    this.mongoManager.updateLinkedUser(this.mongoUser);

    const statusData: LinkStatus = {
      status: "success",
      data: { userId: this.userId, name: this.userName },
    };
    const reply: WSResponse = { data: statusData, delete: true };
    this.res?.json(reply);
    this.status = "success";
  }
}
