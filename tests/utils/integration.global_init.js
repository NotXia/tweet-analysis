require("dotenv").config();

module.exports = function () {
    process.env.NODE_ENV = "integration_testing";
}