const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor is not a function');
    }
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    this.status = PENDING;

    const resolve = res => {
      if (res instanceof OwnPromise) {
        res.then(resolve);
      }

      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = res;
        setTimeout(() => {
          this.onFulfilledCallbacks.forEach(callback => {
            callback(this.value);
          }, 0);
        });
      }
    };

    const reject = error => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.error = error;
        setTimeout(() => {
          this.onRejectedCallbacks.forEach(callback => {
            callback(this.error);
          }, 0);
        });
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  static helperFunction(resCallback, resolve, reject) {
    if (typeof resolve !== 'function' || typeof reject !== 'function') {
      throw new TypeError('Not a function');
    }

    try {
      if (resCallback instanceof OwnPromise) {
        resCallback.then(a => resolve(a));
      } else {
        resolve(resCallback);
      }
    } catch (e) {
      reject(e);
    }

    if (resCallback instanceof OwnPromise) {
      resCallback.then(a => reject(a));
    } else {
      reject(resCallback);
    }
  }

  then(onFulfilled, onRejected) {
    if (!(this instanceof OwnPromise)) {
      throw new TypeError('Not a function');
    }

    const onFulfilledF = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const onRejectedF = typeof onRejected === 'function' ? onRejected : error => {
      error;
    };

    return new this.constructor((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      if (this.status === FULFILLED) {
        setTimeout(() => {
          const resCallback = onFulfilledF(this.value);
          OwnPromise.helperFunction(resCallback, resolve, reject);
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          const resCallback = onRejectedF(this.error);
          OwnPromise.helperFunction(resCallback, resolve, reject);
        }, 0);
      } else if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(value => {
          try {
            const resCallback = onFulfilledF(value);
            OwnPromise.helperFunction(resCallback, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });

        this.onRejectedCallbacks.push(error => {
          const resCallback = onRejectedF(error);
          OwnPromise.helperFunction(resCallback, resolve, reject);
        });
      }
    });
  }

  static resolve(value) {
    if (value instanceof OwnPromise) {
      return value;
    }
    return new this(function(resolve, reject) {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      resolve(value);
    });
  }

  static reject(error) {
    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      reject(error);
    });
  }

  static all(promises) {
    if (typeof this !== 'function') {
      throw new TypeError('this !== function');
    }

    if (promises.length === undefined) {
      return new OwnPromise((resolve, reject) => {
        reject(new TypeError('Not an itterable'));
      });
    }

    if (promises.length === 0) {
      return new this((resolve, reject) => {
        resolve([]);
      });
    }

    return new this((resolve, reject) => {
      const results = [];
      let count = 0;
      promises.forEach((promise, i) => {
        promise.then(res => {
          results[i] = res;
          count += 1;

          if (count === promises.length) {
            resolve(results);
          }
        }, err => {
          reject(err);
        });
      });
    });
  }

  static race(promises) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    if (promises === []) {
      return new OwnPromise((resolve, reject) => ({}));
    }

    if (promises.length === undefined) {
      return new OwnPromise((_, reject) => {
        reject(new TypeError('Not an itterable'));
      });
    }

    return new this((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          res => {
            resolve(res);
          },
          err => {
            reject(err);
          }
        );
      }
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
  finally(fn) {
    return this.then(res => OwnPromise.resolve(fn()).then(() => res), err => OwnPromise.reject(fn()).then(() => err));
  }
}

module.exports = OwnPromise;
