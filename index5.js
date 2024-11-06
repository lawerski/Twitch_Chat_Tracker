const tmi = require('tmi.js');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3001;
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://wojciechkoba3:oGypLdQnBkG4NB95@twitch-chat-tracker.fcwdt.mongodb.net/?retryWrites=true&w=majority&appName=Twitch-chat-tracker";

// MongoDB client and database setup
const dbClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
dbClient.connect()
    .then(client => {
        db = client.db('twitchTracker');  // specify the database name
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));

// tmi.js client setup
const client = new tmi.Client({
    channels: [ 'revo_toja' ]
});

client.connect();
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Utility function to extract text after "@"
function extractTextAfterAt(text) {
    const atIndex = text.indexOf('@');
    if (atIndex === -1) return "";
    const spaceIndex = text.indexOf(' ', atIndex);
    return spaceIndex === -1 ? text.substring(atIndex + 1) : text.substring(atIndex + 1, spaceIndex);
}

// Maps and counters
const msgCtn = new Map();
const repCTN = new Map();
const XDCTN = new Map();
const M1P1 = new Map();
const DELCTN = new Map();
const ATEN = new Map();
let P1Value = 0;
let M1Value = 0;
let latestLog = "";  // Store the latest log data

// Handle new messages
client.on('message', (channel, tags, message, self) => {
    if (self) return;

    // Message count
    msgCtn.set(tags['display-name'], (msgCtn.get(tags['display-name']) || 0) + 1);

    // Mentions count
    if (message.includes("@")) {
        const mention = extractTextAfterAt(message);
        if (mention !== channel) {
            repCTN.set(mention, (repCTN.get(mention) || 0) + 1);
        }
    }

    // Mentions with XD count
    if (message.includes("@") && message.includes("XD")) {
        const mention = extractTextAfterAt(message);
        XDCTN.set(mention, (XDCTN.get(mention) || 0) + 1);
    }

    // Increment counters for +1 and -1
    if (message.includes("+1")) P1Value++;
    if (message.includes("-1")) M1Value++;

    // Tracking '@revo_toja' mentions
    if (message.includes("@revo_toja")) {
        ATEN.set(tags['display-name'], (ATEN.get(tags['display-name']) || 0) + 1);
    }
});

// Handle deleted messages
client.on("messagedeleted", (channel, username, deletedMessage, userstate, tags) => {
    DELCTN.set(tags['display-name'], (DELCTN.get(tags['display-name']) || 0) + 1);
});

// Find max value in a map
function findMax(map) {
    let max = -Infinity;
    let maxKey = null;
    for (const [key, value] of map.entries()) {
        if (value > max) {
            max = value;
            maxKey = key;
        }
    }
    return { key: maxKey, value: max };
}

// Generate log data to push to MongoDB
function generateLog() {
    const maps = [
        { name: 'msgCtn', map: msgCtn },
        { name: 'repCTN', map: repCTN },
        { name: 'XDCTN', map: XDCTN },
        { name: 'M1P1', map: M1P1 },
        { name: 'DELCTN', map: DELCTN },
        { name: 'ATEN', map: ATEN }
    ];

    const currentTime = new Date().toLocaleString();
    let log = `Time: ${currentTime}\n\n`;

    const data = { time: currentTime };
    maps.forEach(({ name, map }) => {
        const { key, value } = findMax(map);
        log += `${name}: Key: ${key}, Value: ${value}\n`;
        data[name] = { key, value };
    });

    log += '\n';
    log += `Plus 1: ${P1Value}\n`;
    log += `Minus 1: ${M1Value}\n`;

    data.plusOne = P1Value;
    data.minusOne = M1Value;

    return { log, data };
}

// Write log to file and update MongoDB document
async function writeMaxValues() {
    const { log, data } = generateLog();
    latestLog = log;
    
    // Save to file
    fs.appendFile('max_values.txt', latestLog, (err) => {
        if (err) throw err;
    });

    // Update data in MongoDB with upsert
    if (db) {
        try {
            const collection = db.collection('chatLogs');  // specify collection name
            await collection.updateOne(
                { identifier: "unique_log_entry" }, // Use a unique key to ensure a single document
                { $set: data },
                { upsert: true } // Insert if document doesn’t exist
            );
            console.log('Data updated in MongoDB');
        } catch (err) {
            console.error('Error updating data in MongoDB:', err);
        }
    }
}

// Update the latestLog variable and update MongoDB every 10 seconds
setInterval(writeMaxValues, 10000);

// Endpoint to serve the latest log
app.get('/', (req, res) => {
    const logData = generateLog(); // Generujemy log w formacie JSON
    res.json(logData); // Wysyłamy dane jako JSON
});
