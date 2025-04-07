const {
  Client,
  BaseInteraction,
  InteractionType,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} = require("discord.js");

const { ViewCommand } = require("./Commands/View/ViewCommand");
const { LinkCommand } = require("./Commands/Link/LinkCommand");
const {
  LinkBeginButton,
} = require("./Commands/Link/Components/LinkBeginButton");
const { LinkModal } = require("./Commands/Link/Components/LinkModal");
const {
  LinkCancelButton,
} = require("./Commands/Link/Components/LinkCancelButton");
const { LinkPinButton } = require("./Commands/Link/Components/LinkPinButton");
const { GenCommand } = require("./Commands/Generate/GenCommand");
const { GenAutocomplete } = require("./Commands/Generate/GenAutocomplete");
const { HelpCommand } = require("./Commands/Help/HelpCommand");
const { HelpSelect } = require("./Commands/Help/Components/HelpSelect");
const {
  EntitlementCommand,
} = require("./Commands/Entitlement/EntitlementCommand");
const {
  EntitlementServerButton,
} = require("./Commands/Entitlement/Components/EntitlementServerButton");
const {
  EntitlementDashboardButton,
} = require("./Commands/Entitlement/Components/EntitlementDashboardButton");
const {
  EntitlementRolesButton,
} = require("./Commands/Entitlement/Components/EntitlementRolesButton");
const {
  EntitlementRolesClanSelect,
} = require("./Commands/Entitlement/Components/EntitlementRolesClanSelect");
const {
  EntitlementRolesCategorySelect,
} = require("./Commands/Entitlement/Components/EntitlementRolesCategorySelect");
const {
  EntitlementRolesSelect,
} = require("./Commands/Entitlement/Components/EntitlementMemberRolesSelect");
const {
  EntitlementNewClanModalButton,
} = require("./Commands/Entitlement/Components/EntitlementNewClanModalButton");
const {
  EntitlementNewClanModal,
} = require("./Commands/Entitlement/Components/EntitlementNewClanModal");
const {
  EntitlementCommandButton,
} = require("./Commands/Entitlement/Components/EntitlementCommandButton");
const {
  EntitlementManageCommandSelect,
} = require("./Commands/Entitlement/Components/EntitlementManageCommandSelect");
const {
  EntitlementToggleCommandButton,
} = require("./Commands/Entitlement/Components/EntitlementToggleCommandButton");
const {
  EntitlementEditCallnameModalButton,
} = require("./Commands/Entitlement/Components/EntitlementEditCallnameModalButton");
const {
  EntitlementNewCommandModalButton,
} = require("./Commands/Entitlement/Components/EntitlementNewCommandModalButton");
const { PremiumCommand } = require("./Commands/Premium/PremiumCommand");
const {
  PremiumCommandButton,
} = require("./Commands/Premium/Components/PremiumCommandButton");
const {
  PlacementsButton,
} = require("./Commands/Premium/Components/PlacementsButton");
const {
  MetricsButton,
} = require("./Commands/Premium/Components/MetricsButton");
const {
  SettingsButton,
} = require("./Commands/Premium/Components/SettingsButton");
const {
  SettingsClanButton,
} = require("./Commands/Premium/Components/SettingsClanButton");
const {
  SettingsWhitelistButton,
} = require("./Commands/Premium/Components/SettingsWhitelistButton");
const {
  SettingsPreferencesButton,
} = require("./Commands/Premium/Components/SettingsPreferencesButton");
const {
  SettingsDisplayButton,
} = require("./Commands/Premium/Components/SettingsDisplayButton");
const {
  MetricsSelect,
} = require("./Commands/Premium/Components/MetricsSelect");
const {
  MetricsPinButton,
} = require("./Commands/Premium/Components/MetricsPinButton");
const {
  PlacementsActiveMissionButton,
} = require("./Commands/Premium/Components/PlacementsActiveMissionButton");
const {
  PlacementsMissionSelect,
} = require("./Commands/Premium/Components/PlacementsMissionSelect");
const {
  PlacementsConfirmMissionsButton,
} = require("./Commands/Premium/Components/PlacementsConfirmMissionsButton");
const { SocketActionManager } = require("./Socket/SocketActionManager");
const {
  SettingsWhitelistUserSelect,
} = require("./Commands/Premium/Components/SettingsWhitelistUserSelect");
const {
  SettingsEditButton,
} = require("./Commands/Premium/Components/SettingsEditButton");
const {
  SettingsEditPreferencesModal,
} = require("./Commands/Premium/Components/SettingsEditPreferencesModal");
const {
  SettingsEditDisplayModal,
} = require("./Commands/Premium/Components/SettingsEditDisplayModal");
const { logInteraction } = require("./Log");
const {
  EntitlementActivateServerButton,
} = require("./Commands/Entitlement/Components/EntitlementActivateServerButton");
const {
  EntitlementNewCommandModal,
} = require("./Commands/Entitlement/Components/EntitlementNewCommandModal");
const { ViewButton } = require("./Commands/View/Components/ViewButton");

