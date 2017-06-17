module.exports = (bot) => {
	bot.addTraditionalCommand("help", message => {
		message.delete(1000)
        var commands = bot.getTraditionalCommands()

        if(commands.length) {
            var replyMsg = "U in need, I help! \`\`\`"

            for (var i = 0; i < commands.length; i++) {
                replyMsg += bot.getPrefix() + commands[i].index + "\n"
            }

            replyMsg += "\`\`\`"
            message.channel.send(replyMsg)
        }
    })
}