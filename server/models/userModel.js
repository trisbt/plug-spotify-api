const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [{
        id: { type: String, unique: true },
        song: { type: String },
        artist: { type: Array },
        album: { type: String },
        image: { type: String }
    }]
});

module.exports = mongoose.model('User', userSchema);
