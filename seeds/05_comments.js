const commentsData = require("../seed_data/commentsData");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("comment").del();
  await knex("comment").insert(commentsData);
};
