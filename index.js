// server.js
const express = require('express');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.use(cors());

const audioFilePath = './audio.mp3'; // Replace with the actual path to your MP3 file
const data = `[
  {"percent": 30, "shortText": "Improved RO1 on ad spend", "longDesc": "Media buying helped with these results, since it's an important way of attracting clients"},
  {"percent": 50, "shortText": "More engagement in majority of campaigns", "longDesc": "Ads generated significantly more engagement"},
  {"percent": 38, "shortText": "Surge in Website Traffic", "longDesc": "As a consequence, website visits skyrocketed, boosted by social media engagement"},
  {"percent": 42, "shortText": "Surge in Social Channel Traffic", "longDesc": "The Surge extended to social media, where engagement almost exactly followed website visits"}
]`;
app.use(express.static('public'));

// app.get('/stream-text', (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');

//   // Send initial message
//   res.write(`data: ${data} \n\n`);
//   // Close connection after 10 seconds (for demo purposes)
//   setTimeout(() => {
//     res.end();
//   }, 10000);
// });


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

io.on('connection', (socket) => {
  console.log('new user connected');
  
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
    if (message === 'data for finance card') {
      console.log('sending...', data);
      socket.send(data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
