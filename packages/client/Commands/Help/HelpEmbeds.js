const {
  getSimpleEmbed,
  botAvatar,
  getDescriptionFromFields,
  supportContactFull,
} = require("../../DeliveryUtil");
const mainColor = "#fcf4ec";

const helpEmbed = (locale) => {
  const moreText = `
    > - [Add Tacti to your server](https://discord.com/api/oauth2/authorize?client_id=695821440167182386&permissions=8&scope=applications.commands%20bot)
    > - [Tacti Youtube](https://www.youtube.com/@tactigenerator425)
    > - [Support Server](https://discord.gg/6WdSg9H)
    > - [Subscribe to Premium (Discord)](https://discord.com/servers/tactigenerator-697219146169057301)
    > - [Subscribe to Premium (Patreon)](https://patreon.com/tactigenerator)
    `;
  const helpFields = [
    {
      name: "## ``` /link```",
      value: "> Link your Tacticool account with Discord.",
    },
    {
      name: "## ``` /generate```",
      value: "> Create & manage operator placements.",
    },
    {
      name: "## ``` /view```",
      value: "> View Tacticool profiles of linked users.",
    },
    {
      name: "## ``` Premium Commands```",
      value:
        "> Exclusive access to automated roles, clan metrics, advanced instructions, & more.",
    },
    { name: "## ``` More ```", value: moreText },
  ];

  const helpEmbedObj = {
    color: mainColor,
    title: "Help & Support",
    description: getDescriptionFromFields(helpFields),
    thumbnail: botAvatar,
  };

  return getSimpleEmbed(helpEmbedObj);
};

const helpLinkEmbed = (locale) => {
  const descriptionText = `> **/link** enables users to connect their Tacticool accounts to Discord.
    > Linking your Tacticool to Discord is required to view your stats. If your clan is a Tacti Premium user, then linking will also be helpful for clan leadership to automatically know who you are, assign roles, and know your play style, performance, and more.`;

  const processText = `> **Linking your account is a straightforward and quick process.**
    > 1. Run the </link:1109720221524185178> command.
    > 2. When ready to start the process, press the green \`Begin Link\` button.
    > 3. Input your Tacticool **Public ID** into the modal.
    > 4. Go into Tacticool and change your avatar to the one shown by the bot in Discord.
    > 5. Done! You can change your avatar back once the bot confirms the link completion.`;

  const suggestedText = `> **</view:1109722539682443306> Performance Metrics**`;

  const helpFields = [
    { name: "## /link", value: "" },
    { name: "### Description", value: descriptionText },
    { name: "### Process", value: processText },
    { name: "### Suggested Topics", value: suggestedText },
  ];

  const helpEmbedObj = {
    color: mainColor,
    title: "Help & Support • Link",
    description: getDescriptionFromFields(helpFields),
    thumbnail: botAvatar,
  };

  return getSimpleEmbed(helpEmbedObj);
};

const helpViewEmbed = (locale) => {
  const descriptionText = `> **/view** enables users to view a collection of Tacticool Metrics of linked users.
    > Available stats include but are not limited to: 
    > - Username, Avatar, & Country
    > - Level & Rating
    > - Clan Name, Tag, Country, & Icon
    > - KDR, Kills, Assists, Kills by Weapon Category
    > - Games Played, Win Rate, Days In-Game
    > - Average Mission Points / Cycle, Average Medals / Month`;

  const processText = `> **You can view the Tacticool Account of a linked user by doing the following:**
    > 1. Prepare the </view:1109722539682443306> command.
    > 2. In the required command option field, select the user you want to view.
    > 3. If the selected user is linked, their stats should display momentarily!`;

  const suggestedText = `>  **</link:1109720221524185178> Tacticool Account**
    > **⭐ Premium Commands**`;
  const helpFields = [
    { name: "## /view", value: "" },
    { name: "### Description", value: descriptionText },
    { name: "### Process", value: processText },
    { name: "### Suggested Topics", value: suggestedText },
  ];

  const helpEmbedObj = {
    color: mainColor,
    title: "Help & Support • View",
    description: getDescriptionFromFields(helpFields),
    thumbnail: botAvatar,
  };

  return getSimpleEmbed(helpEmbedObj);
};

