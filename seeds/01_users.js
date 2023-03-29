const usersData = require("../seed_data/usersData");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("user").del();
  await knex("user").insert(usersData);
};
