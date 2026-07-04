const fs = require("fs");
const BlogModel = require("../model/Blog");
const Subscriber = require("../model/subscriberModel");
const sendEmail = require("../config/email");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const sendNewBlogNotifications = async (blog) => {
  const subscribers = await Subscriber.find().select("email");

  if (!subscribers.length) {
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const blogUrl = `${frontendUrl.replace(/\/$/, "")}/blog/${blog._id}`;
  const descriptionPreview =
    blog.description.length > 250
      ? `${blog.description.substring(0, 250)}...`
      : blog.description;

  const subject = `New Blog Published: ${blog.title}`;
  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2 style="color:#0d6efd;">${escapeHtml(blog.title)}</h2>

      <p>Hello,</p>

      <p>A new blog has just been published on <strong>ScholarHub</strong>.</p>

      <p><strong>Country:</strong> ${escapeHtml(blog.country)}</p>

      <p><strong>Category:</strong> ${escapeHtml(blog.category)}</p>

      <p>${escapeHtml(descriptionPreview)}</p>

      <a
        href="${blogUrl}"
        style="
          background:#0d6efd;
          color:white;
          padding:12px 20px;
          text-decoration:none;
          border-radius:5px;
          display:inline-block;
          margin-top:15px;
        "
      >
        Read Full Blog
      </a>

      <br><br>

      <p>Thank you for subscribing to ScholarHub.</p>
    </div>
  `;

  const results = await Promise.allSettled(
    subscribers.map((subscriber) => sendEmail(subscriber.email, subject, html))
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.log(
        `Failed to send email to ${subscribers[index].email}`,
        result.reason.message
      );
    }
  });
};

// ======================
// Add Blog
// ======================
const blogAddData = async (req, res) => {
  try {
    const {
      title,
      country,
      city,
      category,
      description,
      benefit,
      criteria,
      document,
      apply,
      deadline,
      website,
    } = req.fields;

    const { photo } = req.files;

    const data = new BlogModel({
      title,
      country,
      city,
      category,
      description,
      benefit,
      criteria,
      document,
      apply,
      deadline,
      website,
    });

    if (photo) {
      data.photo.data = fs.readFileSync(photo.path);
      data.photo.contentType = photo.type;
    }

    await data.save();

    // Send email to all subscribers after the new blog is published.
    await sendNewBlogNotifications(data);

    res.status(201).json({
      success: true,
      message: "Blog added successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Blogs
const blogGetData = async (req, res) => {
  try {
    const blogs = await BlogModel.find().select("-photo");

    res.send(blogs);
  } catch (err) {
    res.status(400).send(err.message);
  }
};
// Get Blog Photo
const blogGetPhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await BlogModel.findById(id).select("photo");

    if (!blog?.photo?.data) {
      return res.status(404).send({
        message: "Photo not found",
      });
    }

    res.set("Content-Type", blog.photo.contentType);

    return res.send(blog.photo.data);
  } catch (err) {
    console.error(err);

    return res.status(400).send({
      error: err.message,
    });
  }
};

// Get Single Blog

const getSingleBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id).select("-photo");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Search Blogs
const searchBlogs = async (req, res) => {
  try {
    const keyword = req.query.keyword?.trim();

    if (!keyword) {
      return res.status(200).json([]);
    }

    const blogs = await BlogModel.find({
      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          country: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          category: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          deadline: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .select("-photo")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(blogs);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};

module.exports = {
  blogAddData,
  blogGetData,
  blogGetPhoto,
  getSingleBlog,
  searchBlogs,
};
