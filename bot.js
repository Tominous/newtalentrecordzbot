/**
 * Created by TortleWortle on 3/31/2017.
 */
// This is an example bot
const TortleBot = require('tortlebot-core')
const Discord = require("discord.js");
const config = require('./config.json');
const client = new Discord.Client({ autoReconnect: true });
const errorlog = require("./data/errors.json")
const fs = require("fs")
const rb = "```"

client.login(config.token)

const bot = new TortleBot(client);

console.log("BOT IS STARTING UP!")
//var msg = `
//------------------------------------------------------
//> Do 'git pull' periodically to keep your bot updated!
//> Logging in...
//------------------------------------------------------
//Logged in as ${bot.client.user.username} [ID ${bot.client.user.id}]
//On ${bot.client.guilds.size} servers!
//${bot.client.channels.size} channels and ${bot.clientbot.users.size} users cached!
//Bot is logged in and ready to play some tunes!
//LET'S GO!
//------------------------------------------------------`

//console.log(msg)


bot.client.on("guildMemberAdd", member => {
    let guild = member.guild;
    var guildID = member.guild.id;
    var guildGeneral = member.guild.defaultChannel.id;
    //console.log(guildGeneral);
    //console.log(guildID);
    if (guildID == "250354580926365697") { //Meme M8s Guild ID
        member.addRole(guild.roles.find('name', 'Lil Meme'));
        //client.channels.get(guildGeneral).sendMessage("Hey " + member.displayName + ", welcome to the **Chill Spot**! You are now a Lil Meme. Please read #welcome and enjoy your stay!");
    }
    if (guildID == "169960109072449536") { //Innovative Studios Guild ID
        member.addRole(guild.roles.find('name', 'Citizens of Townsville'));
    }
});

bot.client.on("guildCreate", guild => {
    console.log("I just joined a new server called " + guild.name)
    guild.defaultChannel.createInvite({
        maxAge: 0
    }).then(result => fs.writeFile("./servers/" + guild.name + ".txt", "Invite Code - " + result))
    guild.defaultChannel.sendMessage("Hey guys and gals! I\'m M8 Bot! Its great to meet you all, and I hope you enjoy me :P\nA list of my commands can be found by useing \"!help m8bot\".\nIf you encounter any issues, you can type \"!m8bug\" to recive links to submit issues!")

});

bot.client.on("guildDelete", guild => {


});

bot.setPrefix(config.prefix)

//bot.registerModule(require('./modules/stream/mixer'));
bot.registerModule(require('./modules/admin/eval'));
//bot.registerModule(require('./modules/radioplay'));
bot.registerModule(require('./modules/commands/help'));
bot.registerModule(require('./modules/audio/radio/radiostats'));
bot.registerModule(require('./modules/audio/radio/radioplay'));
bot.registerModule(require('./modules/audio/youtube/youtube'));

process.on('unhandledRejection', console.error);