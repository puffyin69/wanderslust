const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { review: reviewSchema } = require("../schema.js"); // Correctly import the review schema
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");


module.exports = router;