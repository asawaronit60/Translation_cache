const mongoose = require('mongoose');

const trasnlationSchema = new mongoose.Schema({
    textToTranslate: {
        from: String,
        text: String
    },
    translation: {
        to: String,
        trans: String,
    },
    smartTranslation: [{
        from:String,
        to: String,
        trans: String
    }]
})


const Translation = new mongoose.model('Translation', trasnlationSchema)

module.exports = Translation