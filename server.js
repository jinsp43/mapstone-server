const express = require("express");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT || 5050;
const { FRONTEND_URL } = process.env;

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.static("public"));
app.use(express.json());

const userRoutes = require("./routes/users");
const groupRoutes = require("./routes/groups");

app.use("/users", userRoutes);
app.use("/groups", groupRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
