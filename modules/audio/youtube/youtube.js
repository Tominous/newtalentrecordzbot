const request = require('request')
const Discord = require("discord.js");
const config = require('../../../config.json');
const ytdl = require('ytdl-core')
const search = require('youtube-search')
const markdown = require( "markdown" ).markdown;
const queues = {}
const errorlog = require("../../../data/errors.json")
const fs = require("fs")
const twitchusername = config.twitchusername;
const ytkey = config.youtube_api_key;
const rb = "```"

const opts = {
    part: 'snippet',
    maxResults: 10,
    key: config.youtube_api_key
}
var intent;

module.exports = (bot) => {
    	
    function getQueue(guild) {
        if (!guild) return
        if (typeof guild == 'object') guild = guild.id
        if (queues[guild]) return queues[guild]
        else queues[guild] = []
        return queues[guild]
    }

    var paused = {}

    function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
	}

   //Fix dis shit its BROKEN for STOP command!
   // function getRandomMusic(queue, msg) {
   //     fs.readFile('./modules/audio/youtube/autoplaylist.txt', 'utf8', function(err, data) {
   //         if (err) throw err;
   //         console.log('OK: autoplaylist.txt');
   //         var random = data.split('\n');
   //
   //         var num = getRandomInt(random.length);
   //         console.log(random[num])
   //         var url = random[num];
   //         msg.author.username = "AUTOPLAYLIST";
   //         play(msg, queue, url)
   //    });
   // }

