const tmi = require('tmi.js')
const fetch = require('node-fetch')
const TwitchEmote = require("./models/twitch_emote")
const configs = require("./config.json")
require('./db/mongoose')

// collection of all emotes by channel id
let emotes = {}
const profiles = {
	"coolkidarnie": "https://static-cdn.jtvnw.net/jtv_user_pictures/1d0e8c09-f229-4161-9cc0-78a77a593084-profile_image-70x70.png",
	"erobb221": "https://cdn.betterttv.net/emote/5fc53fdecac2fb4621e48bb0/3x",
	"zoil": "https://cdn.betterttv.net/emote/620ae6fd06fd6a9f5be48c01/3x"
}

const LOG_CHANNELS = configs.map(channel => channel.name)

const get_emotes = async () => { 
	let all_emotes = await TwitchEmote.find({}) 
	for (let emote of all_emotes) {
		if (emotes.hasOwnProperty(emote.channel.id))
			emotes[emote.channel.id].push(emote)
		else 
			emotes[emote.channel.id] = [emote]
	}
	print(emotes)
}

get_emotes()
setInterval(get_emotes, 1800000)

const get_channel = (name) => {
	for (const channel of configs) 
		if (channel.name === name) return channel
}

// emotes per channel instead of all channel emotes
const fix_message = (message, channel_id) => {
	let msg = message.split(' ')
	for (let i = 0; i < msg.length; i++) {
		for (let emote of emotes[channel_id]) {
			if (msg[i] === emote.name) {
				msg[i] = `<${(emote.animated) ? 'a' : ''}:${emote.name}:${emote.id}>`
			}
		}
	}
	return msg.join(' ')
}

const client = new tmi.Client({
	channels: LOG_CHANNELS
});

client.connect()

client.on('message', async (channel, tags, message, self) => {
	if (tags.badges?.hasOwnProperty('broadcaster')) {
		message = fix_message(message, tags['user-id'])
		channel = get_channel(tags['display-name'])
		for (const webhook of channel.webhooks) {
			const res = await fetch(webhook, {
				method: 'POST',
				body: JSON.stringify({ content: message, username: tags['display-name'], 'avatar_url': profiles[tags.username] }),
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}
});

// notify webhook on startup
(async () => {
	const res = await fetch(process.env.MONITOR_WEBHOOK, {
		method: 'POST',
		body: JSON.stringify({ content: 'Now online :)', username: 'raspberry-pi', 'avatar_url': 'https://i.imgur.com/5oiMjdI.png' }),
		headers: { 'Content-Type': 'application/json' }
	});
})();