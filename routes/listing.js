const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js");
const { listingSchema } = require("../schema.js");
const listingController = require("../controller/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
   .route("/")
   // show all listings route
   .get(wrapAsync(listingController.index))
   // put data into listing route
   .post(
      isLoggedIn,
      // validateListing,
      upload.single("listing[image]"),
      wrapAsync(listingController.createListing)
   );

// add new listing route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
   .route("/:id")
   // show particular listing route
   .get(wrapAsync(listingController.showListing))
   // edit listing route
   .put(
      isLoggedIn,
      isOwner,
      upload.single("listing[image]"),
      // validateListing,
      wrapAsync(listingController.editListing)
   )
   // delete listing route
   .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// edit form route
router.get(
   "/:id/edit",
   isLoggedIn,
   isOwner,
   wrapAsync(listingController.renderEditForm)
);

module.exports = router;
