const tmi = require('tmi.js');
const fs = require('fs');
const client = new tmi.Client({
	channels: [ 'delordione' ]
});

client.connect();

function extractTextAfterAt(text) {
    // Find the index of '@'
    var atIndex = text.indexOf('@');
    
    // If '@' is not found, return an empty string
    if (atIndex === -1) {
        return "";
    }
    
    // Find the index of the first space after '@'
    var spaceIndex = text.indexOf(' ', atIndex);
    
    // If no space is found after '@', return the text after '@'
    if (spaceIndex === -1) {
        return text.substring(atIndex + 1);
    }
    
    // Return the text between '@' and the first space
    return text.substring(atIndex + 1, spaceIndex);
}
let usernames = [];
const msgCtn= new Map();
const repCTN = new Map();
const XDCTN = new Map();
const M1P1 = new Map();
const DELCTN = new Map();
const ATEN = new Map();
let P1Value = 0;
let M1Value = 0;
client.on('message', (channel, tags, message, self, id) => {
	// "Alca: Hello, World!"
	console.log(`${tags['display-name']}: ${message}`);
	if(self)return

//Message count
	if (msgCtn.has((tags['display-name']))){
		msgCtn.set(tags['display-name'],(msgCtn.get(tags["display-name"])+1));
		console.log([...msgCtn]);
}else{
	msgCtn.set(tags['display-name'],1);
	console.log([...msgCtn]);
}
// Mentions count
if (message.includes("@")){
	if(extractTextAfterAt(message)!= channel){
	if(repCTN.has(extractTextAfterAt(message))){
		repCTN.set(extractTextAfterAt(message),(repCTN.get(extractTextAfterAt(message)+1)))
		console.log(...repCTN)
	}else{
		repCTN.set(extractTextAfterAt(message),1)
		console.log(...repCTN)
	}
}}

// Count 
if(message.includes("@")&&message.includes("XD")){
	if(XDCTN.has(extractTextAfterAt(message))){
		XDCTN.set(extractTextAfterAt(message),(repCTN.get(extractTextAfterAt(message)+1)))
		console.log(...XDCTN)
	}else{
		XDCTN.set(extractTextAfterAt(message),1)
		console.log(...XDCTN)
	}

}
if(message.includes("+1")){
	P1Value++
}
if(message.includes("-1")){
	M1Value++
}
//Atencjusz
if(message.includes("@delordione")){
	if(ATEN.has(tags['display-name'])){
		ATEN.set(tags['display-name'],ATEN.get(tags['display-name']+1))
	}else{
		ATEN.set(tags['display-name'],1)
	}
}

});
client.on("messagedeleted", (channel, username, deletedMessage, userstate, tags) => {
	if (DELCTN.has((tags['display-name']))){
		DELCTN.set(tags['display-name'],(DELCTN.get(tags["display-name"])+1));
		console.log([...DELCTN]);
}else{
	msgCtn.set(tags['display-name'],1);
	console.log([...DELCTN]);
}
});

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

function writeMaxValues() {
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

    maps.forEach(({ name, map }) => {
        const { key, value } = findMax(map);
        log += `${name}: Key: ${key}, Value: ${value}\n`;
    });

    log += '\n';
	log += ("Plus 1: "+ P1Value)
	log += ("\nMinus 1: "+M1Value)

    fs.appendFile('max_values.txt', log, (err) => {
        if (err) throw err;
        console.log('Max values appended to max_values.txt');
    });
}
setInterval(writeMaxValues, 10000);