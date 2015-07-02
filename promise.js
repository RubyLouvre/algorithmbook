var mmPromise
if (Object.prototype.toString.call(window.Promise) === "Promise") {
    mmPromise = window.Promise
} else {
    mmPromise = require("./promise/core")
}

if (typeof module === "object") {
     module.exports = mmPromise
}

