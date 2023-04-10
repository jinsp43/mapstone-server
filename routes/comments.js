const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

// GET all comments for a specific marker
router.get("/:markerId", authorise, async (req, res) => {
  try {
    const requestedMarkerId = req.params.markerId;

    const comments = await knex("comment")
      .join("user", "comment.user_id", "user.id")
      .where({ marker_id: requestedMarkerId })
      .select(
        "comment.id",
        "comment.comment",
        "user.username",
        "comment.user_id",
        "comment.rating"
      );

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Could not retrieve comments",
    });
  }
});

// POST a new comment
router.post("/:markerId", authorise, async (req, res) => {
  try {
    const requestedMarkerId = req.params.markerId;

    const requestedComment = {
      ...req.body,
      user_id: req.token.id,
      marker_id: requestedMarkerId,
    };

    const newCommentId = await knex("comment").insert(requestedComment);

    const newComment = await knex("comment")
      .where({ id: newCommentId[0] })
      .first();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({
      message: "Could not add new comment",
    });
  }
});

module.exports = router;
