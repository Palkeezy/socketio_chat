const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Chat', ChatSchema);
