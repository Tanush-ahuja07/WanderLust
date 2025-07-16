const Listing = require('../models/listing.js');
const axios = require('axios');

//index
module.exports.index = async (req,res)=>{
       const allListings =  await Listing.find({});
       res.render("listings/index.ejs", { allListings });
}


//new listing
module.exports.renderNewForm = (req,res)=>{
        res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path : "reviews",populate:{path:"author"}})
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req,res,next)=>{
            const locationQuery = req.body.listing.location;
            const geoResponse = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {
                params: {
                q: locationQuery,
                format: 'json'
                },
                headers: {
                'User-Agent': 'WanderLust/1.0 (http://localhost:8080)'
                }
            }
            );
            let latitude = null;
            let longitude = null;

            if (geoResponse.data.length > 0) {
            latitude = geoResponse.data[0].lat;
            longitude = geoResponse.data[0].lon;
            } else {
            console.log('⚠️ No geocoding results found.');
                latitude = null;
                longitude = null;
            } 
            let url = req.file.path;
            let filename = req.file.filename;
            const newListing = new Listing(req.body.listing); // Create a new listing using the request body
            newListing.owner = req.user._id;
            newListing.image = {url,filename};
            newListing.latitude = latitude;
            newListing.longitude = longitude;
            await newListing.save();
            req.flash("success","New Listing Created!");
            res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;   
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_300");
    res.render("listings/edit.ejs", { listing , originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const locationQuery = req.body.listing.location;

  const geoResponse = await axios.get(
    'https://nominatim.openstreetmap.org/search',
    {
      params: {
        q: locationQuery,
        format: 'json'
      },
      headers: {
        'User-Agent': 'WanderLust/1.0 (http://localhost:8080)'
      }
    }
  );

  let latitude = null;
  let longitude = null;

  if (geoResponse.data.length > 0) {
    latitude = geoResponse.data[0].lat;
    longitude = geoResponse.data[0].lon;
  } else {
    console.log('⚠️ No geocoding results found.');
  }

  let listing = await Listing.findByIdAndUpdate(
    id,
    {
      ...req.body.listing,
      latitude: latitude,
      longitude: longitude
    },
    { new: true }
  );
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req,res)=>{
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success","Listing Deleted!");
        res.redirect("/listings");
}