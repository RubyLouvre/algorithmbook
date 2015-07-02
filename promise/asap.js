
var nextTick = (function () {
    var tickImmediate = window.setImmediate
    var tickObserver = window.MutationObserver
    var tickPost = window.dispatchEvent && window.postMessage
    if (tickImmediate) {
        return tickImmediate.bind(window)
    }

    var queue = []
    function callback() {
        var n = queue.length
        for (var i = 0; i < n; i++) {
            queue[i]()
        }
        queue = queue.slice(n)
    }

    if (tickObserver) {
        var node = document.createTextNode("avalon")
        new tickObserver(callback).observe(node, {characterData: true})// jshint ignore:line
        return function (fn) {
            queue.push(fn)
            node.data = Math.random()
        }
    }

    if (tickPost) {
        window.addEventListener("message", function (e) {
            var source = e.source
            if ((source === window || source === null) && e.data === "process-tick") {
                e.stopPropagation()
                callback()
            }
        })

        return function (fn) {
            queue.push(fn)
            window.postMessage('process-tick', '*')
        }
    }

    return function (fn) {
        setTimeout(fn, 0)
    }
})()
if (typeof module === "object") {
    module.exports = nextTick
}

