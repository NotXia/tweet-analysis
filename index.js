require("dotenv").config();
const express = require("express");
const app = express();
app.disable("x-powered-by");
const path = require("path");
const cookieParser = require("cookie-parser");
const error_handler = require("./error_handler.js").error_handler;
const cors = require("cors");

const sentiment_router = require("./routes/sentiment.js");
const user_router = require("./routes/user.js");
const hashtag_router = require("./routes/hashtag.js");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:3000", "https://tcxia.ddns.net"] }));

// API
app.use("/analysis", sentiment_router);
app.use("/tweets", user_router);
app.use("/tweets", hashtag_router);


app.use(error_handler); // Gestore errori

// App react
app.use("/", express.static(path.join(__dirname, "frontend/build")));
app.use("/*", (req, res) => { res.sendFile(path.join(__dirname, "frontend/build/index.html")) });

if (!process.env.NODE_ENV.includes("testing")) {
    app.listen(process.env.PORT, function () {
        console.log(`Server started at http://localhost:${process.env.PORT}`);
    });
}

module.exports = app;
