// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const audioFilePath = './audio.mp3'; // Replace with the actual path to your MP3 file

app.use(cors());

app.use(express.static('public'));

app.get('/stream-text', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial message
  // res.write("data: initial message\n\n");
  res.write("data: { data: [{percent: 30,shortText: 'Improved RO1 on ad spend', longDesc: 'Media buying helped with these results, since it's an important way of attracting clients', },\n\n");
  res.write("data: {percent: 50, shortText: 'More engagement in majority of campains', longDesc: 'Ads generated significantly more engagement',},\n\n");
  res.write("data: { percent: 38, shortText: 'Surge in Website Traffic', longDesc: 'As a consequence, website visits skyrocketed, boosted by social media engagement',},\n\n");
  res.write("data: {percent: 42,shortText: Surge in Social Channel Traffic',longDesc: 'The Surge extended to social media, where engagement almost exactly followed website visits',},]}\n\n");
  
  // Close connection after 10 seconds (for demo purposes)
  setTimeout(() => {
    // clearInterval(intervalId);
    res.end();
  }, 10000);
});


app.get('/stream-audio', (req, res) => {
  const stat = fs.statSync(audioFilePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(audioFilePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mp3',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mp3',
    };

    res.writeHead(200, head);
    fs.createReadStream(audioFilePath).pipe(res);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
