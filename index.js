require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

const test_router = require("./routes/test");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/test", test_router);

app.use("/", express.static(path.join(__dirname, "frontend/build")));
app.use("/*", (req, res) => { res.sendFile(path.join(__dirname, "frontend/build/index.html")) });

if (process.env.NODE_ENV != "testing") {
    app.listen(process.env.PORT, function () {
        console.log(`Server started at http://localhost:${process.env.PORT}`);
    });
}

module.exports = app;
