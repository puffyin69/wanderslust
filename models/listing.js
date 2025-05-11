const mongoose = require("mongoose");
const Review = require("./reviews.js");
async function main() {
    await mongoose.connect('mongodb+srv://kirtanthakkar30:XLL64oHMK8JweHde@cluster1.fwmjtkj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1');
}


main().then((res)=>{
    console.log("the connection made succesfully");
}).catch((err)=>{
    console.log("an error occured!");
})



const listingschema = new mongoose.Schema({
    title:{
        type : String,
        required : true,
        maxlength:120
    },
    description :{
        type: String,
        required : true,
        minLength:25,
    },
    image : {
        url: String,
        filename: String
    },
    price : Number,
    location : {    
        type: String,
        latitude: Number,
        longitude: Number,
        required : true
    },
    country : {
        type: String,
        required : true
    },
    category :{
        type: String,
        enum: ['Trending',"Room","Beach","iconic cities","Mountain","Castles","Pools","Camping",'Bed and Breakfast',"New","Artic","Chef's Kitchen"],
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})
//post middle che je aagar koi listing delete thase toh eeni hare eena reviews bi badhaj delete kari nakse ekle code optimise thai gayo
listingschema.post("findOneAndDelte",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in : listing.reviews}})
    }
})

const Listing =  mongoose.model("Listing",listingschema);
module.exports = Listing ;
