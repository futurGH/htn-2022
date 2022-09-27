# sentinel
### An AI-powered dashboard that helps streamers better connect to their audience.

## Driving Force
Over the course of the last few years, live streaming has taken its place as a leading medium for community storytelling. From pro gamers showing off plays to businesses unveiling exciting new products, there's something unique about sharing a part of yourself to millions of other people and giving them an opportunity to share back. Of course, anyone who's given a presentation of any sort before knows just how stressful it can be, especially when you don't know how people are going to react to what you have to say. What if we could use cutting edge technology to help everyone learn from both sides of the equation; the presenters giving it their all and the audience that is more than eager to share back?

## At the Core
Sentinel analyzes a Twitch stream in real time, using a mix of audio sentiment analysis and natural language processing to compare the highs and lows of a streamer and their audience in order to help content creators better understand just how they can engage with their community.

## Behind the Scenes
Sentinel uses co:here for natural language processing in real-time chat, augmented by a model fine-tuned on social media content inspired by the VADER sentiment analysis project. AssemblyAI is used to transcribe and analyze the video stream and provide an analysis of the presenter's emotions over time. Transcription data is stored in CockroachDB thanks to its incredibly easy timestamp manipulation. This is all handled via a backend server built solely with Node.js using TypeScript. The frontend is built with React, Vite, and TailwindCSS, all in TypeScript.

## Suffering for Success
One thing we struggled with was obtaining the stream as a video file for AssemblyAI to analyze. We found our salvation in the brilliant open-source Streamlink, but it didn't provide an API in JavaScript (or TypeScript), the language we were using for the entirety of this project. Much of our time was spent fiddling with a system that would forward the link to the stream to Streamlink through the command line.

Another struggle was using the Twitch API, a decision we continue to regret. After we picked one of their 6 APIs that appeared to best fit our use case, we were seemingly in a constant fight with the API over everything from authentication to making sure our custom Twitch bot knew when a stream ended so that it could stop recording messages. With blood, sweat, tears, and a few too many angry keyboard slams, we managed to work with it to build something awesome.

## 🏆 Our Proudest Achievements
We're really proud of the sheer breadth of content we learned about in order to build this project. Neither of us had any experience with machine learning or AI of any sort, and within 36 hours we found ourselves masters of poring over research papers & datasets to build the best classifier we possibly could for Twitch's unique Internet dialect.