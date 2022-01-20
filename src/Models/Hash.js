const mongoose = require('mongoose');


const HashSchema = new mongoose.Schema(
    {
        hash: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
    }
);

const Hash = mongoose.model('Hash', HashSchema);
module.exports = {Hash, HashSchema};