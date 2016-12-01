'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ownKeys = require('babel-runtime/core-js/reflect/own-keys');

var _ownKeys2 = _interopRequireDefault(_ownKeys);

exports.isClassProvider = isClassProvider;
exports.createClassProvider = createClassProvider;
exports.createFactoryProvider = createFactoryProvider;
exports.createProvider = createProvider;

var _index = require('./index');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isClassProvider(definition) {
    if ((0, _utils.hasAnnotation)(definition, _index.ClassProviderLabel)) {
        return true;
    } else if ((0, _utils.hasAnnotation)(definition, _index.FactoryProviderLabel)) {
        return false;
    } else if (definition.provider.name) {
        return (0, _utils.isUpperCase)(definition.provider.name.charAt(0));
    } else {
        return (0, _ownKeys2.default)(definition.provider.prototype).length > 0;
    }
}

function createClassProvider(Class) {
    return function (dependencies) {
        return new Class(dependencies);
    };
}

function createFactoryProvider(Factory) {
    return function (dependencies) {
        return Factory(dependencies);
    };
}

function createProvider(definition) {
    if (isClassProvider(definition)) {
        return createClassProvider(definition.provider);
    } else {
        return createFactoryProvider(definition.provider);
    }
}
//# sourceMappingURL=providers.js.map