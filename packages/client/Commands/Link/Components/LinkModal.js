const axios = require("axios");
const { getErrorEmbed } = require("../../../DeliveryUtil");
const { Client, ModalSubmitInteraction } = require("discord.js");
const {
  createLinkSuccessMenu,
  createLinkExpiredMenu,
  createAwaitingActionMenu,
} = require("../LinkDelivery");

class LinkModal {
  /**
   * Creates an instance of LinkModal.
   * @date 1/2/2024 - 12:07:17 AM
   *
   * @constructor
   * @param {Client} client
   * @param {ModalSubmitInteraction} interaction
   */
  constructor(client, interaction) {
    this.client = client;
    this.interaction = interaction;
    this.defer = this.interaction.deferReply({ ephemeral: true });
  }

  process = async (fromview = "") => {
    this.parse();

    //Workaround for creating a new reply if the modal is triggered through a channel-sent message component instead of an interaction-sent one.
    this.interaction.update =
      this.interaction.message.interaction && !fromview
        ? this.interaction.editReply
        : this.interaction.editReply;

    const startLinkResponse = await this.startLink();

    await this.defer;

    const { data, error } = startLinkResponse?.data?.data || {};
    if (error || !data) {
      await this.interaction.update(getErrorEmbed().initial);
      return;
    }

    const { name, expectedAvatar } = data;
    const delivery = createAwaitingActionMenu(
      this.locale,
      name,
      expectedAvatar
    );

    await this.interaction.update(delivery.initial);

    const linkStatusResponse = await this.getLinkStatus();
    const statusData = linkStatusResponse?.data?.data || {};

    if (!statusData) {
      await this.interaction.editReply(getErrorEmbed().initial);
      return;
    }

    const statusDelivery =
      statusData.status === "success"
        ? createLinkSuccessMenu(this.locale, statusData.data.name)
        : createLinkExpiredMenu(this.locale);

    await this.interaction.editReply(statusDelivery.initial);
  };

  parse = () => {
    this.locale = this.interaction.locale;
    this.userId = this.interaction.user.id;
    this.publicId = this.interaction.fields.getTextInputValue("publicid");
  };

  startLink = async () => {
    try {
      return axios({
        method: "post",
        url: `${process.env.BACKEND_URL}/link`,
        data: {
          userId: this.userId,
          publicId: this.publicId.toUpperCase(),
        },
        timeout: 10000,
      }).catch(async () => {
        const delivery = getErrorEmbed();
        await this.interaction.update(delivery.initial);
        return null;
      });
    } catch (err) {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.update(delivery.initial);
    }
  };

  getLinkStatus = async () => {
    try {
      return axios({
        method: "get",
        url: `${process.env.BACKEND_URL}/link_progress?userId=${this.userId}`,
        timeout: 210000,
      }).catch(async () => {
        const delivery = getErrorEmbed();
        await this.interaction.editReply(delivery.initial);
        return null;
      });
    } catch (err) {
      console.error(err);
      const delivery = getErrorEmbed();
      await this.interaction.editReply(delivery.initial);
    }
  };
}

module.exports = { LinkModal };
