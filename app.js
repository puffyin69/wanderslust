if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");
const { storage } = require("./CloudConfig.js"); // Import the Cloudinary storage configuration
const cloudinary = require("cloudinary").v2; // Import the Cloudinary library
const axios = require('axios');
const upload = multer({ storage }); // Store uploaded files in clodniary cloud
app.engine("ejs", ejsMate);
const session = require("express-session");
const MongoStore = require('connect-mongo');
app.use(flash());

const store = MongoStore.create({
    mongoUrl:"mongodb+srv://kirtanthakkar30:XLL64oHMK8JweHde@cluster1.fwmjtkj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1",
    crypto:{
        secret:"mysecretcode"
    },
    touchAfter:24*60*60, // 24 hours
})

// session options
const sessionoptions = {
    store:store,
    secret:"myscretecode",
    resave:false,
    saveUninitialized:true,
    cookie :{
        expires : Date.now() +7*24*60*60*1000, // 7 days days into hr into min into sec into ms
        maxAge : 7*24*60*60*1000, // 7 days,    
        httpOnly:true,

    }
};




// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionoptions));

// aa badha code passport npm na documentation ma che !1

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // or however you store the logged-in user
    next();
});


// Middleware for flash messages (move this above all routes)
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});



// Database connection
async function main() {
    await mongoose.connect("mongodb+srv://kirtanthakkar30:XLL64oHMK8JweHde@cluster1.fwmjtkj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1");
}
main()
    .then(() => {
        console.log("The connection was made successfully");
    })
    .catch((err) => {
        console.log("An error occurred!", err);
    });

// Set views directory and engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to validate listings
const validateListing = (req, res, next) => {
    const result = listingSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

// Middleware to validate reviews
const validateReview = (req, res, next) => {
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        const msg = result.error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

// Routes

//signup page
app.get("/signup",(req,res)=>{
    res.render("./user/signup.ejs");   

})
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email });
        await User.register(user, password); // register ane authenticate karva mate aa passport ma method hoy ee use kari chhe
        req.login(user,(err)=>{ //automatically login kari de sign up kariya paaachi
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        })
    } catch (err) {
        console.log(err);
        req.flash("error", "User already exists or registration failed");
        res.redirect("/signup");
    }
});
//login page
app.get("/login",(req,res)=>{
    res.render("./user/login.ejs");   
})
app.post("/login", passport.authenticate("local", { // pasport usees passport.authenticate method to authenticate the user
    successFlash: true, //authetication pass then flash the success message
    failureFlash: true, //authentication failed and flash the error message
    failureRedirect: "/login",// agar user cannot authenticate then redirect to login
}), (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect('/listings'); // redirect to the previous page or default to /listings
});



// Index route
app.get(
    "/listings",
    wrapAsync(async (req, res) => {
        let listings = await Listing.find({});
        res.render("listings.ejs", { listings });
    })
);

// Create new listing form
app.get("/listings/new", (req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error","You need to login first");
        return res.redirect("/login");
    }
    res.render("neww.ejs");
});

// Save new listing (with multer for file upload)
app.post(
    "/listings",
    upload.single("image"),
    wrapAsync(async (req, res) => {
        let { title, description, price, location, country, category } = req.body;
        let imageObj;
        if (req.file) {
            imageObj = {    
                url: req.file.path,
                filename: req.file.filename
            };
        }
        const newlt = new Listing({
            title,
            description,
            image: imageObj,
            price,
            location,
            country,
            category
        });
        await newlt.save();
        req.flash("success","New Listing has been added successfully");
        res.redirect("/listings");
    })
);

