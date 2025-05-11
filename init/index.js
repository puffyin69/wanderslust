const mongoose = require("mongoose");
let initdata = require("../data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderslust');
}

main().then(() => {
    console.log("the connection made successfully");
}).catch((err) => {
    console.log("an error occurred!", err);
});

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("the data has been stored successfully heheh");
}
initDB();