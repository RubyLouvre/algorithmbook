'use strict';

var Promise = (function () {

    if (Object.prototype.toString.call(window.Promise) === "Promise")
        return window.Promise

    var asap = (function () {
        function rawAsap(task) {
            if (!queue.length) {
                requestFlush();
                flushing = true;
            }
            // Equivalent to push, but avoids a function call.
            queue[queue.length] = task;
        }

        var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
        var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
        var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
        var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
        var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
        function flush() {
            while (index < queue.length) {
                var currentIndex = index;
                // Advance the index before calling the task. This ensures that we will
                // begin flushing on the next task the task throws an error.
                index = index + 1;
                queue[currentIndex].call();
                // Prevent leaking memory for long chains of recursive calls to `asap`.
                // If we call `asap` within tasks scheduled by `asap`, the queue will
                // grow, but to avoid an O(n) walk for every task we execute, we don't
                // shift tasks off the queue after they have been executed.
                // Instead, we periodically shift 1024 tasks off the queue.
                if (index > capacity) {
                    // Manually shift all values starting at the index back to the
                    // beginning of the queue.
                    for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                        queue[scan] = queue[scan + index];
                    }
                    queue.length -= index;
                    index = 0;
                }
            }
            queue.length = 0;
            index = 0;
            flushing = false;
        }

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
        var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
        if (typeof BrowserMutationObserver === "function") {
            requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
        } else {
            requestFlush = makeRequestCallFromTimer(flush);
        }

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
        rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
        function makeRequestCallFromMutationObserver(callback) {
            var toggle = 1;
            var observer = new BrowserMutationObserver(callback);
            var node = document.createTextNode("");
            observer.observe(node, {characterData: true});
            return function requestCall() {
                toggle = -toggle;
                node.data = toggle;
            };
        }

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

        function makeRequestCallFromTimer(callback) {
            return function requestCall() {
                // We dispatch a timeout with a specified delay of 0 for engines that
                // can reliably accommodate that request. This will usually be snapped
                // to a 4 milisecond delay, but once we're flushing, there's no delay
                // between events.
                var timeoutHandle = setTimeout(handleTimer, 0);
                // However, since this timer gets frequently dropped in Firefox
                // workers, we enlist an interval handle that will try to fire
                // an event 20 times per second until it succeeds.
                var intervalHandle = setInterval(handleTimer, 50);

                function handleTimer() {
                    // Whichever timer succeeds will cancel both timers and
                    // execute the callback.
                    clearTimeout(timeoutHandle);
                    clearInterval(intervalHandle);
                    callback();
                }
            };
        }

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
        rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

        return rawAsap
    })();

    function noop() {
    }

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
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

    module.exports = Promise;

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
    return Promise

})()



