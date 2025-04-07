import { RequestManager } from "../Managers/RequestManager";
import { MongoDBManager, MongoDBUser } from "../Managers/MongoDBManager";
import {
  PlayerData,
  ClanData,
  UserData,
  PlayerKills,
  PresetData,
} from "../Interfaces";
import l from "./localizations";
import d from "./data";

const localizations = l() as any;
const pzdData = d() as any;

export class FromUserIdProcessor {
  constructor(public mongoManager: MongoDBManager) {}

  async process(userId: string): Promise<UserData> {
    //Find MongoDBUser from list of linked users in order to pull more information.
    const mongoUser: MongoDBUser =
      this.mongoManager.findLinkedUserInCache(userId);
    if (!mongoUser || !mongoUser.pu_id.length) return { userId };
    const { pl_id, pu_id, cl_uuid } = mongoUser;

    //Get player statistics from club.tacticool.game
    const clubData = await new RequestManager(
      "https://api.club.tacticool.game/api"
    ).post(getClubBody(mongoUser.pu_id));

    const clanmateCount = cl_uuid
      ? this.mongoManager.getUsersFromClanUUID(cl_uuid).length
      : 0;

    //Pull data from club.tacticool.game response
    const account = clubData?.data?.account || {};
    const { avatarId, countryCode, level, name, rating, stats, presets } =
      account;
    const clan = account.clan || {};
    const { flagId, iconId, tag, tagColor } = clan;
    const clan_name = clan.name;
    const { matches, totalTime, wins, kills, deaths, killsByType } =
      stats || {};
    const {
      assists,
      byWeaponClass,
      explosive,
      machineGun,
      melee,
      physics,
      primaryWeapon,
      secondaryWeapon,
      vehicle,
    } = killsByType || {};
    const { smg, shotgun, assault, sniper, prototypes } =
      getWeaponClassKills(byWeaponClass);
    const kdr = (kills / (deaths ? deaths : 1)).toFixed(2);
    const winRate = ((100 * wins) / matches).toFixed(2) + "%";
    const timePlayed = (totalTime / 86400).toFixed(2); //60 seconds * 60 minutes * 24 hours;
    const avgGamesPerWeek = "¯\\_(ツ)_/¯"; // average(gamesPerWeek.map(w => w.gamesPlayed || 0)).toFixed(1)
    const killsPerGame = (kills / matches).toFixed(2);

    const presetData = getPresetData(presets);

    const isValidResponse = clubData.status == 200 && clubData.data;

    const killData = !isValidResponse
      ? null
      : new PlayerKills(
          kills,
          assists,
          kdr,
          smg,
          shotgun,
          assault,
          sniper,
          machineGun,
          prototypes,
          vehicle,
          explosive,
          physics,
          melee,
          primaryWeapon,
          secondaryWeapon
        );

    const playerData = !isValidResponse
      ? null
      : new PlayerData(
          pu_id,
          pl_id,
          countryCode,
          level,
          name,
          rating,
          avatarId,
          undefined,
          undefined,
          undefined,
          undefined,
          null,
          killData,
          matches,
          timePlayed,
          winRate,
          avgGamesPerWeek,
          killsPerGame
        );

    const clanData = !isValidResponse
      ? {}
      : new ClanData(
          undefined,
          undefined,
          clan_name,
          tag,
          tagColor,
          iconId,
          flagId,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          clanmateCount
        );

    const userData = new UserData(
      userId,
      playerData,
      clanData,
      presetData,
      undefined
    );

    return userData;
  }
}

