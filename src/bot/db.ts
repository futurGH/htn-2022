import PG from "pg";
import { authorized, authProvider, chatClient } from "./bot.js";
import ck from "ckey";
import { ApiClient } from "@twurple/api";

export const DATABASE_URL = `postgresql://${ck.COCKROACH_USER}:${ck.COCKROACH_PASSWORD}@free-tier14.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dfast-oriole-5020`

const client = new PG.Client(DATABASE_URL);
await client.connect();

let apiClient: ApiClient;
export const setApiClient = (thing: ApiClient) => apiClient = thing;

export { client, apiClient, trackChannel }

export type TableStream = {
	channel: string;
	id: string;
	title: string;
	streamstart: Date;
	streamend?: Date;
}

export type LogMessage = {
	author: string;
	message: string;
	timestamp: Date;
}

async function trackChannel(channel: string) {
	await client.query(`CREATE TABLE IF NOT EXISTS chat_log.streams (
        channel STRING NOT NULL,
        id STRING NOT NULL,
        title STRING NOT NULL,
        streamStart TIMESTAMPTZ NOT NULL,
        streamEnd TIMESTAMPTZ
)`);
	await client.query(`CREATE TABLE IF NOT EXISTS chat_log.${channel} (
	author TEXT NOT NULL,
	message TEXT NOT NULL,
	timestamp TIMESTAMPTZ NOT NULL
)`);

	if (authorized && !apiClient) apiClient = new ApiClient({ authProvider });

	if (!chatClient.isConnected) await chatClient.connect();
	if (chatClient.isRegistered) {
		await joinChannel(channel);
	} else chatClient.onRegister(()  => joinChannel(channel));

	const channelStream = await apiClient.streams.getStreamByUserName(channel);
	if (!channelStream) return;
	chatClient.onMessage(async (messageChannel, user, message, msg) => {
		if (
			channel
				.toLowerCase()
				.replace(/[^a-z0-9_\-]/gm, "") !== messageChannel
				.toLowerCase()
				.replace(/[^a-z0-9_\-]/gm, "")) return;
		console.log(message);
		await client.query(
				`INSERT INTO chat_log.streams (channel, id, title, streamStart) VALUES ($1, $2, $3, $4)`,
				[channel, channelStream.id, channelStream.title, channelStream.startDate]
		);
		await client.query(`INSERT INTO chat_log.${channel} VALUES ($1, $2, $3)`, [user, message, msg.date]);
	});
	setInterval(async () => {
		if (!(await apiClient.streams.getStreamByUserName(channel))) {
			client.query(
				`UPDATE chat_log.streams SET streamEnd = $1 WHERE id = $2`,
				[new Date(), channelStream.id]
			);
		}
	}, 5000)
}

async function joinChannel(channel: string) {
	await chatClient.join(channel).catch((e) => { throw new Error(`Failed to join channel ${channel}\n\n${e}`) });
	await chatClient.say(channel, "Hello, world!")
}