import express from 'express';
import { createServer, request } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
import dotenv from "dotenv";
import connectDatabase from "./db.js";
import user from "./routes/userRoutes.js";
import requests from "./routes/RequestRoutes.js"
import Redis from "ioredis";

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
const redisClient = new Redis(
  {
    host:'redis',
    port: 6379
  }
);




const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))


app.use(bodyParser.urlencoded({ extended: true },{limit : '50mb'}));
app.use(cookieParser());

app.use("/api/v1" , user);
app.use("/api/v1" , requests);


const server = createServer(app);
const io = new Server(server , {
  cors:{
    origin:"http://localhost:3000"
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  dotenv.config({ path: `${__dirname}/.env` });
} catch (error) {
  console.error('Error loading .env file:', error);
}


connectDatabase();


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });

io.on('connection', (socket) => {

  console.log('a user connected '+socket.handshake.query.prescriptionId);
  socket.join(socket.handshake.query.prescriptionId)

    // Retrieve and return all messages stored in the channel on connection
    if(socket.handshake.query.prescriptionId!=undefined) {redisClient.lrange(socket.handshake.query.prescriptionId, 0, -1, (err, messages) => {
      if (err) {
        console.error('Error retrieving messages from Redis:', err);
        return;
      }
      // Emit each message to the newly connected client
      messages.forEach((msg) => {
        socket.emit('message', JSON.parse(msg));
      });
    });
  }
  
  socket.on('message', (msg) => {
    // Broadcast message to all clients
    console.log(msg);

    redisClient.rpush(msg.prescriptionId, JSON.stringify(msg), (err) => {
      if (err) {
        console.error('Error storing message in Redis:', err);
      }
    });
    
    io.to(msg.prescriptionId ).emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});




server.listen(8000, () => {
  console.log('server running at http://localhost:8000');
});