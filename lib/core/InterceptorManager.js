/**
 * @file 拦截器对象
 * 
 */

'use strict';

var utils = require('./../utils');

// 拦截器构造函数，里面有个函数处理的数组
function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 * 向handlers中增加一个拦截器对象，最终返回handlers数组的长度减1
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  // 返回长度减去1的原因，猜测是因为注册一个就会进行执行，然后剩余的肯定要减去当前注册的
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 * 根据id来移除拦截器对象实例
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 * 遍历拦截器对象实例，并对于不为空对象的执行函数fn
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;
