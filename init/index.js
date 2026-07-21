const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();

const DBurl = process.env.ATLAS_DB_URL;

main()
   .then(() => console.log("Connection Successful"))
   .catch((err) => console.log(err));

async function main() {
   await mongoose.connect(DBurl);
}

const initDB = async () => {
   await Listing.deleteMany({});
   console.log(initdata.data);
   // to add owner in database
   initdata.data = initdata.data.map((obj) => ({
      ...obj,
      owner: "6a5f891e45e828cf386c2e9b",
   }));
   await Listing.insertMany(initdata.data);
   console.log("data initialized");
};

initDB();
