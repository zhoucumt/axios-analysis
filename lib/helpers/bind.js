/**
 * @file 工具方法bind
 * 
 */

'use strict';

module.exports = function bind(fn, thisArg) {
  // 返回一个新的函数wrap
  return function wrap() {
    // 其实现在apply支持arguments这样的类数组对象了，不需要手动转数组
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
