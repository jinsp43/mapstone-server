const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const knex = require("knex")(require("../knexfile"));
require("dotenv").config();
const authorise = require("../middleware/auth");

// Used when encrypting the users password (more salt rounds = stronger encrpytion)
const SALT_ROUNDS = 8;

// Allows new users to sign up
router.post("/signup", (req, res) => {
  const { password } = req.body;

  // Encrypt the password the user provided via bcrypt
  bcrypt.hash(password, SALT_ROUNDS, async (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Couldn't encrypt the supplied password" });
    }

    try {
      // Create a user record in the database
      await knex("user").insert({
        ...req.body, // spread over all the form fields
        password: hashedPassword, // but use the hashed password for the password (instead of the plain text password)
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't create a new user: ${error.message}`,
      });
    }
  });
});

// Allow user to login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database for the user via username
    const user = await knex("user").where({ username: username }).first();

    // Ensure the password provided matches the encrypted password
    bcrypt.compare(password, user.password, function (_, success) {
      if (!success) {
        return res
          .status(403)
          .json({ message: "Username/Password combination is incorrect" });
      }

      // Generate a JWT token for the user
      const token = jwt.sign(
        {
          id: user.id,
          sub: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // And send it back to the frontend
      res.status(200).json({ authToken: token });
    });
  } catch (error) {
    res.status(400).json({ message: "User not found" });
  }
});

// A protected route via middleware, must be authenticated to get the user details from the database
router.get("/profile", authorise, async (req, res) => {
  try {
    // Query the database for the user by comparing the ID in the JWT token against the ID of the user
    const user = await knex("user").where({ id: req.token.id }).first();

    // Remove user password before sending it to client side (via the `delete` operator)
    delete user.password;

    user.created_at = user.created_at.toLocaleDateString("en-GB");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Can't fetch user profile" });
  }
});

module.exports = router;
