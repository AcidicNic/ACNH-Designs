const mongoose = require('mongoose');
const slug = require('mongoose-url-slugs');

const designSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String },
    img: { type: String },
    slug: { type: String, slug: "title",  unique: true },
    creator: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    designId: { type: String },
});

const Design = mongoose.model('Design', designSchema);

module.exports = Design;
