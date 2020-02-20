/**
 * @file 拼接URL
 * 
 */

'use strict';

/**
 * Creates a new URL by combining the specified URLs
 * 拼接URL： base URL + relative URL
 * 利用正则匹配把baseURL最后面的一个或多个斜杠转为空，
 * 同理利用正则表达式作用于relativeURL的最前面的一个或多个
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};
