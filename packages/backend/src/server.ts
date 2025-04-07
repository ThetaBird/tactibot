import * as dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  UserData,
  WSResponse,
  AggregatedEntitlement,
  MongoDBClan,
} from "./Interfaces";
import { MongoDBManager } from "./Managers/MongoDBManager";
import { FromUserIdProcessor } from "./Processors/FromUserIdProcessor";
import { LinkProcessor } from "./Processors/LinkProcessor";
import { PendingLinkManager } from "./Managers/PendingLinkManager";
import { SocketManager } from "./Managers/SocketManager";
import { RoleManager } from "./Managers/RoleManager";
import { EntitlementProcessor } from "./Processors/EntitlementProcessor";
import log from "./log";
import { PlayersClubManager } from "./Managers/PlayersClubManager";
import { Scheduler } from "./NewSchedule";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(8080);
const socketManager: SocketManager = new SocketManager();
const IS_PROD = process.env.NODE_ENV === "production";

const corsOptions = {
  origin: "http://localhost:*", // Allow from any port on localhost
  optionsSuccessStatus: 200,
};

// Global error handler for uncaught exceptions
process.on("uncaughtException", (error) => {
  log({ statusCode: 502, error: error.message })?.catch(console.error);
});

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  log({ statusCode: 501, reason: `Reason: ${reason}` })?.catch(console.error);
});

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded());

app.use((req, res, next) => {
  const start = Date.now();
  const { url, method, body, params, query } = req;
  const hostname = req.get("host");

  if (hostname != "localhost:8081") {
    log({ url, method, params, query, hostname, statusCode: 401 }).catch(
      console.error
    );
    return res.status(401).send("Unauthorized");
  }

  const newBody = url.includes("linked_server_members") ? "[REMOVED]" : body;

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    const { statusCode } = res;
    log({
      url,
      method,
      newBody,
      params,
      query,
      hostname,
      responseTime,
      statusCode,
    }).catch(console.error);
  });

  res.on("close", () => {
    const responseTime = Date.now() - start;
    if (!res.writableEnded)
      log({
        url,
        method,
        newBody,
        params,
        query,
        hostname,
        responseTime,
        statusCode: 500,
      }).catch(console.error);
  });
  next();
});

const mongoManager: MongoDBManager = new MongoDBManager(socketManager);
const clubManager: PlayersClubManager = new PlayersClubManager();
const newSchedule: Scheduler = new Scheduler(
  socketManager,
  mongoManager,
  clubManager
);

async function init() {
  await mongoManager.connectToDatabase();

  if (IS_PROD) {
    newSchedule.scheduleRoleUpdate();
    newSchedule.startCycleTimer();
    newSchedule.scheduleClanTraverse();
    console.warn("Scheduled tasks started in production mode");
  } else {
    console.warn("Skipping scheduled tasks in dev mode");
  }
}

init();

const FromUserIdManager = new FromUserIdProcessor(mongoManager);
const EntitlementManager: EntitlementProcessor = new EntitlementProcessor(
  mongoManager
);

const pendingManager = new PendingLinkManager();
pendingManager.startGarbageCollector();

const LinkManager = new LinkProcessor(mongoManager, pendingManager);

app.get("/", (req, res) => {
  res.json("hello world");
});

app.get("/fromUserId", async (req, res) => {
  const { userId } = req.query;
  const userData: UserData = await FromUserIdManager.process(userId as string);
  const reply: WSResponse = { data: userData, delete: true };
  res.json(reply);
});

app.post("/link", async (req, res) => {
  const { userId, publicId } = req.body;
  const reply = await LinkManager.processLinkStart(
    userId as string,
    publicId as string
  );
  res.json(reply);
});

app.get("/link_progress", async (req, res) => {
  const { userId } = req.query;
  LinkManager.attachResToPendingLink(userId as string, res);
});

app.get("/link", async (req, res) => {
  const { userId } = req.query;
  const mongoUser = LinkManager.processLinkGet(userId as string);
  const reply: WSResponse = { data: mongoUser, delete: !!mongoUser };
  res.json(reply);
});

app.delete("/link", async (req, res) => {
  const { userId } = req.body;
  pendingManager.deletePendingLink(userId);
  res.json({ userId });
});

