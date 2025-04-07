const {
  getSelect,
  Emoji,
  getButton,
  getModal,
  getRoleSelect,
  getRow,
  getShortTextInput,
  supportContactShort,
} = require("../../../DeliveryUtil");

const _EntitlementDashboardButton = (locale) =>
  getButton({
    customId: "entitlement_dashboard",
    label: `Back`, //[locale]
    style: "Secondary",
    emoji: Emoji.backButton,
  });

const _EntitlementServerButton = (locale, back = false) =>
  getButton({
    customId: "entitlement_viewserver",
    label: back ? "\u200B" : `Servers`, //[locale]
    style: "Secondary",
    emoji: back ? Emoji.backButton : Emoji.link,
  });

const _EntitlementActivateServerButton = (locale) =>
  getButton({
    customId: "entitlement_activateserver",
    label: `Activate`, //[locale]
    style: "Primary",
    emoji: Emoji.link,
  });

const _EntitlementManageRolesButton = (locale, back) =>
  getButton({
    customId: "entitlement_manageroles",
    label: back ? "\u200B" : `Roles`, //[locale]
    style: back ? "Secondary" : "Primary",
    emoji: back ? Emoji.backButton : Emoji.link,
  });

const _EntitlementClansButton = (locale, back) =>
  getButton({
    customId: "entitlement_viewcommands",
    label: back ? "\u200B" : `Commands`, //[locale]
    style: "Secondary",
    emoji: back ? Emoji.backButton : Emoji.link,
  });

const _EntitlementRolesClanSelect = (locale, options) => {
  return getSelect({
    customId: "entitlement_roleclanselect",
    placeholder: "Select Clan", //[locale]
    options: [
      ...options,
      {
        label: "New",
        description: "Link roles to a clan not in the list.",
        value: "new",
      },
    ],
  });
};

const _EntitlementTSLinkButton = (locale, cl_id) =>
  getButton({
    //customId:"entitlement_tactistats",
    label: `TactiStats`, //[locale]
    style: "Link",
    url: cl_id
      ? `https://stats.tacticool.game/#clan/${cl_id}`
      : `https://stats.tacticool.game`,
    //emoji:Emoji.link
  });

const _EntitlementRoleCategorySelect = (locale, cl_id) => {
  return getSelect({
    customId: `entitlement_rolecategoryselect_${cl_id}`,
    placeholder: "Role Category", //[locale]
    options: [
      {
        label: "Member",
        description: "Roles given to clan members.",
        value: "r_id",
      },
      {
        label: "Online",
        description: "Roles given to online clan members.",
        value: "online_r_id",
      },
      {
        label: "No Points",
        description: "Roles given to clan members with no mission stars.",
        value: "zero_points_r_id",
      },
    ],
  });
};

const _EntitlementMemberRoleSelect = (locale, cl_id, target, defaultRoles) => {
  switch (target) {
    case "r_id":
      return getRoleSelect({
        customId: `entitlement_memberroleselect_${cl_id}`,
        placeholder: "Roles: Member", //[locale]
        min: 0,
        max: 5,
        defaultRoles,
      });
    case "online_r_id":
      return getRoleSelect({
        customId: `entitlement_onlineroleselect_${cl_id}`,
        placeholder: "Role: Online", //[locale]
        min: 0,
        defaultRoles,
      });
    case "zero_points_r_id":
      return getRoleSelect({
        customId: `entitlement_nopointsroleselect_${cl_id}`,
        placeholder: "Role: No Points", //[locale]
        min: 0,
        defaultRoles,
      });
  }
};

const _EntitlementRolesNewClanModalButton = (locale, options) => {
  return getButton({
    customId: "entitlement_shownewclanmodal",
    label: `Submit`, //[locale]
    style: "Primary",
    emoji: Emoji.link,
  });
};

const _EntitlementNewClanModal_ClanURLField = (locale, clanId) =>
  getShortTextInput({
    customId: "entitlement_newclanURL",
    label: "TactiStats URL", //[locale]
    max: 80,
    min: 59,
    required: true,
    placeholder: `https://stats.tacticool.game/#clan/${clanId}`, //[locale]
  });

const _EntitlementNewClanModal = (locale, clanId) =>
  getModal({
    customId: `entitlement_addnewclan`,
    title: "Link Clan Roles", //[locale]
    components: getRow([_EntitlementNewClanModal_ClanURLField(locale, clanId)]),
  });

