const request = require('request')
const Discord = require("discord.js");
const md5 = require('md5');

module.exports = (bot) => {

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

	function updateGame(){
		request("http://hexcraft.pro:8004/statistics?json=1",
		    (err,res,body) => {
		    	if(err) {
		    		bot.setGame("Couldn't update status retrying.",'https://twitch.tv/chisdealhd')
		    		return
		    	}
		        var data = JSON.parse(body);
		        bot.set('radioinfo', data);

		        if(data.streams[0].bitrate == '0') {
					bot.setGame('with the radio','https://twitch.tv/chisdealhd')
					return
				}

		        bot.setGame('Nowplaying: '+data.streams[0].songtitle,'https://twitch.tv/chisdealhd')
			}
		)
	}

	bot.client.on('ready', () => {
		updateGame()
		setInterval(updateGame, 10 * 1000)
	})

	bot.addTraditionalCommand('radio np', message => {
		message.delete(1000)
		let info = bot.get('radioinfo')

		if(info.streams[0].bitrate == '0') {
			message.reply('Radio not live')
			return
		}
		if(info.streams[0].songtitle == null || info.streams[0].uniquelisteners == null) {
			message.reply("Not receiving enough info")
			return
		}

		let embed = new Discord.RichEmbed();
		embed.setColor(0x9900FF)
		embed.setTitle('TalentRecordz')
		embed.addField("Now Playing: ", info.streams[0].songtitle)
		if(info.streams[0].nexttitle != null) {
			embed.addField("Up next: ", info.streams[0].nexttitle)
		}
		var listeners = info.streams[0].uniquelisteners -1 //subtract the bot
		listeners += bot.get('voiceListeners') || 0;
		embed.addField("Listeners: ", listeners)
		embed.setThumbnail("http://hexcraft.pro:8004/playingart?sid=1&"+ getRandomInt(0, 999999))
		embed.setFooter('TalentRecordz')
		embed.setURL('https://github.com/TortleWortle/DuckRecords-Discord-bot')

		message.channel.send({embed})
	})
}