const helpGenerateEmbed = (locale) => {
  const descriptionText = `> **/generate** enables users to create a list of optimal operator placements for a set of missions.
    > **Supported languages:**
    > - \`EN\` 🇺🇸 🇬🇧
    > - \`RU\` 🇷🇺
    > - \`FR\` 🇫🇷
    > - \`PL\` 🇵🇱
    > - \`DEU\` 🇩🇪
    > - \`IT\` 🇮🇹
    > - \`ES\` 🇪🇸
    > - \`PTB\` 🇧🇷
    > - \`PTP\` 🇵🇹
    > - \`TR\` 🇹🇷
    > - \`ID\` 🇮🇩
    > 
    > Operator movements (after each completed mission), alongside an entire suite of clan management tools, are available in Tacti Premium.`;

  const processText = `> **You can create operator placements by doing the following:**
    > 1. Prepare the </generate:937719863143694336> command.
    > 2. In the required \`input_lang\` field, select the language you want to use to view mission options.
    > 3. In the optional \`m1\`, \`m2\`, \`m3\`, \`m4\`, \`m5\`, \`m6\`, \`m7\`, & \`m8\` fields, select your missions.
    > 4. In the optional \`lang\` field, write the languages you want the instructions to be displayed in.
    > 5. In the optional \`format\` field, select the format you want the instructions to be displayed in.
    > 6. Confirm your selections and run the command!`;

  const suggestedText = `> **⭐ Premium Commands**`;
  const helpFields = [
    { name: "## /generate", value: "" },
    { name: "### Description", value: descriptionText },
    { name: "### Process", value: processText },
    { name: "### Suggested Topics", value: suggestedText },
  ];

  const helpEmbedObj = {
    color: mainColor,
    title: "Help & Support • Placements",
    description: getDescriptionFromFields(helpFields),
    thumbnail: botAvatar,
  };

  return getSimpleEmbed(helpEmbedObj);
};

const helpPremiumEmbed = (locale) => {
  const descriptionText = `> **Premium Commands** enable users to effectively merge their Tacticool Clan with Discord.
    > All premium functionality is bundled into one custom command tailored for your clan.
    > 
    > ### - [\`Subscribe to Premium (Discord)\`](https://discord.com/servers/tactigenerator-697219146169057301)
    > ### - [\`Subscribe to Premium (Patreon)\`](https://patreon.com/tactigenerator)
    `;

  const processText = `> **A method of automating premium setup is in development. For now, contact ${supportContactFull}** to receive your very own **\`/(your clan here)\`** command!\n\n`;

  const placementsText =
    "> Description for advanced placements coming soon! All you need to know for now is that it's a more powerful version of what's current available in **/generate**.";

  const metricsText =
    "> Unfortunately, [TactiStats](https://stats.tacticool.game) has been discontinued by its developer. While this issue is out of our hands, we are working with Panzerdog as much as we possibly can to get access to real-time player performance data to restore functionality.";

  const roleText =
    "> Tacti is able to automate the assignment of roles and nicknames to members in your server based on their clan status. Currently, this feature is temporarily disabled, as we are trying to move away from TactiStats for this information.";

  const suggestedText = `> **Tacti Premium** comes with priority developer support. Reach out to ${supportContactFull} for assistance.`;
  const helpFields = [
    { name: "## Tacti Premium", value: "" },
    { name: "### Description", value: descriptionText },
    { name: "### Setup", value: processText },
    { name: "## ``` Functionality```", value: "" },
    { name: "### Advanced Placements", value: placementsText },
    { name: "### Clan Metrics", value: metricsText },
    { name: "### Automated Roles & Nicknames", value: roleText },
    { name: "### Note", value: suggestedText },
  ];

  const helpEmbedObj = {
    color: mainColor,
    title: "Help & Support • Placements",
    description: getDescriptionFromFields(helpFields),
    thumbnail: botAvatar,
  };

  return getSimpleEmbed(helpEmbedObj);
};

module.exports = {
  helpEmbed,
  helpLinkEmbed,
  helpViewEmbed,
  helpGenerateEmbed,
  helpPremiumEmbed,
};
