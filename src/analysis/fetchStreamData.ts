import { client } from "../bot/db.js";

export async function fetchStreamData(channel: string, start: Date, end: Date) {
	const streamData = await client.query(
		`SELECT * FROM chat_log.${channel} WHERE timestamp > $1 AND timestamp < $2`,
		[start, end]
	);
	console.log(streamData);
}

console.log(await fetchStreamData("futur_istick", new Date("2022-09-16"), new Date()));