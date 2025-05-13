import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.login(process.env.DISCORD_BOT_TOKEN);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

async function sendErrorToDiscord(message) {
  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (channel) {
    channel.send(`🚨 Error occurred:\n\`\`\`\n${message}\n\`\`\``);
  }
}

export default sendErrorToDiscord;
