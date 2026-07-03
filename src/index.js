require("dotenv").config();
const { App } = require("@slack/bolt");

const TARGET_USER_ID = process.env.ANSON_USER_ID;

const FAREWELL_MESSAGES = [
  "Anson has been eradicated from this channel.",
  "Anson has left the channel. Not by choice.",
  "Anson is no longer here.",
];

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.event("member_joined_channel", async ({ event, client, logger }) => {
  if (event.user !== TARGET_USER_ID) return;

  try {
    const { user } = await client.users.info({ user: event.user });

    // Slack won't stop a bot from kicking an admin/owner, so it checks manually.
    if (user.is_admin || user.is_owner || user.is_primary_owner) {
      await client.chat.postMessage({
        channel: event.channel,
        text: "Anson is an admin in this channel and can't be removed.",
      });
      return;
    }

    await client.conversations.kick({ channel: event.channel, user: event.user });

    const message = FAREWELL_MESSAGES[Math.floor(Math.random() * FAREWELL_MESSAGES.length)];
    await client.chat.postMessage({ channel: event.channel, text: message });

    logger.info(`Removed ${event.user} from ${event.channel}`);
  } catch (err) {
    logger.error("Removal failed:", err);
  }
});

app.start().then(() => console.log("The Anson Eradicator is running."));