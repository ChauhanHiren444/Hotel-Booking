const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
   const allListings = await Listing.find({});
   res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
   res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
   let { id } = req.params;
   let listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } }) //populate author for every review
      .populate("owner");
   if (!listing) {
      req.flash("error", "Listing Not Found");
      res.redirect("/listings");
   }
   // console.log(listing);
   res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
   // let result = listingSchema.validate(req.body);
   // console.log(result);

   let url = req.file.path;
   let filename = req.file.filename;
   // console.log(url, "..", filename);

   // let { title, description, price, country, location, image } = req.body;
   let newlisting = new Listing(req.body.listing);
   // console.log(newlisting);

   newlisting.owner = req.user._id;

   newlisting.image = { url, filename };
   // console.log(req.user);
   await new Listing(newlisting).save();
   req.flash("success", "Listing Added Successfully");
   res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
   let { id } = req.params;
   let listing = await Listing.findById(id);
   if (!listing) {
      req.flash("error", "Listing Not Found");
      res.redirect("/listings");
   }

   let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
   res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.editListing = async (req, res) => {
   let { id } = req.params;
   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   // console.log(listing);

   if (typeof req.file !== "undefined") {
      if (!req.file) {
         let url = req.file.path;
         let filename = req.file.filename;

         listing.image = { url, filename };
         await listing.save();
      }
   }

   req.flash("success", "Listing Updated Successfully");
   res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
   let { id } = req.params;
   await Listing.findByIdAndDelete(id);
   req.flash("success", "Listing Deleted Successfully");
   res.redirect("/listings");
};