class Logic {
  /**
   * Creates an instance of Logic.
   * @date 1/2/2024 - 9:53:46 PM
   *
   * @constructor
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Process Interaction
   * @date 1/2/2024 - 9:39:16 PM
   *
   * @param {BaseInteraction} interaction
   * @returns
   */
  processInteraction = async (interaction) => {
    const { type } = interaction;
    switch (type) {
      case InteractionType.ApplicationCommand:
        return this.processApplicationCommand(interaction);
      case InteractionType.MessageComponent:
        return this.processMessageComponent(interaction);
      case InteractionType.ModalSubmit:
        return this.processModalSubmit(interaction);
      case InteractionType.ApplicationCommandAutocomplete:
        return this.processApplicationCommandAutocomplete(interaction);
    }
  };

  /**
   * Process ChatInputCommandInteraction
   * @date 1/2/2024 - 9:57:34 PM
   *
   * @async
   * @param {ChatInputCommandInteraction} interaction
   * @returns {*}
   */
  processApplicationCommand = async (interaction) => {
    const { commandName, options } = interaction;

    const logContent = {
      type: "COMMAND",
      identifier: commandName,
      options: options?.data?.map((obj) => `${obj.name}:${obj.value}`),
      interaction,
    };
    try {
      logInteraction(this.client, logContent);
    } catch (error) {
      console.error(error);
    }

    switch (commandName) {
      case "link": //Link user
        return new LinkCommand(this.client, interaction).process();
      case "view": //View linked user
        return new ViewCommand(this.client, interaction).process();
      case "help": //Help dashboard
        return new HelpCommand(this.client, interaction).process();
      case "premium": //Manage premium settings
        return new EntitlementCommand(this.client, interaction).process();
      case "generate": //Create free placements
        return new GenCommand(this.client, interaction).process();
      default: //Premium custom command
        return new PremiumCommand(this.client, interaction).process();
    }
  };

  /**
   * Process MessageComponentInteraction
   * @date 1/2/2024 - 9:57:34 PM
   *
   * @async
   * @param {MessageComponentInteraction} interaction
   * @returns {*}
   */
  processMessageComponent = async (interaction) => {
    const _ = [this.client, interaction];
    const { customId, values } = interaction;
    const component = customId.split("_");
    const [commandName, action, id] = component;

    const logContent = {
      type: "COMPONENT",
      identifier: commandName,
      action: action + (id ? `_${id}` : ""),
      values,
      interaction,
    };
    try {
      logInteraction(this.client, logContent);
    } catch (error) {
      console.error(error);
    }

    switch (commandName) {
      case "view":
        switch (action) {
          case "presets":
            return new ViewButton(..._).process(id, true);
          case "main":
            return new ViewButton(..._).process(id);
          default:
            throw new Error("Invalid View Component Action: " + action);
        }
      case "link":
        switch (action) {
          case "begin":
            return new LinkBeginButton(..._).process();
          case "fromview":
            return new LinkBeginButton(..._).process(true);
          case "cancel":
            return new LinkCancelButton(..._).process();
          case "pin":
            return new LinkPinButton(..._).process();
          default:
            throw new Error("Invalid Link Component Action: " + action);
        }

      case "help":
        switch (action) {
          case "select":
            return new HelpSelect(..._).process();
          default:
            throw new Error("Invalid Help Component Action: " + action);
        }

      case "entitlement":
        switch (action) {
          case "viewserver":
            return new EntitlementServerButton(..._).process();
          case "dashboard":
            return new EntitlementDashboardButton(..._).process();
          case "manageroles":
            return new EntitlementRolesButton(..._).process();
          case "roleclanselect":
            return new EntitlementRolesClanSelect(..._).process();
          case "rolecategoryselect":
            return new EntitlementRolesCategorySelect(..._).process(id);
          case "memberroleselect":
            return new EntitlementRolesSelect(..._).process(id, "r_id");
          case "onlineroleselect":
            return new EntitlementRolesSelect(..._).process(id, "online_r_id");
          case "nopointsroleselect":
            return new EntitlementRolesSelect(..._).process(
              id,
              "zero_points_r_id"
            );
          case "shownewclanmodal":
            return new EntitlementNewClanModalButton(..._).process();
          case "viewcommands":
            return new EntitlementCommandButton(..._).process();
          case "managecommand":
            return new EntitlementManageCommandSelect(..._).process();
          case "togglecommand":
            return new EntitlementToggleCommandButton(..._).process(id);
          case "showeditcommand":
            return new EntitlementEditCallnameModalButton(..._).process(id);
          case "shownewcommand":
            return new EntitlementNewCommandModalButton(..._).process();
          case "activateserver":
            return new EntitlementActivateServerButton(..._).process();
          default:
            throw new Error("Invalid Entitlement Component Action: " + action);
        }

      case "premium":
        switch (action) {
          case "dashboard":
            return new PremiumCommandButton(..._).process();
          case "dashboardplacements":
            return new PlacementsButton(..._).process();
          case "dashboardmetrics":
            return new MetricsButton(..._).process();
          case "dashboardsettings":
            return new SettingsButton(..._).process();

          case "placementsconfirm":
            return new PlacementsConfirmMissionsButton(..._).process();
          case "repositionsconfirm":
            return new PlacementsConfirmMissionsButton(..._).process(true);
          case "placementsactivemission":
            return new PlacementsActiveMissionButton(..._).process(id);
          case "placementsmissionselect":
            return new PlacementsMissionSelect(..._).process();
          case "placementscompletedselect":
            return new PlacementsMissionSelect(..._).process(true);

          case "metricsselect":
            return new MetricsSelect(..._).process();
          case "metricpin":
            return new MetricsPinButton(..._).process(id);

          case "settingsclan":
            return new SettingsClanButton(..._).process();
          case "settingswhitelist":
            return new SettingsWhitelistButton(..._).process();
          case "settingspreferences":
            return new SettingsPreferencesButton(..._).process();
          case "settingsdisplay":
            return new SettingsDisplayButton(..._).process();

          case "settingsedit": //id contains display/preferences
            return new SettingsEditButton(..._).process(id);
          case "settingswhitelistedit": //id contains managers/members
            return new SettingsWhitelistButton(..._).process(id);
          case "settingswhitelistuserselect":
            return new SettingsWhitelistUserSelect(..._).process(id);

          default:
            throw new Error("Invalid Premium Component Action: " + action);
        }

      default:
        throw new Error("Invalid Component CommandName");
    }
  };

