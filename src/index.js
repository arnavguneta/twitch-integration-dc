const tmi = require('tmi.js')
const fetch = require('node-fetch')
const TwitchEmote = require("./models/twitch_emote")
const configs = require("./config.json")
require('./db/mongoose')

// collection of all emotes by channel id
let emotes = {}

const LOG_CHANNELS = configs.map(channel => channel.name)

const get_emotes = async () => { 
	let all_emotes = [];
	try {
		require('./db/mongoose')
		all_emotes = await TwitchEmote.find({'data.active': true})
	} catch (error) {
		console.error(`Error occurred refreshing emotes: ${error}`)
	}
	for (let emote of all_emotes) {
		if (emotes.hasOwnProperty(emote.channel.id))
			emotes[emote.channel.id].push(emote)
		else 
			emotes[emote.channel.id] = [emote]
	}
	console.log(`emote fetched len: ${all_emotes.length}`)
}

get_emotes()
setInterval(get_emotes, 300000)

const get_channel = (name) => {
	for (const channel of configs) 
		if (channel.name === name) return channel
}

// emotes per channel instead of all channel emotes
const fix_message = (message, channel_id) => {
	let msg = message.split(' ')
	let channel_emotes = emotes[channel_id] || []
	for (let i = 0; i < msg.length; i++) {
		for (let emote of channel_emotes) {
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
				body: JSON.stringify({ content: message, username: tags['display-name'], 'avatar_url': channel.profile }),
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