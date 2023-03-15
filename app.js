require("dotenv").config();
require("express-async-errors"); //for async error handling:: replace try_catch
//to access the cookies
const cookieParser = require("cookie-parser");

//security packages
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cors = require("cors");
//handle file uploads
const fileUpload = require("express-fileupload");

const express = require("express");
const app = express();

//logger middleware
const morgan = require("morgan");

//local imports
const connectDB = require("./db/connect");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

//middleware
app.use(morgan("tiny"));
app.use(express.static("./public"));

app.set("trust proxy", 1);
app.use(rateLimiter({ windowMs: 10 * 60 * 1000, max: 100 }));
app.use(helmet());
app.use(xss());

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors()); //for cross origin resource sharing

//test route
app.get("/api/v1", (req, res) => {
  res.send("Welcome to the API");
});

//routes
app.use(`/api/${process.env.API_VERSION}/auth`, require(`./routes/auth.route`));
app.use(`/api/${process.env.API_VERSION}/users`, require(`./routes/user.route`));
app.use(`/api/${process.env.API_VERSION}/products`, require(`./routes/product.route`));
app.use(`/api/${process.env.API_VERSION}/reviews`, require(`./routes/review.route`));

//error handling middleware
app.use(notFound); //404
app.use(errorHandler); // runs when error is thrown

//run server
const port = process.env.PORT || 8000;
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();
