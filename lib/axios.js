'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 * 创建axios实例
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  // new 一个 Axios 生成实例对象
  var context = new Axios(defaultConfig);

  // bind 返回一个新的包装函数
  // 调用axios 是调用 Axios.prototype.request 函数的原因
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // 复制Axios.prototype到实例上
  // 也就是为什么 有 axios.get 等别名方法，
  // 且调用的是 Axios.prototype.get 等别名方法
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  // 复制context到intance 实例
  // 也就是为什么默认配置 axios.defaults 和拦截器  axios.interceptors 可以使用的原因
  // 其实是new Axios().defaults 和 new Axios().interceptors
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
// 允许 class 继承 也就是可以 new axios.Axios()
axios.Axios = Axios;

// Factory for creating new instances
// 工厂模式 创建新的实例 用户可以自定义一些参数
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
