import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from "chart.js";
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Audio = { text: string, start: number, end: number, sentiment: string, confidence: number }

export function StreamAnalytics({ messages, audio }: {
  messages: {
    start: number,
    end: number,
    length: number,
    messages: { author: string, message: string, timestamp: Date }[],
    sentiment: number[]
  };
  audio: Array<{
    text: string;
    start: number;
    end: number;
    sentiment: string;
    confidence: number
  }>
}) {
  const streamStart = messages.start;
  const streamEnd = messages.end;
  const streamLength = messages.length;
  console.log(messages);
  const options = {
    responsive: true
  };

  const audioSentiments: Array<number> = [];

  const rawLabels = [];
  const labels = [];
  for (let i = 0; i <= (audio?.at?.(-1)?.end || 0); i += 10000) {
    const secs = (i / 1000) % 60;
    const mins = i / 1000 / 60;
    rawLabels.push(i);
    audioSentiments.push(...audio?.filter?.(a => a.start >= i && a.end <= i + 10000).map(a => {
      let value = a.confidence;
      if (a.sentiment === "NEGATIVE") {
        value *= -1;
      } else if (a.sentiment === "NEUTRAL") {
        value -= 0.5;
      }
      return value;
    }));
    labels.push(`${parseInt(mins.toString()).toString().padStart(2, "0")}:${parseInt(secs.toString()).toString().padStart(2, "0")}`);
  }

  const graphData = {
    labels,
    datasets: [
      {
        label: "Chat",
        data: messages.sentiment,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: "Stream",
        data: audioSentiments,
        borderColor: 'rgb(99,250,255)',
        backgroundColor: 'rgba(99,130,255,0.5)',
      }
    ],
  };
  return (
    <div>
      <span className="font-bold text-lg text-gray-700 -mt-12">Stream Analytics</span>
      <Line data={graphData} options={options} />
    </div>
  )
}
