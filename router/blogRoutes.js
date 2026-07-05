const express = require("express");
const router = express.Router();
const formdible = require("express-formidable");

// CONTROLLERS
const {
  blogAddData,
  blogGetData,
  blogGetPhoto,
  getSingleBlog,
  searchBlogs,
} = require("../controller/blogController");

// CREATE BLOG
router.post("/blog", formdible(), blogAddData);

// GET ALL BLOGS (WITH CATEGORY FILTER)
router.get("/getblogs", blogGetData);

// GET SINGLE BLOG
router.get("/getblog/:id", getSingleBlog);

// GET BLOG IMAGE
router.get("/img/:id", blogGetPhoto);

// SEARCH BLOGS
router.get("/search", searchBlogs);

module.exports = router;