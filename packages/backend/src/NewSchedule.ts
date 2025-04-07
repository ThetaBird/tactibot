import { ToadScheduler, SimpleIntervalJob, Task } from "toad-scheduler";
const Moment = require("moment");

import { MongoDBManager, MongoDBUser } from "./Managers/MongoDBManager";
import { PlayersClubManager } from "./Managers/PlayersClubManager";
import { SocketManager } from "./Managers/SocketManager";

import throttledQueue from "throttled-queue";
const queue = throttledQueue(10, 1000, true);

const scheduler = new ToadScheduler();

export class Scheduler {
  constructor(
    private socketManager: SocketManager,
    private mongoManager: MongoDBManager,
    private clubManager: PlayersClubManager
  ) {}

  startCycleTimer() {
    const knownCycleStart = Moment("2021-11-11T19"); //new Date("November 11, 2021 19:00:00"); //info goes here
    const now = Moment(); //Date.now();
    do {
      knownCycleStart.add(99, "h");
    } while (knownCycleStart < now);

    knownCycleStart.subtract(10, "m");

    const difference = Math.abs(knownCycleStart - now);
    console.log({ difference });
  }

  scheduleRoleUpdate() {
    console.log("Role Update Schedule");

    const roleTask = new Task("role update", () => {
      const serverIds = this.mongoManager.linkedServers.map((s) => s._id);
      this.socketManager.emit("linked_server_members", { serverIds });
    });

    const job = new SimpleIntervalJob(
      { minutes: 5, runImmediately: false },
      roleTask
    );
    setTimeout(() => {
      scheduler.addSimpleIntervalJob(job);
    }, 6000);
  }

  scheduleClanTraverse() {
    console.log("Clan Traverse Schedule");

    const traverseTask = new Task("traverse update", () => {
      Schedule.traverseClans(this.mongoManager, this.clubManager);
    });

    const job = new SimpleIntervalJob(
      { minutes: 20, runImmediately: true },
      traverseTask
    );
    setTimeout(() => {
      scheduler.addSimpleIntervalJob(job);
    }, 60000);
  }
}

class Schedule {
  static traverseCount = 0;
  static async traverseClans(
    mongoManager: MongoDBManager,
    clubManager: PlayersClubManager
  ) {
    const now = new Date();
    Schedule.traverseCount =
      Schedule.traverseCount >= 144 ? 0 : Schedule.traverseCount + 1;
    const allLinkedPlayers = mongoManager.linkedUsers.map((user) => ({
      ...user,
    }));

    const clans = mongoManager.clanId; //[{_id:"bef1790d-825e-46b2-8dbb-6d618923f680"},{_id:"4ebff67b-1f0b-4123-b7aa-7b1020674dce"}]//

    for (const { _id } of clans) {
      const start = Date.now();
      const clan_players = mongoManager.getUsersFromClanUUID(_id);

      const promises: Array<Promise<void>> = [];
      let count = clan_players.length;
      clan_players.forEach(async (player) => {
        promises.push(
          queue(() => clubManager.getAllPlayerInfo(player.pu_id)).then(
            async (playerInfo) => {
              if (!playerInfo) return;
              const { clan, name, level, rating } = playerInfo;
              if (!name) return; //Something went wrong with the request

              player.name = name;
              player.level = level;
              player.rating = rating;
              //console.log(name)
              const foundUUID = mongoManager.getClanUUID(clan);

              if (foundUUID != _id) {
                //mismatch in uuids. Either clan info changed or player changed clans
                player.failover_uuid = _id; //set backup in case clan info changed.
                player.cl_uuid = foundUUID; //set to new clan UUID
                count--;
              }
            }
          )
        );
      });

      await Promise.allSettled(promises);

      if (!count) {
        //If we're here, then something's wrong - no players with cl_uuid as _id.
        //This either happens if a clan becomes abandoned (rare)
        //or if clan data changed and all players have been moved to new UUID.
        const failover_players = getPlayersFromFailoverUUID(
          clan_players,
          _id
        ).filter((p) => !!p.cl_uuid);
        if (!failover_players.length) continue; //If all failover players have cl_uuid of nothing then something problably went terribly wrong @ PZD

        const bestNewUUID = getMostCommonOccurence(
          failover_players.map((p) => p.cl_uuid)
        );
        mongoManager.updateClanUUID(_id, bestNewUUID);

        failover_players.forEach((player) => {
          player.cl_uuid = _id;
          player.failover_uuid = undefined;
        });
      }

      clan_players.forEach((player) => {
        const idx = allLinkedPlayers.findIndex((p) => p._id == player._id);
        if (idx != -1) allLinkedPlayers.splice(idx, 1);
        mongoManager.updateLinkedUser(player);
      });

      console.log("Done!", Date.now() - start);
    }

    //Now we deal with the stragglers that weren't covered by our clan traversal
    //console.log(allLinkedPlayers.length)
    allLinkedPlayers.forEach(async (player) => {
      if (player.bad_count > 5 && !Schedule.traverseCount) return;
      queue(() => clubManager.getAllPlayerInfo(player.pu_id)).then(
        async (playerInfo) => {
          if (!playerInfo) return;
          const { clan, name, level, rating } = playerInfo;
          if (!name) return; //Something went wrong with the request

          player.name = name;
          player.level = level;
          player.rating = rating;

          const foundUUID = mongoManager.getClanUUID(clan);
          if (foundUUID != player.cl_uuid) {
            player.cl_uuid = foundUUID; //set to new clan UUID
            mongoManager.updateLinkedUser(player);
          } else {
            mongoManager.updateLinkedUser(player, [], player.bad_count + 1);
          }
        }
      );
    });
  }
}

const getPlayersFromFailoverUUID = (clanPlayers: MongoDBUser[], uuid: string) =>
  clanPlayers.filter((user) => user.failover_uuid == uuid);

const getMostCommonOccurence = (arr: any[]) => {
  const obj: any = {};
  let el,
    max = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) obj[arr[i]] = 1;
    else obj[arr[i]]++;
  }
  for (const i in obj) {
    if (max < obj[i]) {
      max = obj[i];
      el = i;
    }
  }
  return el;
};
