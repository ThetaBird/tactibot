const { getSelect } = require("../../../DeliveryUtil");

const _HelpSelect = (locale, main = false) => {
  const home = main
    ? []
    : [{ label: "Home", description: "Back to Main Page", value: "main" }];
  return getSelect({
    customId: "help_select",
    placeholder: "Select Topic", //[locale]
    options: [
      ...home,
      {
        label: "/link",
        description: "Discord Tacticool Integration",
        value: "link",
      },
      {
        label: "/generate",
        description: "Operator Placements & Movements",
        value: "missions",
      },
      { label: "/view", description: "Performance Metrics", value: "metrics" },
      //{label:"TactiEvents", description:"" ,value:"okay_value2"},
      {
        label: "Premium Commands",
        description: "Exclusive Functionality",
        value: "premium",
        emoji: "⭐",
      },
    ],
  });
};

module.exports = {
  _HelpSelect,
};
