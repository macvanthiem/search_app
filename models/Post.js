const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    normalized_if: [
        {
            word: {
                type: String,
                required: true
            },

            _if: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = {Post: mongoose.model('post', PostSchema)};