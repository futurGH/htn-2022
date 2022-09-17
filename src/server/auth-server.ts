/// <reference types="global.d.ts">

import Fastify from "fastify";
import Axios from "axios";
import { auth, chatClient } from "../bot/bot.js";
import ck from "ckey";
import { URLSearchParams } from "url";
import { trackChannel } from "../bot/db.js";

const fastify = Fastify({ logger: true });

fastify.get("/auth/twitch", async (request, reply) => {
	const { query } = request;

	if (query && "code" in query) {
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
		auth({ accessToken: access_token, refreshToken: refresh_token });
		await chatClient.connect()
			.catch(() => reply.status(500).send("Failed to initiate client"));
		await trackChannel("futur_istick");
		reply.status(200).send("Started client");
	} else reply.code(500).send("Invalid request");
});

await fastify.listen({ port: 3000 }).catch(e => {
	fastify.log.error(e);
	process.exit(1);
});