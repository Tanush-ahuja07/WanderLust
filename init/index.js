const mongoose = require('mongoose');
const initData = require('./data.js'); // Import the data from data.js
const Listing = require('../models/listing.js'); // Import the Listing model


//                   Connect to MongoDB
main()
.then(()=>{
        console.log("connection is successful");
})
.catch((err)=>{
        console.log(err);
})

async function main(){
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async ()=>{
        await Listing.deleteMany({});
        initData.data = initData.data.map((obj)=>({...obj,owner:"6875172cc11d62e2b8198844"}));
        await Listing.insertMany(initData.data);
        console.log("Data was initialized successfully");
}

initDB();