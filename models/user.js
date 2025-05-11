const mongoose = require("mongoose");
const passaportLocalMongoose = require("passport-local-mongoose");

//passport-local-mongoose adds username and password fields to the schema and handles hashing and salting of passwords
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    }
});

UserSchema.plugin(passaportLocalMongoose) ;

module.exports = mongoose.model("User",UserSchema) ;