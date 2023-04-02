const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

// Get all groups for a logged in user
router.get("/", authorise, async (req, res) => {
  try {
    const groups = await knex("group")
      .join("user_group", "group.id", "user_group.group_id")
      .where({ user_id: req.token.id });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch group list" });
  }
});

// Create a new group and place logged in user in it
router.post("/", authorise, async (req, res) => {
  try {
    const newGroupId = await knex("group").insert({
      ...req.body,
    });

    // Get the new group
    const newGroup = await knex("group").where({ id: newGroupId[0] });

    // Add logged in user to the new group
    await knex("user_group").insert({
      user_id: req.token.id,
      group_id: newGroupId[0],
    });

    res.status(201).json(newGroup[0]);
  } catch (error) {
    res.status(500).json({ message: "Can't create new group" });
  }
});

module.exports = router;
