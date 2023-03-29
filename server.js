const express = require("express");
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT || 5050;
const { FRONTEND_URL } = process.env;

const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
