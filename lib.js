var utils = require("./utils")

var lib = {}
utils.mix(lib,utils)

if (typeof module === "object") {
    module.exports = lib
}
