export class MongoDBClan {
  constructor(
    public _id: string,
    public clanData: TactiClanData,
    public missionData: MissionData,
    public whitelistPreferences: WhitelistPreferences,
    public placementPreferences: PlacementPreferences,
    public displayPreferences: DisplayPreferences,
    public automatePreferences: AutomatePreferences,
    public analytics: Analytics,
    public missionPreferences: MissionPreferences,
    public userRole?: string
  ) {}
}
export interface MongoDBUser {
  _id?: string; //discord id
  pu_id?: string; //public tacticool id
  pl_id?: string; //private tacticool id
  cl_id?: string; //private clan id
  cl_uuid?: string; //custom clan uuid
  ignoreNicknames?: string[];
  level?: number;
  rating?: number;
}
export interface MongoDBClanID {
  _id?: string;
  name?: string;
  tag?: string;
  tagColor?: number;
  iconId?: number;
  flagId?: number;
}

export interface NicknameObject extends MongoDBUser {
  name: string;
  tag: string;
  online?: boolean;
  zeroPoints?: boolean;
}

export interface MongoDBServer {
  _id?: string; //discord server id
  authRoles?: Array<string>; //discord role ids
  linkedNicknames?: string;
  linkedRoles: Array<LinkedRole>;
  server?: string;
  isDisabled?: boolean;
}

export interface TactiClanData {
  call_name: string;
  clan_id: string;
  clan_tag: string;
  clan_name: string;
  clan_language: string;
  unlimited_uses: boolean;
  subscription_countdown: number;
}

export interface MissionData {
  initial_missions: Array<string>;
  current_missions: Array<string>;
  latest_instructions: any;
  focused_num: number;
  selected?: Array<string>;
}

export interface WhitelistUser {
  id: string;
  lang: string;
}

export interface WhitelistPreferences {
  admin: WhitelistUser;
  moderators: Array<WhitelistUser>;
  whitelist: Array<WhitelistUser>;
}

export interface MissionPreferences {
  ignore_missions: number;
  mission_count: number;
}

export interface PlacementPreferences {
  operator_priority: string;
  epic_position: string;
  show_movements: boolean;
}

export interface DisplayPreferences {
  clan_flag: number;
  clan_color: number;
  custom_message: string;
  output_languages: Array<string>;
  output_format: string;
  message_reaction: string;
  embed_thumbnail: string;
  enforce_placements: string;
}

export interface AutomatePreferences {
  automate_placements: boolean;
  automate_server: string;
  automate_channel: string;
  mission_threshold: number;
  eta_threshold: number;
}

export interface Analytics {
  generate_calls: number;
  clan_calls: number;
  player_calls: number;
}

export interface LinkedRole {
  r_id: Array<string>; //discord id of role
  cl_id: string; //tacticool id of clan
  cl_name: string; //tacticool name of clan
  nickname?: string; //discord nickname format
  online_r_id?: string; //discord id of role if online
  zero_points_r_id?: string; //discord id of role if no progress points
}

export interface AWSUser {
  //AWS users (for now) are players in top 300 clans, but histories are only displayed to users in premium clans
  pl_id?: string; //private tacticool id
  cp_h?: Array<number>; //mission point history for last X cycles
  cp_c?: Array<number>; //mission point history for current cycle (by minute?) (PREMIUM ONLY)
  md_h?: Array<number>; //medal history for last X weeks,
  ev_c?: number; //Event currency
}

export interface calculatedAWSStats {
  avg_cp?: number; //moving x-cycle average mission points
  avg_md?: number; //moving y-week average clan medals
}

export interface SocketData {
  name: string;
  age: number;
}

export interface ServerToClientEvents {
  //noArg: () => void;
  //basicEmit: (a: number, b: string, c: Buffer) => void;
  //withAck: (d: string, callback: (e: number) => void) => void;
  fromUserId: (d: WSResponse) => void;
  fetch_entitlement_response: (d: WSResponse) => void;
  //link_icon : (d: WSResponse) => void;
  link_status: (d: WSResponse) => void;
  link_get: (d: WSResponse) => void;
  linked_server_members: (d: WSResponse) => void;
  role_update: (d: WSResponse) => void;
  nickname_update: (d: WSResponse) => void;

