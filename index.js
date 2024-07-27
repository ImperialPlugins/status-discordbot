const {
  serviceName,
  pageLink,
  guildId,
  channelId,
  messageId,
  updateInterval,
} = require("./config.json");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const puppeteer = require("puppeteer-extra");
const process = require("process");

const statusName = `${serviceName} Status`;
const statusColor = "#3F51B5";

async function updateStatus() {
  await getScreenshot();
  await new Promise((resolve) => setTimeout(resolve, 6000));

  let embed = new EmbedBuilder()
    .setColor(statusColor)
    .setTitle(statusName)
    .setURL(pageLink)
    .setAuthor({
      name: serviceName,
      iconURL: client.guilds.cache.get(guildId).iconURL({ dynamic: true }),
      url: pageLink,
    })
    .setImage("attachment://screen.png")
    .setTimestamp();

  const timeStamp = Math.floor(Date.now() / 1000) + updateInterval + 9;
  const formattedTimeStamp = `<t:${timeStamp}:R>`;

  client.channels.cache
    .get(channelId)
    .messages.fetch(messageId)
    .then((msg) =>
      msg.edit({
        content: `Next update ${formattedTimeStamp}`,
        embeds: [embed],
        files: ["./screen.png"],
      })
    );
}

async function getScreenshot() {
  puppeteer
    .launch({
      headless: true,
      executablePath: process.env.CHROME_PATH,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.setViewport({ width: 1820, height: 1024 });

      await page.goto(pageLink);
      await page.waitForTimeout(3500);
      await page.screenshot({ path: "screen.png", fullPage: true });

      await browser.close();
    });
}

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", async () => {
  console.log("Discord client is ready.");

  if (!messageId) {
    console.log(
      "Initial message ID was not set. Creating a new message with the embed."
    );

    const initialEmbed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle(statusName)
      .setURL(pageLink)
      .setAuthor({
        name: statusName,
        iconURL: client.guilds.cache.get(guildId).iconURL({ dynamic: true }),
        url: pageLink,
      });

    await client.channels.cache.get(channelId).send({ embeds: [initialEmbed] });
  }

  await updateStatus();

  setInterval(async function () {
    await updateStatus();
  }, updateInterval * 1000);
});

client.login(process.env.DISCORD_TOKEN);
