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
      .where({ user_id: req.token.id })
      .select("group.id", "group.group_name", "group.created_at");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch group list" });
  }
});

// Get details about a group
router.get("/:groupId", authorise, async (req, res) => {
  const requestedGroupId = req.params.groupId;

  const isUserInGroup = await knex("user_group")
    .where({
      user_id: req.token.id,
      group_id: requestedGroupId,
    })
    .first();

  if (!isUserInGroup) {
    res.status(401).json({
      message: "You are not in this group",
    });

    return;
  }

  try {
    const groupDetails = await knex("group")
      .where({
        id: requestedGroupId,
      })
      .first();

    groupDetails.created_at =
      groupDetails.created_at.toLocaleDateString("en-GB");

    res.json(groupDetails);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Can't fetch group details", error: error.message });
  }
});

// Get users in a group
router.get("/users/:groupId", authorise, async (req, res) => {
  const requestedGroupId = req.params.groupId;

  try {
    const usersInGroup = await knex("user_group")
      .join("user", "user_group.user_id", "user.id")
      .where({ "user_group.group_id": requestedGroupId })
      .select("user.username", "user.id", "user.marker_colour");

    res.json(usersInGroup);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch list of users" });
  }
});

// Create a new group and place logged in user in it
router.post("/", authorise, async (req, res) => {
  try {
    const newGroupId = await knex("group").insert({
      ...req.body,
    });

    // Get the new group
    const newGroup = await knex("group").where({ id: newGroupId[0] }).first();

    // Add logged in user to the new group
    await knex("user_group").insert({
      user_id: req.token.id,
      group_id: newGroupId[0],
    });

    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ message: "Can't create new group" });
  }
});

// Add a user to a group
router.post("/:groupId/add", authorise, async (req, res) => {
  const requestedGroupId = req.params.groupId;

  const requestedUsername = req.body.username;

  try {
    const user = await knex("user")
      .where({ username: requestedUsername })
      .first();

    const isInGroup = await knex("user_group")
      .where({
        user_id: user.id,
        group_id: requestedGroupId,
      })
      .first();

    if (isInGroup) {
      res.status(400).json({ message: `User is already in this group!` });
      return;
    }

    await knex("user_group").insert({
      user_id: user.id,
      group_id: requestedGroupId,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // if user not found
    if (
      error.message === "Cannot read properties of undefined (reading 'id')"
    ) {
      res.status(404).json({
        message: `No user with that username was found`,
      });

      return;
    }

    res.status(500).json({
      message: `Couldn't add user to group: ${error.message}`,
    });
  }
});

module.exports = router;
