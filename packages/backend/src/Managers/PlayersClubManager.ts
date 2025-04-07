import { RequestManager } from "./RequestManager";

const club = new RequestManager("https://api.club.tacticool.game/api");

export class PlayersClubManager {
  async getLinkPlayerInfo(pu_id: string) {
    const getClubBody = (pu_id: string) => {
      return {
        operationName: "getUser",
        variables: { publicId: pu_id },
        query:
          "query getUser($publicId: ID!) {\n  account(publicId: $publicId) {\n name\n avatarId\n }\n}",
      };
    };
    const response = await club.post(getClubBody(pu_id)).catch((e): any => {
      return { data: { account: null } };
    });

    const { data } = response;
    return data?.account ?? {};
  }

  async getMinimalPlayerInfo(pu_id: string) {
    const getClubBody = (pu_id: string) => {
      return {
        operationName: "getUser",
        variables: { publicId: pu_id },
        query:
          "query getUser($publicId: ID!) {\n  account(publicId: $publicId) {\n    publicId\n    name\n   avatarId\n    clan {\n      name\n      tag\n      tagColor\n      iconId\n      flagId\n     }\n   }\n}",
      };
    };
    const response = await club.post(getClubBody(pu_id));
    const { data } = response;
    return data?.account ?? {};
  }

  async getBasicPlayerInfo(pu_id: string) {
    const getClubBody = (pu_id: string) => {
      return {
        operationName: "getUser",
        variables: { publicId: pu_id },
        query:
          "query getUser($publicId: ID!) {\n  account(publicId: $publicId) {\n    publicId\n    name\n    rating\n    level\n    countryCode\n    avatarId\n    clan {\n      name\n      tag\n      tagColor\n      iconId\n      flagId\n     }\n   }\n}",
      };
    };
    const response = await club.post(getClubBody(pu_id));
    const { data } = response;
    return data?.account ?? {};
  }

  async getAllPlayerInfo(pu_id: string) {
    const getClubBody = (pu_id: string) => {
      return {
        operationName: "getUser",
        variables: { publicId: pu_id },
        query:
          "query getUser($publicId: ID!) {\n  account(publicId: $publicId) {\n    publicId\n    name\n    rating\n    level\n    countryCode\n    avatarId\n    subscriptionExpireTimestamp\n    clan {\n      name\n      tag\n      tagColor\n      iconId\n      flagId\n      __typename\n    }\n    stats {\n      kills\n      deaths\n      wins\n      matches\n      totalTime\n      killsByType {\n        primaryWeapon\n        secondaryWeapon\n        melee\n        explosive\n        physics\n        vehicle\n        machineGun\n        assists\n        byWeaponClass {\n          weaponClass\n          kills\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    presets {\n      hero {\n        id\n        level\n        skinId\n        talentIds\n        __typename\n      }\n      primaryWeapon {\n        id\n        skinId\n        collectibleId\n        level\n        moduleIds\n        __typename\n      }\n      secondaryWeapon {\n        id\n        skinId\n        collectibleId\n        level\n        moduleIds\n        __typename\n      }\n      firstAbility {\n        id\n        level\n        __typename\n      }\n      secondAbility {\n        id\n        level\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
      };
    };
    const response = await club.post(getClubBody(pu_id));
    const { data } = response;
    return data?.account ?? {};
  }
}
