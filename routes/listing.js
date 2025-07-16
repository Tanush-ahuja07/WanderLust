const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing.js');
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })

// INDEX ROUTE
// POST route to create a new listing
router
        .route("/")
        .get(wrapAsync(listingController.index))
        .post(
                isLoggedIn,
                validateListing,
                upload.single('listing[image]'),
                wrapAsync (listingController.createListing)
        );
        
        
// create route to add the new listing
router.get("/new",isLoggedIn,listingController.renderNewForm);

// read route to show a single listing
//update route to update the listing
// delete route to delete a listing
router
        .route("/:id")
        .get(wrapAsync(listingController.showListing))
        .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
        .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



// edit and update route to edit an existing listing
router.get("/:id/edit",isOwner,isLoggedIn,wrapAsync(listingController.renderEditForm));


module.exports = router;