import { promises as fs, existsSync } from "fs"
import ck from "ckey";
import { execSync } from 'child_process';
import axios from "axios";

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

export async function analyzeFromLink(link: string, callback: (transcript: AssemblyResults) => void) {
	const channelName = link.split("/").at(-1);
	const filename = `./__videos/${channelName}.ts`;
	if (existsSync(filename)) await fs.unlink(filename);
	execSync(`streamlink -o "${filename}" "${link}" 1080p,best`);
	const uploadUrl = await uploadVideo(filename);
	await getVideoTranscript(uploadUrl, callback)
}

async function uploadVideo(filename: string) {
	const uploaded = await assembly.post("/upload", await fs.readFile(filename));
	return uploaded.data.upload_url;
}

async function getVideoTranscript(uploadUrl: string, useTranscript: (transcript: AssemblyResults) => void) {
	const initialTranscriptReq = await assembly.post("/transcript", {
		audio_url: uploadUrl,
		sentiment_analysis: true
	}).catch(err => {
		console.error(err)
	});
	if (!initialTranscriptReq) throw new Error("Could not get transcript");
	const requestInterval: NodeJS.Timer = setInterval(async function() {
		const queuedTranscriptReq = await assembly.get<{
			status: string;
			sentiment_analysis_results: AssemblyResults
		}>(`/transcript/${initialTranscriptReq.data.id}`)
		if (queuedTranscriptReq.data.status === "completed") {
			await useTranscript(queuedTranscriptReq.data.sentiment_analysis_results)
			return clearInterval(requestInterval);
		}
	}, 5000);
}