const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    country: {
        type: String,
        
    },
    city: {
        type: String,
        

    },
    post:{
        type: String,

    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    benefit:{
        type: String,
        required: true
    },
    criteria:{
        type:String,
        required:true
    },
document:{
    type: String,
    required:true
},
apply:{
    type: String,
    required:true
},

    deadline: {
        type: String,
        required: true
    },
 website: {
  type: String,
 
},

    photo: {
        data: Buffer,
        contentType: String
    }

}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);