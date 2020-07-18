const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
const assert = require("assert");

mongoose.plugin(slug);
mongoose.connection.on("error", console.error.bind(console, "MongoDB connection Error:"));
mongoose.Promise = global.Promise;
mongoose.connect(
    process.env.MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.on("error", console.error.bind(console, "MongoDB connection Error:"));
mongoose.set("debug", true);

module.exports = mongoose.connection;
