'use strict';

var cache = {};
var rules = [];
var insert = function insert(rule) {
  return rules.push(rule);
};
var hyph = function hyph(s) {
  return s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase();
};
var mx = function mx(rule, media) {
  return media ? media + '{' + rule + '}' : rule;
};
var rx = function rx(cn, prop, val) {
  return '.' + cn + '{' + hyph(prop) + ':' + val + '}';
};
var noAnd = function noAnd(s) {
  return s.replace(/&/g, '');
};

var parse = function parse(obj) {
  var child = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var media = arguments[2];
  return Object.keys(obj).map(function (key) {
    var val = obj[key];
    if (val === null) return '';
    if (typeof val === 'object') {
      var m2 = /^@/.test(key) ? key : null;
      var c2 = m2 ? child : child + key;
      return parse(val, c2, m2 || media);
    }
    var _key = key + val + child + media;
    if (cache[_key]) return cache[_key];
    var className = 'x' + rules.length.toString(36);
    insert(mx(rx(className + noAnd(child), key, val), media));
    cache[_key] = className;
    return className;
  }).join(' ');
};

module.exports = function () {
  for (var _len = arguments.length, styles = Array(_len), _key2 = 0; _key2 < _len; _key2++) {
    styles[_key2] = arguments[_key2];
  }

  return styles.map(function (style) {
    return parse(style);
  }).join(' ').trim();
};

module.exports.css = function () {
  return rules.sort().join('');
};

module.exports.reset = function () {
  cache = {};
  while (rules.length) {
    rules.pop();
  }
};

if (typeof document !== 'undefined') {
  var sheet = document.head.appendChild(document.createElement('style')).sheet;
  insert = function insert(rule) {
    rules.push(rule);
    sheet.insertRule(rule, sheet.cssRules.length);
  };
}