// Edit listing form
app.get(
    "/listings/:id/edit",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const editlt = await Listing.findById(id);
        if (!editlt) {
            throw new ExpressError(404, "Listing not found");
        }
        if(!req.isAuthenticated()){
            req.flash("error","You need to login first");
            return res.redirect("/login");
        }

        res.render("edit.ejs", { editlt });
    })
);
app.get("/listings/Trending", async (req, res) => {
    let listings = await Listing.find({ category: "Trending" });
    
    res.render("Trending.ejs", { listings });
});
app.get("/listings/Room",async(req,res)=>{
    let listings = await Listing.find({category:"Room"});
    res.render("room.ejs", { listings });
})
app.get("/listings/Beach",async(req,res)=>{ 
    let listings = await Listing.find({category:"Beach"});
    res.render("beach.ejs", { listings });
})
app.get("/listings/iconiccities",async(req,res)=>{
    let listings = await Listing.find({category:"iconic cities"});
    res.render("city.ejs", { listings });
})
app.get("/listings/Mountain",async(req,res)=>{
    let listings = await Listing.find({category:"Mountain"});
    res.render("mountain.ejs", { listings });
})
app.get("/listings/Castles",async(req,res)=>{   
    let listings = await Listing.find({category:"Castles"});
    res.render("castles.ejs", { listings });
})
app.get("/listings/Pools",async(req,res)=>{     
    let listings = await Listing.find({category:"Pools"});
    res.render("pools.ejs", { listings });
})
app.get("/listings/Camping",async(req,res)=>{
    let listings = await Listing.find({category:"Camping"});
    res.render("camping.ejs", { listings });
})
app.get("/listings/BedandBreakfast",async(req,res)=>{
    let listings = await Listing.find({category:"Bed and Breakfast"});
    res.render("rest.ejs", { listings });
})
app.get("/listings/Newfilter",async(req,res)=>{
    let listings = await Listing.find({category:"New"});
    res.render("New.ejs", { listings });
})
app.get("/listings/Artic",async(req,res)=>{ 
    let listings = await Listing.find({category:"Artic"});
    res.render("artic.ejs", { listings });
})
app.get("/listings/Chef'sKitchen",async(req,res)=>{
    let listings = await Listing.find({category:"Chef's Kitchen"});
    res.render("kitchen.ejs", { listings });
})

// Update listing (handle file upload and update image if new file is uploaded)
app.put(
    "/listings/:id",
    upload.single("image"),
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        if(!req.isAuthenticated()){
            req.flash("error","You need to login first");
            return res.redirect("/login");
        }
        if(!listing.owner._id.equals(res.locals.currentUser._id)){
            req.flash("error","You are not authorized to edit this listing");
            return res.redirect(`/listings/${id}`);
        }
        // Update fields
        listing.title = req.body.title;
        listing.description = req.body.description;
        listing.price = req.body.price;
        listing.country = req.body.country;
        listing.category = req.body.category;
        listing.owner = req.user._id;

        // If a new image is uploaded, update it
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        await listing.save();
        req.flash("success","Listing Updated successfully");
        res.redirect(`/listings/${id}`);
    })
);

app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logout successfully");
        res.redirect("/listings");
    })
})
/


// Delete listing
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
         let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currentUser._id)){
            req.flash("error","You are not authorized to Delete this listing");
            return res.redirect(`/listings/${id}`);
        };
        await Listing.findByIdAndDelete(id);
        if(!id) {
            req.flash("error","Listing not found");
        }
        if(!req.isAuthenticated()){
            req.flash("error","You need to login first");
            return res.redirect("/login");
        }   
        
        req.flash("error","Deleted review successfully");
        res.redirect("/listings");
    })
);
 
// Show listing
app.get(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const showlt = await Listing.findById(id).populate({path:"reviews",populate:{
            path:"author",
            model:"User"
        }}).populate("owner");
        if (!showlt) {
            throw new ExpressError(404, "Listing not found");
        }
        req.flash("success","Listing found successfully");

        console.log(showlt);

        
        res.render("show.ejs", { showlt });
    })
);


// Add review to listing
app.post(
    "/listings/:id/reviews",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        if(!req.isAuthenticated()){
            req.flash("error","You need to login first");
            return res.redirect("/login");
        }
        let { rating, comment } = req.body;
        let newReview = new Review({
            rating,
            comment,
        });
        newReview.author = req.user._id; // Set the owner of the review to the current user
        console.log(newReview);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        res.redirect(`/listings/${id}`);    
    })
);

// Delete review
app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        const listing = await Listing.findById(id);
        const review = await Review.findById(reviewId);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        if(!req.isAuthenticated()){
            req.flash("error","You need to login first");
            return res.redirect("/login");
        }
        if(!review.author._id.equals(res.locals.currentUser._id)){
            req.flash("error","You are not authorized to delete this review");
            return res.redirect(`/listings/${id}`);
        }
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        console.log(`Deleted review ${reviewId} from listing ${id}`);
       
         // Redirect back to the listing page after deleting the review
        res.redirect(`/listings/${id}`);
    })
);



// Catch-all route for undefined paths
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs", { err });
});

// Start server
const port = 8080;
app.listen(port, () => {
    console.log("The server is listening");
});