/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var lib = __webpack_require__(1)
	var promise = __webpack_require__(3)
	var history = __webpack_require__(6)
	var router = __webpack_require__(7)

	lib.Promise = promise
	lib.Router = router
	lib.History = history

	window.QAPP  = lib


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2)

	var lib = {}
	utils.mix(lib,utils)

	if (true) {
	    module.exports = lib
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var rword = /[^, ]+/g //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
	var oproto = Object.prototype
	var ohasOwn = oproto.hasOwnProperty
	var serialize = oproto.toString
	var class2type = {}
	"Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
	    class2type["[object " + name + "]"] = name.toLowerCase()
	})


	function noop() {
	}

	function oneObject(array, val) {
	    if (typeof array === "string") {
	        array = array.match(rword) || []
	    }
	    var result = {},
	            value = val !== void 0 ? val : 1
	    for (var i = 0, n = array.length; i < n; i++) {
	        result[array[i]] = value
	    }
	    return result
	}

	var isPlainObject = function (obj) {
	    // 简单的 typeof obj === "object"检测，会致使用isPlainObject(window)在opera下通不过
	    return serialize.call(obj) === "[object Object]" && Object.getPrototypeOf(obj) === oproto
	}

	var isFunction = function (fn) {
	    return serialize.call(fn) === "[object Function]"
	}


	var mix = function () {
	    var options, name, src, copy, copyIsArray, clone,
	            target = arguments[0] || {},
	            i = 1,
	            length = arguments.length,
	            deep = false

	    // 如果第一个参数为布尔,判定是否深拷贝
	    if (typeof target === "boolean") {
	        deep = target
	        target = arguments[1] || {}
	        i++
	    }

	    //确保接受方为一个复杂的数据类型
	    if (typeof target !== "object" && !isFunction(target)) {
	        target = {}
	    }

	    //如果只有一个参数，那么新成员添加于mix所在的对象上
	    if (i === length) {
	        target = this
	        i--
	    }

	    for (; i < length; i++) {
	        //只处理非空参数
	        if ((options = arguments[i]) != null) {
	            for (name in options) {
	                src = target[name]
	                copy = options[name] //当options为VBS对象时报错
	                // 防止环引用
	                if (target === copy) {
	                    continue
	                }
	                if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

	                    if (copyIsArray) {
	                        copyIsArray = false
	                        clone = src && Array.isArray(src) ? src : []

	                    } else {
	                        clone = src && isPlainObject(src) ? src : {}
	                    }

	                    target[name] = mix(deep, clone, copy)
	                } else if (copy !== void 0) {
	                    target[name] = copy
	                }
	            }
	        }
	    }
	    return target
	}

	/*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
	function isArrayLike(obj) {
	    if (!obj)
	        return false
	    var n = obj.length
	    if (n === (n >>> 0)) { //检测length属性是否为非负整数
	        var type = serialize.call(obj).slice(8, -1)
	        if (/(?:regexp|string|function|window|global)$/i.test(type))
	            return false
	        if (type === "Array")
	            return true
	        try {
	            if ({}.propertyIsEnumerable.call(obj, "length") === false) { //如果是原生对象
	                return  /^\s?function/.test(obj.item || obj.callee)
	            }
	            return true
	        } catch (e) { //IE的NodeList直接抛错
	            return !obj.window //IE6-8 window
	        }
	    }
	    return false
	}
	if (true) {
	    module.exports = {
	        rword: rword,
	        noop: noop,
	        mix: mix,
	        type: function (obj) { //取得目标的类型
	            if (obj == null) {
	                return String(obj)
	            }
	            // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
	            return typeof obj === "object" || typeof obj === "function" ?
	                    class2type[serialize.call(obj)] || "object" :
	                    typeof obj
	        },
	        mix: mix,
	        oneObject: oneObject,
	        isFunction: isFunction,
	        isPlainObject: isPlainObject,
	        /*遍历数组与对象,回调的第一个参数为索引或键名,第二个或元素或键值*/
	        each: function (obj, fn) {
	            if (obj) { //排除null, undefined
	                var i = 0
	                if (isArrayLike(obj)) {
	                    for (var n = obj.length; i < n; i++) {
	                        if (fn(i, obj[i]) === false)
	                            break
	                    }
	                } else {
	                    for (i in obj) {
	                        if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
	                            break
	                        }
	                    }
	                }
	            }
	        },
	        Array: {
	            /*只有当前数组不存在此元素时只添加它*/
	            ensure: function (target, item) {
	                if (target.indexOf(item) === -1) {
	                    return target.push(item)
	                }
	            },
	            /*移除数组中指定位置的元素，返回布尔表示成功与否*/
	            removeAt: function (target, index) {
	                return !!target.splice(index, 1).length
	            },
	            /*移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否*/
	            remove: function (target, item) {
	                var index = target.indexOf(item)
	                if (~index)
	                    return avalon.Array.removeAt(target, index)
	                return false
	            }
	        }
	    }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var mmPromise
	if (Object.prototype.toString.call(window.Promise) === "Promise") {
	    mmPromise = window.Promise
	} else {
	    mmPromise = __webpack_require__(4)
	}

	if (true) {
	     module.exports = mmPromise
	}



