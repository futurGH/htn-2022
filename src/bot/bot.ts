import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import ck from "ckey";

const clientId = ck.TWITCH_CLIENT_ID;
const clientSecret = ck.TWITCH_CLIENT_SECRET;
const tokenData = { expiresIn: 0, obtainmentTimestamp: 0 };

export let chatClient: ChatClient;
export function auth({ accessToken, refreshToken }: Record<string, string>) {
	if (!chatClient) {
		const authProvider = new RefreshingAuthProvider(
			{
				clientId,
				clientSecret,
				onRefresh: async newTokenData => Object.assign(
					tokenData,
					{ expiresIn: newTokenData.expiresIn, obtainmentTimestamp: newTokenData.obtainmentTimestamp },
				)
			},
			{ ...tokenData, accessToken, refreshToken }
		);
		chatClient = new ChatClient({ authProvider, channels: [] });
	}
	return chatClient;
}