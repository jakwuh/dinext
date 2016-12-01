'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.isString = isString;
exports.isObject = isObject;
exports.isPromise = isPromise;
exports.isFunction = isFunction;
exports.isUpperCase = isUpperCase;
exports.hasAnnotation = hasAnnotation;
exports.all = all;
exports.then = then;
exports.zipObject = zipObject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isString(O) {
    return typeof O === 'string';
}

function isObject(O) {
    return (typeof O === 'undefined' ? 'undefined' : (0, _typeof3.default)(O)) === 'object';
}

function isPromise(O) {
    return isObject(O) && isFunction(O.then);
}

function isFunction(O) {
    return typeof O === 'function';
}

function isUpperCase(string) {
    return string === string.toUpperCase();
}

function hasAnnotation(object, annotation) {
    if (!Array.isArray(object.annotations)) {
        return false;
    }
    return object.annotations.some(function (current) {
        return current instanceof annotation;
    });
}

function all(values, resolve, reject) {
    if (values.some(isPromise)) {
        return _promise2.default.all(values).then(resolve, reject);
    } else {
        try {
            return resolve ? resolve(values) : _promise2.default.resolve(values);
        } catch (error) {
            return reject ? reject(error) : _promise2.default.reject(error);
        }
    }
}

function then(value, resolve, reject) {
    if (isPromise(value)) {
        return value.then(resolve, reject);
    } else {
        try {
            return resolve ? resolve(value) : _promise2.default.resolve(value);
        } catch (error) {
            return reject ? reject(error) : _promise2.default.reject(error);
        }
    }
}

function zipObject(keys, values) {
    return keys.reduce(function (memo, current, index) {
        memo[current] = values[index];
        return memo;
    }, {});
}
//# sourceMappingURL=utils.js.map