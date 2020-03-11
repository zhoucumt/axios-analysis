/**
 * @file Axios核心方法
 * 
 */

'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');

/**
 * Create a new instance of Axios
 * Axios构造函数
 * 
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  // 请求和响应的拦截器对象
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 * 请求方法：实质上最后返回的是一个promise对象
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  // 适用于这种情况：axios('/api/list', {name: ''})
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  // 合并到默认配置里
  // 像data这种属性会直接覆盖默认值，因为每个请求的发送的
  // 请求数据都可能不一样
  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  // 这里并不是直接去发请求，而是通过dispatchRequest去发的
  // 但是dispatchRequest又不是直接调用的，因为
  // 可能在调用之前执行请求拦截器
  // 在请求之后执行响应拦截器，所以这里存储在调用链里通过promise来保证执行顺序
  var chain = [dispatchRequest, undefined];
  // promise除了保证执行顺序，还可以把config传进去
  var promise = Promise.resolve(config);

  // 注意 这里的 forEach 不是 Array.forEach， 也不是上面讲到的 util.forEach.
  // 具体 拦截器源码 会讲到
  // unshift方法把请求拦截器放在最前面执行，
  // 所以，请求拦截器是后使用，先执行
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  // 响应拦截器的push方法加入到调用链的末端
  // 所以，响应拦截器的执行顺序是先使用先执行
  // 但是顺序还是在.then的res之前执行
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

// post,put,patch方法的请求方式多了data: data
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;
