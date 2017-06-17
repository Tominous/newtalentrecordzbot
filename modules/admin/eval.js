const request = require('request')
const Discord = require("discord.js");
const config = require('../../config.json');
const admins = config.admins;

module.exports = (bot) => {

function isCommander(id) {
	if(id === config.owner_id) {
		return true;
	}
	for(var i = 0; i < admins.length; i++){
		if(admins[i] == id) {
			return true;
		}
	}
	return false;
}

	bot.addTraditionalCommand('eval', message => {
		message.delete(1000)
	if (isCommander(message.author.id)) {
                try {
                    let code = message.content.split(" ").splice(1).join(" ")
                    let result = eval(code)
                    message.channel.send("```diff\n+ " + result + "```")
                } catch (err) {
                    message.channel.send("```diff\n- " + err + "```")
                }
            } else {
			message.channel.send("Sorry, you do not have permissisons to use this command, **" + message.author.username + "**.")
		}
	});
}