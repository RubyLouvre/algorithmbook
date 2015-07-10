(function(){

    "use strict";

	/*=======================================================================
	             _________       _          _________    __________
	           / ________ /    /   \       |  _____  |  |  _____  |
	          / /      / /    / / \ \      | |     | |  | |     | |
	         / /  Q   / /    / / A \ \     | |  P  | |  | |  P  | |
	        / /  __  / /    / /_____\ \    | |_____| |  | |_____| |
	       / /___\ \/ /    /  _______  \   |  _______|  |  _______|
	      /________  /    / /         \ \  | |          | |
	               \_\   /_/           \_\ |_|          |_|
	
	 QApp Mobile Framework
	 Copyright (c) 2014-2015 Edwon Lim and other contributors in Qunar Hotel FE Mobile Team.
	 WebSite: http://ued.qunar.com/mobile/qapp/
	
	 qapp.js 0.2.11 build at 2015.06.26
	 ======================================================================*/
	
	var QApp = {},
	    _packages = QApp._packages = {}; // 存放 package
	
	// 预赋值，利于压缩
	var win = window,
	    doc = document,
	    TRUE = true,
	    FALSE = false,
	    NULL = null,
	    UNDEFINED = void 0;
	
	// 定义包
	function define(space, factory) {
	    _packages[space] = factory();
	}
	
	// 引用包 require
	// 为了避免和 fekit 冲突，所以不用 require
	function r(space) {
	    return _packages[space];
	}
	
	

	/* ================================== 全局配置 ================================== */
	var Config = {
	    type: 'app',          // 类型
	    indexView: 'index',   // 默认的首屏 View
	    animate: TRUE,        // 是否动画
	    defaultAnimate: '',   // 默认的动画
	    hashRouter: FALSE,    // 是否开启 hash router
	    hashSupport: {
	        all: TRUE,        // 是否默认全部
	        exist: [],        // 白名单
	        except: []        // 黑名单
	    },
	    customRoot: TRUE,     // 是否使用自定义的 Root
	    appRoot: NULL,        // Root 节点
	    screen: {
	        rotate: FALSE,    // 是否支持屏幕旋转
	        largeChange: TRUE // 检测屏幕变大
	    },
	    gesture: {
	        ctrl: TRUE,       // 是否开启手势控制 (在 View 切换时，禁用手势)
	        longTap: TRUE ,   // 长按是否触发 Tap 事件
	        autoBlur: TRUE    // 自动控制元素失去焦点
	    },
	    root: {               // Root 节点位置和大小配置
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0
	    }
	};
	
	// 常用事件列表
	var CustomEvents = ['show', 'hide', 'beforeShow', 'beforeHide', 'refresh', 'router', 'ready'];
	
	// 自定义事件监听方法
	var CustEventFns = ['on', 'once', 'off'];
	
	// 标签列表
	var Tags = {
	    app: 'qapp-app',
	    view: 'qapp-view',
	    widget: 'qapp-widget',
	    container: 'qapp-container'
	};
	

	/* ================================== 环境嗅探 ================================== */
	var _sniff = (function() {
	    var sniff = {}; // 结果
	
	    var ua = navigator.userAgent,
	        platform = navigator.platform,
	        android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),  // 匹配 android
	        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),            // 匹配 ipad
	        ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),         // 匹配 ipod
	        iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);        // 匹配 iphone
	
	    sniff.ios = sniff.android = sniff.iphone = sniff.ipad = sniff.ipod = FALSE;
	
	    // Android
	    if (android) {
	        sniff.os = 'android';
	        sniff.osVersion = android[2];
	        sniff.android = TRUE;
	    }
	
	    // IOS
	    if (ipad || iphone || ipod) {
	        sniff.os = 'ios';
	        sniff.ios = TRUE;
	    }
	
	    if (iphone) {
	        sniff.osVersion = iphone[2].replace(/_/g, '.');
	        sniff.iphone = TRUE;
	        sniff.imobile = TRUE;
	    }
	
	    if (ipad) {
	        sniff.osVersion = ipad[2].replace(/_/g, '.');
	        sniff.ipad = TRUE;
	    }
	
	    if (ipod) {
	        sniff.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : NULL;
	        sniff.ipod = TRUE;
	        sniff.imobile = TRUE;
	    }
	
	    // iOS 8+ changed UA
	    if (sniff.ios && sniff.osVersion && ua.indexOf('Version/') >= 0) {
	        if (sniff.osVersion.split('.')[0] === '10') {
	            sniff.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
	        }
	    }
	
	    if (sniff.osVersion) {
	        sniff.osVersionN = parseInt(sniff.osVersion.match(/\d+\.?\d*/)[0]);
	    }
	
	    // Pixel Ratio
	    sniff.pixelRatio = win.devicePixelRatio || 1;
	
	    sniff.retina = sniff.pixelRatio >= 2;
	
	    sniff.pc = platform.indexOf('Mac') === 0 || platform.indexOf('Win') === 0 || (platform.indexOf('linux') === 0 && !sniff.android);
	
	    return sniff;
	})();
	

	/* ================================== 工具部分 ================================== */
	var __object__ = Object.prototype,
	        __array__ = Array.prototype,
	        toString = __object__.toString,
	        slice = __array__.slice,
	        readyRep = /complete|loaded|interactive/, // 页面 ready 时的状态
	        whiteSpace = ' ', // className 分隔符
	        curId = 0, // id 初始值
	        curZIndex = 1000;                          // zIndex 初始值
	
	
	// 检测 css 支持
	var vendors = ['Webkit', '', 'Moz', 'O'],
	        testEl = doc.createElement('div'),
	        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
	        transformAttr = '',
	        prefix = '', eventPrefix;
	
	vendors.every(function (vendor) {
	    if (testEl.style[vendor + 'TransitionProperty'] !== UNDEFINED) {
	        if (vendor) {
	            prefix = '-' + vendor.toLowerCase() + '-';
	        }
	        eventPrefix = vendor.toLowerCase();
	        return FALSE;
	    }
	});
	
	testEl = NULL;
	
	transformAttr = prefix + 'transform';
	
	function _noop() {
	} // 空方法
	
	// 获取 obj 的 key 列表
	function keys(obj) {
	    var ret = [],
	            key;
	    for (key in obj) {
	        ret.push(key);
	    }
	    return ret;
	}
	
	// 类型判断
	var class2type = {
	    '[object HTMLDocument]': 'Document',
	    '[object HTMLCollection]': 'NodeList',
	    '[object StaticNodeList]': 'NodeList',
	    '[object IXMLDOMNodeList]': 'NodeList',
	    '[object DOMWindow]': 'Window',
	    '[object global]': 'Window',
	    'null': 'Null',
	    'NaN': 'NaN',
	    'undefined': 'Undefined'
	};
	
	'Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,Null,Undefined'
	        .replace(/\w+/ig, function (value) {
	            class2type['[object ' + value + ']'] = value;
	        });
	
	function getType(obj, match) {
	    var rs = class2type[(obj === NULL || obj !== obj) ? obj :
	            toString.call(obj)] ||
	            (obj && obj.nodeName) || '#';
	    if (obj === UNDEFINED) {
	        rs = 'Undefined';
	    } else if (rs.charAt(0) === '#') {
	        if (obj == obj.document && obj.document != obj) {
	            rs = 'Window';
	        } else if (obj.nodeType === 9) {
	            rs = 'Document';
	        } else if (obj.callee) {
	            rs = 'Arguments';
	        } else if (isFinite(obj.length) && obj.item) {
	            rs = 'NodeList';
	        } else {
	            rs = toString.call(obj).slice(8, -1);
	        }
	    }
	    if (match) {
	        return match === rs;
	    }
	    return rs;
	}
	
	function _isObject(source) {
	    return source === Object(source);
	}
	
	function _isArray(source) {
	    return getType(source, 'Array');
	}
	
	function _isString(source) {
	    return getType(source, 'String');
	}
	
	function _isFunction(source) {
	    return getType(source, 'Function');
	}
	
	var relement = /Element$/
	//因为元素节点的[[class]]一般都是 "[object HTMLXXXElement]"
	var _isElement = function (obj) {
	    if (obj && obj.nodeType === 1) {//先过滤最简单的
	        if (obj instanceof Node) { //如果是IE9,则判定其是否Node的实例
	            return true //由于obj可能是来自另一个文档对象，因此不能轻易返回false
	        }
	        return relement.test(toString.call(obj))
	    }
	    return false
	}
	
	
	function _isNumber(source) {
	    return getType(source, 'Number');
	}
	
	function _isPlainObject(source) {
	    return getType(source, 'Object') && Object.getPrototypeOf(source) === __object__
	}
	
	function _isEmptyObject(source) {
	    try {
	        return  JSON.stringify(source) === "{}"
	    } catch (e) {
	        return FLASE
	    }
	}
	// extend
	function extend(target, source, deep) {
	    var key;
	    for (key in source) {
	        if (deep && (_isPlainObject(source[key]) || _isArray(source[key]))) {
	            if (_isPlainObject(source[key]) && !_isPlainObject(target[key])) {
	                target[key] = {};
	            }
	            if (_isArray(source[key]) && !_isArray(target[key])) {
	                target[key] = [];
	            }
	            extend(target[key], source[key], deep);
	        } else if (source[key] !== UNDEFINED) {
	            target[key] = source[key];
	        }
	    }
	}
	
	function _extend(target) {
	    var deep,
	            args = slice.call(arguments, 1);
	    if (typeof target == 'boolean') {
	        deep = target;
	        target = args.shift();
	    }
	    args.forEach(function (arg) {
	        extend(target, arg, deep);
	    });
	    return target;
	}
	
	// each
	function _each(obj, fn) {
	    var key;
	    for (key in obj) {
	        fn.call(obj, key, obj[key]);
	    }
	}
	
	// MakeArray
	function _makeArray(iterable) {
	    var rs = [], len;
	    if (_isArray(iterable)) {
	        return iterable;
	    } else if (getType(iterable, 'NodeList')) {
	        len = iterable.length;
	        while (len--) {
	            rs[len] = iterable.item(len);
	        }
	        return rs;
	    } else if (iterable) {
	        len = iterable.length;
	        if (getType(len, 'Number') && len % 1 === 0 && len >= 0) {
	            while (len--) {
	                rs[len] = iterable[len];
	            }
	            return rs;
	        }
	        return FALSE;
	    }
	    return FALSE;
	}
	
	// Delay
	function _delay(func, delay) {
	    return win.setTimeout(func, delay || 0);
	}
	
	// Associate
	function _associate(arrVal, arrKey) {
	    var obj = {}, i = 0;
	    for (; i < arrKey.length; i++) {
	        obj[arrKey[i]] = arrVal[i];
	    }
	    return obj;
	}
	
	// Mapping
	function _mapping(obj, arrKey) {
	    var arrVal = [], i = 0;
	    for (; i < arrKey.length; i++) {
	        arrVal[i] = obj[arrKey[i]];
	    }
	    return arrVal;
	}
	
	// UniqueID
	function _getUniqueID() {
	    return curId++;
	}
	
	// zIndex
	function _getZIndex() {
	    return curZIndex++;
	}
	
	
	// parseString
	function _camelCase(str) {
	    return str.replace(/[-_][^-_]/g, function (match) {
	        return match.charAt(1).toUpperCase();
	    });
	}
	
	function _dasherize(str) {
	    return str.replace(/([a-z\d])([A-Z])/g, '$1-$2')
	            .replace(/\_/g, '-').toLowerCase();
	}
	
	// empty
	function _empty(obj) {
	    var key;
	    for (key in obj) {
	        obj[key] = NULL;
	    }
	}
	
	// jsonToQuery
	function encodeFormat(data, isEncode) {
	    data = (data === NULL ? '' : data).toString().trim();
	    return isEncode ? encodeURIComponent(data) : data;
	}
	
	function _jsonToQuery(json, isEncode) {
	    var qs = [], k, i, len;
	    for (k in json) {
	        if (k === '$nullName') {
	            qs = qs.concat(json[k]);
	        } else if (_isArray(json[k])) {
	            for (i = 0, len = json[k].length; i < len; i++) {
	                if (!_isFunction(json[k][i])) {
	                    qs.push(k + "=" + encodeFormat(json[k][i], isEncode));
	                }
	            }
	        } else if (!_isFunction(json[k]) && (json[k] !== NULL && json[k] !== UNDEFINED)) {
	            qs.push(k + "=" + encodeFormat(json[k], isEncode));
	        }
	    }
	    return qs.join('&');
	}
	
	// queryToJson
	
	function decodeFormat(data, isDecode) {
	    return isDecode ? decodeURIComponent(data) : data;
	}
	
	function _queryToJson(qs, isDecode) {
	    var qList = qs.trim().split("&"),
	            json = {},
	            i = 0,
	            len = qList.length;
	
	    for (; i < len; i++) {
	        if (qList[i]) {
	            var hash = qList[i].split("="),
	                    key = hash[0],
	                    value = hash[1];
	            // 如果只有key没有value, 那么将全部丢入一个$nullName数组中
	            if (hash.length < 2) {
	                value = key;
	                key = '$nullName';
	            }
	            if (!(key in json)) {
	                // 如果缓存堆栈中没有这个数据，则直接存储
	                json[key] = decodeFormat(value, isDecode);
	            } else {
	                // 如果堆栈中已经存在这个数据，则转换成数组存储
	                json[key] = [].concat(json[key], decodeFormat(value, isDecode));
	            }
	        }
	    }
	    return json;
	}
	
	// CustEvent
	function _once(func) {
	    var ran = FALSE,
	            memo;
	    return function () {
	        if (ran)
	            return memo;
	        ran = TRUE;
	        memo = func.apply(this, arguments);
	        func = NULL;
	        return memo;
	    };
	}
	
	var triggerEvents = function (events, args) {
	    var ev,
	            i = -1,
	            l = events.length,
	            ret = 1;
	    while (++i < l && ret) {
	        ev = events[i];
	        ret &= (ev.callback.apply(ev.ctx, args) !== false);
	    }
	    return !!ret;
	};
	
	var CustEvent = {
	    on: function (name, callback, context) {
	        this._events = this._events || {};
	        this._events[name] = this._events[name] || [];
	        var events = this._events[name];
	        events.push({
	            callback: callback,
	            context: context,
	            ctx: context || this
	        });
	        return this;
	    },
	    once: function (name, callback, context) {
	        var self = this;
	        var once = _once(function () {
	            self.off(name, once);
	            callback.apply(this, arguments);
	        });
	        once._callback = callback;
	        return this.on(name, once, context);
	    },
	    off: function (name, callback, context) {
	        var retain, ev, events, names, i, l, j, k;
	        if (!name && !callback && !context) {
	            this._events = UNDEFINED;
	            return this;
	        }
	        names = name ? [name] : keys(this._events);
	        for (i = 0, l = names.length; i < l; i++) {
	            name = names[i];
	            events = this._events[name];
	            if (events) {
	                this._events[name] = retain = [];
	                if (callback || context) {
	                    for (j = 0, k = events.length; j < k; j++) {
	                        ev = events[j];
	                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
	                                (context && context !== ev.context)) {
	                            retain.push(ev);
	                        }
	                    }
	                }
	                if (!retain.length)
	                    delete this._events[name];
	            }
	        }
	        return this;
	    },
	    trigger: function (name) {
	        if (!this._events)
	            return this;
	        var args = slice.call(arguments, 1),
	                events = this._events[name],
	                allEvents = this._events.all,
	                ret = 1;
	        if (events) {
	            ret &= triggerEvents(events, args);
	        }
	        if (allEvents && ret) {
	            ret &= triggerEvents(allEvents, args);
	        }
	        return !!ret;
	    }
	};
	
	function _createEventManager() {
	    var EM = function () {
	    };
	    _extend(EM.prototype, CustEvent);
	    return new EM();
	}
	
	// Deferred
	function Deferred() {
	
	    var status = 'pending',
	            ret,
	            isStart = FALSE,
	            startFn,
	            that = {},
	            events = (function () {
	                var binds = {
	                    resolve: [],
	                    reject: [],
	                    notify: []
	                };
	                return {
	                    add: function (type, fn) {
	                        binds[type].push(fn);
	                    },
	                    remove: function (type, fn) {
	                        var index = binds[type].indexOf(fn);
	                        if (index > -1) {
	                            binds[type].splice(index, 1);
	                        }
	                    },
	                    clear: function (type) {
	                        binds[type].length = 0;
	                    },
	                    fire: function (type, args) {
	                        binds[type].forEach(function (fn) {
	                            fn.apply(NULL, args);
	                        });
	                    },
	                    destroy: function () {
	                        binds.resolve.length = 0;
	                        binds.reject.length = 0;
	                        binds.notify.length = 0;
	                    }
	                };
	            })();
	
	    function bind(onResolved, onRejected, onProgressed) {
	        if (_isFunction(startFn) && !isStart) {
	            isStart = TRUE;
	            startFn(that);
	        }
	        if (_isFunction(onResolved)) {
	            if (status === 'resolved') {
	                onResolved.apply(NULL, ret);
	            } else if (status === 'pending') {
	                events.add('resolve', onResolved);
	            }
	        }
	        if (_isFunction(onRejected)) {
	            if (status === 'rejected') {
	                onRejected.apply(NULL, ret);
	            } else if (status === 'pending') {
	                events.add('reject', onRejected);
	            }
	        }
	        if (_isFunction(onProgressed)) {
	            events.add('notify', onProgressed);
	        }
	    }
	
	    that.enabled = TRUE;
	
	    that.all = function (onResolvedOrRejected) {
	        bind(onResolvedOrRejected, onResolvedOrRejected);
	        return that;
	    };
	
	    that.done = function (onResolved) {
	        bind(onResolved);
	        return that;
	    };
	
	    that.fail = function (onRejected) {
	        bind(NULL, onRejected);
	        return that;
	    };
	
	    that.progress = function (onProgressed) {
	        bind(NULL, NULL, onProgressed);
	        return that;
	    };
	
	    that.unProgress = function (onProgressed) {
	        events.remove('notify', onProgressed);
	        return that;
	    };
	
	    that.then = function (onResolved, onRejected, onProgressed) {
	        bind(onResolved, onRejected, onProgressed);
	        return that;
	    };
	
	    that.resolve = function () {
	        if (status === 'pending') {
	            status = 'resolved';
	            ret = slice.call(arguments);
	            events.fire('resolve', ret);
	        }
	        return that;
	    };
	
	    that.reject = function () {
	        if (status === 'pending') {
	            status = 'rejected';
	            ret = slice.call(arguments);
	            events.fire('reject', ret);
	        }
	        return that;
	    };
	
	    that.notify = function () {
	        events.fire('notify', slice.call(arguments));
	        return that;
	    };
	
	    that.state = function () {
	        return status;
	    };
	
	    that.startWith = function (fn) {
	        startFn = fn;
	        return that;
	    };
	
	    that.destroy = function () {
	        that.enabled = FALSE;
	        that.notify('destroy');
	        status = NULL;
	        ret = NULL;
	        isStart = NULL;
	        startFn = NULL;
	        that.destroy = function () {
	        };
	        that = NULL;
	        events.destroy();
	        events = NULL;
	    };
	
	    return that;
	}
	
	// Queue
	
	function _queue(list, keys, dynamic) {
	    var deferred = new Deferred(),
	            queue = dynamic ? list : list.slice(0),
	            ret = [],
	            index = -1,
	            getKey = function (index) {
	                getKey = (keys && keys.length) ? function (index) {
	                    return keys[index];
	                } : function (index) {
	                    return index;
	                };
	                return getKey(index);
	            },
	            next = function () {
	                index++;
	                var pro = queue.shift();
	                if (pro && _isFunction(pro.all)) {
	                    pro.all(function (data) {
	                        deferred.notify(getKey(index), data, list);
	                        ret[index] = data;
	                        next();
	                    });
	                } else if (pro) {
	                    if (_isFunction(pro)) {
	                        var p = pro(ret[index - 1], ret);
	                        if (p && _isFunction(p.all)) {
	                            p.all(function (data) {
	                                deferred.notify(getKey(index), data, list);
	                                ret[index] = data;
	                                next();
	                            });
	                        } else {
	                            deferred.notify(getKey(index), p, list);
	                            ret[index] = p;
	                            next();
	                        }
	                    } else {
	                        deferred.notify(getKey(index), pro, list);
	                        ret[index] = pro;
	                        next();
	                    }
	                } else {
	                    if (keys && keys.length) {
	                        ret = _associate(ret, keys);
	                    }
	                    deferred.resolve.call(NULL, ret);
	                }
	            };
	
	    return deferred.startWith(function () {
	        _delay(next);
	    });
	}
	
	// Parallel
	function _parallel(list, keys) {
	    var deferred = new Deferred(),
	            queue = list.slice(0),
	            ret = [],
	            num = 0,
	            check = function () {
	                if (num === queue.length) {
	                    if (keys && keys.length) {
	                        ret = _associate(ret, keys);
	                    }
	                    deferred.resolve.call(NULL, ret);
	                }
	            },
	            start = function () {
	                queue.forEach(function (pro, index) {
	                    if (pro && _isFunction(pro.all)) {
	                        ret[index] = UNDEFINED;
	                        pro.all(function (data) {
	                            ret[index] = data;
	                            num++;
	                            check();
	                        });
	                    } else {
	                        ret[index] = pro;
	                        num++;
	                    }
	                });
	                check();
	            };
	
	    return deferred.startWith(start);
	}
	
	// Dom
	function _ready(callback) {
	    if (readyRep.test(doc.readyState) && doc.body) {
	        callback();
	    } else {
	        _addEvent(doc, 'DOMContentLoaded', function () {
	            callback();
	        }, FALSE);
	    }
	}
	
	
	function _builder(html) {
	
	    var frame, children,
	            toCreate = 'div';
	
	    [['li', 'ul'], ['tr', 'tbody'], ['td', 'tr'], ['th', 'tr'], ['tbody', 'table'], ['option', 'select']].some(function (item) {
	        if (html.indexOf('<' + item[0]) === 0) {
	            toCreate = item[1];
	            return TRUE;
	        }
	    });
	
	    frame = doc.createElement(toCreate);
	    frame.innerHTML = html;
	    children = _makeArray(frame.children);
	    frame = doc.createDocumentFragment();
	
	    children.forEach(function (node) {
	        frame.appendChild(node);
	    });
	
	    return {
	        box: frame,
	        children: children
	    };
	}
	
	function _appendNodes(node, elements) {
	    elements = [].concat(elements);
	    elements.forEach(function (element) {
	        node.appendChild(element);
	    });
	}
	
	function _insertElement(node, element, where) {
	    where = where ? where.toLowerCase() : "beforeend";
	    switch (where) {
	        case "beforebegin":
	            node.parentNode.insertBefore(element, node);
	            break;
	        case "afterbegin":
	            node.insertBefore(element, node.firstChild);
	            break;
	        case "beforeend":
	            node.appendChild(element);
	            break;
	        case "afterend":
	            if (node.nextSibling) {
	                node.parentNode.insertBefore(element, node.nextSibling);
	            } else {
	                node.parentNode.appendChild(element);
	            }
	            break;
	    }
	    return element;
	}
	
	function _removeNode(node) {
	    if (node && node.parentNode) {
	        node.parentNode.removeChild(node);
	    }
	}
	
	function _attr(node, attrName) {
	    if (_isString(attrName)) {
	        if (arguments.length > 2) {
	            var value = arguments[2];
	            node[(value == NULL ? 'remove' : 'set') + 'Attribute'](attrName, value);
	        } else {
	            return node.getAttribute(attrName);
	        }
	    } else {
	        _each(attrName, function (key, value) {
	            node.setAttribute(key, value);
	        });
	    }
	}
	
	function _css(node, property) {
	    if (node && node.style) {
	        if (_isString(property)) {
	            if (arguments.length > 2) {
	                var value = arguments[2];
	                if (supportedTransforms.test(property)) {
	                    node.style[transformAttr] = property + '(' + value + ')';
	                } else {
	                    property = _camelCase(property);
	                    if (value || value === 0) {
	                        node.style[property] = value;
	                    } else {
	                        node.style.removeProperty(property);
	                    }
	                }
	            } else {
	                var styles = win.getComputedStyle(node, NULL),
	                        ret;
	                if (styles) {
	                    ret = styles[_camelCase(property)];
	                }
	                return ret;
	            }
	        } else {
	            var styleList = [],
	                    transforms = '';
	            _each(property, function (key, value) {
	                if (supportedTransforms.test(key)) {
	                    transforms += key + '(' + value + ') ';
	                } else {
	                    styleList.push(_dasherize(key) + ':' + value);
	                }
	            });
	            if (transforms.length) {
	                styleList.push(_dasherize(transformAttr) + ':' + transforms);
	            }
	            node.style.cssText += ';' + styleList.join(';') + ';';
	        }
	    }
	}
	
	function _removeStyle(node, names) {
	    if (node && node.style) {
	        [].concat(names).forEach(function (name) {
	            node.style.removeProperty(name);
	            node.style.removeProperty(prefix + name);
	        });
	    }
	}
	
	function _fixEvent(event) {
	
	    if (!event.target) {
	        event.target = event.srcElement || document;
	    }
	
	    // Safari
	    if (event.target.nodeType == 3) {
	        event.target = event.target.parentNode;
	    }
	
	    //fix pageX & pageY
	    if (event.pageX === NULL && event.clientX !== NULL) {
	        var html = doc.documentElement,
	                body = doc.body;
	
	        event.pageX = event.clientX + (html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || body && body.clientLeft || 0);
	        event.pageY = event.clientY + (html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || body && body.clientTop || 0);
	    }
	
	    return event;
	}
	
	function _addEvent(node, type, listener, useCapture) {
	    node.addEventListener(type, listener, !!useCapture);
	}
	
	function _removeEvent(node, type, listener) {
	    node.removeEventListener(type, listener);
	}
	
	function _dispatchEvent(node, type, args) {
	    var event = doc.createEvent("Events");
	    event.initEvent(type, true, true);
	    _extend(event, args);
	    node.dispatchEvent(event);
	}
	
	function _addClass(node, className) {
	    node.className = (node.className + whiteSpace + className).split(/\s+/).filter(function (item, index, source) {
	        return source.lastIndexOf(item) === index;
	    }).join(whiteSpace);
	}
	
	function _removeClass(node, className) {
	    className = whiteSpace + className.replace(/\s+/g, whiteSpace) + whiteSpace;
	
	    node.className = node.className.split(/\s+/).filter(function (originClassName) {
	        return className.indexOf(whiteSpace + originClassName + whiteSpace) === -1;
	    }).join(whiteSpace);
	}
	
	function _createStyle(cssText) {
	    var style = doc.createElement('style');
	    style.type = 'text/css';
	    style.innerHTML = cssText;
	    doc.querySelector('head').appendChild(style);
	}
	
	var _contains = doc.compareDocumentPosition ? function (a, b) {
	    return !!(a.compareDocumentPosition(b) & 16);
	} : function (a, b) {
	    return a !== b && (a.contains ? a.contains(b) : TRUE);
	};
	
	function _focus(element) {
	    var length;
	
	    // 兼容 ios7 问题
	    if (_sniff.ios && element.setSelectionRange && element.type.indexOf('date') !== 0 && element.type !== 'time' && element.type !== 'month') {
	        length = element.value.length;
	        element.setSelectionRange(length, length);
	    } else {
	        element.focus();
	    }
	}
	
	function _blur(container) {
	    var el = doc.activeElement;
	    container = container || doc.body;
	    if (el && _contains(container, el) && _isFunction(el.blur)) {
	        el.blur();
	    }
	}
	
	// size
	function docSize(doc) {
	    function getWidthOrHeight(clientProp) {
	        var docEl = doc.documentElement,
	                body = doc.body;
	        return Math.max(
	                body["scroll" + clientProp],
	                docEl["scroll" + clientProp],
	                body["offset" + clientProp],
	                docEl["offset" + clientProp],
	                docEl["client" + clientProp]
	                );
	    }
	
	    return {
	        width: getWidthOrHeight('Width'),
	        height: getWidthOrHeight('Height')
	    };
	}
	
	function winSize(win) {
	    function getWidthOrHeight(clientProp) {
	        return win.document.documentElement["client" + clientProp];
	    }
	
	    return {
	        width: getWidthOrHeight('Width'),
	        height: getWidthOrHeight('Height')
	    };
	}
	
	function _size(any) {
	    var type = getType(any),
	            ret;
	    switch (type) {
	        case 'Document':
	            ret = docSize(any);
	            break;
	        case 'Window':
	            ret = winSize(any);
	            break;
	        default:
	            ret = {
	                width: parseInt(_css(any, 'width').replace('px', '')),
	                height: parseInt(_css(any, 'height').replace('px', ''))
	            };
	    }
	
	    return ret;
	}
	
	// position
	function generalPosition(el) {
	    var box = el.getBoundingClientRect(),
	            body = el.ownerDocument.body,
	            docEl = el.ownerDocument.documentElement,
	            scrollTop = Math.max(win.pageYOffset || 0, docEl.scrollTop, body.scrollTop),
	            scrollLeft = Math.max(win.pageXOffset || 0, docEl.scrollLeft, body.scrollLeft),
	            clientTop = docEl.clientTop || body.clientTop || 0,
	            clientLeft = docEl.clientLeft || body.clientLeft || 0;
	
	    return {
	        left: box.left + scrollLeft - clientLeft,
	        top: box.top + scrollTop - clientTop
	    };
	}
	
	function diff(pos, bPos) {
	    return {
	        left: pos.left - bPos.left,
	        top: pos.top - bPos.top
	    };
	}
	
	function _position(el) {
	    if (!_contains(el.ownerDocument.body, el)) {
	        return {
	            top: NaN,
	            left: NaN
	        };
	    }
	
	    return arguments.length > 1 ?
	            diff(generalPosition(el), generalPosition(arguments[1])) :
	            generalPosition(el);
	}
	
	function _dataSet(node) {
	    var ret = {};
	    if (node) {
	        if (node.dataset) {
	            _extend(ret, node.dataset);
	        } else {
	            var attrs = node.attributes;
	            for (var i = 0, l = attrs.length; i < l; i++) {
	                var name = attrs[i].name,
	                        value = attrs[i].value;
	                if (name.indexOf('data-') === 0) {
	                    name = _camelCase(name.substring(5));
	                    ret[name] = value;
	                }
	            }
	        }
	    }
	    return ret;
	}
	
	// 事件中心
	var EventManager = _createEventManager();
	
	// 其他
	
	function _apply(callback, view, args) {
	    if (_isFunction(callback)) {
	        if (view) {
	            return callback.apply(view, _makeArray(args) || []);
	        } else {
	            return callback();
	        }
	    }
	}
	
	function _getCallback(args) {
	    var fn = _noop;
	    args = _makeArray(args);
	    if (args) {
	        args.some(function (arg) {
	            if (_isFunction(arg)) {
	                fn = arg;
	                return TRUE;
	            }
	        });
	    }
	    return fn;
	}
	
	

	// Gesture
	var Gesture = (function () {
	
	    var TOUCHKEYS = [
	            'screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'
	        ],
	        TAP_TIMEOUT = 200, // tap 判定时间
	        ALLOW_LONG_TAP = FALSE, // 允许长按
	        PAN_DISTANCE = 10, // 判定 pan 的位移偏移量
	        DIRECTION_DEG = 15, // 判断方向的角度
	        FLICK_TIMEOUT = 300, // 判断 flick 的延时
	        FLICK_DIS = 100, // flick 距离
	        ABS_TIME = 3; // 抱死次数判定
	
	    var gesture,
	        curElement,
	        curId,
	        lastId,
	        lastTime = 0,
	        trackingClick,
	        clickElement,
	        overTouchTime = 0,
	        cancelNextClick = FALSE,
	        running = TRUE;
	
	    // 重置
	    function reset() {
	        gesture = NULL;
	        curElement = NULL;
	        curId = NULL;
	    }
	
	    // 复制 touch 对象上的有用属性到固定对象上
	    function mixTouchAttr(target, source) {
	        if (source) {
	            TOUCHKEYS.forEach(function (key) {
	                target[key] = source[key];
	            });
	        }
	        return target;
	    }
	
	    // 查找对应id的touch
	    function findTouch(touches) {
	        return _makeArray(touches).filter(function (touch) {
	            return touch.identifier === curId;
	        })[0];
	    }
	
	    // 计算距离
	    function computeDistance(offsetX, offsetY) {
	        return Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
	    }
	
	    // 计算角度
	    function computeDegree(offsetX, offsetY) {
	        var degree = Math.atan2(offsetY, offsetX) / Math.PI * 180;
	        return degree < 0 ? degree + 360 : degree;
	    }
	
	    // 获取方向
	    function getDirection(offsetX, offsetY) {
	        var ret = [],
	            absX = Math.abs(offsetX),
	            absY = Math.abs(offsetY),
	            proportion = Math.tan(DIRECTION_DEG / 180 * Math.PI),
	            transverse = absX > absY;
	
	        if (absX > 0 || absY > 0) {
	            ret.push(transverse ? offsetX > 0 ? 'right' : 'left' : offsetY > 0 ? 'down' : 'up');
	            if (transverse && absY / absX > proportion) {
	                ret.push(offsetY > 0 ? 'down' : 'up');
	            } else if (!transverse && absX / absY > proportion) {
	                ret.push(offsetX > 0 ? 'right' : 'left');
	            }
	        }
	
	        return ret;
	    }
	
	    // 检测是否需要原生 click
	    function needsClick(target) {
	        switch (target.nodeName.toLowerCase()) {
	            case 'button':
	            case 'select':
	            case 'textarea':
	                if (target.disabled) {
	                    return TRUE;
	                }
	                break;
	            case 'input':
	                // IOS6 pad 上选择文件，如果不是原生的click，弹出的选择界面尺寸错误
	                if ((_sniff.ipad && _sniff.osVersionN === 6 && target.type === 'file') || target.disabled) {
	                    return TRUE;
	                }
	                break;
	            case 'label':
	            case 'iframe':
	            case 'video':
	                return TRUE;
	        }
	
	        return (/\bneedsclick\b/).test(target.className);
	    }
	
	    // 检测是否需要 focus
	    function needsFocus(target) {
	        switch (target.nodeName.toLowerCase()) {
	            case 'textarea':
	                return TRUE;
	            case 'select':
	                return !_sniff.android;
	            case 'input':
	                switch (target.type) {
	                    case 'button':
	                    case 'checkbox':
	                    case 'file':
	                    case 'image':
	                    case 'radio':
	                    case 'submit':
	                        return FALSE;
	                }
	                return !target.disabled && !target.readOnly;
	            default:
	                return (/\bneedsfocus\b/).test(target.className);
	        }
	    }
	
	    // 选择触发的事件
	    function determineEventType(target) {
	        // 安卓chrome浏览器上，模拟的 click 事件不能让 select 打开，故使用 mousedown 事件
	        if (_sniff.android && target.nodeName.toLowerCase() === 'select') {
	            return 'mousedown';
	        }
	
	        return 'click';
	    }
	
	    // 发送 click 事件
	    function sendClick(target, touch) {
	        var clickEvent;
	
	        // 某些安卓设备必须先移除焦点，之后模拟的click事件才能让新元素获取焦点
	        if (doc.activeElement && doc.activeElement !== target) {
	            doc.activeElement.blur();
	        }
	
	        clickEvent = doc.createEvent('MouseEvents');
	        clickEvent.initMouseEvent(determineEventType(target), TRUE, TRUE, win, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, FALSE, FALSE, FALSE, FALSE, 0, NULL);
	        clickEvent.forwardedTouchEvent = TRUE;
	        if (running) {
	            target.dispatchEvent(clickEvent);
	        }
	    }
	
	    //  寻找 label 对应的元素
	    function findControl(labelElement) {
	
	        // HTML5 新属性
	        if (labelElement.control !== UNDEFINED) {
	            return labelElement.control;
	        }
	
	        // 通过 htmlFor
	        if (labelElement.htmlFor) {
	            return doc.getElementById(labelElement.htmlFor);
	        }
	
	        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	    }
	
	    // 创建事件
	    function createEvent(type) {
	        var event = doc.createEvent("HTMLEvents");
	        event.initEvent(type, TRUE, TRUE);
	        return event;
	    }
	
	    // 构造 pan / flick / panend 事件
	    function createPanEvent(type, offsetX, offsetY, touch, duration) {
	        var ev = createEvent(type);
	        ev.offsetX = offsetX;
	        ev.offsetY = offsetY;
	        ev.degree = computeDegree(offsetX, offsetY);
	        ev.directions = getDirection(offsetX, offsetY);
	        if (duration) {
	            ev.duration = duration;
	            ev.speedX = ev.offsetX / duration;
	            ev.speedY = ev.offsetY / duration;
	        }
	        return mixTouchAttr(ev, touch);
	    }
	
	    // 分析 Move
	    function analysisMove(event, touch) {
	        var startTouch = gesture.origin,
	            offsetX = touch.clientX - startTouch.clientX,
	            offsetY = touch.clientY - startTouch.clientY;
	
	        if (gesture.status === 'tapping' || gesture.status === 'pressing') {
	            if (computeDistance(offsetX, offsetY) > PAN_DISTANCE) {
	                gesture.status = 'panning'; // 更改状态
	                trackingClick = FALSE; // 取消跟踪 click
	                clickElement = NULL;
	                gesture.startMoveTime = event.timeStamp; // 记录移动开始的时间
	                clearTimeout(gesture.handler);
	                gesture.handler = NULL;
	                trigger(createPanEvent('pan', offsetX, offsetY, touch));
	            }
	        } else if (gesture.status === 'panning') {
	            trigger(createPanEvent('pan', offsetX, offsetY, touch));
	        }
	    }
	
	    // 分析 End
	    function analysisEnd(event, touch) {
	        if (gesture.handler) {
	            clearTimeout(gesture.handler);
	            gesture.handler = NULL;
	        }
	        if (gesture.status === 'panning') {
	            var startTouch = gesture.origin,
	                offsetX = touch.clientX - startTouch.clientX,
	                offsetY = touch.clientY - startTouch.clientY,
	                duration = event.timeStamp - gesture.startMoveTime;
	            trigger(createPanEvent('panend', offsetX, offsetY, touch, duration));
	            // 判断是否是快速移动
	            if (duration < FLICK_TIMEOUT && computeDistance(offsetX, offsetY) > FLICK_DIS) {
	                trigger(createPanEvent('flick', offsetX, offsetY, touch, duration));
	            }
	        } else {
	            if (gesture.status === 'tapping') {
	                trigger(mixTouchAttr(createEvent('tap'), touch));
	            } else if (gesture.status === 'pressing') {
	                trigger(mixTouchAttr(createEvent('pressend'), touch));
	                if (ALLOW_LONG_TAP) {
	                    trigger(mixTouchAttr(createEvent('tap'), touch));
	                }
	            }
	        }
	    }
	
	
	    // 触发事件
	    function trigger(event) {
	        if (running && curElement) {
	            curElement.dispatchEvent(event);
	        }
	    }
	
	    function onTouchStart(event) {
	
	        var touch, selection,
	            changedTouches = event.changedTouches,
	            timestamp = event.timeStamp;
	
	        // 如果两次 touch 事件过快，则，直接阻止默认行为
	        if (timestamp - lastTime < TAP_TIMEOUT) {
	            event.preventDefault();
	            return FALSE;
	        }
	
	        // 忽略多指操作
	        if (changedTouches.length > 1) {
	            return TRUE;
	        } else if (curId) {
	            // 防抱死，由于快速点击时，有时touchend事件没有触发，造成手势库卡死
	            overTouchTime++;
	            if (overTouchTime > ABS_TIME) {
	                reset();
	            }
	            return TRUE;
	        }
	
	        touch = changedTouches[0];
	
	        if (touch) {
	            curElement = event.target;
	            curId = touch.identifier;
	            gesture = {
	                origin: mixTouchAttr({}, touch),
	                timestamp: timestamp,
	                status: 'tapping',
	                handler: setTimeout(function () {
	                    gesture.status = 'pressing';
	                    trigger(mixTouchAttr(createEvent('press'), gesture.origin));
	                    clearTimeout(gesture.handler);
	                    gesture.handler = NULL;
	                }, TAP_TIMEOUT)
	            };
	
	            if (!_sniff.pc) {
	                // Fast Click 判定部分
	                // 排除 ios 上的一些特殊情况
	                if (_sniff.ios) {
	                    // 判断是否是点击文字，进行选择等操作，如果是，不需要模拟click
	                    selection = win.getSelection();
	                    if (selection.rangeCount && !selection.isCollapsed) {
	                        return TRUE;
	                    }
	
	                    // 当 alert 或 confirm 时，点击其他地方，会触发touch事件，id相同，此事件应该被忽略
	                    if (curId === lastId) {
	                        event.preventDefault();
	                        return FALSE;
	                    }
	
	                    lastId = curId;
	
	                    //TODO updateScrollParent
	
	                }
	
	                // 开始跟踪 click
	                trackingClick = TRUE;
	                clickElement = curElement;
	            }
	
	        }
	
	        overTouchTime = 0;
	
	        return TRUE;
	
	    }
	
	    function onTouchMove(event) {
	        var touch = findTouch(event.changedTouches);
	
	        if (touch && gesture) {
	            analysisMove(event, touch);
	        }
	
	        return TRUE;
	    }
	
	    function onTouchEnd(event) {
	        var touch = findTouch(event.changedTouches),
	            timestamp = event.timeStamp,
	            tagName, forElement, startTime;
	
	        if (touch && gesture) {
	            analysisEnd(event, touch);
	
	            startTime = gesture.timestamp;
	
	            reset();
	
	            if (!_sniff.pc) {
	
	                if (trackingClick) {
	
	                    // 触击过快，阻止下一次 click
	                    if (timestamp - lastTime < TAP_TIMEOUT) {
	                        cancelNextClick = TRUE;
	                        return TRUE;
	                    }
	
	                    if (timestamp - startTime > TAP_TIMEOUT) {
	                        return TRUE;
	                    }
	
	                    cancelNextClick = FALSE;
	                    lastTime = timestamp;
	
	                    tagName = clickElement.nodeName.toLowerCase();
	                    // 如果是 label， 则模拟 focus 其相关的元素
	                    if (tagName === 'label') {
	                        forElement = findControl(clickElement);
	                        if (forElement) {
	                            _focus(forElement);
	
	                            if (_sniff.android) {
	                                return FALSE;
	                            }
	
	                            clickElement = forElement;
	                        }
	                    } else if (needsFocus(clickElement)) {
	                        if (timestamp - startTime > 100 || (_sniff.ios && win.top !== win && tagName === 'input')) {
	                            clickElement = NULL;
	                            return FALSE;
	                        }
	
	                        _focus(clickElement);
	                        sendClick(clickElement, touch);
	
	                        if (!_sniff.ios || tagName !== 'select') {
	                            clickElement = NULL;
	                            event.preventDefault();
	                        }
	
	                        return FALSE;
	                    }
	
	                    if (!needsClick(clickElement)) {
	                        event.preventDefault();
	                        sendClick(clickElement, touch);
	                    }
	
	                    return FALSE;
	                }
	            }
	        }
	
	        return TRUE;
	    }
	
	    function onTouchCancel(event) {
	        var touch = findTouch(event.changedTouches);
	
	        if (touch && gesture) {
	            clickElement = NULL;
	            analysisEnd(event, touch);
	            reset();
	        }
	
	        return TRUE;
	    }
	
	    function onMouse(event) {
	        if (!clickElement) {
	            return TRUE;
	        }
	
	        if (event.forwardedTouchEvent) {
	            return TRUE;
	        }
	
	        if (!event.cancelable) {
	            return TRUE;
	        }
	
	        if (!needsClick(clickElement) || cancelNextClick) {
	            if (event.stopImmediatePropagation) {
	                event.stopImmediatePropagation();
	            } else {
	                event.propagationStopped = TRUE;
	            }
	            event.stopPropagation();
	            event.preventDefault();
	            return FALSE;
	        }
	
	        return TRUE;
	    }
	
	    function onClick(event) {
	        var permitted;
	
	        if (trackingClick) {
	            clickElement = NULL;
	            trackingClick = FALSE;
	            return TRUE;
	        }
	
	        if (event.target.type === 'submit' && event.detail === 0) {
	            return TRUE;
	        }
	
	        permitted = onMouse(event);
	
	        if (!permitted) {
	            clickElement = NULL;
	        }
	
	        return permitted;
	    }
	
	    _ready(function () {
	        var body = doc.body;
	
	        if (!_sniff.pc) {
	
	            if (_sniff.android) {
	                _addEvent(body, 'moveover', onMouse, TRUE);
	                _addEvent(body, 'mousedown', onMouse, TRUE);
	                _addEvent(body, 'mouseup', onMouse, TRUE);
	            }
	
	            _addEvent(body, 'click', onClick, TRUE);
	        }
	
	        _addEvent(body, 'touchstart', onTouchStart, TRUE);
	        _addEvent(body, 'touchmove', onTouchMove, TRUE);
	        _addEvent(body, 'touchend', onTouchEnd, TRUE);
	        _addEvent(body, 'touchcancel', onTouchCancel, TRUE);
	    });
	
	    return {
	        allowLongTap: function () {
	            ALLOW_LONG_TAP = TRUE;
	        },
	        on: function() {
	            running = TRUE;
	        },
	        off: function() {
	            running = FALSE;
	        }
	    };
	
	})();

	// Animate
	var _animate = (function () {
	    var DURATION = 200,
	        TIMEOUT_DELAY = 25,
	        EASE = 'linear';
	
	    var transitionProperty, transitionDuration, transitionTiming, transitionDelay;
	
	    transitionProperty = prefix + 'transition-property';
	    transitionDuration = prefix + 'transition-duration';
	    transitionDelay = prefix + 'transition-delay';
	    transitionTiming = prefix + 'transition-timing-function';
	
	    function setParentStyle(el) {
	        var parentNode = el.parentNode;
	        if (parentNode) {
	            _css(parentNode, {
	                'transform-style': 'preserve-3d',
	                'backface-visibility': 'hidden'
	            });
	        }
	    }
	
	    function resetParentStyle(el) {
	        var parentNode = el.parentNode;
	        _removeStyle(parentNode, ['transform-style', 'backface-visibility']);
	    }
	
	    return function (el, props, duration, ease, delay) {
	        var argsLength = arguments.length,
	            endEvent = eventPrefix + 'TransitionEnd',
	            cssValues = {},
	            cssProperties = [],
	            transforms = '';
	
	        if (argsLength < 3) {
	            duration = DURATION;
	        }
	
	        if (argsLength < 4) {
	            ease = EASE;
	        }
	
	        if (argsLength < 5) {
	            delay = 0;
	        }
	
	        _each(props, function (key, value) {
	            if (supportedTransforms.test(key)) {
	                transforms += key + '(' + value + ') ';
	            } else {
	                cssValues[key] = value;
	            }
	            cssProperties.push(_dasherize(key));
	        });
	
	        if (transforms) {
	            cssValues[transformAttr] = transforms;
	            cssProperties.push(transformAttr);
	        }
	
	        if (duration > 0) {
	            cssValues[transitionProperty] = cssProperties.join(', ');
	            cssValues[transitionDuration] = duration / 1000 + 's';
	            cssValues[transitionDelay] = delay / 1000 + 's';
	            cssValues[transitionTiming] = ease;
	        }
	
	        var that = new Deferred();
	        var fired = FALSE;
	
	        function callback(event) {
	            if (event) {
	                if (event.target !== el) {
	                    return;
	                }
	            }
	            _removeEvent(el, endEvent, callback);
	            fired = TRUE;
	            _delay(function () {
	                if (transforms) {
	                    resetParentStyle(el);
	                }
	                _removeStyle(el, 'transition');
	                that.resolve();
	            });
	        }
	
	        if (duration > 0) {
	            _addEvent(el, endEvent, callback, FALSE);
	
	            // 兼容不支持的情况
	            _delay(function () {
	                if (!fired) {
	                    callback();
	                }
	            }, duration + delay + TIMEOUT_DELAY * 2);
	        }
	
	        _delay(function () {
	            if (transforms) {
	                setParentStyle(el);
	            }
	
	            _css(el, cssValues);
	
	            that.notify('start');
	        }, TIMEOUT_DELAY);
	
	        if (duration <= 0) {
	            _delay(callback);
	        }
	
	        return that;
	    };
	})();
	

	// DelegatedEvent 代理事件
	var checkContains = function (list, el) {
	    for (var i = 0, len = list.length; i < len; i += 1) {
	        if (_contains(list[i], el)) {
	            return TRUE;
	        }
	    }
	    return FALSE;
	};
	
	function _delegatedEvent(actEl, expEls, tag) {
	    if (!expEls) {
	        expEls = [];
	    }
	    expEls = [].concat(expEls);
	    var evtList = {},
	        bindEvent = function (evt) {
	            var el = evt.target,
	                type = evt.type;
	            doDelegated(el, type, evt);
	        },
	        actionTag = tag || 'action-type';
	
	    function doDelegated(el, type, evt) {
	        var actionType = NULL;
	
	        function checkBuble() {
	            var tg = el,
	                data = _dataSet(tg);
	            if (evtList[type] && evtList[type][actionType]) {
	                return evtList[type][actionType]({
	                    'evt': evt,
	                    'el': tg,
	                    'box': actEl,
	                    'data': data
	                }, data);
	            } else {
	                return TRUE;
	            }
	        }
	
	        if (checkContains(expEls, el)) {
	            return FALSE;
	        } else if (!_contains(actEl, el)) {
	            return FALSE;
	        } else {
	            while (el && el !== actEl) {
	                if (el.nodeType === 1) {
	                    actionType = el.getAttribute(actionTag);
	                    if (actionType && checkBuble() === FALSE) {
	                        break;
	                    }
	                }
	                el = el.parentNode;
	            }
	
	        }
	    }
	
	    var that = {};
	
	    that.add = function (funcName, evtType, process, useCapture) {
	        if (!evtList[evtType]) {
	            evtList[evtType] = {};
	            _addEvent(actEl, evtType, bindEvent, !!useCapture);
	        }
	        var ns = evtList[evtType];
	        ns[funcName] = process;
	    };
	
	    that.remove = function (funcName, evtType) {
	        if (evtList[evtType]) {
	            delete evtList[evtType][funcName];
	            if (_isEmptyObject(evtList[evtType])) {
	                delete evtList[evtType];
	                _removeEvent(actEl, evtType, bindEvent);
	            }
	        }
	    };
	
	    that.pushExcept = function (el) {
	        expEls.push(el);
	    };
	
	    that.removeExcept = function (el) {
	        if (!el) {
	            expEls = [];
	        } else {
	            for (var i = 0, len = expEls.length; i < len; i += 1) {
	                if (expEls[i] === el) {
	                    expEls.splice(i, 1);
	                }
	            }
	        }
	
	    };
	
	    that.clearExcept = function () {
	        expEls = [];
	    };
	
	    that.fireAction = function (actionType, evtType, evt, params) {
	        var data = {};
	        if (params && params.data) {
	            data = params.data;
	        }
	        if (evtList[evtType] && evtList[evtType][actionType]) {
	            evtList[evtType][actionType]({
	                'evt': evt,
	                'el': NULL,
	                'box': actEl,
	                'data': data,
	                'fireFrom': 'fireAction'
	            }, data);
	        }
	    };
	
	    that.fireInject = function (dom, evtType, evt) {
	        var actionType = dom.getAttribute(actionTag),
	            dataSet = _dataSet(dom);
	        if (actionType && evtList[evtType] && evtList[evtType][actionType]) {
	            evtList[evtType][actionType]({
	                'evt': evt,
	                'el': dom,
	                'box': actEl,
	                'data': dataSet,
	                'fireFrom': 'fireInject'
	            }, dataSet);
	        }
	    };
	
	
	    that.fireDom = function (dom, evtType, evt) {
	        doDelegated(dom, evtType, evt || {});
	    };
	
	    that.destroy = function () {
	        for (var k in evtList) {
	            for (var l in evtList[k]) {
	                delete evtList[k][l];
	            }
	            delete evtList[k];
	            _removeEvent(actEl, k, bindEvent);
	        }
	    };
	
	    return that;
	}

	// parseURL
	var URL_REG = /(\w+):\/\/\/?([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(\?[^#]*)?(#.*)?/i,
	    URL_MAP = ['url', 'protocol', 'hostname', 'port', 'path', 'name', 'query', 'hash'];
	
	function _parseURL(str, decode) {
	    var scope = _associate(URL_REG.exec(str) || [], URL_MAP);
	
	    scope.query = scope.query ? _queryToJson(scope.query.substring(1), decode) : {};
	
	    scope.hash = scope.hash ? _queryToJson(scope.hash.substring(1), decode) : {};
	
	    scope.getQuery = function(key) {
	        return scope.query[key];
	    };
	
	    scope.getHash = function(key) {
	        return scope.hash[key];
	    };
	
	    scope.setQuery = function(key, value) {
	        if (value === UNDEFINED) {
	            scope.query[key] = NULL;
	        } else {
	            scope.query[key] = value;
	        }
	        return scope;
	    };
	
	    scope.setHash = function(key, value) {
	        if (value === UNDEFINED) {
	            scope.hash[key] = NULL;
	        } else {
	            scope.hash[key] = value;
	        }
	        return scope;
	    };
	
	    scope.toUrl = function(encode) {
	        var url = scope.protocol + '://',
	            query = _jsonToQuery(scope.query, encode),
	            hash = _jsonToQuery(scope.hash, encode);
	        if (scope.protocol && scope.protocol.toLowerCase() === 'file') {
	            url += '/';
	        }
	        return url +
	            scope.hostname +
	            (scope.port || '') +
	            scope.path +
	            (scope.name || '') +
	            (query ? '?' + query : '') +
	            (hash ? '#' + hash : '');
	    };
	
	    return scope;
	}
	
	/// Loader
	var LOADER_OPT = {
	    charset: 'UTF-8',
	    timeout: 30 * 1000,
	    onComplete: NULL,
	    onTimeout: NULL,
	    onFail: NULL
	};
	
	var headEL = doc.getElementsByTagName('head')[0];
	
	function bindEvent(el, deferred, timeout) {
	    var requestTimeout;
	
	    headEL.insertBefore(el, headEL.firstChild);
	
	    if (timeout) {
	        requestTimeout = _delay(function() {
	            el.onload = NULL;
	            _removeNode(el);
	            deferred.reject({type : 'Timeout'});
	        }, timeout);
	    }
	
	    el.onload = function() {
	        if (requestTimeout) {
	            clearTimeout(requestTimeout);
	        }
	        el.onload = NULL;
	        el.onerror = NULL;
	        deferred.resolve();
	    };
	
	    el.onerror = function() {
	        if (requestTimeout) {
	            clearTimeout(requestTimeout);
	        }
	        _removeNode(el);
	        el.onload = NULL;
	        el.onerror = NULL;
	        deferred.reject({type : 'Error'});
	    };
	}
	
	var Manager = {
	    script : function(url, options) {
	        var deferred = new Deferred(),
	            charset = options.charset,
	            timeout = options.timeout,
	            el = doc.createElement('script');
	        el.type = 'text/javascript';
	        el.charset = charset;
	        return deferred.startWith(function() {
	            deferred.notify('element', el);
	            bindEvent(el, deferred, timeout);
	            el.src = url;
	        });
	    },
	    style : function(url, options) {
	        var deferred = new Deferred(),
	            charset = options.charset,
	            timeout = options.timeout,
	            el = doc.createElement('link');
	        el.type = 'text/css';
	        el.charset = charset;
	        el.rel = 'stylesheet';
	        return deferred.startWith(function() {
	            bindEvent(el, deferred, timeout);
	            el.href = url;
	        });
	    },
	    image : function(url, options) {
	        var deferred = new Deferred(),
	            img = new Image(),
	            timeout = options.timeout,
	            timer = NULL;
	        img.onload = function() {
	            img.onload = NULL;
	            img.onerror = NULL;
	            if (timer) {
	                clearTimeout(timer);
	            }
	            deferred.resolve(img);
	        };
	        img.onerror = function() {
	            img.onload = NULL;
	            img.onerror = NULL;
	            if (timer) {
	                clearTimeout(timer);
	            }
	            deferred.reject({type : 'Error'});
	        };
	        if (timeout) {
	            timer = _delay(function() {
	                img.onload = NULL;
	                img.onerror = NULL;
	                if (timer) {
	                    clearTimeout(timer);
	                }
	                deferred.reject({type : 'Timeout'});
	            }, timeout);
	        }
	        return deferred.startWith(function() {
	            img.src = url;
	        });
	    }
	};
	
	function _loader(type, url, options) {
	    var opt = _extend({}, LOADER_OPT, options),
	        deferred = Manager[type] && Manager[type](url, opt);
	
	    if (deferred && (opt.onComplete || opt.onFail || opt.onTimeout)) {
	        deferred.then(opt.onComplete, function(reason) {
	            if (reason.type === 'Timeout' && _isFunction(opt.onTimeout)) {
	                opt.onTimeout(reason);
	            }
	            if (reason.type === 'Error' && _isFunction(opt.onFail)) {
	                opt.onFail(reason);
	            }
	        });
	    }
	
	    return deferred;
	}

	var _hash = (function () {
	
	    var event = _createEventManager(),
	        locked = FALSE,
	        lastHash;
	
	    function getHash() {
	        var match = win.location.href.match(/#(.*)$/);
	        return match ? match[1] : '';
	    }
	
	    function getInfo() {
	        var hash = getHash(),
	            match = hash.split('?'),
	            query = _queryToJson(match[1] || ''),
	            info = _extend({}, _associate((match[0] + ':').split(':'), ['view', 'index']), {
	                ani: query.ani,
	                param: _queryToJson(match[1] || '', TRUE)
	            });
	
	        if (!info.view) {
	            info.root = TRUE;
	        }
	
	        return info;
	    }
	
	    var setHash = win.history.pushState ? function (hash, replaced) {
	        win.history[replaced ? 'replaceState': 'pushState'](hash, NULL, location.href.split('#')[0] + hash);
	    } : function(hash, replaced) {
	        locked = true;
	        if (replaced) {
	            win.history.back();
	        }
	        _delay(function() {
	            win.location.hash = hash;
	            locked = false;
	        });
	    };
	
	    function buildHash(view, index, ani, param) {
	        var p = {};
	        _each(param, function(key, value) {
	            if (value || value === 0) {
	                p[key] = value;
	            }
	        });
	        return '#' + view + (index ? ':' + index : '') + '?' + _jsonToQuery(_extend(p, {
	            ani: ani
	        }), TRUE);
	    }
	
	    win.addEventListener('hashchange', function () {
	        if (lastHash !== location.hash && !locked) {
	            lastHash = location.hash;
	            event.trigger('change', getInfo());
	        }
	    });
	
	    var Hash = {
	        getInfo: getInfo,
	        setInfo: function (view, index, ani, param) {
	            if (_isObject(view)) {
	                index = view.index;
	                ani = view.ani;
	                param = view.param;
	                view = view.view;
	            }
	            lastHash = buildHash(view, index, ani, param);
	            setHash(lastHash, view === getInfo().view);
	            return lastHash;
	        },
	        refreshInfo: function(view, index, ani, param) {
	            var curView = getInfo().view;
	            if (_isObject(view)) {
	                index = view.index;
	                ani = view.ani;
	                param = view.param;
	                view = view.view;
	            }
	            if ((curView || Config.indexView) !== (view || Config.indexView)) {
	                Hash.setInfo(view, index, ani, param);
	            }
	        },
	        setParam: function(key, value) {
	            var info = getInfo();
	            info.param[key] = value;
	            Hash.setInfo(info);
	        },
	        reset: function (notForce) {
	            var curInfo = getInfo();
	            if (!notForce || !(!curInfo.view || curInfo.view === Config.indexView)) {
	                win.location.hash = lastHash = '';
	            }
	        },
	        listener: function (callback) {
	            event.on('change', callback);
	        }
	    };
	
	    return Hash;
	
	})();
	

	var supportsOrientationChange = "onorientationchange" in win,
	    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize",
	    _orientation = _createEventManager(),
	    getOrientation = function(size) {
	        return size.width > size.height ? 'landscape' : 'portrait';
	    };
	
	_orientation.get = function() {
	    return getOrientation(_size(win));
	};
	
	_ready(function() {
	    var curSize = _size(win);
	    win.addEventListener(orientationEvent, function() {
	        var size = _size(win);
	        if (curSize.width !== size.width || curSize.height !== size.height) {
	            curSize = size;
	            _orientation.trigger('change', {
	                type: orientationEvent,
	                width: size.width,
	                height: size.height,
	                orientation: getOrientation(size)
	            });
	        }
	    });
	});

	/* ================================== 获取模板 ================================== */
	define('fetchNode', function () {
	
	    function resolveNode(deferred) {
	        deferred.resolve();
	    }
	
	    return function (view) {
	        var options = view.options;
	
	        return new Deferred().startWith(function (that) {
	            if (options.html || _isFunction(options.fetch)) {
	                if (options.html) {
	                    resolveNode(that);
	                } else if (options.fetch.length) { // function(resolve) {}
	                    options.fetch.call(view, function (node) {
	                        options.html = node || '';
	                        resolveNode(that);
	                    });
	                } else {
	                    options.html = options.fetch.call(view) || '';
	                    resolveNode(that);
	                }
	            } else {
	                options.html = '';
	                resolveNode(that);
	            }
	        });
	    };
	});
	

	/* ================================== 插件管理 ================================== */
	define('pluginM', function () {
	
	    var plugins = QApp._plugins = {},
	        globalPlugins = [];
	
	    return {
	        add: function (key, options, adapter) {
	            var names = [].concat(key);
	            names.forEach(function (name) {
	                plugins[name] = {
	                    options: options,
	                    adapter: adapter
	                };
	            });
	        },
	        exists: function (name) {
	            return !!plugins[name];
	        },
	        get: function (name) {
	            return plugins[name];
	        },
	        setOpt: function (name, options) {
	            if (plugins[name]) {
	                _extend(TRUE, plugins[name].options, options);
	            }
	        },
	        getGlobal: function () {
	            return globalPlugins;
	        },
	        setGlobal: function (gPlugins) {
	            globalPlugins = [].concat(gPlugins);
	        }
	    };
	});
	

	/* ================================== 组件管理 ================================== */
	define('widgetM', function () {
	
	    var widgets = QApp._widgets = {};
	
	    return {
	        add: function (name, adapter, isEvent) {
	            widgets[name] = {
	                eventName: isEvent && (_isString(isEvent) ? isEvent : 'tap'),
	                adapter: adapter
	            };
	        },
	        exists: function (name) {
	            return !!widgets[name];
	        },
	        isEvent: function (name) {
	            return !!widgets[name].eventName;
	        },
	        get: function (name) {
	            return widgets[name];
	        },
	        show: function (name, el, options, view) {
	            if (widgets[name]) {
	                if (_isElement(el)) {
	                    return widgets[name].adapter(el, options, view);
	                } else {
	                    return widgets[name].adapter(NULL, el, options);
	                }
	            }
	        }
	    };
	
	});
	

	/* ================================== Module ================================== */
	define('module', function () {
	
	    var $pluginM = r('pluginM'),
	        $viewM;
	
	    // 默认配置
	    var DEFAULT_OPT = {
	        name: NULL,         // 名称
	        defaultTag: NULL,   // 默认 tag
	        container: NULL,    // 渲染的位置
	        renderAll: FALSE,   // 是否都渲染
	        ready: NULL,        // ready 回调
	        views: [],          // 包含的 views
	        plugins: [],        // 插件配置
	        renderEvent: TRUE
	    };
	
	    // 渲染 View
	    function renderView(name, param, module, isShow) {
	
	        return new Deferred().startWith(function (that) {
	            $viewM.get(name, function (view) {
	                if (that.enabled) {
	                    if (view) {
	                        var cb = function (type) {
	                            if (type === 'destroy') {
	                                view.destroy();
	                                view = NULL;
	                                that.reject();
	                            }
	                        };
	
	                        view.parentModule = module;
	                        view.parentView = module.parentView;
	                        view.on('loadStart', function () {
	                            view.mergeParam(param);
	                            view.initialShow = !!isShow;
	                        });
	                        view.on('completed', function () {
	                            that.resolve(view);
	                        });
	                        view.renderTo(module.container);
	                        view.on('destroy', function () {
	                            view = NULL;
	                        });
	
	                        that.progress(cb);
	                        that.all(function () {
	                            that.unProgress(cb);
	                        });
	                    } else {
	                        that.resolve(NULL);
	                    }
	                }
	            });
	        });
	    }
	
	    // 处理 View
	    function handleView(module, parentViewIndex) {
	        var views = module.options.views;
	        views.forEach(function (view, index) {
	            if (_isString(view)) {
	                views[index] = view = {
	                    tag: view,
	                    name: view,
	                    param: {}
	                };
	            }
	            if (view.name.indexOf(':') === -1 && parentViewIndex) {
	                view.name += ':' + parentViewIndex;
	            }
	            module.addView(view.tag, view.name, view.param);
	        });
	    }
	
	    // 处理 Plugin
	    function handlePlugin(module) {
	        module.options.plugins.forEach(function (plugin) {
	            var name = typeof plugin === 'string' ? plugin : plugin.name,
	                options = plugin.options || {};
	            if ($pluginM.exists(name)) {
	                module.plugins[name] = ($pluginM.get(name))(module, options, Config);
	            }
	        });
	    }
	
	    // 充值 View 样式
	    function resetViewStyle(view) {
	        if (view && view.options && view.options.styles) {
	            _css(view.root, view.options.styles);
	        }
	    }
	
	    // Module 对象
	    function Module(options, parentViewIndex) {
	        var me = this;
	
	        me.options = _extend(TRUE, {}, DEFAULT_OPT, options);
	        me.param = {};
	        me.isReady = FALSE;
	        me.container = NULL;
	        me.curTag = me.options.defaultTag || NULL;
	        me.tagList = [];
	        me.parentView = NULL;
	        me.views = {};
	        me.plugins = {};
	
	        me.renderAll = me.options.renderAll;
	        me.renderDefers = [];
	
	        me.renderAllDefer = NULL;
	        me.renderOneDefer = NULL;
	
	        me.pushMessageTimer = NULL;
	
	        handleView(me, parentViewIndex);
	        handlePlugin(me);
	    }
	
	    _extend(Module.prototype, {
	        renderTo: function (container) {
	            var me = this,
	                renderEvent = me.options.renderEvent,
	                curView;
	            me.container = container;
	            if (me.renderAll) {
	                me.renderAllDefers = _queue(me.renderDefers, me.tagList).done(function () {
	                    me.trigger('loaded');
	                }).progress(function (tag, view) {
	                    if (view) {
	                        if (renderEvent) {
	                            view.trigger('beforeShow');
	                        }
	                        me.views[tag].entity = view;
	                        if (renderEvent) {
	                            view.trigger('show');
	                        }
	                    }
	                });
	            } else if (me.curTag) {
	                curView = me.views[me.curTag];
	                if (curView) {
	                    me.renderOneDefer = renderView(curView.name, curView.param, me, TRUE).done(function (view) {
	                        if (renderEvent) {
	                            view.trigger('beforeShow');
	                        }
	                        curView.entity = view;
	                        if (renderEvent) {
	                            view.trigger('show');
	                        }
	                        me.trigger('loaded');
	                    });
	                }
	            } else {
	                me.trigger('loaded');
	            }
	            if (!me.isReady) {
	                me.isReady = TRUE;
	                me.trigger('ready');
	                _apply(me.options.ready, me);
	            }
	        },
	        mergeParam: function (newParam) {
	            var me = this,
	                viewOpt;
	            _extend(TRUE, me.param, newParam);
	            if (me.curTag && me.views[me.curTag]) {
	                viewOpt = me.views[me.curTag];
	                $viewM.get(viewOpt.name, viewOpt.param).invoke('mergeParam', me.param);
	            }
	        },
	        addView: function (tag, name, param) {
	            var me = this;
	            tag = tag || name;
	            if (me.renderAll && !me.curTag) {
	                me.curTag = tag;
	            }
	            me.views[tag] = {
	                name: name,
	                param: param
	            };
	            me.tagList.push(tag);
	            if (me.renderAll) {
	                me.renderDefers.push(renderView(name, param, me, me.curTag === tag));
	            }
	        },
	        launch: function (tag, param) {
	            var me = this,
	                curView = me.views[me.curTag],
	                nextView = me.views[tag],
	                curEntity, nextEntity;
	
	            if (me.renderOneDefer) {
	                me.renderOneDefer.destroy();
	                me.renderOneDefer = NULL;
	            }
	
	            if (nextView) {
	                curEntity = curView && curView.entity;
	                nextEntity = nextView.entity;
	                if (me.curTag === tag && curEntity) {
	                    curEntity.mergeParam(_extend({}, me.param, param));
	                    curEntity.trigger('refresh');
	                } else {
	                    if (me.renderAll) {
	                        nextEntity.mergeParam(_extend({}, me.param, param));
	                        if (curEntity) {
	                            curEntity.trigger('beforeHide');
	                            _css(curEntity.root, 'display', 'none');
	                        }
	                        nextEntity.trigger('beforeShow');
	                        _removeStyle(nextEntity.root, ['visibility', 'display']);
	                        resetViewStyle(nextEntity);
	                        nextEntity.trigger('show');
	                        nextEntity.notify('actived');
	                        if (curEntity) {
	                            curEntity.trigger('hide');
	                            curEntity.notify('deactived');
	                        }
	                        me.curTag = tag;
	                        me.trigger('launch', tag, param);
	                    } else {
	                        if (curEntity) {
	                            curEntity.trigger('beforeHide');
	                        }
	                        nextEntity = nextView.entity = NULL;
	                        me.renderOneDefer = renderView(nextView.name, _extend({}, nextView.param, me.param, param), me).done(function (view) {
	                            if (view) {
	                                nextEntity = nextView.entity = view;
	                                nextEntity.mergeParam(_extend({}, me.param, param));
	                                nextEntity.trigger('beforeShow');
	                                if (curEntity) {
	                                    _css(curEntity.root, 'display', 'none');
	                                }
	                                _removeStyle(nextEntity.root, ['visibility', 'display']);
	                                resetViewStyle(nextEntity);
	                                if (curEntity) {
	                                    curEntity.trigger('hide');
	                                }
	                                nextEntity.trigger('show');
	                                if (curEntity) {
	                                    curEntity.destroy();
	                                    curView.entity = NULL;
	                                }
	                                me.trigger('launch', tag, param);
	                            }
	                        }).fail(function () {
	                            if (curEntity) {
	                                curEntity.destroy();
	                                curView.entity = NULL;
	                            }
	                        });
	                    }
	                    me.curTag = tag;
	                }
	            }
	        },
	        getCurViewOpt: function () {
	            return this.views[this.curTag];
	        },
	        getCurView: function () {
	            var me = this,
	                tag = me.curTag,
	                views = me.views;
	            return tag && views[tag] ? views[tag].entity : NULL;
	        },
	        pushMessage: function (type, message) {
	            var me = this;
	            if (me.curTag) {
	                if (me.views[me.curTag].entity) {
	                    me.views[me.curTag].entity.trigger(type, message);
	                } else {
	                    (me.renderOneDefer || me.renderAllDefer).done(function () {
	                        if (me.views[me.curTag].entity) {
	                            me.views[me.curTag].entity.trigger(type, message);
	                        }
	                    });
	                }
	            }
	        },
	        destroy: function () {
	            var me = this;
	
	            _each(me.views, function (tag, viewOpt) {
	                if (viewOpt.entity && viewOpt.entity.destroy) {
	                    viewOpt.entity.destroy();
	                }
	                viewOpt.entity = NULL;
	            });
	
	            me.tagList.length = 0;
	
	            me.renderDefers.forEach(function (deferred) {
	                deferred.destroy();
	            });
	
	            me.renderDefers.length = 0;
	
	            if (me.renderAllDefer) {
	                me.renderAllDefer.destroy();
	            }
	
	            if (me.renderOneDefer) {
	                me.renderOneDefer.destroy();
	            }
	
	            clearTimeout(me.pushMessageTimer);
	
	            _each(me.plugins, function(key, plugin) {
	                if (plugin && _isFunction(plugin.destroy)) {
	                    plugin.destroy();
	                }
	            });
	
	            _empty(me);
	
	            me.destroyed = TRUE;
	        }
	    }, CustEvent);
	
	    // 注入 ViewManager
	    Module.inject = function (Manager) {
	        $viewM = Manager;
	    };
	
	    return Module;
	
	});
	

	/* ================================== View ================================== */
	define('view', function () {
	
	    var Module = r('module'),
	        $fetchNode = r('fetchNode'),
	        $pluginM = r('pluginM'),
	        $widgetM = r('widgetM');
	
	    var RENDER_TIMEOUT = 10;
	
	    var DEFAULT_OPT = {
	        init: _noop,
	        isContainer: FALSE,
	        html: NULL,
	        fetch: NULL,
	        template: NULL,
	        classNames: [],
	        attrs: {},
	        styles: {},
	        destroyDom: TRUE,
	        mergeRouterParam: TRUE,
	        ready: NULL,
	        modules: [],
	        subViews: [],
	        plugins: [],
	        bindEvents: {},
	        extra: {}
	    };
	
	    function createRoot(isContainer) {
	        return doc.createElement(
	            isContainer ? Tags.container : Tags.view
	        );
	    }
	
	    function initialize(view) {
	        var init = view.options.init;
	        if (_isFunction(init)) {
	            init.call(view);
	        } else {
	            _each(init, function (key, value) {
	                view[key] = _isFunction(value) ? value.bind(view) : value;
	            });
	        }
	    }
	
	    function bindEvents(view) {
	        _each(view.options.bindEvents, function(eventName, process) {
	            if (_isFunction(process)) {
	                view.on(eventName, process.bind(view));
	            }
	        });
	    }
	
	    function handleModule(view, viewIndex) {
	        var options = view.options,
	            module;
	        options.subViews.forEach(function (item) {
	            options.modules.unshift({
	                name: item.name + '-module',
	                defaultTag: 'index',
	                container: item.container,
	                ready: NULL,
	                views: [{
	                    tag: 'index',
	                    name: item.name,
	                    param: item.param
	                }],
	                plugins: [],
	                renderEvent: item.renderEvent
	            });
	        });
	        options.modules.forEach(function (moduleOpt) {
	            view.hasModule = TRUE;
	            module = new Module(moduleOpt, viewIndex);
	            module.parentView = view;
	            view.modules[moduleOpt.name] = module;
	        });
	    }
	
	    function handlePlugin(view) {
	        var addPlugins = view.options.isContainer ? [] : $pluginM.getGlobal();
	
	        addPlugins.concat(view.options.plugins).forEach(function (plugin) {
	            var name = _isString(plugin) ? plugin : plugin.name,
	                options = plugin.options || view.options[_camelCase(name) + 'Options'] || {},
	                pluginOpt = $pluginM.get(name),
	                opt;
	            if (pluginOpt) {
	                opt = _isFunction(options) ? options : _extend(TRUE, {}, pluginOpt.options, options);
	                view.plugins[name] = (pluginOpt.adapter)(view, opt, Config);
	            }
	        });
	    }
	
	    function getParam(el, name) {
	        var options = {
	            param: {}
	        };
	
	        _each(_dataSet(el), function (key, value) {
	            if (!key.indexOf(name)) {
	                var attrName = key.substring(name.length).replace(/\w/i, function (letter) {
	                    return letter.toLowerCase();
	                });
	                if (!attrName.indexOf('param')) {
	                    options.param[
	                        attrName.substring(3).replace(/\w/i, function (letter) {
	                            return letter.toLowerCase();
	                        })
	                        ] = value;
	                } else {
	                    options[attrName] = value;
	                }
	            }
	        });
	        return options;
	    }
	
	    function handleWidget(view, container) {
	        container =  (_isString(container) ? view.root.querySelector(container) : container) || view.root;
	        _makeArray(
	            container.querySelectorAll('[' + Tags.widget + ']')
	        ).forEach(function (el) {
	                var name = _attr(el, Tags.widget),
	                    widget, eventName, bindFunc, adapter, options;
	                if ($widgetM.exists(name)) {
	                    eventName = $widgetM.get(name).eventName;
	                    adapter = $widgetM.get(name).adapter;
	
	                    bindFunc = function () {
	                        options = getParam(el, name);
	                        widget = adapter(el, options, view);
	                        if (options.id) {
	                            view.widgets[options.id] = widget;
	                        }
	                    };
	
	                    if ($widgetM.isEvent(name)) {
	                        options = getParam(el, name);
	                        eventName = options.eventType || eventName;
	
	                        _addEvent(el, eventName, bindFunc, FALSE);
	                        view.on('destroy', function () {
	                            _removeEvent(el, eventName, bindFunc);
	                        });
	                    } else {
	                        if (view.isReady) {
	                            bindFunc();
	                        } else {
	                            view.on('ready', function () {
	                                bindFunc();
	                            });
	                        }
	                    }
	
	                    view.on('destroy', function () {
	                        if (widget && _isFunction(widget.destroy)) {
	                            widget.destroy();
	                        }
	                        widget = NULL;
	                        adapter = NULL;
	                        options = NULL;
	                        bindFunc = NULL;
	                    });
	                }
	            });
	    }
	
	    function handleRouter(view) {
	        view.on('router', function (data) {
	            view.mergeParam(_extend({}, data.param, {
	                routerType: data.type
	            }));
	        });
	    }
	
	    function doReady(view) {
	        view.isReady = TRUE;
	        view.trigger('ready');
	        _apply(view.options.ready, view);
	        view.trigger('completed');
	        if (view.initialShow) {
	            view.once('show', function() {
	                view.trigger('actived');
	            });
	        }
	    }
	
	    function getViewIndex(name) {
	        return name.split('-')[0].split(':')[1];
	    }
	
	    function View(options) {
	        var me = this;
	
	        me.options = _extend(TRUE, {}, DEFAULT_OPT, options);
	        me.name = me.options.name || ('view-' + _getUniqueID());
	        me.isContainer = me.options.isContainer;
	        me.container = NULL;
	        me.isReady = FALSE;
	        me.isShow = FALSE;
	        me.initialShow = TRUE;
	        me.locked = FALSE;
	        me.root = NULL;
	        me.nodes = NULL;
	        me.param = {};
	        me.parentModule = NULL;
	        me.parentView = NULL;
	        me.hasModule = FALSE;
	        me.modules = {};
	        me.plugins = {};
	        me.widgets = {};
	        me.extra = _extend({}, me.options.extra);
	
	        me.renderEventTimer = NULL;
	        me.renderDeferred = new Deferred();
	
	        me.moduleDeferreds = [];
	        me.modulParallelDeferred = NULL;
	
	        initialize(me);
	        bindEvents(me);
	        handleModule(me, getViewIndex(me.name));
	        handlePlugin(me);
	
	        if (me.options.mergeRouterParam) {
	            handleRouter(me);
	        }
	    }
	
	    _extend(View.prototype, CustEvent, {
	        renderTo: function (container) {
	            var me = this;
	            if (!me.locked) {
	                me.locked = TRUE;
	                me.container = container;
	                if (!me.isReady) {
	                    me.root = createRoot(me.isContainer);
	                    _attr(me.root, 'qapp-name', me.name);
	                    _addClass(me.root, me.options.classNames.join(' '));
	                    _attr(me.root, me.options.attrs);
	                    _css(me.root, me.options.styles);
	                    me.trigger('loadStart');
	                    $fetchNode(me).done(function () {
	                        me.html = me.options.html;
	                        me.trigger('loadEnd');
	                        me.container.appendChild(me.root);
	                        me.renderHTML().done(function () {
	                            me.trigger('rendered');
	                            if (me.hasModule) {
	                                _each(me.modules, function (key, module) {
	                                    me.moduleDeferreds.push(new Deferred().startWith(function (that) {
	
	                                        module.once('loaded', function () {
	                                            that.resolve();
	                                        });
	
	                                        module.renderTo(
	                                            (module.options.container && me.root.querySelector(module.options.container)) || me.root
	                                        );
	                                    }));
	                                });
	                                me.modulParallelDeferred = _parallel(me.moduleDeferreds).done(function () {
	                                    me.trigger('loaded');
	                                    me.locked = FALSE;
	                                    doReady(me);
	                                });
	                            } else {
	                                me.trigger('loaded');
	                                me.locked = FALSE;
	                                doReady(me);
	                            }
	                        });
	                    });
	                } else {
	                    me.trigger('rendered');
	                    me.container.appendChild(me.root);
	                    me.trigger('loaded');
	                    me.locked = FALSE;
	                    me.trigger('completed');
	                    if (me.initialShow) {
	                        me.once('show', function() {
	                            me.trigger('actived');
	                        });
	                    }
	                }
	            }
	            return me;
	        },
	        renderHTML: function (html) {
	            var me = this,
	                deferred = me.renderDeferred,
	                cb = function (e) {
	                    if (me.renderEventTimer) {
	                        clearTimeout(me.renderEventTimer);
	                        me.renderEventTimer = NULL;
	                    }
	                    me.renderEventTimer = _delay(function () {
	                        if (me.root) {
	                            deferred.resolve();
	                        }
	                    }, RENDER_TIMEOUT);
	                };
	
	            me.html = html || me.html;
	            me.nodes = _builder(me.html).children;
	
	            if (me.nodes.length) {
	                _addEvent(me.root, 'DOMNodeInserted', cb, FALSE);
	                _appendNodes(me.root, me.nodes);
	                deferred.done(function () {
	                    _removeEvent(me.root, 'DOMNodeInserted', cb);
	                    handleWidget(me);
	                });
	                me.renderEventTimer = _delay(function () {
	                    if (me.root) {
	                        deferred.resolve();
	                    }
	                }, RENDER_TIMEOUT);
	            } else {
	                if (me.root) {
	                    handleWidget(me);
	                    deferred.resolve();
	                }
	            }
	            return deferred;
	
	        },
	        staticBuild: function(root) {
	            var me = this;
	            if (root && _isElement(root)) {
	                me.trigger('loadStart');
	                me.html = root.innerHTML || '';
	                me.trigger('loadEnd');
	                me.container = root.parentNode || root;
	                me.root = root;
	                _attr(me.root, 'qapp-name', me.name);
	                _addClass(me.root, me.options.classNames.join(' '));
	                _attr(me.root, me.options.attrs);
	                _css(me.root, me.options.styles);
	                me.nodes = _makeArray(root.children) || [];
	                handleWidget(me);
	                me.trigger('rendered');
	                me.trigger('loaded');
	                doReady(me);
	                me.trigger('completed');
	                me.trigger('beforeShow');
	                me.trigger('show');
	                me.trigger('actived');
	            }
	            return me;
	        },
	        show: function (container, startCss, endCss, duration) {
	            var me = this;
	            if (me.isShow) {
	                _css(me.root, _extend({
	                    width: '100%',
	                    height: '100%',
	                    zIndex: _getZIndex()
	                }, endCss || startCss));
	                me.trigger('refresh');
	            } else {
	                me.once('completed', function () {
	                    _css(me.root, _extend({
	                        width: '100%',
	                        height: '100%',
	                        zIndex: _getZIndex()
	                    }, startCss));
	                    me.trigger('beforeShow');
	                    if (Config.animate && endCss) {
	                        _animate(me.root, endCss, duration).done(function () {
	                            me.isShow = TRUE;
	                            me.trigger('show');
	                        });
	                    } else {
	                        _css(me.root, endCss || {});
	                        me.isShow = TRUE;
	                        me.trigger('show');
	                    }
	                });
	                me.renderTo(_isElement(container) ? container : Config.appRoot);
	            }
	            return me;
	        },
	        hide: function () {
	            var me = this;
	            if (me.isShow) {
	                me.trigger('beforeHide');
	                me.trigger('hide');
	            }
	            return me;
	        },
	        mergeParam: function (newParam) {
	            var me = this;
	            _extend(TRUE, me.param, newParam);
	            _each(me.modules, function (key, module) {
	                module.mergeParam(me.param);
	            });
	            return me;
	        },
	        getInnerView: function (name) {
	            var me = this,
	                key, viewOpt;
	            if (name) {
	                for (key in me.modules) {
	                    viewOpt = me.modules[key].getCurViewOpt();
	                    if (viewOpt.entity && viewOpt.name === name) {
	                        return viewOpt.entity;
	                    }
	                }
	            }
	            return NULL;
	        },
	        fn: function (name) {
	            var me = this;
	            return function () {
	                return _isFunction(me[name]) ?
	                    me[name].apply(this, _makeArray(arguments)) :
	                    NULL;
	            };
	        },
	        dispatch: function () {
	            var me = this,
	                parentView = me.parentView,
	                args = _makeArray(arguments);
	            if (me.trigger.apply(me, args) && parentView) {
	                if (parentView.isReady && !parentView.locked) {
	                    parentView.trigger.apply(parentView, args);
	                } else {
	                    parentView.on('completed', function () {
	                        parentView.trigger.apply(parentView, args);
	                    });
	                }
	            }
	        },
	        notify: function () {
	            var me = this,
	                args = _makeArray(arguments),
	                subView;
	            if (me.trigger.apply(me, args) && me.hasModule) {
	                _each(me.modules, function (key, module) {
	                    subView = module.getCurView();
	                    if (subView) {
	                        subView.notify.apply(subView, args);
	                    }
	                });
	            }
	        },
	        scanWidget: function(container) {
	            handleWidget(this, container);
	        },
	        destroy: function () {
	            var me = this;
	            if (me.options.destroyDom) {
	                _removeNode(me.root);
	            }
	
	            clearTimeout(me.renderEventTimer);
	
	            if (me.renderDeferred) {
	                me.renderDeferred.destroy();
	            }
	
	            if (me.hasModule) {
	                me.moduleDeferreds.forEach(function (deferred) {
	                    deferred.destroy();
	                });
	                me.moduleDeferreds.length = 0;
	                if (me.modulParallelDeferred) {
	                    me.modulParallelDeferred.destroy();
	                }
	            }
	
	            _each(me.modules, function (key, module) {
	                module.destroy();
	            });
	
	            _each(me.plugins, function(key, plugin) {
	                if (plugin && _isFunction(plugin.destroy)) {
	                    plugin.destroy();
	                }
	            });
	
	            _each(me.widgets, function(key, widget) {
	                if (widget && _isFunction(widget.destroy)) {
	                    widget.destroy();
	                }
	            });
	
	            me.trigger('destroy');
	            me.off();
	
	            _empty(me);
	
	            me.destroyed = TRUE;
	
	            return me;
	        }
	    });
	
	    return View;
	});
	

	/* ================================== View 管理 ================================== */
	define('viewM', function() {
	
	    var View = r('view'),
	        Module = r('module');
	
	    var optionsMap = QApp._viewOptionsMap = {},
	        viewMap = QApp._viewMap = {};
	
	    function throwNoViewError(name) {
	        throw 'Not Found View defined "' + name + '" .';
	    }
	
	    function getRealName(name) {
	        return name.split(':')[0];
	    }
	
	    function getView(name, index, callback) {
	        var view;
	        if (viewMap[name] && viewMap[name][index]) {
	            callback(viewMap[name][index]);
	        } else if (optionsMap[name]) {
	            view = viewMap[name][index] = new View(_extend({
	                name: name + ':' + index
	            }, optionsMap[name]));
	            view.on('destroy', function () {
	                viewMap[name][index] = NULL;
	            });
	            callback(view);
	        } else {
	            throwNoViewError(name);
	        }
	    }
	
	    function getViewSync(name, index) {
	        var view = NULL;
	        if (viewMap[name] && viewMap[name][index]) {
	            view = viewMap[name][index];
	        } else if (optionsMap[name]) {
	            view = viewMap[name][index] = new View(_extend({
	                name: name + ':' + index
	            },optionsMap[name]));
	            view.on('destroy', function () {
	                viewMap[name][index] = NULL;
	            });
	        } else {
	            throwNoViewError(name);
	        }
	        return view;
	    }
	
	    function getOptions(args) {
	        return _extend.apply(NULL, [TRUE, {}].concat(_makeArray(args).slice(1).map(function (item) {
	            return _isString(item) ? optionsMap[item] || {} : item;
	        })));
	    }
	
	    var Manager = {
	        define: function (name) {
	            if (_isString(name)) {
	                optionsMap[name] = getOptions(arguments);
	                viewMap[name] = [];
	            }
	        },
	        undefine: function (name) {
	            if (_isString(name)) {
	                optionsMap[name] = NULL;
	            }
	        },
	        create: function () {
	            return new View(getOptions(arguments));
	        },
	        build: function(root) {
	            var options = getOptions(_makeArray(arguments).slice(1)),
	                view;
	            if (root && _isElement(root)) {
	                options.name = _attr(root, 'qapp-name');
	                view = new View(options);
	                view.staticBuild(root);
	            }
	            return view;
	        },
	        exists: function (name) {
	            return optionsMap[name];
	        },
	        get: function (key, callback) {
	            var opt = {}, that, values;
	            if (_isString(key)) {
	                values = key.split(':');
	                opt = {
	                    name: values[0],
	                    index: values[1] || 0
	                };
	            }
	            if (_isFunction(callback)) {
	                getView(opt.name, opt.index, function (view) {
	                    callback(view);
	                });
	            } else {
	                that = {
	                    invoke: function () {
	                        var args = _makeArray(arguments),
	                            funcName = args.shift();
	                        getView(opt.name, opt.index, function (view) {
	                            _apply(view[funcName], view, args);
	                        });
	                        return that;
	                    },
	                    pushMessage: function (type, message) {
	                        var view = viewMap[opt.name] && viewMap[opt.name][opt.index];
	                        if (view) {
	                            view.trigger(type, message);
	                        }
	                        return that;
	                    }
	                };
	
	                return that;
	            }
	        },
	        getSync: function(key) {
	            var opt = {}, values;
	            if (_isString(key)) {
	                values = key.split(':');
	                opt = {
	                    name: values[0],
	                    index: values[1] || 0
	                };
	            }
	            return getViewSync(opt.name, opt.index);
	        },
	        getExtraOption: function (name, key) {
	            var extra,
	                options = optionsMap[getRealName(name)];
	            if (options) {
	                extra = (options.extra && options.extra[Config.type]) || options.extra || {};
	                return extra[key];
	            }
	        },
	        getHashParams: function(name) {
	            var options = optionsMap[getRealName(name)];
	            return options ? options.hashParams || [] : [];
	        }
	    };
	
	    Module.inject(Manager);
	
	    return Manager;
	
	});
	

	/* ================================== Router ================================== */
	define('router', function () {
	
	    var $viewM = r('viewM');
	
	    var history = [],
	        actions = [],
	        hiddenActions = [],
	        backIntent = FALSE,
	        backNum = 0,
	        hideIndex = -1,
	        routerParam,
	        running = FALSE,
	        actionListeners = {},
	        callbacks = [],
	        hashSupport = [],
	        hashAllSupport = FALSE;
	
	
	    function checkAllSupport() {
	        hashAllSupport = hashSupport.indexOf('$all') > -1;
	    }
	
	    function isSupport(name) {
	        return hashAllSupport ?
	        hashSupport.indexOf('!' + (name || '').split(':')[0]) === -1 :
	        hashSupport.indexOf((name || '').split(':')[0]) > -1;
	    }
	
	    function notifyPreActived(flag) {
	        var eventName = flag ? 'actived' : 'deactived';
	        if (history.length) {
	            history[history.length - 1].decorator.container.notify(eventName);
	        } else {
	            try {
	                $viewM.get(Config.indexView, function (view) {
	                    view.notify(eventName);
	                });
	            } catch(e) {}
	        }
	    }
	
	    function getParam() {
	        return routerParam;
	    }
	
	    function resetVar() {
	        backIntent = FALSE;
	        backNum = 0;
	        hideIndex = -1;
	        running = FALSE;
	    }
	
	    function executeHide() {
	        var index = hideIndex !== -1 ? hideIndex : history.length - backNum,
	            completeNum = 0,
	            totalNum = history.length - index,
	            decorator,
	            callback = function () {
	                completeNum++;
	                if (completeNum === totalNum) {
	                    history.splice(index, totalNum);
	                    resetVar();
	                    if (index > 0) {
	                        decorator = history[index - 1].decorator;
	                        decorator.container.trigger('router', {
	                            type: 'backTo',
	                            param: routerParam
	                        });
	                        if (Config.hashRouter && isSupport(decorator.viewOpt.name)) {
	                            _hash.refreshInfo(decorator.viewOpt.name, NULL, decorator.type, {});
	                        }
	                    } else {
	                        if (Config.indexView) {
	                            $viewM.get(Config.indexView).pushMessage('router', {
	                                type: 'backTo',
	                                param: routerParam
	                            });
	                            if (Config.hashRouter) {
	                                _hash.reset(TRUE);
	                            }
	                        }
	                    }
	                    routerParam = UNDEFINED;
	                    execute();
	                }
	            },
	            i, l;
	
	        if (index > -1 && index < history.length) {
	            for (i = index, l = history.length; i < l; i++) {
	                history[i].back(callback, getParam);
	            }
	        } else {
	            if (index === history.length) {
	                if (history[index - 1]) {
	                    history[index - 1].decorator.container.trigger('router', {
	                        type: 'refresh',
	                        param: routerParam
	                    });
	                }
	            }
	            resetVar();
	            routerParam = UNDEFINED;
	            execute();
	        }
	
	    }
	
	    function execute() {
	        _delay(function () {
	            var action = actions[0],
	                decorator;
	            if (!running) {
	                if (backIntent) {
	                    running = TRUE;
	                    executeHide();
	                } else if (action) {
	                    running = TRUE;
	                    action.open(function () {
	                        decorator = action.decorator;
	                        if (Config.hashRouter && isSupport(decorator.viewOpt.name)) {
	                            action.hash = _hash.setInfo(
	                                decorator.viewOpt.name,
	                                NULL,
	                                decorator.type,
	                                decorator.viewOpt.param
	                            );
	                        }
	                        decorator.on('hide', function () {
	                            if (!running) {
	                                var index = history.indexOf(action);
	                                if (index > -1) {
	                                    history.splice(index, 1);
	                                }
	                            } else {
	                                hiddenActions.push(action);
	                            }
	                        });
	                        history.push(action);
	                        actions.shift();
	                        running = FALSE;
	                        execute();
	                        return history.length - 1;
	                    }, getParam);
	                } else {
	                    hiddenActions.forEach(function (action) {
	                        var index = history.indexOf(action);
	                        if (index > -1) {
	                            history.splice(index, 1);
	                        }
	                    });
	                    hiddenActions.length = 0;
	                    callbacks.forEach(function(callback) {
	                        callback();
	                    });
	                    callbacks.length = 0;
	                }
	            }
	        });
	    }
	
	    function analyseHash(info, callback) {
	        var listeners = actionListeners[info.view];
	
	        if (listeners && listeners.length && !listeners.every(function (listener) {
	                var ret = listener(info);
	                return ret || ret === UNDEFINED;
	            })) {
	
	            return FALSE;
	        }
	
	        if (info.root) {
	            Router.home(callback);
	        } else {
	            renderHash(info, callback);
	        }
	    }
	
	    function renderHash(info, callback) {
	        if (info.view) {
	            Router.goto(info.view, {
	                ani: info.ani,
	                param: info.param
	            }, {
	                fromHash: TRUE
	            }, callback);
	        } else {
	            _delay(callback);
	        }
	    }
	
	    function pushCallback(callback) {
	        if (_isFunction(callback)) {
	            callbacks.push(callback);
	        }
	    }
	
	    var Router = {
	        start: function () {
	            if (Config.hashRouter) {
	                _hash.listener(analyseHash);
	            }
	        },
	        renderHash: function(callback) {
	            analyseHash(_hash.getInfo(), callback);
	        },
	        addHashSupport: function (views) {
	            hashSupport = hashSupport.concat(views);
	            checkAllSupport();
	        },
	        setHashSupport: function(views) {
	            hashSupport = [].concat(views);
	            checkAllSupport();
	        },
	        push: function (decorator, openFunc, backFunc) {
	            if (!$router.has(decorator.name)) {
	                actions.push({
	                    decorator: decorator,
	                    open: openFunc,
	                    back: backFunc
	                });
	                execute();
	            }
	        },
	        hide: function (index, param) {
	            backIntent = TRUE;
	            hideIndex = index || 0;
	            routerParam = _isFunction(param) ? {} : param;
	            pushCallback(_getCallback(arguments));
	            execute();
	        },
	        back: function (num, param) {
	            backIntent = TRUE;
	            backNum = num || 1;
	            routerParam = _isFunction(param) ? {} : param;
	            pushCallback(_getCallback(arguments));
	            execute();
	            return history.length + actions.length === 0;
	        },
	        backTo: function (name, param) {
	            var args = arguments;
	            if (!history.some(function (item, index) {
	                if (item.decorator.viewName === name) {
	                    backIntent = TRUE;
	                    hideIndex = index + 1;
	                    routerParam = _isFunction(param) ? {} : param;
	                    pushCallback(_getCallback(args));
	                    execute();
	                    return TRUE;
	                }
	            }) && name == Config.indexView) {
	                Router.home(param);
	            }
	        },
	        home: function (param) {
	            backIntent = TRUE;
	            hideIndex = 0;
	            routerParam = _isFunction(param) ? {} : param;
	            pushCallback(_getCallback(arguments));
	            execute();
	        },
	        goto: function (name, options, param, callback) {
	            if (history.some(function (item) {
	                    if (item.decorator.viewName === name) {
	                        _extend(item.decorator.viewOpt.options, options);
	                        return TRUE;
	                    }
	                })) {
	                Router.backTo(name, param, callback);
	            } else if (name == Config.indexView) {
	                Router.home(param, callback);
	            } else {
	                if (param) {
	                    options = options || {};
	                    options.param = _extend({}, options.param, param);
	                }
	                Router.open(name, options, param, callback);
	            }
	        },
	        addListener: function(name, listener) {
	            if (actionListeners[name]) {
	                actionListeners[name].push(listener);
	            } else {
	                actionListeners[name] = [listener];
	            }
	        },
	        has: function (name) {
	            return history.concat(actions).some(function (item) {
	                if (item.decorator.viewName === name) {
	                    return TRUE;
	                }
	            });
	        },
	        find: function(name) {
	            return history.concat(actions).filter(function(item) {
	                if (item.decorator.viewName === name) {
	                    return TRUE;
	                }
	            })[0];
	        },
	        size: function () {
	            return history.concat(actions).length;
	        },
	        list: function () {
	            return history;
	        },
	        isFront: function(name) {
	            var list = history.concat(actions);
	            if (list.length) {
	                return list[list.length - 1].decorator.container.name === name;
	            } else {
	                return Config.indexView === name.split(':')[0];
	            }
	        },
	        notifyPreActived: notifyPreActived
	    };
	
	    return Router;
	});
	

	/* ================================== Decorator ================================== */
	define('decorator', function () {
	    var View = r('view'),
	        $router = r('router'),
	        $viewM = r('viewM');
	
	    var queue = [],
	        running = FALSE;
	
	    var Container_Tag = '-container';
	
	    function doQueue() {
	        var fn;
	        if (!running) {
	            if (queue.length) {
	                running = TRUE;
	                fn = queue.shift();
	                fn(function () {
	                    running = FALSE;
	                    doQueue();
	                });
	            }
	        }
	    }
	
	    function getEventKey(eventName) {
	        return 'on' + eventName.replace(/\w/, function (a) {
	                return a.toUpperCase();
	            });
	    }
	
	    function initContainer(decorator) {
	
	        var type = decorator.type,
	            viewOpt = decorator.viewOpt,
	            viewName = viewOpt.name,
	            viewParam = viewOpt.param,
	            options = viewOpt.options,
	            container = decorator.container = new View({
	                name: decorator.viewOpt.name + Container_Tag,
	                html: '',
	                isContainer: TRUE,
	                subViews: [{
	                    name: viewName,
	                    container: '.inner',
	                    param: viewParam,
	                    renderEvent: FALSE
	                }],
	                styles: options.styles,
	                plugins: [{
	                    name: type,
	                    options: _extend({}, $viewM.getExtraOption(name, type), decorator.options)
	                }],
	                ready: function () {
	                    var me = this,
	                        view = me.getInnerView(viewName);
	
	                    if (view) {
	                        view.hide = function () {
	                            decorator.hide();
	                        };
	
	                        view.close = function () {
	                            decorator.close();
	                        };
	
	                        view.show = function () {
	                            decorator.show();
	                        };
	
	                        view.getRouterIndex = function () {
	                            return decorator.routerIndex;
	                        };
	
	                        view.on('beforeShow', function () {
	                            view.trigger('init', options, decorator.showArgs);
	                        });
	
	                        view.on('refresh', function () {
	                            view.trigger('init', options, decorator.showArgs);
	                        });
	
	                        view.complete = function() {
	                            _apply(options.onComplete, view, arguments);
	                        };
	
	                        view.on('callback', function (data) {
	                            _apply(options.onComplete, view, arguments);
	                        });
	
	                        CustomEvents.forEach(function (eventName) {
	                            container.on(eventName, function (args) {
	                                view.trigger(eventName, args);
	                                decorator.trigger(eventName, args);
	                            });
	                        });
	
	                    }
	                }
	            });
	
	        container.decShow = function () {
	            decorator.show();
	        };
	
	        container.decHide = function () {
	            decorator.hide();
	        };
	
	        container.decClose = function () {
	            decorator.close();
	        };
	
	        CustomEvents.forEach(function (eventName) {
	            var func = options[getEventKey(eventName)];
	            if (_isFunction(func)) {
	                container.on(eventName, function () {
	                    func.apply(container.getInnerView(viewName), arguments);
	                });
	            }
	        });
	
	    }
	
	    function Decorator(type, options) {
	        var me = this;
	        me.name = '';
	        me.viewName = '';
	        me.type = type === FALSE ? 'none' : (type || Config.defaultAnimate);
	        me.options = options || {};
	        me.viewOpt = {};
	        me.showArgs = [];
	        me.container = NULL;
	        me.isShow = FALSE;
	        me.withRouter = FALSE;
	        me.routerIndex = -1;
	    }
	
	    _extend(Decorator.prototype, {
	        setView: function (viewName, param, options, callback) {
	            var me = this;
	            me.viewOpt = {
	                name: viewName,
	                param: param || {},
	                options: options || {},
	                callback: callback
	            };
	            me.name = viewName + '-' + me.type + '-' + _getUniqueID(); // jshint ignore:line
	            me.viewName = viewName;
	            if (me.container) {
	                me.container.destroy();
	                me.container = NULL;
	            }
	        },
	        show: function () {
	            var me = this;
	            if (!me.isShow) {
	                me.isShow = TRUE;
	                me.showArgs = _makeArray(arguments);
	                if (me.withRouter) {
	                    $router.push(me, function (callback, getParam) {
	                        EventManager.trigger('running', TRUE);
	                        if (!me.container) {
	                            initContainer(me);
	                        }
	                        me.container.once('show', function () {
	                            me.container.trigger('router', {
	                                type: 'open',
	                                param: getParam()
	                            });
	                            EventManager.trigger('running', FALSE);
	                            me.routerIndex = me.container.routerIndex = callback();
	                        });
	                        $router.notifyPreActived(false);
	                        me.container.show.apply(me.container, me.showArgs);
	                    }, function (callback, getParam) {
	                        EventManager.trigger('running', TRUE);
	                        me.container.once('hide', function () {
	                            me.container.trigger('router', {
	                                type: 'hide',
	                                param: getParam()
	                            });
	                            _delay(function () {
	                                EventManager.trigger('running', FALSE);
	                                callback();
	                                me.destroy();
	                                $router.notifyPreActived(true);
	                            });
	                        });
	                        me.container.hide();
	                    });
	                } else {
	                    queue.push(function (callback) {
	                        EventManager.trigger('running', TRUE);
	                        if (!me.container) {
	                            initContainer(me);
	                        }
	                        me.container.once('show', function () {
	                            EventManager.trigger('running', FALSE);
	                            callback();
	                        });
	                        me.container.show.apply(me.container, me.showArgs);
	                    });
	                    doQueue();
	                }
	            }
	        },
	        hide: function () {
	            var me = this;
	            if (me.isShow) {
	                me.isShow = FALSE;
	                if (me.withRouter) {
	                    if (me.container && me.routerIndex !== -1) {
	                        $router.hide(me.routerIndex);
	                    }
	                } else {
	                    queue.push(function (callback) {
	                        EventManager.trigger('running', TRUE);
	                        me.container.once('hide', function () {
	                            _delay(function () {
	                                EventManager.trigger('running', FALSE);
	                                callback();
	                                me.destroy();
	                            });
	                        });
	                        me.container.hide();
	                    });
	                    doQueue();
	                }
	            }
	        },
	        close: function () {
	            var me = this;
	            if (me.container) {
	                me.container.preventAnimate = TRUE;
	            }
	            me.hide();
	        },
	        destroy: function () {
	            var me = this,
	                container = me.container;
	            if (container && _isFunction(container.destroy)) {
	                container.destroy();
	            }
	            this.off();
	        }
	    }, CustEvent);
	
	    Decorator.show = function (withRouter, viewName, options) {
	        var args = _makeArray(arguments),
	            callback = _getCallback(arguments),
	            aniName,
	            aniOpt,
	            dec,
	            that;
	
	        if (viewName && viewName.split(':')[1] === 'new') {
	            viewName = viewName.replace(':new', ':' + _getUniqueID());
	        }
	
	        dec = $router.find(viewName);
	
	        if (!dec) {
	
	            options = options || {};
	
	            if (!options.ani) {
	                options.ani = $viewM.getExtraOption(viewName, 'ani') || '';
	            } else if (!_isString(options.ani) && !options.ani.name) {
	                options.ani.name = $viewM.getExtraOption(viewName, 'ani') || '';
	            }
	
	            aniName = _isString(options.ani) ? options.ani : options.ani.name;
	            aniOpt = (!_isString(options.ani) && options.ani) || {};
	
	            dec = new Decorator(aniName, aniOpt);
	            dec.withRouter = withRouter;
	            dec.setView(viewName, _extend({}, options.param), options, options.onComplete);
	            dec.once('show', function () {
	                _apply(callback, dec.container && dec.container.getInnerView(viewName));
	            });
	            dec.show.apply(dec, args.slice(3));
	        }
	
	        that = {
	            decorator: dec,
	            getContainer: function () {
	                return dec.container;
	            },
	            getView: function () {
	                return dec.container && dec.container.getInnerView(viewName);
	            },
	            hide: function () {
	                dec.hide();
	            },
	            close: function () {
	                dec.close();
	            }
	        };
	
	        CustEventFns.forEach(function (funcName) {
	            that[funcName] = function () {
	                dec[funcName].apply(dec, _makeArray(arguments));
	            };
	        });
	
	        return that;
	    };
	
	    View.prototype.atFront = function() {
	        var me = this;
	        while (me.parentView)  {
	            me = me.parentView;
	        }
	        return $router.isFront(me.name.replace(Container_Tag, ''));
	    };
	
	    return Decorator;
	
	});
	

	/* ================================== 出口文件 ================================== */
	var $viewM = r('viewM'),
	    $router = r('router'),
	    $decorator = r('decorator'),
	    $pluginM = r('pluginM'),
	    $widgetM = r('widgetM');
	
	var origin = {},
	    openFilters = [],
	    readyDefer = new Deferred(),
	    readyDependenceDefers = [];
	
	function coreReady(fn) {
	    readyDefer.done(fn);
	}
	
	coreReady(function () {
	    // 设置并记录 Root 的位置和大小
	    var de = doc.documentElement,
	        winWidth = de.clientWidth,
	        winHeight = de.clientHeight,
	        appRoot = doc.createElement(Tags.app);
	
	    function refreshSize() {
	        winWidth = de.clientWidth;
	        winHeight = de.clientHeight;
	        _extend(origin , {
	            width: winWidth,
	            height: winHeight,
	            rootWidth: winWidth - Config.root.left - Config.root.right,
	            rootHeight: winHeight - Config.root.top - Config.root.bottom
	        });
	
	        _css(doc.body, 'height', winHeight + 'px');
	
	        _css(appRoot, {
	            height: origin.rootHeight + 'px',
	            width: origin.rootWidth + 'px'
	        });
	    }
	
	    function checkKeyboard() {
	        var curHeight = de.clientHeight;
	        if (curHeight >= winHeight) {
	            if (curHeight > winHeight) {
	                refreshSize();
	            }
	        }
	    }
	
	    _extend(origin , {
	        width: winWidth,
	        height: winHeight,
	        rootTop: Config.root.top,
	        rootLeft: Config.root.left
	    });
	
	    _css(doc.body, 'height', winHeight + 'px');
	
	    if (Config.customRoot) {
	
	        origin.rootWidth = winWidth - Config.root.left - Config.root.right;
	        origin.rootHeight = winHeight - Config.root.top - Config.root.bottom;
	
	        _css(appRoot, {
	            top: origin.rootTop + 'px',
	            left: origin.rootLeft + 'px',
	            height: origin.rootHeight + 'px',
	            width: origin.rootWidth + 'px'
	        });
	
	        _appendNodes(doc.body, appRoot);
	    } else {
	        origin.rootWidth = winWidth;
	        origin.rootHeight = winHeight;
	
	        appRoot = doc.body;
	    }
	
	    if (Config.hashRouter && Config.hashSupport) {
	        if (Config.hashSupport.all) {
	            $router.setHashSupport('$all');
	        }
	        if (Config.hashSupport.exist) {
	            $router.addHashSupport(Config.hashSupport.exist);
	        }
	        if (Config.hashSupport.except) {
	            $router.addHashSupport([].concat(Config.hashSupport.except).map(function(item) {
	                return '!' + item;
	            }));
	        }
	        $router.start();
	    }
	
	    if (Config.screen) {
	        if (Config.screen.largeChange) {
	            win.addEventListener('resize', checkKeyboard);
	        }
	        if (Config.screen.rotate) {
	            _orientation.on('change', refreshSize);
	        }
	    }
	
	    if (Config.gesture) {
	        if (Config.gesture.ctrl) {
	            EventManager.on('running', function(ret) {
	                Gesture[ret ? 'off' : 'on']();
	            });
	        }
	        if (Config.gesture.longTap) {
	            QApp.gesture.allowLongTap();
	        }
	        if (Config.gesture.autoBlur) {
	            var focusTags = ['INPUT', 'TEXTAREA'];
	            _addEvent(doc.body, 'touchstart', function(e) {
	                if (focusTags.indexOf(e.target.tagName.toUpperCase()) === -1) {
	                    _blur();
	                }
	            });
	        }
	    }
	
	
	    QApp.root = Config.appRoot = appRoot;
	
	});
	
	function showDec(withRouter, args) {
	    return $decorator.show.apply(NULL, [withRouter].concat(_makeArray(args)));
	}
	
	// 暴露接口
	_extend(QApp, {
	
	    config: function (conf) {
	        var newConf =  _extend(TRUE, Config, conf),
	            plugins = newConf.plugins,
	            globalPlugins = newConf.globalPlugins;
	        if (_isArray(globalPlugins)) {
	            $pluginM.setGlobal(globalPlugins);
	        }
	        if (_isArray(plugins)) {
	            plugins.forEach(function(plugin) {
	                if (plugin && plugins.name) {
	                    $pluginM.setOpt(plugin.name, plugin.options);
	                }
	            });
	        } else if (plugins) {
	            _each(plugins, function(name, options) {
	                if (name) {
	                    $pluginM.setOpt(name, options);
	                }
	            });
	        }
	        return newConf;
	    },
	
	    root: doc.body,
	
	    origin: origin,
	
	    defineView: $viewM.define,
	
	    undefineView: $viewM.undefine,
	
	    createView: $viewM.create,
	
	    buildView: $viewM.build,
	
	    getView: $viewM.get,
	
	    getViewSync: $viewM.getSync,
	
	    addPlugin: $pluginM.add,
	
	    configPlugin: $pluginM.setOpt,
	
	    setGlobalPlugins: $pluginM.setGlobal,
	
	    addWidget: $widgetM.add,
	
	    showWidget: $widgetM.show,
	
	    router: $router,
	
	    sniff: _sniff
	});
	
	QApp.show = QApp.showView = function (viewName, options) {
	    if (options) {
	        return showDec(FALSE, arguments);
	    } else {
	        return $viewM.get(viewName).invoke('show');
	    }
	};
	
	QApp.router.open = function () {
	    var args = _makeArray(arguments);
	    if (args[0] && args[0].split(':')[1] === 'new') {
	        args[0] = args[0].replace(':new', ':' + _getUniqueID());
	    }
	    if ((args[1] && args[1].skipFilter) || openFilters.reduce(function(ret, filter) {
	        return ret && (filter(args) !== FALSE);
	    }, TRUE)) {
	        return showDec(TRUE, args);
	    } else {
	        return NULL;
	    }
	};
	
	QApp.open = function() {
	    var args = _makeArray(arguments),
	        noRouter = args[1] && args[1].router === FALSE,
	        fn = noRouter ? QApp.show : QApp.router.open;
	    return fn.apply(NULL, args);
	};
	
	QApp.router.addOpenFilter = function(filter) {
	    if (_isFunction(filter)) {
	        openFilters = openFilters.concat(filter);
	    }
	};
	
	QApp.router.removeOpenFilter = function(filter) {
	    var index = openFilters.indexOf(filter);
	    if (index > -1) {
	        openFilters.splice(index, 1);
	    }
	
	};
	
	// 添加 util
	
	var util = QApp.util = {};
	
	util.ready = _ready;
	
	QApp.ready = coreReady;
	
	QApp.addReadyDependencies = function(defer) {
	    readyDependenceDefers.push(defer);
	};
	
	util.query = function(selector) {
	    return doc.querySelector(selector);
	};
	
	util.queryAll = function(selector) {
	    return doc.querySelectorAll(selector);
	};
	
	util.is = getType;
	util.isObject = _isObject;
	util.isString = _isString;
	util.isArray = _isArray;
	util.isFunction = _isFunction;
	util.isNumber = _isNumber;
	util.isElement = _isElement;
	util.isPlainObject = _isPlainObject;
	util.isEmptyObject = _isEmptyObject;
	
	util.extend = _extend;
	util.each = _each;
	util.makeArray = _makeArray;
	util.delay = _delay;
	util.associate = _associate;
	util.mapping = _mapping;
	util.camelCase = _camelCase;
	util.dasherize = _dasherize;
	util.empty = _empty;
	util.noop = _noop;
	util.getUniqueID = _getUniqueID;
	util.getZIndex = _getZIndex;
	util.jsonToQuery = _jsonToQuery;
	util.queryToJson = _queryToJson;
	util.parseURL = _parseURL;
	util.loader = _loader;
	
	util.builder = _builder;
	util.appendNodes = _appendNodes;
	util.insertElement = _insertElement;
	util.removeNode = _removeNode;
	util.attr = _attr;
	util.css = _css;
	util.removeStyle = _removeStyle;
	util.addClass = _addClass;
	util.removeClass = _removeClass;
	util.fixEvent = _fixEvent;
	util.addEvent = _addEvent;
	util.removeEvent = _removeClass;
	util.dispatchEvent = _dispatchEvent;
	util.createStyle = _createStyle;
	util.size = _size;
	util.position = _position;
	util.contains = _contains;
	util.focus = _focus;
	util.blur = _blur;
	util.animate = _animate;
	util.dataSet = _dataSet;
	util.delegatedEvent = _delegatedEvent;
	
	util.CustEvent = util.custEvent = CustEvent;
	
	util.Deferred = util.deferred = Deferred;
	util.queue = _queue;
	util.parallel = _parallel;
	
	util.gesture = QApp.gesture = Gesture;
	
	util.hash = QApp.hash = _hash;
	
	win.QApp = QApp;
	
	// init
	_ready(function() {
	    if (readyDependenceDefers.length) {
	        _parallel(readyDependenceDefers).done(function() {
	            readyDefer.resolve();
	        });
	    } else {
	        readyDefer.resolve();
	    }
	});
	

})();