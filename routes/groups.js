const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

router.get("/", authorise, async (req, res) => {
  try {
    const groups = await knex("group")
      .join("user_group", "group.id", "user_group.group_id")
      .where({ user_id: req.token.id })
      .select("group.group_name");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch group list" });
  }
});

module.exports = router;
