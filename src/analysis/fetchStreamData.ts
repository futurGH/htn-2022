import { client, LogMessage } from "../bot/db.js";

export async function fetchStreamData(channel: string, start: Date, end: Date): Promise<Array<LogMessage>> {
	const streamData = await client.query(
		`SELECT * FROM chat_log.${channel} WHERE timestamp > $1 AND timestamp < $2`,
		[start, end]
	);
	return streamData.rows;
}