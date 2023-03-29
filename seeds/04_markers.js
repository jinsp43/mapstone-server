const markersData = require("../seed_data/markersData");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("marker").del();
  await knex("marker").insert(markersData);
};
