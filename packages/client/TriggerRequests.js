const axios = require("axios");

const upsertEntitlement = (
  discordId,
  purchasedClans,
  provider,
  guildId,
  entitlementId
) => {
  axios({
    method: "post",
    url: `${process.env.BACKEND_URL}/entitlement`,
    timeout: 3000,
    data: {
      discordId,
      purchasedClans,
      provider,
      guildId,
      entitlementId,
    },
  });
};

module.exports = {
  upsertEntitlement,
};
