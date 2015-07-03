var avalon = require("./lib")

var anchorElement = document.createElement('a')

var History = function () {
    this.location = location
}

History.started = false

History.defaults = {
    basepath: "/",
    hashPrefix: "!",
    fireAnchor: true,//决定是否将滚动条定位于与hash同ID的元素上
    routeElementJudger: avalon.noop // 判断a元素是否是触发router切换的链接
}

History.prototype = {
    constructor: History,
    getFragment: function (fragment) {
        if (fragment == null) {
            fragment = this.getHash()
        }
        return fragment.replace(/^[#\/]|\s+$/g, "")
    },
    getHash: function (window) {
        // IE6直接用location.hash取hash，可能会取少一部分内容
        // 比如 http://www.cnblogs.com/rubylouvre#stream/xxxxx?lang=zh_c
        // ie6 => location.hash = #stream/xxxxx
        // 其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
        // firefox 会自作多情对hash进行decodeURIComponent
        // 又比如 http://www.cnblogs.com/rubylouvre/#!/home/q={%22thedate%22:%2220121010~20121010%22}
        // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
        // 其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
        var path = (window || this).location.href
        return this._getHash(path.slice(path.indexOf("#")))
    },
    _getHash: function (path) {
        if (path.indexOf("#/") === 0) {
            return decodeURIComponent(path.slice(2))
        }
        if (path.indexOf("#!/") === 0) {
            return decodeURIComponent(path.slice(3))
        }
        return ""
    },
    getPath: function () {
        var path = decodeURIComponent(this.location.pathname + this.location.search)
        var root = this.basepath.slice(0, -1)
        if (!path.indexOf(root))
            path = path.slice(root.length)
        return path.slice(1)
    },
    _getAbsolutePath: function (a) {
        return  a.href
    },
    /*
     * @interface avalon.history.start 开始监听历史变化
     * @param options 配置参数
     * @param options.hashPrefix hash以什么字符串开头，默认是 "!"，对应实际效果就是"#!"
     * @param options.routeElementJudger 判断a元素是否是触发router切换的链接的函数，return true则触发切换，默认为avalon.noop，history内部有一个判定逻辑，是先判定a元素的href属性是否以hashPrefix开头，如果是则当做router切换元素，因此综合判定规则是 href.indexOf(hashPrefix) == 0 || routeElementJudger(ele, ele.href)，如果routeElementJudger返回true则跳转至href，如果返回的是字符串，则跳转至返回的字符串，如果返回false则返回浏览器默认行为
     * @param options.html5Mode 是否采用html5模式，即不使用hash来记录历史，默认false
     * @param options.fireAnchor 决定是否将滚动条定位于与hash同ID的元素上，默认为true
     * @param options.basepath 根目录，默认为"/"
     */
    start: function (options) {
        if (History.started)
            throw new Error("路由器已经调用start方法了")
        History.started = true
        this.options = avalon.mix({}, History.defaults, options)
        //IE6不支持maxHeight, IE7支持XMLHttpRequest, IE8支持window.Element，querySelector, 
        //IE9支持window.Node, window.HTMLElement, IE10不支持条件注释
        //确保html5Mode属性存在,并且是一个布尔
        this.html5Mode = !!this.options.html5Mode
        //监听模式

        this.monitorMode = "hashchange"

        this.prefix = "#" + this.options.hashPrefix + "/"
        //确认前后都存在斜线， 如"aaa/ --> /aaa/" , "/aaa --> /aaa/", "aaa --> /aaa/", "/ --> /"
        this.basepath = ("/" + this.options.basepath + "/").replace(/^\/+|\/+$/g, "/")  // 去最左右两边的斜线

        this.fragment = this.getFragment()

        anchorElement.href = this.basepath
        this.rootpath = this._getAbsolutePath(anchorElement)
        var that = this



        // 支持popstate 就监听popstate
        // 支持hashchange 就监听hashchange
        // 否则的话只能每隔一段时间进行检测了
        function checkUrl(e) {

            var pageHash = that.getFragment(), hash
            if (pageHash !== that.fragment) {
                hash = pageHash
            }
            if (hash !== void 0) {
                that.fragment = hash
                that.fireRouteChange(hash, {fromHistory: true})
            }
        }

        //thanks https://github.com/browserstate/history.js/blob/master/scripts/uncompressed/history.html4.js#L272

        // 支持popstate 就监听popstate
        // 支持hashchange 就监听hashchange(IE8,IE9,FF3)

        this.checkUrl = checkUrl
        window.addEventListener("hashchange", checkUrl)

        //根据当前的location立即进入不同的路由回调
        var id = setInterval(function () {
            if (document.readyState === "complete") {
                that.fireRouteChange(that.fragment || "/", {replace: true})
                clearInterval(id)
            }
        })

    },
    fireRouteChange: function (hash, options) {
        var router = avalon.Router
        if (router && router.navigate) {
            router.setLastPath(hash)
            router.navigate(hash === "/" ? hash : "/" + hash, options)
        }
        if (this.options.fireAnchor) {
            scrollToAnchorId(hash.replace(/\?.*/g, ""))
        }
    },
    // 中断URL的监听
    stop: function () {

        window.removeEventListener("hashchange", this.checkUrl)
        History.started = false
    },
    updateLocation: function (hash, options) {
        var options = options || {},
                rp = options.replace,
                st = options.silent

        var newHash = this.prefix + hash
        if (st && hash != this.getHash()) {
            this.fragment = this._getHash(newHash)
        }

        this._setHash(this.location, newHash, rp)

    },
    _setHash: function (location, hash, replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '')
        if (replace) {
            location.replace(href + hash)
        } else {
            location.hash = hash
        }
    }
}

avalon.history = new History

//https://github.com/asual/jquery-address/blob/master/src/jquery.address.js

//劫持页面上所有点击事件，如果事件源来自链接或其内部，
//并且它不会跳出本页，并且以"#/"或"#!/"开头，那么触发updateLocation方法
document.addEventListener("click", function (event) {
    var defaultPrevented = "defaultPrevented" in event ? event['defaultPrevented'] : event.returnValue === false,
            routeElementJudger = avalon.history.options.routeElementJudger
    if (defaultPrevented || event.ctrlKey || event.metaKey || event.which === 2)
        return
    var target = event.target
    while (target.nodeName !== "A") {
        target = target.parentNode
        if (!target || target.tagName === "BODY") {
            return
        }
    }

    if (targetIsThisWindow(target.target)) {
        var href = target.getAttribute("href") || target.getAttribute("xlink:href")
        var prefix = avalon.history.prefix
        if (href === null) { // href is null if the attribute is not present
            return
        }
        var hash = href.replace(prefix, "").trim()
        if (!(href.indexOf(prefix) === 0 && hash !== "")) {
            hash = routeElementJudger(target, href)
            if (hash === true)
                hash = href
        }
        if (hash) {
            event.preventDefault()
            avalon.Router && avalon.Router.navigate(hash)
        }
    }
})

//判定A标签的target属性是否指向自身
//thanks https://github.com/quirkey/sammy/blob/master/lib/sammy.js#L219
function targetIsThisWindow(targetWindow) {
    if (!targetWindow || targetWindow === window.name || targetWindow === '_self' || (targetWindow === 'top' && window == window.top)) {
        return true
    }
    return false
}
//得到页面第一个符合条件的A标签
function getFirstAnchor(list) {
    for (var i = 0, el; el = list[i++]; ) {
        if (el.nodeName === "A") {
            return el
        }
    }
}

function scrollToAnchorId(hash, el) {
    if ((el = document.getElementById(hash))) {
        el.scrollIntoView()
    } else if ((el = getFirstAnchor(document.getElementsByName(hash)))) {
        el.scrollIntoView()
    } else {
        window.scrollTo(0, 0)
    }
}

if (typeof module === "object") {
    module.exports = avalon.history
}

