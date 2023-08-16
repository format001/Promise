
// 异步程序同步化解决方案
class MyPromise {
    constructor (executor) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;

        this.onFulFilledCallbacks = [];
        this.onRejectedCallbacks = [];

        let resolve = (value) => {
            if (value instanceof MyPromise) {
                return value.then((value), reject)
            }
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;

                this.onFulFilledCallbacks.forEach(fn => fn());
            }
        }

        let reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;

                this.onRejectedCallbacks.forEach(fn => fn());
            }
        }

        try {
            executor(resolve, reject);
        }catch (e) {
            reject(e);
        }
    }

    then (onFulFilled, onRejected) {
        let p2 = new MyPromise((resolve, reject) => {
            let x;

            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        x = onFulFilled(this.value);
                        resolvePromise(p2, x, resolve, reject);
                    }catch (err) {
                        reject(err);
                    }
                }, 0);
            }

            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        x = onRejected(this.value);
                        resolvePromise(p2, x, resolve, reject);
                    }catch (err) {
                        reject(err);
                    }
                }, 0);
            }

            if (this.state === 'pending') {
                this.onFulFilledCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            x = onFulFilled(this.value);
                            resolvePromise(p2, x, resolve, reject);
                        }catch (err) {
                            reject(err);
                        }
                    }, 0);
                });
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            x = onRejected(this.value);
                            resolvePromise(p2, x, resolve, reject);
                        }catch (err) {
                            reject(err);
                        }
                    }, 0);
                })
            }
        });

        return p2;
    }
}

function resolvePromise (p2, x, resolve, reject) {
    if (p2 === x) {
    throw new TypeError('Chaining cycle detected for promise #<Promise>');
    }

    if ((typeof x === 'object' && typeof x !== null) || typeof x === 'function') {
        let called = false,
            then = x.then;

        if (typeof then === 'function') {
            try {
                then.call(x, (y) => {
                    if (called) return;
                    called = true;
                    resolvePromise(p2, y, resolve, reject)
                }, (r) => {
                    if (called) return;
                    called = true;
                   reject(r);
                });
            }catch (err) {
                if (called) return;
                called = true;
                reject(err)
            }
        }else {
            if (called) return;
            called = true;
            resolve(x)
        }
    }else {
        resolve(x);
    }
}


var p = new Promise((resolve, reject) => {
    resolve(1)
});
function fn () {
    return new Promise((resolve, reject) => {
        resolve(123)
    });
}
var a = (async function (){
    var data = await fn();
    console.log(data)
    return data
})();
console.log(a)
