/*global Promise, require, setImmediate, setTimeout, describe, it */
"use strict";


describe("25.4.4.2 Promise.prototype", function () {
    it("is the Promise prototype object", function () {
        var p = new Promise(function () {});

        assert.ok(p instanceof Promise);
        // TODO(Sam): is there any way to ensure that there are no
        // other objects in the prototype chain?
        assert.ok(Promise.prototype instanceof Object);
    });
    it("has attribute [[Writable]]: false");
    it("has attribute [[Enumerable]]: false");
    it("has attribute [[Configurable]]: false");
});

describe("25.4.5 Properties of the Promise Prototype Object", function () {
    it("is an ordinary object");
    it("is not a Promise"); // implied
});

describe("25.4.5.1 Promise.prototype.catch( onRejected )", function () {
    it("is a function+++", function () {
        assert.equal("function", typeof Promise.prototype.catch);
    });
    it("expects 'this' to be a Promise+++", function () {
        const prom = new Promise(function () {});
        prom.catch(()=>{});
        assert.ok(prom instanceof Promise);
    });
    it("takes one argument, a function", function(){
        const errorValue = 4;
        assert.throws(function () {
            Promise.catch(errorValue);
        }, TypeError);
    });
    it("is equivalent to 'promise.then(undefined, fn)'");
});

describe("25.4.5.2 Promise.prototype.constructor", function () {
    it("is an object++", function () {
        assert.ok(Promise.prototype.constructor instanceof Object);
    });
    it("is a function++", function () {
        assert.equal("function", typeof Promise.prototype.constructor);
    });
    it("is the Promise constructor");
});

describe("25.4.5.3 Promise.prototype.then", function () {
    it("Promise.prototype.then is a function++++", function () {
        assert.equal("function", typeof Promise.prototype.then);
    });
    it("expects 'this' to be a Promise+++", function(){
        const a = new Promise(()=>{});
        const b = a.then(()=>{});
        assert.ok((b instanceof Promise));
    });

    it("throws TypeError if 'this' is not a Promise++", function () {
        const errorValue = 4;
        assert.throws(function () {
            errorValue.then(function () {});
        }, TypeError);
    });

    it("takes two arguments, both optional, both functions++", function () {
        const funcProm = Promise.prototype.then.length;
        assert.equal(funcProm, 2);
    });
    it("has default on resolve: identity");
    it("has default on reject: thrower", function (done) {
        var errorObject = {};
        var p = new Promise(function (resolve, reject) {
            reject(errorObject);
        });

        p.then().catch(function (rejected) {
            assert.equal(errorObject, rejected);
        }).then(done).catch(done);
    });

    it("does not call either function immediately if promise status is 'pending'");

    it("does call onFulfilled immediately if promise status is 'fulfilled'");
    it("never calls onRejected if promise status is 'fulfilled+++'", function(){
            const resolvedValue = Promise.resolve(()=>{});
            assert.throws(function () {
                resolvedValue.reject(function () {});
            }, TypeError);
        });

    it("never calls onFullfilled if promise status is 'rejected++'", function(){
        const rejectedValue = Promise.reject(()=>{});
        assert.throws(function () {
            rejectedValue.resolve(function () {});
        }, TypeError);
    });
    it("does call onRejected immediately if promise status is 'rejected'");

    it("returns its 'this' argument if it is of type 'Promise'");
    it("returns a Promise-wrapped version of 'this' if 'this' is not of type 'Promise'");
});
