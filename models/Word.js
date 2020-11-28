const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    reverse_index_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'post'
        }
    ]

    
});

module.exports = {Word: mongoose.model('word', WordSchema)};