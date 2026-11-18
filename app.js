if (process.env.NODE_ENV != "production") {
   require("dotenv").config();
}

const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// const { isLoggenIn } = require("./middlewares.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const DBurl = process.env.ATLAS_DB_URL;

main()
   .then(() => console.log("Connection Successful"))
   .catch((err) => console.log(err));

async function main() {
   // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
   await mongoose.connect(DBurl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); // to use same template in multipls ejs file

const store = MongoStore.create({
   mongoUrl: DBurl,
   crypto: {
      secret: process.env.SECRET,
   },
   touchAfter: 24 * 60 * 60, // in seconds
});

const sessionOptions = {
   store,
   secret: process.env.SECRET,
   resave: false,
   saveUninitialized: true,
   cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // in miliseconds
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
   },
};

store.on("error", () => {
   console.log("ERROR in mongo session store", err);
});

app.use(session(sessionOptions));
app.use(flash());

// for passport mechanisam
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this res.locals should be after session
app.use((req, res, next) => {
   res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currUser = req.user;
   next();
});

// User adding to database
// app.get("/demouser", async (req, res) => {
//    let fakeUser = new User({
//       email: "student@gmail.com",
//       username: "delta-student",
//    });

//    let registeredUser = await User.register(fakeUser, "hello-world");
//    res.send(registeredUser);
// });

app.get("/", (req, res) => {
   res.redirect("/listings");
});

app.use("/listings", listingsRouter); // all listing routes
app.use("/listings/:id/reviews", reviewsRouter); // all review routes
app.use("/", userRouter); // all review routes

// for all route if error
app.all("*", (req, res, next) => {
   next(new ExpressError(404, "Page not found!"));
});

// error middleware
app.use((err, req, res, next) => {
   let { statusCode = 500, message = "Error Message" } = err;
   res.status(statusCode).render("./listings/error.ejs", { err });
   // res.status(statusCode).send(message);
});

// listen port
app.listen(8080, () => {
   console.log("Server is listening on port 8080");
});
