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

const TactiClanTemplate = () => {
  return { ...tactiClan };
};

export default TactiClanTemplate;
