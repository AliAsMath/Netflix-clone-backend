const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRout = require("./routes/auth");
const userRout = require("./routes/users");
const movieRout = require("./routes/movies");
const listRout = require("./routes/lists");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected!"))
  .catch((err) => console.log(err));

app = express();
app.use(express.json());
app.use(cookieParser());

const whitelist = [
  "https://netflix-clone-opal-omega.vercel.app",
  "https://netflix-cmd.vercel.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// res.header("Access-Control-Allow-Origin", [
//   ,
// ]); // update to match the domain you will make the request from
// res.header("Access-Control-Allow-Methods", "*");
// res.header("cross-origin-resource-policy", "*");
// res.header(
//   "Access-Control-Allow-Headers",
//   "Origin, X-Requested-With, Content-Type, Accept"
// );
// res.header("Access-Control-Allow-Credentials", "true");

app.use("/api/auth", authRout);
app.use("/api/users", userRout);
app.use("/api/movies", movieRout);
app.use("/api/lists", listRout);

app.listen(process.env.PORT || 8800, () => {
  console.log("Server is running!");
});
