import { useEffect, useState } from "react";
import axios from "axios";
import { StreamAnalytics } from "@/components/StreamAnalytics";
import { ChatLogs } from "@/components/ChatLogs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { StreamTranscript } from "@/components/StreamTranscript";
import { useSearchParams } from "react-router-dom";

export function Dashboard() {
  const [chatLogs, setChatLogs] = useState<{ start: number, end: number, length: number, messages: { author: string, message: string, timestamp: Date }[], sentiment: number[] }
    >({} as never);
  const [audioTranscript, setAudioTranscript] = useState<{ text: string, start: number, end: number, sentiment: string, confidence: number }[]>([] as never);
  const [videoBlob, setVideoBlob] = useState<Blob>(null as never);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const username = searchParams.get("username");
    if (!username) return;
    const videoInterval = setInterval(() => {
      axios.get(`http://localhost:3000/video-sentiment?channel=${username}`)
        .then((response) => {
          setAudioTranscript(response.data.transcript);
          setVideoBlob(response.data.video);
        })
        .catch((error) => {
          console.log(error);
        });
      if (audioTranscript?.length > 0) {
        clearInterval(videoInterval);
      }
    }, 5000)
    const chatInterval = setInterval(() => {
      axios.get(`http://localhost:3000/chat-sentiment?channel=${username}`)
        .then((response) => {
          setChatLogs(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 5000)
  }, [searchParams]);

  const noContent = !Object.keys(chatLogs).length && !audioTranscript.length;

  return (
    <div className='flex justify-center items-center h-screen w-screen'>
      {noContent ? <span className="text-lg text-gray-700 font-medium">Start a stream to begin collecting statistics!</span> : (
        <div className='flex w-4/5 space-x-16'>
        {!!Object.keys(chatLogs).length && (<div className='flex flex-col w-3/5 space-y-8'>
          <StreamAnalytics messages={chatLogs} audio={audioTranscript}/>
          <ChatLogs data={chatLogs}/>
        </div>)
        }
        {!!audioTranscript.length && (
        <div className='flex flex-col space-y-8'>
          <VideoPlayer blob={videoBlob} />
          <StreamTranscript data={audioTranscript} />
        </div>
          )}
      </div>)}
    </div>
  )
}
