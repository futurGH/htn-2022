/// <reference types="global.d.ts">

import Fastify from "fastify";
import Axios from "axios";
import { auth, authorized, chatClient } from "../bot/bot.js";
import ck from "ckey";
import { URLSearchParams } from "url";
import { client, trackChannel } from "../bot/db.js";
import { getStreamChatSentiment } from "../chat-analysis/getStreamChatSentiment.js";
import {
	beginAnalysis,
	getTranscriptionAndVideoIfDone
} from "../stream-analysis/analyzeStreamVideo.js"
import { getTokenInfo } from "@twurple/auth";
import cors from "@fastify/cors";

const fastify = Fastify({ logger: true });
await fastify.register(cors, {
	origin: "*",
})

fastify.get("/auth/is-authed", async (request, reply) => {
	return authorized ? reply.status(200).send("Authorized") : reply.status(401).send("Unauthorized");
})

fastify.get("/auth/twitch", async (request, reply) => {
	const { query } = request;

	if (query && typeof query === "object" && "code" in query) {
		// @ts-expect-error TS2322
		const { code } = query;

		const params = {
			client_id: ck.TWITCH_CLIENT_ID,
			client_secret: ck.TWITCH_CLIENT_SECRET,
			redirect_uri: encodeURI(ck.TWITCH_REDIRECT_URI),
			code,
			grant_type: "authorization_code"
		}

		const result = await Axios.post(
			`https://id.twitch.tv/oauth2/token?${(new URLSearchParams(params)).toString()}`,
			params
		).catch(e => {
			fastify.log.error("Could not complete oauth flow");
			console.error(e);
		});
		if (!result?.data) {
			return reply.status(500).send("Could not complete oauth flow");
		}
		const { access_token, refresh_token } = result.data;
		const tokenInfo = await getTokenInfo(access_token, ck.TWITCH_CLIENT_ID);
		const username = tokenInfo.userName;
		auth({ accessToken: access_token, refreshToken: refresh_token });
		await chatClient.connect()
			.catch(() => reply.redirect(`http://localhost:3001/dashboard${username ? `?username=${username}` : ""}`));
		if (username) {
			await trackChannel(username).catch((e) => {
				console.error(e);
			});
			beginAnalysis(`https://twitch.tv/${username}`);
		}
		reply.redirect(`http://localhost:3001/dashboard?username=${username}`);
	} else reply.status(500).send("Invalid request");
});

fastify.get("/chat-sentiment", async (request, reply) => {
	const { query } = request;

	if (query && typeof query === "object" && "channel" in query) {
		// @ts-expect-error TS2322
		const { channel, id } = query;
		const streamId = id || (await client.query("SELECT id FROM chat_log.streams ORDER BY streamStart DESC LIMIT 1")).rows[0].id;
		const sentiment = await getStreamChatSentiment(channel, streamId);
		console.log(sentiment);
		reply.status(200).send(sentiment);
	}
})

fastify.get("/video-sentiment", async (request, reply) => {
	const { query } = request;

	if (query && typeof query === "object" && "channel" in query) {
		// @ts-expect-error TS2322
		const { channel } = query;

		const results = await getTranscriptionAndVideoIfDone(channel);
		if (results) {
			reply.status(200).send(results);
		} else reply.status(500).send("Video not analyzed yet");
	}
})

await fastify.listen({ port: 3000 }).catch(e => {
	fastify.log.error(e);
	process.exit(1);
});