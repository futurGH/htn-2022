import Papa from "papaparse";
import fs from "fs";
const { data: emoteData } = Papa.parse(fs.readFileSync("./emote.tsv", "utf8"));
const { data: vader } = Papa.parse(fs.readFileSync("./vader.tsv", "utf8"), { delimiter: "\t" });
emoteData[0] = ["word", "label"];
const final = emoteData.concat(vader.slice(1, vader.length));
const content = final.map((row) => {
  const value = Number(row[1]);
  if (value < -0.33) {
    return [row[0], "negative"];
  } else if (value > 0.33) {
    return [row[0], "positive"];
  } else {
    return [row[0], "neutral"];
  }
})
const csv = Papa.unparse(content, { delimiter: "," });
console.log(csv);
fs.writeFileSync("./output.csv", csv);