app.post("/linked_server_members", async (req, res) => {
  const { guilds, uniq } = req.body;
  console.log({ guilds, uniq });

  const roleManager = new RoleManager(
    guilds,
    uniq as Array<string>,
    mongoManager
  );
  roleManager.processUsers();
  res.json({ temp: "temp" });
});

app.post("/admin_clan", async (req, res) => {
  const { adminId, clanId, callName } = req.body;
  await mongoManager.createClan(adminId, clanId, callName);
});

app.post("/admin_link", async (req, res) => {
  const { _id, pl_id, pu_id } = req.body;
  await mongoManager.forceLinkedUser(_id, pl_id, pu_id);
});

app.get("/entitlement", async (req, res) => {
  const { userId } = req.query;
  const entitlementData: AggregatedEntitlement =
    EntitlementManager.fetchEntitlement(userId as string);
  const reply: WSResponse = {
    data: entitlementData,
    delete: entitlementData === null,
  };
  res.json(reply);
});

app.post("/entitlement", async (req, res) => {
  const { discordId, purchasedClans, provider, guildId, entitlementId } =
    req.body;
  EntitlementManager.createEntitlement(
    discordId as string,
    purchasedClans as number,
    provider as string,
    guildId as string,
    entitlementId as string
  );
  res.json({});
});

app.post("/entitlementServer", async (req, res) => {
  const { discordId, serverId, serverName } = req.body;
  const entitlementData = EntitlementManager.updateEntitlementServer(
    discordId as string,
    serverId as string,
    serverName as string
  );
  const reply: WSResponse = { data: entitlementData };
  res.json(reply);
});

app.get("/getClan", async (req, res) => {
  const { callName, userId } = req.query;
  const foundClan: MongoDBClan = mongoManager.findClanByCallName(
    callName as string,
    userId as string
  );
  const reply: WSResponse = { data: foundClan };
  res.json(reply);
});

app.post("/updateMissionData", async (req, res) => {
  const {
    userId,
    callName,
    missions,
    focused_num,
    persist,
    selected,
    confirmCompleted,
  } = req.body;
  const { userLang } = mongoManager.findClanByCallName(
    callName as string,
    userId as string
  );

  const foundClan: MongoDBClan = mongoManager.updateClanMissionData(
    callName as string,
    missions as Array<string>,
    focused_num as number,
    persist as boolean,
    selected as Array<string>,
    confirmCompleted as boolean
  );

  const reply: WSResponse = { data: { ...foundClan, userLang } };
  res.json(reply);
});

app.post("/updateWhitelistData", async (req, res) => {
  const { callName, type, members } = req.body;
  const foundClan: MongoDBClan = mongoManager.updateClanWhitelistData(
    callName as string,
    type as string,
    members as Array<string>
  );
  const reply: WSResponse = { data: foundClan };
  res.json(reply);
});

app.post("/updatePreferenceData", async (req, res) => {
  const {
    callName,
    ignore_missions,
    mission_count,
    operator_priority,
    epic_position,
    show_movements,
  } = req.body;
  const foundClan: MongoDBClan = mongoManager.updatePreferenceData(
    callName as string,
    ignore_missions as number,
    mission_count as number,
    operator_priority as string,
    epic_position as string,
    show_movements as boolean
  );
  const reply: WSResponse = { data: foundClan };
  res.json(reply);
});

app.post("/updateDisplayData", async (req, res) => {
  const {
    callName,
    custom_message,
    output_languages,
    output_format,
    enforce_placements,
  } = req.body;
  const foundClan: MongoDBClan = mongoManager.updateDisplayData(
    callName as string,
    custom_message as string,
    output_languages as Array<string>,
    output_format as string,
    enforce_placements as string
  );
  const reply: WSResponse = { data: foundClan };
  res.json(reply);
});

app.post("/roles", async (req, res) => {
  const { clanId, roles, target, serverId } = req.body;
  const foundClan: MongoDBClan = await mongoManager.updateLinkedServer(
    serverId,
    clanId,
    target,
    roles
  );
  const reply: WSResponse = { data: foundClan };
  res.json(reply);
});

app.post("/tactiClan", async (req, res) => {
  const { callName, clanId, adminId } = req.body;
  const entitlement: MongoDBClan =
    await EntitlementManager.createEntitlementCommand(
      callName,
      clanId,
      adminId
    );
  const reply: WSResponse = { data: entitlement };
  res.json(reply);
});

io.on("connection", (socket) => {
  socketManager.setSocket(socket);
});

app.listen(8081);
