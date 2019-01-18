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

  then(onFulfilled, onRejected) {
    const onResolved = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const onReject = typeof onRejected === 'function' ? onRejected : error => {
      error;
    };

    return new this.constructor((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }

      switch (this.status) {
      case FULFILLED:
        setTimeout(() => {
          try {
            const resCallback = onResolved(this.value);
            resolve(resCallback);
          } catch (error) {
            reject(error);
          }
        }, 0);
        break;
      case REJECTED:
        setTimeout(() => {
          try {
            const resCallback = onReject(this.error);
            resolve(resCallback);
          } catch (error) {
            reject(error);
          }
        }, 0);
        break;
      default:
        this.onFulfilledCallbacks.push(value => {
          try {
            const resCallback = onResolved(value);
            resolve(resCallback);
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedCallbacks.push(error => {
          try {
            const resCallback = onReject(error);
            resolve(resCallback);
          } catch (error) {
            reject(error);
          }
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
    if (promises.length === undefined) {
      return new OwnPromise((resolve, reject) => {
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
