var Discord = require('discord.js');
var auth = require('./auth.json');
const storage = require('node-persist');
var client = new Discord.Client();
client.on('ready', function (evt) {
    console.log('Connected');
});
client.on('message', async (message) => {
    if (message.content.substring(0, 1) == '#') {
        var args = message.content.substring(1).split(' ', 2);
        var cmd = args[0];
        var key = args[1];
        var payload = message.content.substring(cmd.length + key.length + 2)
        switch(cmd) {
            case 'add':
                var items = await storage.getItem(args[1]);
                if(!items){
                    items = [];
                }
                items.push(payload);
                await storage.setItem(key, items);
                message.channel.send(key + ": " + payload + " Saved!");
                break;
            case 'get':
                var items = await storage.getItem(key);
                items.forEach(function(element) {
                    message.channel.send("!play " + element);
                });
                break;
            case 'clear':
                await storage.removeItem(key);;
                message.channel.send(key + " Cleared!");
                message.channel.send(item);
                break;
         }
     }
});

storage.init({
	dir: 'data',
	stringify: JSON.stringify,
	parse: JSON.parse,
	encoding: 'utf8',
	logging: false,  
	ttl: false,
	expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache
    forgiveParseErrors: false
});

client.login(auth.token);