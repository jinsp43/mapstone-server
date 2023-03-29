const groupsData = require("../seed_data/groupsData");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("group").del();
  await knex("group").insert(groupsData);
};
