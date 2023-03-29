const usersGroupsData = require("../seed_data/users_groupsData");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("user_group").del();
  await knex("user_group").insert(usersGroupsData);
};
