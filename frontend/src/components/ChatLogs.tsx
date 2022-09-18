export function ChatLogs({ data }: { data: { start: number, end: number, length: number, messages: { author: string, message: string, timestamp: Date }[], sentiment: number[] }}) {
  return (
      <div className="flex flex-col w-3/5 h-48 overflow-auto">
        {
          data.messages.map((chatLog) => {
            return (
              <p key={chatLog.timestamp.toString()}>{chatLog.message}</p>
            )
          })
        }
      </div>
  )
}