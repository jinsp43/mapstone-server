exports.up = function (knex) {
  return knex.schema
    .createTable("user", (table) => {
      table.increments("id").primary();
      table.integer("google_id");
      table.string("username").notNullable();
      table.string("password").notNullable();
      table.string("marker_colour").defaultTo("orange");
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("group", (table) => {
      table.increments("id").primary();
      table.string("group_name").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
    })
    .createTable("user_group", (table) => {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .integer("group_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("group")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    })
    .createTable("marker", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.integer("group_id").unsigned().notNullable();
      table.string("name").notNullable();
      table.decimal("longitude", 10, 7).notNullable();
      table.decimal("latitude", 10, 7).notNullable();
      table.string("type");
      table
        .foreign("user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("group_id")
        .references("id")
        .inTable("group")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    })
    .createTable("comment", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.integer("marker_id").unsigned().notNullable();
      table.integer("rating");
      table.string("comment");
      table
        .foreign("user_id")
        .references("id")
        .inTable("user")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table
        .foreign("marker_id")
        .references("id")
        .inTable("marker")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("comment")
    .dropTable("marker")
    .dropTable("user_group")
    .dropTable("group")
    .dropTable("user");
};
