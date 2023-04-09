const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

// GET all markers for a specified group
router.get("/:groupId", authorise, async (req, res) => {
  try {
    const requestedGroupId = req.params.groupId;

    const markers = await knex("marker")
      .join("user", "marker.user_id", "user.id")
      .where({
        group_id: requestedGroupId,
      })
      .select(
        "marker.id",
        "marker.longitude",
        "marker.latitude",
        "marker.name",
        "marker.type",
        "user.marker_colour",
        "user.username"
      );

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

// DELETE a marker
router.delete("/:markerId", authorise, async (req, res) => {
  try {
    const requestedMarkerId = req.params.markerId;

    await knex("marker").where({ id: requestedMarkerId }).del();

    res.status(204).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not delete marker",
    });
  }
});

module.exports = router;
