import { Line } from 'react-chartjs-2';

export function StreamAnalytics({ data }: { data: { start: number, end: number, length: number, messages: { author: string, message: string, timestamp: Date }[], sentiment: number[] }}) {
  const options = {
    responsive: true
  };
  let labels = [];
  for (let i = 0; i < data.sentiment.length; i++) {
    labels.push(data.sentiment[i]);
  }

  let pointData = [];
  for (let i = 0; i < data.sentiment.length; i++) {
    pointData.push(data.sentiment[i]);
  }

  const graphData = {
    labels,
    datasets: [
      {
        label: 'your',
        data: pointData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return (
    <div>
      <p>Stream Analytics</p>
      <Line data={graphData} options={options} />
    </div>
  )
}