/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var asap = __webpack_require__(5)
	//https://github.com/then/promise
	function noop() {
	}

	var LAST_ERROR = null;
	var IS_ERROR = {};
	function getThen(obj) {
	    try {
	        return obj.then;
	    } catch (ex) {
	        LAST_ERROR = ex;
	        return IS_ERROR;
	    }
	}

	function tryCallOne(fn, a) {
	    try {
	        return fn(a);
	    } catch (ex) {
	        LAST_ERROR = ex;
	        return IS_ERROR;
	    }
	}
	function tryCallTwo(fn, a, b) {
	    try {
	        fn(a, b);
	    } catch (ex) {
	        LAST_ERROR = ex;
	        return IS_ERROR;
	    }
	}



	function Promise(fn) {
	    if (typeof this !== 'object') {
	        throw new TypeError('Promises must be constructed via new');
	    }
	    if (typeof fn !== 'function') {
	        throw new TypeError('not a function');
	    }
	    this._state = 0;
	    this._value = null;
	    this._deferreds = [];
	    if (fn === noop)
	        return;
	    doResolve(fn, this);
	}
	Promise._noop = noop;

	Promise.prototype.then = function (onFulfilled, onRejected) {
	    if (this.constructor !== Promise) {
	        return safeThen(this, onFulfilled, onRejected);
	    }
	    var res = new Promise(noop);
	    handle(this, new Handler(onFulfilled, onRejected, res));
	    return res;
	};

	function safeThen(self, onFulfilled, onRejected) {
	    return new self.constructor(function (resolve, reject) {
	        var res = new Promise(noop);
	        res.then(resolve, reject);
	        handle(self, new Handler(onFulfilled, onRejected, res));
	    });
	}
	;
	function handle(self, deferred) {
	    while (self._state === 3) {
	        self = self._value;
	    }
	    if (self._state === 0) {
	        self._deferreds.push(deferred);
	        return;
	    }
	    asap(function () {
	        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	        if (cb === null) {
	            if (self._state === 1) {
	                resolve(deferred.promise, self._value);
	            } else {
	                reject(deferred.promise, self._value);
	            }
	            return;
	        }
	        var ret = tryCallOne(cb, self._value);
	        if (ret === IS_ERROR) {
	            reject(deferred.promise, LAST_ERROR);
	        } else {
	            resolve(deferred.promise, ret);
	        }
	    });
	}
	function resolve(self, newValue) {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self) {
	        return reject(
	                self,
	                new TypeError('A promise cannot be resolved with itself.')
	                );
	    }
	    if (
	            newValue &&
	            (typeof newValue === 'object' || typeof newValue === 'function')
	            ) {
	        var then = getThen(newValue);
	        if (then === IS_ERROR) {
	            return reject(self, LAST_ERROR);
	        }
	        if (
	                then === self.then &&
	                newValue instanceof Promise
	                ) {
	            self._state = 3;
	            self._value = newValue;
	            finale(self);
	            return;
	        } else if (typeof then === 'function') {
	            doResolve(then.bind(newValue), self);
	            return;
	        }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	}

	function reject(self, newValue) {
	    self._state = 2;
	    self._value = newValue;
	    finale(self);
	}
	function finale(self) {
	    for (var i = 0; i < self._deferreds.length; i++) {
	        handle(self, self._deferreds[i]);
	    }
	    self._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, promise) {
	    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	    this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, promise) {
	    var done = false;
	    var res = tryCallTwo(fn, function (value) {
	        if (done)
	            return;
	        done = true;
	        resolve(promise, value);
	    }, function (reason) {
	        if (done)
	            return;
	        done = true;
	        reject(promise, reason);
	    })
	    if (!done && res === IS_ERROR) {
	        done = true;
	        reject(promise, LAST_ERROR);
	    }
	}
	//===============================
	var TRUE = valuePromise(true);
	var FALSE = valuePromise(false);
	var NULL = valuePromise(null);
	var UNDEFINED = valuePromise(undefined);
	var ZERO = valuePromise(0);
	var EMPTYSTRING = valuePromise('');

	function valuePromise(value) {
	    var p = new Promise(Promise._noop);
	    p._state = 1;
	    p._value = value;
	    return p;
	}
	Promise.resolve = function (value) {
	    if (value instanceof Promise)
	        return value;

	    if (value === null)
	        return NULL;
	    if (value === undefined)
	        return UNDEFINED;
	    if (value === true)
	        return TRUE;
	    if (value === false)
	        return FALSE;
	    if (value === 0)
	        return ZERO;
	    if (value === '')
	        return EMPTYSTRING;

	    if (typeof value === 'object' || typeof value === 'function') {
	        try {
	            var then = value.then;
	            if (typeof then === 'function') {
	                return new Promise(then.bind(value));
	            }
	        } catch (ex) {
	            return new Promise(function (resolve, reject) {
	                reject(ex);
	            });
	        }
	    }
	    return valuePromise(value);
	};

	Promise.all = function (arr) {
	    var args = Array.prototype.slice.call(arr);

	    return new Promise(function (resolve, reject) {
	        if (args.length === 0)
	            return resolve([]);
	        var remaining = args.length;
	        function res(i, val) {
	            if (val && (typeof val === 'object' || typeof val === 'function')) {
	                if (val instanceof Promise && val.then === Promise.prototype.then) {
	                    while (val._state === 3) {
	                        val = val._value;
	                    }
	                    if (val._state === 1)
	                        return res(i, val._value);
	                    if (val._state === 2)
	                        reject(val._value);
	                    val.then(function (val) {
	                        res(i, val);
	                    }, reject);
	                    return;
	                } else {
	                    var then = val.then;
	                    if (typeof then === 'function') {
	                        var p = new Promise(then.bind(val));
	                        p.then(function (val) {
	                            res(i, val);
	                        }, reject);
	                        return;
	                    }
	                }
	            }
	            args[i] = val;
	            if (--remaining === 0) {
	                resolve(args);
	            }
	        }
	        for (var i = 0; i < args.length; i++) {
	            res(i, args[i]);
	        }
	    });
	};

	Promise.reject = function (value) {
	    return new Promise(function (resolve, reject) {
	        reject(value);
	    });
	};

	Promise.race = function (values) {
	    return new Promise(function (resolve, reject) {
	        values.forEach(function (value) {
	            Promise.resolve(value).then(resolve, reject);
	        });
	    });
	};

	/* Prototype Methods */

	Promise.prototype['catch'] = function (onRejected) {
	    return this.then(null, onRejected);
	};

	if (true) {
	    module.exports = Promise;
	}




