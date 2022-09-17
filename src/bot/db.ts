import PG from "pg";
import { chatClient } from "./bot.js";
import ck from "ckey";

export const DATABASE_URL = `postgresql://${ck.COCKROACH_USER}:${ck.COCKROACH_PASSWORD}@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dfast-oriole-5020`

const client = new PG.Client(DATABASE_URL);
await client.connect();

export async function trackChannel(channel: string) {
	await client.query(`CREATE TABLE IF NOT EXISTS chat_log.${channel} (
	author TEXT NOT NULL,
	message TEXT NOT NULL,
	timestamp TIMESTAMPTZ NOT NULL
)`);
	if (!chatClient.isConnected) await chatClient.connect();
	if (chatClient.isRegistered) {
		await joinChannel(channel);
	} else chatClient.onRegister(()  => joinChannel(channel));
	chatClient.onMessage(async (messageChannel, user, message, msg) => {
		if (
			channel
				.toLowerCase()
				.replace(/[^a-z0-9_\-]/gm, "") !== messageChannel
				.toLowerCase()
				.replace(/[^a-z0-9_\-]/gm, "")) return;
		await client.query(`INSERT INTO chat_log.${channel} VALUES ($1, $2, $3)`, [user, message, msg.date]);
	});
}

async function joinChannel(channel: string) {
	await chatClient.join(channel).catch((e) => { throw new Error(`Failed to join channel ${channel}\n\n${e}`) });
	await chatClient.say(channel, "Hello, world!")
}