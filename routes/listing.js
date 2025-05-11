const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const methodOverride = require('method-override')
const ExpressError = require("../utils/ExpressError.js");
const { listing: listingSchema } = require("../schema.js"); // Correctly import the listing schema
const Listing = require("../models/listing.js");
router.use(methodOverride('_method'));


module.exports = router;