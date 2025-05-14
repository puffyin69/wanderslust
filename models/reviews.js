const mongoose = require("mongoose");

async function main() {
    await mongoose.connect('mongodb+srv://kirtanthakkar30:XLL64oHMK8JweHde@cluster1.fwmjtkj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1');
}


main().then((res)=>{
    console.log("the connection made succesfully");
}).catch((err)=>{
    console.log("an error occured!");
})
const reviewSchema =  new mongoose.Schema({
    comment : String,
    rating : {
        type:Number,
        min:1,
        max:5
    },
    createdAt : {
        type:Date,
        default:Date.now
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

const Review = mongoose.model("Review",reviewSchema);
module.exports = Review;


