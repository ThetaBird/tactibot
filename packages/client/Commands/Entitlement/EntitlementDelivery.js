const { getRow, getErrorEmbed } = require("../../DeliveryUtil");
const {
  _EntitlementServerButton,
  _EntitlementClansButton,
  _EntitlementDashboardButton,
  _EntitlementActivateServerButton,
  _EntitlementManageRolesButton,
  _EntitlementRolesClanSelect,
  _EntitlementTSLinkButton,
  _EntitlementRolesNewClanModalButton,
  _EntitlementRoleCategorySelect,
  _EntitlementMemberRoleSelect,
  _EntitlementManageCommandSelect,
  _EntitlementToggleCommandButton,
  _EntitlementEditCommandButton,
  _EntitlementRolesNewCommandButton,
  _EntitlementNewCommandErrorBackButton,
} = require("./Components/_EntitlementComponentDetails");
const {
  subscriptionEmbed,
  noSubscriptionEmbed,
  serverEmbed,
  newClanRoleEmbed,
  manageClanRolesEmbed,
  commandEmbed,
  newCommandErrorEmbed,
} = require("./EntitlementEmbeds");

const createEntitlementDashboard = async (locale, data, client) => {
  const { discordId } = data || {};
  return {
    initial: {
      ephemeral: true,
      embeds: [
        discordId
          ? await subscriptionEmbed(locale, data, client)
          : noSubscriptionEmbed(locale),
      ],
      components: discordId
        ? [
            getRow([
              _EntitlementServerButton(locale),
              _EntitlementClansButton(locale),
            ]),
          ]
        : [],
      files: [],
    },
  };
};

const createEntitlementServerMenu = async (
  locale,
  data,
  client,
  editing = false
) => {
  const { maxServerCount, servers, guildId } = data;
  const availableSlots = maxServerCount - servers.length;
  const foundServer = servers.find((server) => server._id === guildId);
  const addServer = availableSlots > 0 && !foundServer;

  let components;
  if (editing) {
    //editing roles
    const clanOptions = foundServer.linkedRoles?.map((role) => ({
      label: role.cl_name,
      value: role.cl_id,
    }));

    const button = [_EntitlementServerButton(locale, true)];
    const select = [_EntitlementRolesClanSelect(locale, clanOptions)];

    components = [getRow(select), getRow(button)];
  } else {
    const buttons = [_EntitlementDashboardButton(locale)];
    if (addServer) buttons.push(_EntitlementActivateServerButton(locale));
    else if (foundServer) buttons.push(_EntitlementManageRolesButton(locale));
    components = [getRow(buttons)];
  }

  return {
    initial: {
      ephemeral: true,
      embeds: [await serverEmbed(locale, data, client, editing)],
      components,
      files: [],
    },
  };
};

const createEntitlementServerRoleClanMenu = async (locale, data, clanId) => {
  const { userClanId } = data;

  const backButton = _EntitlementManageRolesButton(locale, true);
  const components = [];
  if (clanId == "new") {
    const buttons = [
      backButton,
      _EntitlementTSLinkButton(locale, userClanId),
      _EntitlementRolesNewClanModalButton(locale),
    ];
    components.push(getRow(buttons));
  } else {
    const buttons = [backButton];
    components.push(
      getRow([_EntitlementRoleCategorySelect(locale, clanId)]),
      getRow(buttons)
    );
  }

  return {
    initial: {
      ephemeral: true,
      embeds: [
        clanId == "new"
          ? newClanRoleEmbed(locale)
          : manageClanRolesEmbed(locale, data, clanId),
      ],
      components,
      files: [],
    },
  };
};

const createEntitlementManageRolesMenu = async (
  locale,
  data,
  clanId,
  target
) => {
  const { guildId, servers } = data;
  const foundServer = servers.find((s) => s._id == guildId);

  const foundClan = foundServer.linkedRoles.find((r) => r.cl_id == clanId);
  if (!foundClan)
    return {
      initial: {
        ephemeral: true,
        embeds: [getErrorEmbed()],
        components,
        files: [],
      },
    };

  const backButton = getRow([_EntitlementManageRolesButton(locale, true)]);
  const select = getRow([
    _EntitlementMemberRoleSelect(locale, clanId, target, foundClan[target]),
  ]);
  const components = [select, backButton];

  return {
    initial: {
      ephemeral: true,
      embeds: [manageClanRolesEmbed(locale, data, clanId)],
      components,
      files: [],
    },
  };
};

const createEntitlementCommandMenu = async (locale, data, client) => {
  const { maxClanCount, clans, guildId } = data;
  const availableSlots = maxClanCount - clans.length;
  const addClan = availableSlots > 0;
  const options = clans.map((clan) => {
    const { clanData, _id } = clan;
    const { call_name, clan_tag, clan_name } = clanData;
    return {
      label: `/${call_name}`,
      description: `[${clan_tag}] ${clan_name}`,
      value: _id,
    };
  });

  const select = [_EntitlementManageCommandSelect(locale, options, addClan)];
  const buttons = [_EntitlementDashboardButton(locale)];

  return {
    initial: {
      ephemeral: true,
      embeds: [await commandEmbed(locale, data, client)],
      components: [getRow(select), getRow(buttons)],
      files: [],
    },
  };
};

const createEntitlementManageCommandMenu = async (locale, data, client) => {
  const { tactiClanId, userClanId } = data;
  const buttons =
    tactiClanId == "new" || !tactiClanId
      ? [
          _EntitlementClansButton(locale, true),
          _EntitlementTSLinkButton(locale, userClanId),
          _EntitlementRolesNewCommandButton(locale),
        ]
      : [
          _EntitlementClansButton(locale, true),
          _EntitlementToggleCommandButton(locale, tactiClanId),
          _EntitlementEditCommandButton(locale, tactiClanId),
        ];

  return {
    initial: {
      ephemeral: true,
      embeds: [await commandEmbed(locale, data, client)],
      components: [getRow(buttons)],
      files: [],
    },
  };
};

const createNewCommandErrorMenu = (locale, data) => {
  const { error } = data;
  const embed = newCommandErrorEmbed(locale, error);
  const button = _EntitlementNewCommandErrorBackButton(locale);
  return {
    initial: {
      ephemeral: true,
      embeds: [embed],
      components: [getRow(button)],
      files: [],
    },
  };
};

module.exports = {
  createEntitlementDashboard,
  createEntitlementServerMenu,
  createEntitlementServerRoleClanMenu,
  createEntitlementManageRolesMenu,
  createEntitlementCommandMenu,
  createEntitlementManageCommandMenu,
  createNewCommandErrorMenu,
};
