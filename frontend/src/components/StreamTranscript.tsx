export function StreamTranscript({ data }: { data: { text: string, start: number, end: number, sentiment: string, confidence: number }[]}) {
  return (
    <div className="flex flex-col w-full h-48 overflow-auto">
      <p>Stream Transcript</p>
      {data.map((transcript) => {
        return (
          <p key={transcript.start.toString()}>{transcript.text}</p>
        )
      })}
    </div>
  )
}