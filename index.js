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

app.use(express.static('public'));

app.get('/stream-text', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial message
  res.write("data: 'What would you like to know related to the revenue estimate?'");
  res.write("data: `Certainly, here’s some reasoning: \n\n1. there are 4 new clients that combined could bring additional $20,000 by the end of the year.`");
  res.write("data: `2. There is a good chance of Telus signing the new $40,000 contract, first payment tranche is scheduled at September 25th. \n\n3. There is a good engagement on the last marketing campaign.`");
  res.write("data: `Updating the Dashboard...`");
  res.write("data: `Done. \n\nShutting down...`");

  // Close connection after 10 seconds (for demo purposes)
  setTimeout(() => {
    // clearInterval(intervalId);
    res.end();
  }, 10000);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
