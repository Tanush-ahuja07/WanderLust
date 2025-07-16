if(process.env.NODE_ENV != "production"){
        require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override"); // Import method-override for PUT and DELETE methods
const ejsMate = require('ejs-mate'); // Import ejs-mate for layout support
const ExpressError = require("./utils/ExpressError.js"); //Express error class
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const Listing = require('./models/listing.js');


const dbUrl = process.env.ATLASDB_URL;

//                   Connect to MongoDB
main().then(()=>{
        console.log("connection is successful");
})
.catch((err)=>{
        console.log(err);
})

async function main(){
        await mongoose.connect(dbUrl);
}

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); 
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter : 24 * 3600,
});
store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions = {
        store,
        secret : process.env.SECRET,
        resave : false,
        saveUninitialized: false,
        cookie : {
                expires : Date.now() + 7 * 24 * 60 *60 * 1000,
                maxAge : 7 * 24 * 60 *60 * 1000,
                httpOnly : true,
        }
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
})

//LISTINGS
app.use("/listings",listingRouter);
//REVIEW
app.use("/listings/:id/reviews",reviewRouter);
//USER
app.use("/",userRouter);


app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    req.flash('error', 'Please enter a search term.');
    return res.redirect('/listings'); 
  }

  try {
    
    const listing = await Listing.findOne({
      title:  {$regex: `^${query}$`, $options: 'i'}
    });

    if (listing) {
      
      return res.redirect(`/listings/${listing._id}`);
    } else {
      req.flash('error', `No listing found for "${query}"`);
      return res.redirect('/listings'); 
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    return res.redirect('/listings');
  }
});

// ERROR HANDLING
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
        let{status=500,message="Something went wrong"} = err;
        res.status(status).render("listings/error.ejs",{message});
        //res.status(status).send(message);
})

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
