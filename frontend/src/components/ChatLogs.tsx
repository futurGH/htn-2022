export function ChatLogs({ data }: { data: { start: number, end: number, length: number, messages: { author: string, message: string, timestamp: Date }[], sentiment: number[] }}) {
  return (
      <div className="flex flex-col w-full h-48 overflow-auto">
        {
          data.messages.map((chatLog) => {
            return (<p key={chatLog.timestamp.toString()}><span className="font-bold">{chatLog.author}</span>&nbsp;&nbsp;&nbsp;{chatLog.message}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-400">{new Intl.DateTimeFormat("en-us", { minute: "numeric", second: "numeric" }).format(new Date(chatLog.timestamp))}</span></p>
            )
          })
        }
      </div>
  )
}
