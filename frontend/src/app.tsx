import { useState } from 'react'
import './app.css'
import { VideoPlayer } from './components/VideoPlayer'
import { ChatLogs } from './components/ChatLogs'
import { StreamTranscript } from './components/StreamTranscript'
import { StreamAnalytics } from './components/StreamAnalytics'
import axios from 'axios'
import { useEffect } from 'react'

export function App () {
  const [chatLogs, setChatLogs] = useState<{ start: number, end: number, length: number, messages: { author: string, message: string, timestamp: Date }[], sentiment: number[] }
>({} as never);
  const [audioTranscript, setAudioTranscript] = useState<{ text: string, start: number, end: number, sentiment: string, confidence: number }[]>([] as never);

  useEffect(() => {
    axios.get('http://localhost:3000/video-sentiment')
      .then((response) => {
        setAudioTranscript(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    
    axios.get('http://localhost:3000/chat-sentiment')
      .then((response) => {
        setChatLogs(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className='flex justify-center h-screen w-screen'>
      <div className='flex w-4/5'>
        <div className='flex flex-col w-3/5'>
          <StreamAnalytics data={chatLogs}/>
          <ChatLogs data={chatLogs}/>
        </div>
        <div className='flex flex-col'>
          <VideoPlayer />
          <StreamTranscript data={audioTranscript} />
        </div>
      </div>
    </div>
  )
}
