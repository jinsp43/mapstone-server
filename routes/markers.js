const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

// GET all markers for a specified group
router.get("/:groupId", authorise, async (req, res) => {
  try {
    const requestedGroupId = req.params.groupId;

    const markers = await knex("marker").where({
      group_id: requestedGroupId,
    });

    res.json(markers);
  } catch (error) {
    res.status(500).json({
      message: "Could not retrieve markers",
    });
  }
});

// POST a new marker to a specified group
router.post("/:groupId", authorise, async (req, res) => {
  try {
    const requestedGroupId = req.params.groupId;

    const requestedMarker = {
      ...req.body,
      user_id: req.token.id,
      group_id: requestedGroupId,
    };

    const newMarkerId = await knex("marker").insert(requestedMarker);

    const newMarker = await knex("marker")
      .where({ id: newMarkerId[0] })
      .first();

    res.status(201).json(newMarker);
  } catch (error) {
    res.status(500).json({
      message: "Could not add marker",
    });
  }
});

module.exports = router;
