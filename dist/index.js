'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TransientLabel = exports.ClassProviderLabel = exports.FactoryProviderLabel = exports.Definition = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

exports.createContainer = createContainer;

var _utils = require('./utils');

var _providers = require('./providers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// todo should we call updateDependencies for the first time?

var Definition = exports.Definition = function Definition(providerOrDescriptor, updateMethod) {
    var dependenciesOrAnnotations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var annotations = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    (0, _classCallCheck3.default)(this, Definition);

    var provider = providerOrDescriptor;
    var dependencies = void 0;

    // todo up updateMethod from provider chain
    // todo collect dependencies, annotations from provider chain

    if (!(0, _utils.isFunction)(providerOrDescriptor)) {
        var descriptor = providerOrDescriptor;
        provider = descriptor.provider;
        updateMethod = descriptor.updateMethod;
        dependencies = descriptor.dependencies || {};
        annotations = descriptor.annotations || [];
    } else if (Array.isArray(dependenciesOrAnnotations)) {
        dependencies = {};
        annotations = dependenciesOrAnnotations;
    } else {
        dependencies = dependenciesOrAnnotations;
    }

    (0, _assign2.default)(this, { provider: provider, updateMethod: updateMethod, dependencies: dependencies, annotations: annotations });
};

var FactoryProviderLabel = exports.FactoryProviderLabel = function FactoryProviderLabel() {
    (0, _classCallCheck3.default)(this, FactoryProviderLabel);
};

var ClassProviderLabel = exports.ClassProviderLabel = function ClassProviderLabel() {
    (0, _classCallCheck3.default)(this, ClassProviderLabel);
};

var TransientLabel = exports.TransientLabel = function TransientLabel() {
    (0, _classCallCheck3.default)(this, TransientLabel);
};

var Container = function () {
    function Container() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            parent = _ref.parent;

        (0, _classCallCheck3.default)(this, Container);

        this.parent = parent;
        this.instances = new _map2.default();
        this.providers = new _map2.default();
        this.definitions = new _map2.default();
    }

    (0, _createClass3.default)(Container, [{
        key: 'normalizeToken',
        value: function normalizeToken(token) {
            // todo parent definitions
            if (this.definitions.has(token)) {
                return this.definitions.get(token);
            } else if (token instanceof Definition) {
                return token;
            } else {
                var _provider = (0, _utils.isFunction)(token.factory) ? token.factory : token; // todo why should we do this?
                var definition = new Definition(_provider, undefined, token.dependencies, token.annotations);
                this.definitions.set(token, definition);
                return definition;
            }
        }
    }, {
        key: 'loadDependencies',
        value: function loadDependencies(dependencies) {
            var names = [],
                instances = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)((0, _entries2.default)(dependencies)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
                        _name = _step$value[0],
                        token = _step$value[1];

                    names.push(_name);
                    instances.push(this.get(token));
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return (0, _utils.all)(instances, function (instances) {
                return (0, _utils.zipObject)(names, instances);
            });
        }
    }, {
        key: 'getProvider',
        value: function getProvider(definition) {
            if (this.providers.has(definition)) {
                return this.providers.get(definition);
            } else {
                var primaryDefinition = definition;
                while (primaryDefinition.provider instanceof Definition) {
                    primaryDefinition = primaryDefinition.provider;
                }
                if (typeof primaryDefinition.provider !== 'function') {
                    throw new Error('Expected provider to be a class or a function');
                }
                var _provider2 = (0, _providers.createProvider)(primaryDefinition);
                this.providers.set(definition, _provider2);
                return _provider2;
            }
        }
    }, {
        key: 'getFromCache',
        value: function getFromCache(definition) {
            if (this.instances.has(definition)) {
                return this.instances.get(definition);
            } else if (this.parent) {
                return this.parent.getFromCache(definition);
            }
        }
    }, {
        key: 'get',
        value: function get(token, options) {
            var instance = void 0,
                definition = this.normalizeToken(token);

            if (this.instances.has(definition)) {
                return this.instances.get(definition);
            } else if (instance = this.getFromCache(definition)) {
                var promiseOrInstance = this.updateInstance(instance, definition);
                this.maybeCacheInstance(promiseOrInstance, definition);
                return promiseOrInstance;
            } else {
                var _promiseOrInstance = this.createInstance(definition, options);
                this.maybeCacheInstance(_promiseOrInstance, definition);
                return _promiseOrInstance;
            }
        }
    }, {
        key: 'maybeCacheInstance',
        value: function maybeCacheInstance(instance, definition) {
            if (!(0, _utils.hasAnnotation)(definition, TransientLabel)) {
                this.instances.set(definition, instance);
            }
        }
    }, {
        key: 'createInstance',
        value: function createInstance(definition) {
            var _this = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return (0, _utils.then)(this.loadDependencies(definition.dependencies), function (dependencies) {
                var provider = _this.getProvider(definition);
                var instance = provider((0, _assign2.default)({}, dependencies, options));
                _this.maybeCacheInstance(instance, definition);
                return _this.updateInstanceDependencies(instance, definition, dependencies);
            });
        }
    }, {
        key: 'updateInstance',
        value: function updateInstance(instance, definition) {
            var _this2 = this;

            return (0, _utils.then)(this.loadDependencies(definition.dependencies), function (dependencies) {
                return _this2.updateInstanceDependencies(instance, definition, dependencies);
            });
        }
    }, {
        key: 'updateInstanceDependencies',
        value: function updateInstanceDependencies(instance, definition, dependencies) {
            var updateMethod = definition.updateMethod || 'updateDependencies';
            if ((0, _utils.isString)(updateMethod) && (0, _utils.isObject)(instance)) {
                updateMethod = instance[updateMethod];
            }
            if ((0, _utils.isFunction)(updateMethod)) {
                updateMethod.call(instance, dependencies);
            }
            return instance;
        }

        // todo should we pass definitions / providers?

    }, {
        key: 'createSession',
        value: function createSession() {
            return new Container({
                parent: this
            });
        }
    }, {
        key: 'closeSession',
        value: function closeSession() {
            this.parent = undefined;
        }
    }]);
    return Container;
}();

function createContainer() {
    return new Container();
}
//# sourceMappingURL=index.js.map