const _EntitlementManageCommandSelect = (locale, options, addClan) => {
  const o = options;
  if (addClan)
    o.push({ label: "New", description: "Activate a new clan.", value: "new" });
  return getSelect({
    customId: "entitlement_managecommand",
    placeholder: "Manage Command", //[locale]
    options: o,
  });
};

const _EntitlementNewCommandErrorBackButton = (locale) => {
  return getButton({
    customId: `entitlement_managecommand`,
    label: `\u200B`, //[locale]
    style: "Secondary",
    emoji: Emoji.backButton,
  });
};

const _EntitlementToggleCommandButton = (locale, tactiClanId) => {
  return getButton({
    customId: `entitlement_togglecommand_${tactiClanId}`,
    label: `Toggle`, //[locale]
    style: "Primary",
    emoji: Emoji.link,
  });
};

const _EntitlementEditCommandButton = (locale, tactiClanId) => {
  return getButton({
    customId: `entitlement_showeditcommand_${tactiClanId}`,
    label: `Edit`, //[locale]
    style: "Primary",
    emoji: Emoji.editButton,
    disabled: true,
  });
};

const _EntitlementRolesNewCommandButton = (locale) => {
  return getButton({
    customId: "entitlement_shownewcommand",
    label: `Submit`, //[locale]
    style: "Primary",
    emoji: Emoji.link,
  });
};

const _EntitlementEditCommandModal_ClanURLField = (locale, clanId) =>
  getShortTextInput({
    customId: "entitlement_editclanURL",
    label: "TactiStats URL", //[locale]
    max: 80,
    min: 59,
    required: true,
    placeholder: `https://stats.tacticool.game/#clan/${clanId}`,
    value: `https://stats.tacticool.game/#clan/${clanId}`,
  });

const _EntitlementEditCommandModal_CallName = (locale) =>
  getShortTextInput({
    customId: "entitlement_editcallname",
    label: "Command Name", //[locale]
    max: 1,
    min: 0,
    required: false,
    placeholder: `Contact ${supportContactShort}`, //[locale]
    //value:`https://stats.tacticool.game/#clan/${clanId}`,
  });

const _EntitlementEditCommandModal = (locale, clanId) =>
  getModal({
    customId: `entitlement_editcommand_${clanId}`,
    title: "Edit Command", //[locale]
    components: [
      getRow(_EntitlementEditCommandModal_CallName(locale)),
      getRow(_EntitlementEditCommandModal_ClanURLField(locale, clanId)),
    ],
  });

const _EntitlementNewCommandModal_ClanURLField = (locale, clanId) =>
  getShortTextInput({
    customId: "entitlement_newclanURL",
    label: "TactiStats URL", //[locale]
    max: 80,
    min: 59,
    required: true,
    placeholder: `https://stats.tacticool.game/#clan/${clanId}`,
  });

const _EntitlementNewCommandModal_CallName = (locale) =>
  getShortTextInput({
    customId: "entitlement_newcallname",
    label: "Command Name", //[locale]
    max: 6,
    min: 1,
    required: true,
    placeholder: "Example: /clan",
  });

const _EntitlementNewCommandModal = (locale, clanId) =>
  getModal({
    customId: `entitlement_newcommand`,
    title: "New Command", //[locale]
    components: [
      getRow(_EntitlementNewCommandModal_CallName(locale)),
      getRow(_EntitlementNewCommandModal_ClanURLField(locale, clanId)),
    ],
  });

module.exports = {
  _EntitlementDashboardButton,
  _EntitlementServerButton,
  _EntitlementActivateServerButton,
  _EntitlementManageRolesButton,
  _EntitlementRoleCategorySelect,
  _EntitlementTSLinkButton,
  _EntitlementRolesNewClanModalButton,
  _EntitlementClansButton,
  _EntitlementRolesClanSelect,
  _EntitlementMemberRoleSelect,
  _EntitlementNewClanModal_ClanURLField,
  _EntitlementNewClanModal,
  _EntitlementManageCommandSelect,
  _EntitlementNewCommandErrorBackButton,
  _EntitlementToggleCommandButton,
  _EntitlementEditCommandButton,
  _EntitlementEditCommandModal,
  _EntitlementRolesNewCommandButton,
  _EntitlementNewCommandModal,
};
