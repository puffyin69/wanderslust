const Joi = require('joi');
const listingSchema = {
    listing: Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null),
        location:Joi.string().required(),
        country:Joi.string().required(),
    })
};
module.exports = listingSchema;

const reviewSchema = Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required()
});

module.exports = reviewSchema;
