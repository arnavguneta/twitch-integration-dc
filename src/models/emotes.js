const mongoose = require('mongoose')

const emoteSchema = new mongoose.Schema({
    animated: {
        type: Number,
        required: false,
        _id : false
    },
    id: {
        type: Object,
        required: false,
        _id : false
    },
    name: {
        type: String,
        required: false,
        _id : false
    }
})

const Emote = mongoose.model('Emote', emoteSchema)

module.exports = Emote