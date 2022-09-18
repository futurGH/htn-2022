import cohere from "cohere-ai";
import ck from "ckey";
import { client, LogMessage, TableStream } from "../bot/db.js";
import { fetchStreamData } from "./fetchStreamData.js";

type Classifications = Array<{
	input: string,
	prediction: string,
	confidences: Array<{ option: string, confidence: number }>,
	labels: Record<string, {confidence: number }>
}>

cohere.init(ck.COHERE_API_KEY)

export async function getStreamChatSentiment(channel: string, streamId: string) {
	const streamQuery = await client.query<TableStream>("SELECT * FROM chat_log.streams WHERE id = $1", [streamId]);
	if (!streamQuery.rows[0]) throw new Error("Stream not found");
	const stream = streamQuery.rows[0];
	const { streamstart, streamend } = stream;

	const streamMessages = await fetchStreamData(channel, streamstart, streamend || new Date());
	const streamLength = (streamend || new Date()).getTime() - streamstart.getTime();
	if (!streamMessages.length) return null;

	let start: number = streamstart.getTime();
	const end = streamend?.getTime() || Date.now();
	const sentimentPerTenSeconds = await Promise.all(Array.from({ length: Math.ceil(streamLength / 1000 / 10)}).map((_, i, arr) => {
		const startDate = new Date(start);
		start += 10000;
		const endDate = start > end ? streamend : new Date(start);
		return averageSentiment(startDate, endDate!, streamMessages);
	}));

	return { start: streamstart, end: streamend, length: streamLength, messages: streamMessages, sentiment: sentimentPerTenSeconds };
}
export async function getSentimentData(inputs: Array<LogMessage>): Promise<Classifications | null> {
	const sentiment = await cohere.classify({
		inputs: inputs.map(i => i.message),
		examples: EXAMPLES,
		model: ck.COHERE_MODEL_ID,
		taskDescription: "Classify social media messages as positive, negative, or neutral",
	}).catch(e => {
		console.error("Error while classifying.");
		throw e;
	})
	if (!sentiment.body?.classifications) {
		console.error("Failure with status " + sentiment.statusCode)
		console.info(sentiment.body);
		return null;
	}
	return sentiment.body.classifications;
}

export async function averageSentiment(start: Date, end: Date, messages: Array<LogMessage>) {
	const messagesInRange = messages.filter(m => m.timestamp > start && m.timestamp < end);
	if (!messagesInRange.length) return 0;
	const sentimentClassifications = await getSentimentData(messagesInRange);
	if (!sentimentClassifications) return 0;
	const sentimentValues = sentimentClassifications.map(c => {
		const sentimentCounts = [
			...Array(parseInt((c.labels.positive.confidence * 100).toPrecision(2))).fill(1),
			...Array(parseInt((c.labels.negative.confidence * 100).toPrecision(2))).fill(-1),
			...Array(parseInt((c.labels.neutral.confidence * 100).toPrecision(2))).fill(0)
		]
		const sentiment = sentimentCounts.reduce((a, b) => a + b, 0) / sentimentCounts.length || 0;
		return isNaN(sentiment) ? 0 : Number(sentiment.toPrecision(3));
	})
	const averageSentiment = sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length || 0;
	return averageSentiment / 100;
}

const EXAMPLES = [
	{
		text: "big W pogchamp",
		label: "positive"
	},
	{
		text: "pepeGasm god clutch FeelsGoodMan",
		label: "positive"
	},
	{
		text: "9k hp str carry kekw",
		label: "positive"
	},
	{
		text: "i hope that laugh not making it way to next bamboe music",
		label: "positive"
	},
	{
		text: "mods just giving away points pogchamp",
		label: "positive"
	},
	{
		text: "lmao did that last night",
		label: "neutral"
	},
	{
		text: "you should just do some sub games kekw",
		label: "neutral"
	},
	{
		text: "i yoinked him for you weirdeyes",
		label: "neutral"
	},
	{
		text: "life in the hood is hard widehardo",
		label: "neutral"
	},
	{
		text: "dont worry bamboe real pro players skip the first major anyway kappa",
		label: "neutral"
	},
	{
		text: "im not a weeb you are a weeb punoko",
		label: "negative"
	},
	{
		text: "losing to the same pleb as me makes you the biggest loser kekw",
		label: "negative"
	},
	{
		text: "hes pakistani",
		label: "negative"
	},
	{
		text: "fuck off m8 3head",
		label: "negative"
	},
	{
		text: "please change this garbage ass fluke sub sound",
		label: "negative"
	}
]