bot.client.on('voiceStateUpdate', function(oldMember, newMember) {
	var svr = bot.client.guilds.array()
    for (var i = 0; i < svr.length; i++) {
        if (svr[i].voiceConnection) {
            if (paused[svr[i].voiceConnection.channel.id]) {
                if (svr[i].voiceConnection.channel.members.size > 1) {
                    //svr[i].defaultChannel.sendMessage("I resumed my music in " + svr[i].voiceConnection.channel.name)
					paused[svr[i].voiceConnection.channel.id].player.resume()
					var game = bot.client.user.presence.game.name;
                    delete paused[svr[i].voiceConnection.channel.id]
                    game = game.split("⏸")[1];
					bot.client.user.setGame(+game,'https://twitch.tv/'+twitchusername);
                }
            }
            if (svr[i].voiceConnection.channel.members.size === 1 && !svr[i].voiceConnection.player.dispatcher.paused) {
                //svr[i].defaultChannel.sendMessage("I paused my music in the voice channel because no one is there, rejoin the channel to resume music")
                svr[i].voiceConnection.player.dispatcher.pause();
                var game = bot.client.user.presence.game.name;
                paused[svr[i].voiceConnection.channel.id] = {
                    "player": svr[i].voiceConnection.player.dispatcher
                }
                bot.client.user.setGame("⏸ " + game,'https://twitch.tv/'+twitchusername);
            }
        }
    }
});
    function play(msg, queue, song) {
        try {
            if (!msg || !queue) return;
            //if (msg.guild.voiceConnection.channel.members.first() == undefined)
            if (song) {
                search(song, opts, function(err, results) {
                    if (err) return msg.channel.sendMessage("Video not found please try to use a youtube link instead.");
                    song = (song.includes("https://" || "http://")) ? song : results[0].link
                    let stream = ytdl(song, {
                        audioonly: true
                    })

                    stream.on('error', function(error) {
                        return msg.channel.sendMessage("Could not play video, or Video is Private. Please try another URL or SONGNAME!");
                    })

                    let test
                    if (queue.length === 0) test = true
                    queue.push({
                        "title": results[0].title,
                        "requested": msg.author.username,
                        "toplay": stream
                    })
                    console.log("Queued " + queue[queue.length - 1].title + " in " + msg.guild.name + " as requested by " + queue[queue.length - 1].requested)
                    msg.channel.sendMessage("Queued **" + queue[queue.length - 1].title + "**")
                    if (test) {
                        setTimeout(function() {
                            play(msg, queue)
                        }, 1000)
                    }
                })
            } else if (queue.length != 0) {
                msg.channel.sendMessage(`Now Playing **${queue[0].title}** | Requested by ***${queue[0].requested}***`)
                console.log(`Playing ${queue[0].title} as requested by ${queue[0].requested} in ${msg.guild.name}`);
                bot.client.user.setGame('Playing: ' +queue[0].title+' | Connected servers: '+bot.client.guilds.size,'https://twitch.tv/'+twitchusername);
                let connection = msg.guild.voiceConnection
                if (!connection) return console.log("No Connection!");
                intent = connection.playStream(queue[0].toplay)

                intent.on('error', () => {
                    queue.shift()
                    play(msg, queue)
                })

                intent.on('end', () => {
                    queue.shift()
                    play(msg, queue)
                })
            } else {
                msg.channel.sendMessage('No more music in queue!')


                //TODO: When no more music, play randomly from playlist

                //getRandomMusic(queue, msg);


            }
        } catch (err) {
            console.log("WELL LADS LOOKS LIKE SOMETHING WENT WRONG! Visit MusicBot server for support (https://discord.gg/EX642f8) and quote this error:\n\n\n" + err.stack)
            errorlog[String(Object.keys(errorlog).length)] = {
                "code": err.code,
                "error": err,
                "stack": err.stack
            }
            fs.writeFile("../data/errors.json", JSON.stringify(errorlog), function(err) {
                if (err) return console.log("Even worse we couldn't write to our error log file! Make sure data/errors.json still exists!");
            })

        }
    }
    bot.client.on('voiceStateUpdate', function(oldMember, newMember) {
    	var svr = bot.client.guilds.array()
        for (var i = 0; i < svr.length; i++) {
            if (svr[i].voiceConnection) {
                if (paused[svr[i].voiceConnection.channel.id]) {
                    if (svr[i].voiceConnection.channel.members.size > 1) {
                        //svr[i].defaultChannel.sendMessage("I resumed my music in " + svr[i].voiceConnection.channel.name)
    					paused[svr[i].voiceConnection.channel.id].player.resume()
    					var game = bot.client.user.presence.game.name;
                        delete paused[svr[i].voiceConnection.channel.id]
                        game = game.split("⏸")[1];
    					bot.client.user.setGame(+game,'https://twitch.tv/'+twitchusername);
                    }
                }
                if (svr[i].voiceConnection.channel.members.size === 1 && !svr[i].voiceConnection.player.dispatcher.paused) {
                    //svr[i].defaultChannel.sendMessage("I paused my music in the voice channel because no one is there, rejoin the channel to resume music")
                    svr[i].voiceConnection.player.dispatcher.pause();
                    var game = bot.client.user.presence.game.name;
                    paused[svr[i].voiceConnection.channel.id] = {
                        "player": svr[i].voiceConnection.player.dispatcher
                    }
                    bot.client.user.setGame("⏸ " + game,'https://twitch.tv/'+twitchusername);
                }
            }
        }
    });

	bot.addTraditionalCommand('ytplay', message => {
			message.delete(1000)

			if (!message.guild.voiceConnection) {
                if (!message.member.voiceChannel) return message.channel.sendMessage('You need to be in a voice channel')
                var chan = message.member.voiceChannel
                chan.join()
            }
            let suffix = message.content.split(" ").slice(1).join(" ")
            if (!suffix) return message.channel.sendMessage('You need to specify a song link or a song name!')

            play(message, getQueue(message.guild.id), suffix)
        //Empty func?
	})

 	bot.addTraditionalCommand('ytstop', message => {
        message.delete(1000)
        message.guild.voiceConnection.disconnect()
        message.channel.sendMessage(':wave: : no music then :( well im all alone!')
    })


	bot.addTraditionalCommand('ytpause', message => {
			message.delete(1000)

			if (message.guild.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1) {
                let player = message.guild.voiceConnection.player.dispatcher
                if (typeof player == 'undefined' || player.paused) return message.channel.sendMessage("Bot is not playing")
                player.pause();
                message.channel.sendMessage("Pausing music...");
            } else {
                message.channel.sendMessage('Only admins can use this command!');
			}
	})

	bot.addTraditionalCommand('ytqueue', message => {
			message.delete(1000)

			let queue = getQueue(message.guild.id);
            if (queue.length == 0) return message.channel.sendMessage("No music in queue");
            let text = '';
            for (let i = 0; i < queue.length; i++) {
                text += `${(i + 1)}. ${queue[i].title} | requested by ${queue[i].requested}\n`
            };
            message.channel.sendMessage(`${rb}xl\n${text}${rb}`);
	})

	bot.addTraditionalCommand('ytnp', message => {
			message.delete(1000)

			let queue = getQueue(message.guild.id);
            if (queue.length == 0) return message.channel.sendMessage(message, "No music in queue");
            message.channel.sendMessage(`${rb}xl\nCurrently playing: ${queue[0].title} | by ${queue[0].requested}${rb}`);
	})

	bot.addTraditionalCommand('ytresume', message => {
			message.delete(1000)

			if (message.guild.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1) {
                let player = message.guild.voiceConnection.player.dispatcher
                if (!player) return message.channel.sendMessage('No music is playing at this time.');
                if (player.playing) return message.channel.sendMessage('The music is already playing');
                var queue = getQueue(message.guild.id);
                bot.client.user.setGame(queue[0].title);
                player.resume();
                message.channel.sendMessage("Resuming music...");
            } else {
                message.channel.sendMessage('Only admins can do this command');
			}
	})

	bot.addTraditionalCommand('ytskip', message => {
			message.delete(1000)

			if (message.guild.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1 || message.channel.permissionsFor(message.member).hasPermission('MANAGE_SERVER')) {
                let player = message.guild.voiceConnection.player.dispatcher
                if (!player || player.paused) return message.channel.sendMessage("Bot is not playing!")
                message.channel.sendMessage('Skipping song...');
                player.end()
            } else {
                message.channel.sendMessage('Only the admins can do this command');
			}
	})

	bot.addTraditionalCommand('ytclear', message => {
			message.delete(1000)

			if (message.guild.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1 || message.channel.permissionsFor(message.member).hasPermission('MANAGE_SERVER')) {
                let queue = getQueue(message.guild.id);
                if (queue.length == 0) return message.channel.sendMessage(`No music in queue`);
                for (var i = queue.length - 1; i >= 0; i--) {
                    queue.splice(i, 1);
                }
                message.channel.sendMessage(`Cleared the queue`)
            } else {
                message.channel.sendMessage('Only the admins can do this command');
			}
	})


	bot.addTraditionalCommand('ytvolume', message => {
			message.delete(1000)

			let suffix = message.content.split(" ")[1];
            var player = message.guild.voiceConnection.player.dispatcher
            if (!player || player.paused) return message.channel.sendMessage('No music m8, queue something with `' + prefix + 'play`');
            if (!suffix) {
                message.channel.sendMessage(`The current volume is ${(player.volume * 100)}`);
            } else if (message.guild.owner.id == message.author.id || message.author.id == config.owner_id || config.admins.indexOf(message.author.id) != -1) {
                let volumeBefore = player.volume
                let volume = parseInt(suffix);
                if (volume > 100) return message.channel.sendMessage("The music can't be higher then 100");
                player.setVolume((volume / 100));
                message.channel.sendMessage(`Volume changed from ${(volumeBefore * 100)} to ${volume}`);
            } else {
				message.channel.sendMessage('Only admins can change the volume!');
			}
	})
}