/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
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
	if (true) {
	    module.exports = nextTick
	}



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var avalon = __webpack_require__(1)

	var anchorElement = document.createElement('a')

	var History = function () {
	    this.location = location
	}

	History.started = false
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
	            routeElementJudger = avalon.history.options.routeElementJudger || avalon.noop
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

	if (true) {
	    module.exports = avalon.history
	}



/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var avalon = __webpack_require__(1)

	function Router() {
	    var table = {}
	    "get,post,delete,put".replace(avalon.rword, function(name) {
	        table[name] = []
	    })
	    this.routingTable = table
	}

	function parseQuery(url) {
	    var array = url.split("?"), query = {}, path = array[0], querystring = array[1]
	    if (querystring) {
	        var seg = querystring.split("&"),
	                len = seg.length, i = 0, s;
	        for (; i < len; i++) {
	            if (!seg[i]) {
	                continue
	            }
	            s = seg[i].split("=")
	            query[decodeURIComponent(s[0])] = decodeURIComponent(s[1])
	        }
	    }
	    return {
	        path: path,
	        query: query
	    }
	}


	function queryToString(obj) {
	    if(typeof obj == 'string') return obj
	    var str = []
	    for(var i in obj) {
	        if(i == "query") continue
	        str.push(i + '=' + encodeURIComponent(obj[i]))
	    }
	    return str.length ? '?' + str.join("&") : ''
	}

	var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g
	var cookieID
	Router.prototype = {
	    error: function(callback) {
	        this.errorback = callback
	    },
	    _pathToRegExp: function(pattern, opts) {
	        var keys = opts.keys = [],
	                //      segments = opts.segments = [],
	                compiled = '^', last = 0, m, name, regexp, segment;

	        while ((m = placeholder.exec(pattern))) {
	            name = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	            regexp = m[4] || (m[1] == '*' ? '.*' : 'string')
	            segment = pattern.substring(last, m.index);
	            var type = this.$types[regexp]
	            var key = {
	                name: name
	            }
	            if (type) {
	                regexp = type.pattern
	                key.decode = type.decode
	            }
	            keys.push(key)
	            compiled += quoteRegExp(segment, regexp, false)
	            //  segments.push(segment)
	            last = placeholder.lastIndex
	        }
	        segment = pattern.substring(last);
	        compiled += quoteRegExp(segment) + (opts.strict ? opts.last : "\/?") + '$';
	        var sensitive = typeof opts.caseInsensitive === "boolean" ? opts.caseInsensitive : true
	        //  segments.push(segment);
	        opts.regexp = new RegExp(compiled, sensitive ? 'i' : undefined);
	        return opts

	    },
	    //添加一个路由规则
	    add: function(method, path, callback, opts) {
	        var array = this.routingTable[method.toLowerCase()]
	        if (path.charAt(0) !== "/") {
	            throw "path必须以/开头"
	        }
	        opts = opts || {}
	        opts.callback = callback
	        if (path.length > 2 && path.charAt(path.length - 1) === "/") {
	            path = path.slice(0, -1)
	            opts.last = "/"
	        }
	        avalon.Array.ensure(array, this._pathToRegExp(path, opts))
	    },
	    //判定当前URL与已有状态对象的路由规则是否符合
	    route: function(method, path, query) {
	        path = path.trim()
	        var states = this.routingTable[method]
	        for (var i = 0, el; el = states[i++]; ) {
	            var args = path.match(el.regexp)
	            if (args) {
	                el.query = query || {}
	                el.path = path
	                el.params = {}
	                var keys = el.keys
	                args.shift()
	                if (keys.length) {
	                    this._parseArgs(args, el)
	                }
	                return  el.callback.apply(el, args)
	            }
	        }
	        if (this.errorback) {
	            this.errorback()
	        }
	    },
	    _parseArgs: function(match, stateObj) {
	        var keys = stateObj.keys
	        for (var j = 0, jn = keys.length; j < jn; j++) {
	            var key = keys[j]
	            var value = match[j] || ""
	            if (typeof key.decode === "function") {//在这里尝试转换参数的类型
	                var val = key.decode(value)
	            } else {
	                try {
	                    val = JSON.parse(value)
	                } catch (e) {
	                    val = value
	                }
	            }
	            match[j] = stateObj.params[key.name] = val
	        }
	    },
	    getLastPath: function() {
	        return localStorage.getItem("msLastPath");
	    },
	    setLastPath: function(path) {
	        if (cookieID) {
	            clearTimeout(cookieID)
	            cookieID = null
	        }
	        localStorage.setItem("msLastPath", path)
	        cookieID = setTimeout(function () {
	            localStorage.removItem("msLastPath")
	        }, 1000 * 60 * 60 * 24)
	    },
	    /*
	     *  @interface avalon.router.redirect
	     *  @param hash 访问的url hash
	     */
	    redirect: function(hash) {
	        this.navigate(hash, {replace: true})
	    },
	    /*
	     *  @interface avalon.router.navigate
	     *  @param hash 访问的url hash
	     *  @param options 扩展配置
	     *  @param options.replace true替换history，否则生成一条新的历史记录
	     *  @param options.silent true表示只同步url，不触发url变化监听绑定
	    */
	    navigate: function(hash, options) {
	        var parsed = parseQuery((hash.charAt(0) !== "/" ? "/" : "") + hash),
	            options = options || {}
	        if(hash.charAt(0) === "/")
	            hash = hash.slice(1)// 修正出现多扛的情况 fix http://localhost:8383/index.html#!//

	        // 在state之内有写history的逻辑
	        // if(!avalon.state || options.silent) avalon.History && avalon.History.updateLocation(hash, avalon.mix({}, options, {silent: true}))
	        // 移植到QApp时，暂时还未引入mmState. TBD by Zilong.xu @2015-07-02
	        avalon.history && avalon.history.updateLocation(hash, avalon.mix({}, options, {silent: true}))

	        // 只是写历史而已
	        if(!options.silent) {
	            this.route("get", parsed.path, parsed.query, options)
	        }
	    },
	    /*
	     *  @interface avalon.router.when 配置重定向规则
	     *  @param path 被重定向的表达式，可以是字符串或者数组
	     *  @param redirect 重定向的表示式或者url
	    */
	    when: function(path, redirect) {
	        var me = this,
	            path = path instanceof Array ? path : [path]
	        avalon.each(path, function(index, p) {
	            me.add("get", p, function() {
	                var info = me.urlFormate(redirect, this.params, this.query)
	                me.navigate(info.path + info.query, {replace: true})
	            })
	        })
	        return this
	    },
	    /*
	     *  @interface avalon.router.get 添加一个router规则
	     *  @param path url表达式
	     *  @param callback 对应这个url的回调
	    */
	    get: function(path, callback) {},
	    urlFormate: function(url, params, query) {
	        var query = query ? queryToString(query) : "",
	            hash = url.replace(placeholder, function(mat) {
	                var key = mat.replace(/[\{\}]/g, '').split(":")
	                key = key[0] ? key[0] : key[1]
	                return params[key] || ''
	            }).replace(/^\//g, '')
	        return {
	            path: hash,
	            query: query
	        }
	    },
	    /* *
	     `'/hello/'` - 匹配'/hello/'或'/hello'
	     `'/user/:id'` - 匹配 '/user/bob' 或 '/user/1234!!!' 或 '/user/' 但不匹配 '/user' 与 '/user/bob/details'
	     `'/user/{id}'` - 同上
	     `'/user/{id:[^/]*}'` - 同上
	     `'/user/{id:[0-9a-fA-F]{1,8}}'` - 要求ID匹配/[0-9a-fA-F]{1,8}/这个子正则
	     `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
	     path into the parameter 'path'.
	     `'/files/*path'` - ditto.
	     */
	    // avalon.router.get("/ddd/:dddID/",callback)
	    // avalon.router.get("/ddd/{dddID}/",callback)
	    // avalon.router.get("/ddd/{dddID:[0-9]{4}}/",callback)
	    // avalon.router.get("/ddd/{dddID:int}/",callback)
	    // 我们甚至可以在这里添加新的类型，avalon.router.$type.d4 = { pattern: '[0-9]{4}', decode: Number}
	    // avalon.router.get("/ddd/{dddID:d4}/",callback)
	    $types: {
	        date: {
	            pattern: "[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])",
	            decode: function(val) {
	                return new Date(val.replace(/\-/g, "/"))
	            }
	        },
	        string: {
	            pattern: "[^\\/]*"
	        },
	        bool: {
	            decode: function(val) {
	                return parseInt(val, 10) === 0 ? false : true;
	            },
	            pattern: "0|1"
	        },
	        int: {
	            decode: function(val) {
	                return parseInt(val, 10);
	            },
	            pattern: "\\d+"
	        }
	    }
	}
	"get,put,delete,post".replace(avalon.rword, function(method) {
	    return  Router.prototype[method] = function(a, b, c) {
	        this.add(method, a, b, c)
	    }
	})
	function quoteRegExp(string, pattern, isOptional) {
	    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	    if (!pattern)
	        return result;
	    var flag = isOptional ? '?' : '';
	    return result + flag + '(' + pattern + ')' + flag;
	}




	if (true) {
	    module.exports = new Router();
	}

/***/ }
/******/ ]);