const getPresetData = (presets: any[]) => {
  const toRet = [] as PresetData[];

  presets.forEach((preset: any) => {
    const {
      firstAbility,
      secondAbility,
      hero,
      primaryWeapon,
      secondaryWeapon,
    } = preset;
    const heroName = localizations.en[`hero_name_${hero.id}`];
    const heroType = pzdData.heroes[`${hero.id}`]?.rarity;
    const heroLevel = `${hero.level}/100`;
    const heroSkin = localizations.en[`outfit_name_${hero.skinId}`];
    const heroSkinId = hero.skinId;
    const heroSkinType = pzdData.outfits[`${hero.skinId}`]?.rarity;
    const { talentIds } = hero;

    const special1Name = localizations.en[`ability_name_${firstAbility.id}`];
    const special1Level = firstAbility.level
      ? `${firstAbility.level}/${
          pzdData.max_levels[`ability_id_${firstAbility.id}`]
        }`
      : "";

    const special2Name = localizations.en[`ability_name_${secondAbility.id}`];
    const special2Level = secondAbility.level
      ? `${secondAbility.level}/${
          pzdData.max_levels[`ability_id_${secondAbility.id}`]
        }`
      : "";

    const primaryName = localizations.en[
      `weapon_name_${primaryWeapon.id}`
    ]?.substring(0, 12);
    const primarySkinName =
      localizations.en[`weapon_skin_name_${primaryWeapon.skinId}`];
    const primarySkinId = primaryWeapon.skinId;
    const primarySkinType =
      pzdData.weapon_skins[`${primaryWeapon.skinId}`]?.rarity;
    const primaryLevel = `${primaryWeapon.level}/${
      pzdData.max_levels[`weapon_id_${primaryWeapon.id}`]
    }`;
    const primaryModules = primaryWeapon.moduleIds;
    const primaryCollectible = primaryWeapon.collectibleId
      ? localizations.en[`collectible_name_${primaryWeapon.id}`]
      : "";

    const secondaryName = localizations.en[
      `weapon_name_${secondaryWeapon.id}`
    ]?.substring(0, 12);
    const secondarySkinName =
      localizations.en[`weapon_skin_name_${secondaryWeapon.skinId}`];
    const secondarySkinId = secondaryWeapon.skinId;
    const secondarySkinType =
      pzdData.weapon_skins[`${secondaryWeapon.skinId}`]?.rarity;
    const secondaryLevel = `${secondaryWeapon.level}/${
      pzdData.max_levels[`weapon_id_${secondaryWeapon.id}`]
    }`;
    const secondaryModules = secondaryWeapon.moduleIds;
    const secondaryCollectible = secondaryWeapon.collectibleId
      ? localizations.en[`collectible_name_${secondaryWeapon.id}`]
      : "";

    toRet.push(
      new PresetData(
        heroName,
        heroType,
        heroLevel,
        heroSkin,
        heroSkinId,
        heroSkinType,
        talentIds,
        special1Name,
        special1Level,
        special2Name,
        special2Level,
        primaryName,
        primarySkinName,
        primarySkinId,
        primarySkinType,
        primaryLevel,
        primaryModules,
        primaryCollectible,
        secondaryName,
        secondarySkinName,
        secondarySkinId,
        secondarySkinType,
        secondaryLevel,
        secondaryModules,
        secondaryCollectible
      )
    );
  });

  return toRet;
};

const getWeaponClassKills = (byWeaponClass: any[] = []) => {
  const classMap = [
    "_",
    "_",
    "sniper",
    "smg",
    "assault",
    "shotgun",
    "_",
    "prototypes",
  ];
  const toRet: any = {};
  for (const { weaponClass, kills } of byWeaponClass) {
    if (!classMap[weaponClass]) continue;
    toRet[classMap[weaponClass]] = kills || 0;
  }
  return toRet;
};

const getClubBody = (pu_id: string) => {
  return {
    operationName: "getUser",
    variables: { publicId: pu_id },
    query:
      "query getUser($publicId: ID!) {\n  account(publicId: $publicId) {\n    publicId\n    name\n    rating\n    level\n    countryCode\n    avatarId\n    subscriptionExpireTimestamp\n    clan {\n      name\n      tag\n      tagColor\n      iconId\n      flagId\n      __typename\n    }\n    stats {\n      kills\n      deaths\n      wins\n      matches\n      totalTime\n      killsByType {\n        primaryWeapon\n        secondaryWeapon\n        melee\n        explosive\n        physics\n        vehicle\n        machineGun\n        assists\n        byWeaponClass {\n          weaponClass\n          kills\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    patches {\n      id\n      count\n      __typename\n    }\n    presets {\n      hero {\n        id\n        level\n        skinId\n        talentIds\n        __typename\n      }\n      primaryWeapon {\n        id\n        skinId\n        collectibleId\n        level\n        moduleIds\n        __typename\n      }\n      secondaryWeapon {\n        id\n        skinId\n        collectibleId\n        level\n        moduleIds\n        __typename\n      }\n      firstAbility {\n        id\n        level\n        __typename\n      }\n      secondAbility {\n        id\n        level\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
  };
};