  /**
   * Process ModalSubmit
   * @date 1/2/2024 - 9:57:34 PM
   *
   * @async
   * @param {ModalSubmitInteraction} interaction
   * @returns {*}
   */
  processModalSubmit = async (interaction) => {
    const _ = [this.client, interaction];
    const { customId, fields } = interaction;
    const modal = customId.split("_");
    const [commandName, action, id] = modal;

    const logContent = {
      type: "MODAL",
      identifier: commandName,
      decipheredFields: fields.fields.values(),
      interaction,
    };
    try {
      logInteraction(this.client, logContent);
    } catch (error) {
      console.error(error);
    }

    switch (commandName) {
      case "link":
        switch (action) {
          case "modal":
            return new LinkModal(..._).process(id); //id contains "fromview" or nothing
          default:
            throw new Error("Invalid Modal Action");
        }
      case "entitlement":
        switch (action) {
          case "addnewclan": //server role linked to a clan
            return new EntitlementNewClanModal(..._).process();
          case "newcommand":
            return new EntitlementNewCommandModal(..._).process();
          case "editcommand": //use id in process

          default:
            throw new Error("Invalid Modal Action");
        }
      case "settings":
        switch (action) {
          case "editpreferences":
            return new SettingsEditPreferencesModal(..._).process();
          case "editdisplay":
            return new SettingsEditDisplayModal(..._).process();
          default:
            throw new Error("Invalid Modal Action: " + action);
        }
      default:
        throw new Error("Invalid Modal CommandName");
    }
  };

  /**
   * Process ApplicationCommandAutocomplete
   * @date 1/2/2024 - 9:57:34 PM
   *
   * @async
   * @param {ApplicationCommandAutocomplete} interaction
   * @returns {*}
   */
  processApplicationCommandAutocomplete = async (interaction) => {
    const { commandName } = interaction;
    switch (commandName) {
      case "generate":
        return new GenAutocomplete(this.client, interaction).process();
      default:
        throw new Error("Invalid Autocomplete CommandName");
    }
  };

  processSocket = (eventName, args) => {
    //console.log({eventName, args})
    switch (eventName) {
      case "role_update":
        return SocketActionManager.role_update(this.client, args);
      case "nickname_update":
        return SocketActionManager.nickname_update(this.client, args);
      case "linked_server_members":
        return SocketActionManager.linked_server_members(this.client, args);
      case "metrics_update":
        return SocketActionManager.metrics_update(this.client, args);
      //const action = new SocketActionManager(eventName, args, this.client);
      //return action.process();

      default:
        throw { name: "Invalid socket eventName" };
    }
  };
}

module.exports = { Logic };
