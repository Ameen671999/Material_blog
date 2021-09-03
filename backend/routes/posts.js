const express = require("express");
const Post = require("../models/post");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isvalid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isvalid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    // runs from left to right
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    post.save().then((createPost) => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createPost,
          id: createPost._id,
        },
      });
    }).catch(error => {
      res.status(500).json({
        message: "Creating post failed!"
      })
    });
  }
);

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }

    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId
    });
    Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    ).then((result) => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: "Updated successfully",
        });
      } else {
        res.status(401).json({
          message: "Not Authorized",
        });
      }
    }).catch(error => {
      res.status(500).json({
        message: "Couldn't update the post!"
      })
    });
  }
);

router.get("", (req, res, next) => {
  // console.log(+req.query.pagesize)
  const pageSize = +req.query.pagesize; //to convert string to number
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Post fetched successfully",
        posts: fetchedPosts,
        maxPosts: count,
      });
    }).catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      })
    });
});

router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  }).catch(error => {
    res.status(500).json({
      message: "Fetching post failed!"
    })
  });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id,
     creator: req.userData.userId }).then(
    (result) => {
      console.log(result);
      if (result.n > 0) {
        res.status(200).json({
          message: "Deletion successful!",
        });
      } else {
        res.status(401).json({
          message: "Not Authorized",
        });
      }
    }
  ).catch(error => {
    res.status(500).json({
      message: "Deleting post failed!"
    })
  });
});

module.exports = router;
