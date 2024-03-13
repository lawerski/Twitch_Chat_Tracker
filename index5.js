const tmi = require('tmi.js');

const client = new tmi.Client({
	channels: [ 'revo_toja' ]
});

client.connect();
let usernames = [];
const msgCtn= new Map();
client.on('message', (channel, tags, message, self) => {
	// "Alca: Hello, World!"
	console.log(`${tags['display-name']}: ${message}`);
	if(self)return
	if (msgCtn.has((tags['display-name']))){
		msgCtn.set(tags['display-name'],(msgCtn.get(tags["display-name"])+1));
		console.log([...msgCtn]);
		console.log(tags)
}else{
	msgCtn.set(tags['display-name'],1);
	console.log([...msgCtn]);
}
if(message.includes('@')){

}

});
				
