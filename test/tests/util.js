describe("util模块", function () {
//http://ued.qunar.com/mobile/qapp/document/
    function heredoc(fn) {
        return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').replace(/\*\/[^\/]+$/, '')
    }
    var util = QApp.util
    describe('util.is', function () {
        it("isXXX系列的内部实现", function () {
            expect(util.is("xxx", "String")).to.be(true)
            expect(util.is(NaN, "NaN")).to.be(true)
            expect(util.is(NaN, "Number")).to.be(false)
            expect(util.is(111, "Number")).to.be(true)
            expect(util.is(/test/i, "RegExp")).to.be(true)
            expect(util.is(new Date, "Date")).to.be(true)
            expect(util.is(window, "Window")).to.be(true)
        })
    })
    describe('isObject', function () {
        it("判定是否为非简单数据类型,即非null, undefined, number, boolean, string的所有类型 ", function () {
            expect(util.isObject("xxx")).to.be(false)
            expect(util.isObject(NaN)).to.be(false)
            expect(util.isObject(null)).to.be(false)
            expect(util.isObject(void 0)).to.be(false)
            expect(util.isObject(Date)).to.be(true)
            expect(util.isObject(function () {
            })).to.be(true)
            expect(util.isObject(window)).to.be(true)
            expect(util.isObject({})).to.be(true)
            expect(util.isObject(document.body)).to.be(true)
        })
    })
    describe('isArray', function () {
        it("判定是否为Array ", function () {
            expect(util.isArray([])).to.be(true)
            expect(util.isArray(NaN)).to.be(false)

        })
    })
    describe('isNumber', function () {
        it("判定是否为Number", function () {
            expect(util.isNumber(1111)).to.be(true)
            expect(util.isNumber(NaN)).to.be(false)
            expect(util.isNumber(Infinity)).to.be(true)
            expect(util.isNumber(-Infinity)).to.be(true)
            expect(util.isNumber(0)).to.be(true)
            expect(util.isNumber(2e64)).to.be(true)
            expect(util.isNumber("0")).to.be(false)
        })
    })
    describe('isString', function () {
        it("判定是否为String", function () {
            expect(util.isString("xxx")).to.be(true)
            expect(util.isString(new String(11))).to.be(true)

        })
    })
    describe('isElement', function () {
        it("判定是否为元素节点", function () {
            expect(util.isElement(document.body)).to.be(true)
            var a = {nodeType: 1}
            expect(util.isElement(a)).to.be(false)

        })
    })
    describe('isPlainObject', function () {
        it("判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例", function () {
            //不能DOM, BOM与自定义"类"的实例
            expect(util.isPlainObject([])).to.be(false)
            expect(util.isPlainObject(1)).to.be(false)
            expect(util.isPlainObject(null)).to.be(false)
            expect(util.isPlainObject(void 0)).to.be(false)
            expect(util.isPlainObject(window)).to.be(false)
            expect(util.isPlainObject(document.body)).to.be(false)
            if (window.dispatchEvent) {
                expect(util.isPlainObject(window.location)).to.be(false)
            }
            var fn = function () {
            }
            expect(util.isPlainObject(fn)).to.be(false)
            fn.prototype = {
                someMethod: function () {
                }
            };
            expect(util.isPlainObject(new fn)).to.be(false)
            expect(util.isPlainObject({})).to.be(true)
            expect(util.isPlainObject({
                aa: "aa",
                bb: "bb",
                cc: "cc"
            })).to.be(true)
            expect(util.isPlainObject(new Object)).to.be(true)

        })
    })

    describe('isEmptyObject', function () {
        it("判定是否空对象, 其可遍历的键值对个数为零", function () {
            var nullObject = Object.create(null)
            var hackDescriptor = {a: 1}
//            util.isEmptyObject = function(a){
//                try{
//                   return  JSON.stringify(a) === "{}"
//                }catch(e){
//                    return false
//                }
//            }
            Object.defineProperty(hackDescriptor, "a", {
                value: 1,
                writable: true,
                enumerable: false,
                configurable: true
            })
            expect(util.isEmptyObject({a: 1})).to.be(false)
            expect(util.isEmptyObject(nullObject)).to.be(true)
            expect(util.isEmptyObject(hackDescriptor)).to.be(true)

        })
    })

    describe('each', function () {
        it("遍历对象与数组", function () {
            var array = [1, 2, 3]
            var keys = []
            util.each(array, function (key) {
                keys.push(key)
            })
            expect(keys).to.eql(["0", "1", "2"])
        })
    })

    describe('extend', function () {
        it("糅杂", function () {
            var a = {
                cc: "cc"
            };
            util.extend(a, {
                test: "test"
            }, {
                second: "second"
            }, {
                third: "third"
            })

            expect(a).to.eql({
                cc: "cc",
                test: "test",
                second: "second",
                third: "third"
            })


            var b = {
                arr: [1, 2],
                str: 'aaa'
            };
            util.extend(true, b, {
                arr: [3, 4, 5, 6]
            }, {
                str: "888"
            }, {
                third: "third"
            })

            expect(b).to.eql({
                arr: [3, 4, 5, 6],
                str: "888",
                third: "third"
            })
        })
    })

    describe('makeArray', function () {
        it("数组化", function () {
            var body = document.body
            var div = document.createElement("div")
            div.innerHTML = heredoc(function () {
                /*
                 <div>zz<!--xxx-->xxx</div><select><option>1</option><option>2</option><option>3</option></select><div></div>
                 */
            })
            body.appendChild(div)
            expect(util.makeArray(div.childNodes).length).to.be(5)
            expect(util.makeArray(div.children).length).to.be(3)
            expect(util.makeArray(div.getElementsByTagName("div")).length).to.be(2)
            var a = div.getElementsByTagName("select")[0]
            expect(util.makeArray(a.options).length).to.be(3)
            body.removeChild(div)
            div.innerHTL = ""
        })
    })

    describe('associate(Aarr, Barr)', function () {
        it("合并两个数组为一个对象，Barr提供键名，Aarr提供健值(个人感觉没什么用)", function () {
            var a = ["a", "b", "c", "d"]
            var b = ["x", "y", "z"]
            expect(util.associate(a, b)).to.eql(
                    {x: 'a', y: 'b', z: 'c'}
            )
        })
    })

    describe('mapping(obj, keys)', function () {
        it("从一个对象中抽取部分键值组成数组", function () {
            var a = {x: 'a', y: 'b', z: 'c'}
            var b = ["x", "y", "z"]
            expect(util.mapping(a, b)).to.eql(
                    ["a", "b", "c"]
                    )
        })
    })

    describe('camelCase', function () {
        it("驼峰风格转换", function () {
            expect(util.camelCase("foo-bar")).to.be("fooBar");
            expect(util.camelCase("foo_bar")).to.be("fooBar");
            expect(util.camelCase("_foo_bar")).to.be("FooBar");
        })
    })

    describe('dasherize', function () {
        it("连字符风格转换", function () {
            expect(util.dasherize("fontSize")).to.be("font-size");
        })
    })

    describe('delay', function () {
        it("延迟触发", function (done) {
            var a = {
                b: 2
            }
            util.delay(function () {
                a.b = 4
            })
            expect(a.b).to.be(2);
            setTimeout(function () {
                expect(a.b).to.be(4);
                done()
            }, 1000)
        })
    })
    describe('empty', function () {
        it("清空对象", function () {
            var a = {
                b: 2,
                c: 1
            }
            util.empty(a)
            expect(a).to.eql({
                b: null,
                c: null
            })
        })
    })

    describe('getUniqueID', function () {

    })
    describe('getZIndex', function () {

    })
    describe('noop', function () {

    })
    describe('jsonToQuery', function () {
        it("对象转querystring, 相当于jQuery.param", function () {
            //https://github.com/jquery/jquery/blob/master/test/unit/serialize.js

            var r20 = /%20/g
            var rbracket = /\[\]$/
            util.jsonToQuery = function (obj) {
                var prefix,
                        s = [],
                        add = function (key, value) {
                            // If value is a function, invoke it and return its value
                            value = util.isFunction(value) ? value() : (value == null ? "" : value);
                            s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                        }
                // 处理数组与类数组的jquery对象
                if (Array.isArray(obj)) {
                    // Serialize the form elements
                    util.each(obj, add)

                } else {
                    for (prefix in obj) {
                        paramInner(prefix, obj[ prefix ], add);
                    }
                }

                // Return the resulting serialization
                return s.join("&").replace(r20, "+");
            }

            function paramInner(prefix, obj, add) {
                var name;
                if (Array.isArray(obj)) {
                    // Serialize array item.
                    util.each(obj, function (i, v) {
                        if (rbracket.test(prefix)) {
                            // Treat each array item as a scalar.
                            add(prefix, v);
                        } else {
                            // Item is non-scalar (array or object), encode its numeric index.
                            paramInner(
                                    prefix + "[" + (typeof v === "object" ? i : "") + "]",
                                    v,
                                    add
                                    //      traditional
                                    );
                        }
                    });
                } else if (util.isObject(obj)) {
                    // Serialize object item.
                    for (name in obj) {
                        paramInner(prefix + "[" + name + "]", obj[ name ], add);
                    }

                } else {
                    // Serialize scalar item.
                    add(prefix, obj);
                }
            }

            var params = {"foo": "bar", "baz": 42, "quux": "All your base are belong to us"};
            expect(util.jsonToQuery(params)).to.be("foo=bar&baz=42&quux=All+your+base+are+belong+to+us")

            params = {"string": "foo", "null": null, "undefined": undefined};
            expect(util.jsonToQuery(params)).to.be("string=foo&null=&undefined=")


            params = {"someName": [1, 2, 3], "regularThing": "blah"};
            expect(util.jsonToQuery(params)).to.be("someName%5B%5D=1&someName%5B%5D=2&someName%5B%5D=3&regularThing=blah")

            params = {"foo": ["a", "b", "c"]};
            expect(util.jsonToQuery(params)).to.be("foo%5B%5D=a&foo%5B%5D=b&foo%5B%5D=c")

            params = {"foo": ["baz", 42, "All your base are belong to us"]};
            expect(util.jsonToQuery(params)).to.be("foo%5B%5D=baz&foo%5B%5D=42&foo%5B%5D=All+your+base+are+belong+to+us")

            params = {"foo": {"bar": "baz", "beep": 42, "quux": "All your base are belong to us"}};
            expect(util.jsonToQuery(params)).to.be("foo%5Bbar%5D=baz&foo%5Bbeep%5D=42&foo%5Bquux%5D=All+your+base+are+belong+to+us")

            params = {a: [1, 2], b: {c: 3, d: [4, 5], e: {x: [6], y: 7, z: [8, 9]}, f: true, g: false, h: undefined}, i: [10, 11], j: true, k: false, l: [undefined, 0], m: "cowboy hat?"};
           

            expect(decodeURIComponent(util.jsonToQuery(params, false))).to.be("a[]=1&a[]=2&b[c]=3&b[d][]=4&b[d][]=5&b[e][x][]=6&b[e][y]=7&b[e][z][]=8&b[e][z][]=9&b[f]=true&b[g]=false&b[h]=&i[]=10&i[]=11&j=true&k=false&l[]=&l[]=0&m=cowboy+hat?")
  // params = {"a": [0, [1, 2], [3, 4, [5, 6]] ]}
 // params = {"a": [0, [1, 2], [3, 4, [5,6]] ]}
   params = {"a": [ {value:1}, {value: 2}]}
        console.log(util.jsonToQuery(params))
            params = {"a": [0, [1, 2], [3, [4, 5], [6]], {"b": [7, [8, 9], [{"c": 10, "d": 11}], [[12]], [[[13]]], {"e": {"f": {"g": [14, [15]]}}}, 16]}, 17]};
            expect(decodeURIComponent(util.jsonToQuery(params))).to.be("a[]=0&a[1][]=1&a[1][]=2&a[2][]=3&a[2][1][]=4&a[2][1][]=5&a[2][2][]=6&a[3][b][]=7&a[3][b][1][]=8&a[3][b][1][]=9&a[3][b][2][0][c]=10&a[3][b][2][0][d]=11&a[3][b][3][0][]=12&a[3][b][4][0][0][]=13&a[3][b][5][e][f][g][]=14&a[3][b][5][e][f][g][1][]=15&a[3][b][]=16&a[]=17")
//
            params = {"a": [1, 2, 3], "b[]": [4, 5, 6], "c[d]": [7, 8, 9], "e": {"f": [10], "g": [11, 12], "h": 13}}
            expect(decodeURIComponent(util.jsonToQuery(params))).to.be("a[]=1&a[]=2&a[]=3&b[]=4&b[]=5&b[]=6&c[d][]=7&c[d][]=8&c[d][]=9&e[f][]=10&e[g][]=11&e[g][]=12&e[h]=13")
//
//            // #7945
            expect(util.jsonToQuery({"jquery": "1.4.2"})).to.be("jquery=1.4.2")
//
            params = {"foo[]": ["baz", 42, "All your base are belong to us"]};
            expect(util.jsonToQuery(params)).to.be("foo%5B%5D=baz&foo%5B%5D=42&foo%5B%5D=All+your+base+are+belong+to+us");
//
            params = {"foo[bar]": "baz", "foo[beep]": 42, "foo[quux]": "All your base are belong to us"};
            expect(util.jsonToQuery(params)).to.be("foo%5Bbar%5D=baz&foo%5Bbeep%5D=42&foo%5Bquux%5D=All+your+base+are+belong+to+us");
        })
    })
    describe('queryToJson', function () {
        describe("querystring转对象, 相当于nodejs的querystring模块的parse方法", function () {



            var qsTestCases = [
                ['foo=918854443121279438895193',
                    {'foo': '918854443121279438895193'}],
                ['foo=bar', {'foo': 'bar'}],
                ['foo=bar&foo=quux', {'foo': ['bar', 'quux']}],
                ['foo=1&bar=2', {'foo': '1', 'bar': '2'}],
                ['my+weird+field=q1%212%22%27w%245%267%2Fz8%29%3F',
                    {'my weird field': 'q1!2"\'w$5&7/z8)?'}],
                ['foo%3Dbaz=bar', {'foo=baz': 'bar'}],
                ['foo=baz=bar', {'foo': 'baz=bar'}],
                ['str=foo&arr=1&arr=2&arr=3&somenull=&undef=',
                    {'str': 'foo',
                        'arr': ['1', '2', '3'],
                        'somenull': '',
                        'undef': ''}],
                [' foo = bar ', {' foo ': ' bar '}],
                ['foo=%zx', {'foo': '%zx'}],
                ['foo=%EF%BF%BD', {'foo': '\ufffd'}],
                // See: https://github.com/joyent/node/issues/1707
                ['hasOwnProperty=x&toString=foo&valueOf=bar&__defineGetter__=baz',
                    {hasOwnProperty: 'x',
                        toString: 'foo',
                        valueOf: 'bar',
                        __defineGetter__: 'baz'}],
                // See: https://github.com/joyent/node/issues/3058
                ['foo&bar=baz', {foo: '', bar: 'baz'}]


            ]

            util.queryToJson = function (qs, sep, eq) {
                sep = sep || '&';
                eq = eq || '=';
                var obj = {};
                if (!util.isString(qs) || qs.length === 0) {
                    return obj;
                }

                var regexp = /\+/g;
                qs = qs.split(sep);
                var len = qs.length;
                var decode = decodeURIComponent;
                for (var i = 0; i < len; ++i) {
                    var x = qs[i].replace(regexp, '%20'),
                            idx = x.indexOf(eq),
                            kstr, vstr, k, v;
                    if (idx >= 0) {
                        kstr = x.substr(0, idx);
                        vstr = x.substr(idx + 1);
                    } else {
                        kstr = x;
                        vstr = '';
                    }
                    try {
                        k = decode(kstr);
                    } catch (e) {
                        k = kstr
                    }
                    try {
                        v = decode(vstr);
                    } catch (e) {
                        v = vstr
                    }
                    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
                        obj[k] = v;
                    } else if (util.isArray(obj[k])) {
                        obj[k].push(v);
                    } else {
                        obj[k] = [obj[k], v];
                    }
                }
                return obj
            }



            for (var i = 0; i < qsTestCases.length; i++) {
                (function (arr) {
                    var str = arr[0], obj = arr[1]
                    it(str, function () {
                   //     console.log(util.queryToJson(str))
                        expect(util.queryToJson(str)).to.eql(obj);
                    })
                })(qsTestCases[i])
            }

        })
    })
    describe('parseURL', function () {
        describe("转换为一个location对象", function () {
            var href = "http://www.xiami.com/search?key=%E4%BA%A4%E5%93%8D%E8%AF%97%E7%AF%87&pos=1#a"
            var lo = util.parseURL(href, true)
            console.log(lo)
        })



    })
    describe('builder', function () {

    })
})