'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _natural = require('natural');

var _natural2 = _interopRequireDefault(_natural);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _changeCase = require('change-case');

var _changeCase2 = _interopRequireDefault(_changeCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_DATABASE_URL', 'FIREBASE_STORAGE_BUCKET'].forEach(function (key) {
  if (process.env[key] == null) {
    throw new Error('Missing env var ' + key + '.');
  }
});

_firebase2.default.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

var database = _firebase2.default.database();

var Model = function () {
  function Model() {
    var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Model);

    var model = this;
    if (model.constructor == Model) {
      throw new Error('Cannot instantiate Model');
    }
    this._attrs = attrs;
  }

  _createClass(Model, [{
    key: 'val',
    value: function val() {
      return this._attrs;
    }
  }, {
    key: 'update',
    value: function update() {
      var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var model = this.constructor;
      var self = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee() {
        var values, objectRef;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                values = _lodash2.default.omit(attrs, 'id', 'createdAt', 'updatedAt');

                _lodash2.default.assign(values, {
                  updatedAt: _firebase2.default.database.ServerValue.TIMESTAMP
                });
                objectRef = database.ref(model.namePlural() + '/' + self.id);
                _context.next = 5;
                return objectRef.transaction(function (current) {
                  return _lodash2.default.assign(current, values);
                });

              case 5:
                _context.next = 7;
                return model.find(self.id);

              case 7:
                return _context.abrupt('return', _context.sent);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
    }
  }, {
    key: 'set',
    value: function set() {
      var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var model = this.constructor;
      var self = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee2() {
        var keys, objectRef;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                keys = Object.keys(attrs);

                keys.push('id', 'createdAt', 'updatedAt');
                objectRef = database.ref(model.namePlural() + '/' + self.id);
                _context2.next = 5;
                return objectRef.transaction(function (current) {
                  return _lodash2.default.assign({}, _lodash2.default.pick(current, keys), _lodash2.default.omit(attrs, 'id', 'createdAt', 'updatedAt'), { updatedAt: _firebase2.default.database.ServerValue.TIMESTAMP });
                });

              case 5:
                _context2.next = 7;
                return model.find(self.id);

              case 7:
                return _context2.abrupt('return', _context2.sent);

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var model = this.constructor;
      var self = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee3() {
        var objectsRef;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                objectsRef = database.ref('' + model.namePlural());
                _context3.t0 = console;
                _context3.next = 4;
                return objectsRef.once('value');

              case 4:
                _context3.t1 = _context3.sent;

                _context3.t0.log.call(_context3.t0, _context3.t1);

                _context3.next = 8;
                return objectsRef.transaction(function (current) {
                  if (current[self.id]) {
                    current._count -= 1;
                    current[self.id] = null;
                  }
                  return current;
                });

              case 8:
                return _context3.abrupt('return');

              case 9:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
    }
  }, {
    key: 'id',
    get: function get() {
      return this._attrs.id;
    }
  }], [{
    key: 'nameSingular',
    value: function nameSingular() {
      var model = this;
      return _changeCase2.default.snakeCase(model.name.toLowerCase());
    }
  }, {
    key: 'namePlural',
    value: function namePlural() {
      var model = this;
      if (model._namePlural != null) return model._namePlural;
      return model._namePlural = new _natural2.default.NounInflector().pluralize(model.nameSingular());
    }
  }, {
    key: 'count',
    value: function count() {
      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee4() {
        var countRef, countSnapshot, count, objectsRef, objectsSnapshot, updatedCount;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                countRef = database.ref(model.namePlural() + '/_count');
                _context4.next = 3;
                return countRef.once('value');

              case 3:
                countSnapshot = _context4.sent;
                count = countSnapshot.val();

                if (!(count == null)) {
                  _context4.next = 13;
                  break;
                }

                objectsRef = database.ref('' + model.namePlural());
                _context4.next = 9;
                return objectsRef.once('value');

              case 9:
                objectsSnapshot = _context4.sent;
                updatedCount = objectsSnapshot.numChildren();

                countRef.set(updatedCount); // optimistic
                return _context4.abrupt('return', updatedCount);

              case 13:
                return _context4.abrupt('return', count);

              case 14:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
    }
  }, {
    key: 'create',
    value: function create() {
      var attrs = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee5() {
        var objectId, objectsRef, objectValues;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                objectId = attrs.id || _nodeUuid2.default.v4();
                objectsRef = database.ref('' + model.namePlural());
                objectValues = _lodash2.default.assign(attrs, {
                  id: objectId,
                  createdAt: _firebase2.default.database.ServerValue.TIMESTAMP,
                  updatedAt: _firebase2.default.database.ServerValue.TIMESTAMP
                });
                _context5.next = 5;
                return objectsRef.transaction(function (current) {
                  if (current == null) current = {};
                  if (current._count == null) {
                    current._count = 1;
                  } else {
                    current._count += 1;
                  }
                  current[objectId] = objectValues;
                  return current;
                });

              case 5:
                _context5.next = 7;
                return model.find(objectId);

              case 7:
                return _context5.abrupt('return', _context5.sent);

              case 8:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
    }
  }, {
    key: 'find',
    value: function find(id) {
      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee6() {
        var attrsSnapshot, attrs;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return database.ref(model.namePlural() + '/' + id).once('value');

              case 2:
                attrsSnapshot = _context6.sent;
                attrs = attrsSnapshot.val();

                if (!(attrs == null)) {
                  _context6.next = 6;
                  break;
                }

                return _context6.abrupt('return', null);

              case 6:
                return _context6.abrupt('return', new model(attrs));

              case 7:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));
    }
  }]);

  return Model;
}();

exports.default = Model;