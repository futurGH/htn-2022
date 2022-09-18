import { promises as fs, existsSync } from "fs"
import ck from "ckey";
import { exec as _exec } from 'child_process';
import axios from "axios";
import { Blob } from "buffer";
import { client } from "../bot/db.js";
import * as util from "util";

const exec = util.promisify(_exec);

type AssemblyResults = Array<{
	text: string;
	start: number;
	end: number;
	sentiment: string;
	confidence: number
}>

const assembly = axios.create({
	baseURL: "https://api.assemblyai.com/v2",
	maxBodyLength: Infinity,
	maxContentLength: Infinity,
	headers: {
		authorization: ck.ASSEMBLY_AUTH,
		"content-type": "application/json",
		"transfer-encoding": "chunked",
	},
});

const createTranscriptionTable = async () => await client.query(`CREATE TABLE IF NOT EXISTS chat_log.transcriptions (
	channel STRING NOT NULL PRIMARY KEY,
	transcriptions JSONB NOT NULL
)`);
export function beginAnalysis(link: string) {
	analyzeFromLink(link, async (transcript) => {
		console.log("done");
		await createTranscriptionTable();
		await client.query(`UPSERT INTO chat_log.transcriptions (channel, transcriptions) VALUES ($1, $2)`, [link.split("/").pop()!, JSON.stringify(transcript)]);
	});
}

export async function getTranscriptionAndVideoIfDone(channel: string): Promise<{ transcript: AssemblyResults, video: Blob } | null> {
	await createTranscriptionTable();
	const { rows: [{ transcriptions = [] } = {}] } = await client.query(`SELECT * FROM chat_log.transcriptions WHERE channel = $1`, [channel]).catch(() => ({ rows: [{}] }));
	if (!transcriptions.length) return null;
	const filepath = `./__videos/${ channel }.ts`
	const video = new Blob(existsSync(filepath) ? [await fs.readFile(filepath)] : []);
	return { video, transcript: transcriptions }
}

export async function analyzeFromLink<T>(link: string, callback: (transcript: AssemblyResults, file: Buffer) => T) {
	await createTranscriptionTable();
	const channelName = link.split("/").at(-1);
	const filename = `./__videos/${channelName}.ts`;
	if (existsSync(filename)) await fs.unlink(filename);
	exec(`streamlink -o "${filename}" "${link}" 1080p,best`).then(async () => {
		console.log("done stream linking");
		const content = await fs.readFile(filename);
		const uploaded = await assembly.post("/upload", content);
		const uploadUrl = uploaded.data.upload_url;
		console.log(uploadUrl);
		await getVideoTranscript(uploadUrl, (transcript) => callback(transcript, content))
	}).catch((e) => console.error(e));
}

// @ts-expect-error TS2355
async function getVideoTranscript<T>(uploadUrl: string, useTranscript: (transcript: AssemblyResults) => T): Promise<T> {
	const initialTranscriptReq = await assembly.post("/transcript", {
		audio_url: uploadUrl,
		sentiment_analysis: true
	}).catch(err => {
		console.error(err)
	});
	console.log("req", initialTranscriptReq?.data);
	if (!initialTranscriptReq) throw new Error("Could not get transcript");
	const requestInterval: NodeJS.Timer = setInterval(async function() {
		const queuedTranscriptReq = await assembly.get<{
			status: string;
			sentiment_analysis_results: AssemblyResults
		}>(`/transcript/${initialTranscriptReq.data.id}`)
		if (queuedTranscriptReq.data.status === "completed") {
			clearInterval(requestInterval);
			return useTranscript(queuedTranscriptReq.data.sentiment_analysis_results)
		}
	}, 5000);
}