  metrics_preview: (d: WSResponse) => void;
  metrics_update: (d: WSResponse) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  fromUserId: (d: FromUserId) => Promise<WSResponse>;
  fetch_entitlement: (d: FromUserId) => Promise<WSResponse>;
  link_start: (d: LinkStart) => void;
  link_get: (d: FromUserId) => Promise<WSResponse>;
  link_cancel: (d: string) => void;
  linked_server_members_response: (d: {
    guilds: any;
    uniq: Array<string>;
  }) => void;
  fetch_metrics_preview: (d: FetchMetricsPreview) => void;
  fetch_metrics: (d: FetchMetrics) => void;
  admin_create: (d: AdminCreate) => void;
  admin_link: (d: AdminLink) => void;
  admin_refresh: () => void;
  admin_restart: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export class ClanData {
  constructor(
    public clanID?: string,
    public country?: string,
    public name?: string,
    public tag?: string,
    public tagColor?: number,
    public iconID?: number,
    public flagID?: number,
    public isPrivate?: boolean,
    public minRating?: number,
    public message?: string,
    public capacity?: number,
    public memberCount?: number,
    public onlineCount?: number,
    public avgRating?: number,
    public clanmateCount?: number
  ) {}
}

export class PlayerData {
  constructor(
    public publicID?: string,
    public playerID?: string,
    public countryCode?: string,
    public level?: number,
    public name?: string,
    public rating?: number,
    public avatarId?: number,
    public avgMissionPoints?: string,
    public avgClanPoints?: string,
    public missionPointHistory?: Array<number>,
    public clanPointHistory?: Array<number>,
    public clanRole?: string,
    public killData?: PlayerKills,
    public matches?: number,
    public timePlayed?: string,
    public winRate?: string,
    public avgGamesPerWeek?: string,
    public killsPerGame?: string
  ) {}
}

export class PlayerKills {
  constructor(
    public kills?: number,
    public assists?: number,
    public kdr?: string,
    public smg?: number,
    public shotgun?: number,
    public assault?: number,
    public sniper?: number,
    public machinegun?: number,
    public prototypes?: number,
    public vehicle?: number,
    public explosive?: number,
    public physics?: number,
    public melee?: number,
    public primary?: number,
    public secondary?: number
  ) {}
}

export class PresetData {
  constructor(
    public heroName?: string,
    public heroType?: string,
    public heroLevel?: string,
    public heroSkin?: string,
    public heroSkinId?: string,
    public heroSkinType?: string,
    public talentIds?: number[],

    public special1Name?: string,
    public special1Level?: string,

    public special2Name?: string,
    public special2Level?: string,

    public primaryName?: string,
    public primarySkinName?: string,
    public primarySkinId?: string,
    public primarySkinType?: string,
    public primaryLevel?: string,
    public primaryModules?: number[],
    public primaryCollectible?: string,

    public secondaryName?: string,
    public secondarySkinName?: string,
    public secondarySkinId?: string,
    public secondarySkinType?: string,
    public secondaryLevel?: string,
    public secondaryModules?: number[],
    public secondaryCollectible?: string
  ) {}
}

export class WeeklyOnlineData {
  constructor(
    public day?: number,
    public hour?: number,
    public gamesPlayed?: number
  ) {}
}

export class UserData {
  constructor(
    public userId?: string,
    public player?: PlayerData,
    public clan?: ClanData | {},
    public presets?: PresetData[],
    public weekly_online?: WeeklyOnlineData[]
  ) {}
}

export interface AxiosFilteredResponse {
  status?: number;
  data?: any;
}

export interface FromUserId {
  userId: string;
  interactionId: string;
}

export interface AdminCreate {
  interactionId: string;
  callName: string;
  adminId: string;
  clanId: string;
}

export interface AdminLink {
  interactionId: string;
  _id: string;
  pl_id: string;
  pu_id: string;
}

export interface LinkStart {
  userId: string;
  publicId: string;
  interactionId: string;
}

export interface LinkStatus {
  status: string;
  data: any;
}

export interface PendingLinkData {
  expectedAvatar: number;
  userId: string;
  interactionId: string;
  publicId: string;
  socket: any;
}

export interface FetchMetricsPreview {
  interactionId: string;
  clanId: string;
  metricType: string;
}

export interface FetchMetrics {
  guildId: string;
  channelId: string;
  messageId: string;
  clanId: string;
  metricType: string;
  identifier: string;
}

interface MetricType {
  guildId?: string;
  metricType: string;
  tag: string;
  name: string;
  tagColor: number;
}

export interface MissionPercentageMetric extends MetricType {
  mCount: number;
  mPct: number;
  pPoints: number;
  pRequired: number;
  timeLeft: number;
  avg: string;
  bestPlayer: {
    progressPoints: number;
    name: string;
  };
  worstPlayer: {
    progressPoints: number;
    name: string;
  };
}

export interface PlayerMissionPointMetric extends MetricType {
  players: Array<PlayerMissionPointData>;
}
interface PlayerMissionPointData {
  name: string;
  pl_id: string;
  mPoints: number | string;
  _id?: string;
}

export interface PlayerOnlineMetric extends MetricType {
  players: Array<PlayerMissionPointData>;
}
interface PlayerOnlineData {
  name: string;
  online: boolean;
  _id?: string;
}

export interface WSResponse {
  interactionId?: string;
  guildId?: string;
  channelId?: string;
  messageId?: string;
  identifier?: string;
  data: any;
  delete?: boolean;
}

export interface MetricUpdateFileData {
  clanId: string;
  identifier: string;
  guildId: string;
  channelId: string;
  messageId: string;
  metricType: string;
  callName: string;
}

export interface Entitlement {
  _id: string;
  discordId: string;
  unlimited: boolean;
  expires: Date;
  entitlementId: string;
  serverId: string;
  callNames: Array<string>;
  purchasedClans: number;
  provider: string;
}

export interface AggregatedEntitlement {
  discordId: string;
  userClanId: string;
  maxServerCount: number;
  servers: Array<MongoDBServer>;
  providers: Array<string>;
  clans: Array<MongoDBClan>;
  maxClanCount: number;
  expires: number;
}
