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

var _nodeUuid = require('uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _changeCase = require('change-case');

var _changeCase2 = _interopRequireDefault(_changeCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
                objectsRef = database.ref(model.namePlural());
                _context3.next = 3;
                return objectsRef.transaction(function (current) {
                  if (current == null) current = {};
                  if (current[self.id]) {
                    current._count -= 1;
                    current._ids[self.id] = null;
                    current[self.id] = null;
                  }
                  return current;
                });

              case 3:
                return _context3.abrupt('return');

              case 4:
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
      return _changeCase2.default.snakeCase(_changeCase2.default.noCase(model.name.toLowerCase()));
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
                  if (current._ids == null) {
                    current._ids = {};
                  }
                  current._ids[objectId] = true;
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
  }, {
    key: 'allIds',
    value: function allIds() {
      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee7() {
        var keysRef, keysSnapshot, keysRoot;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                keysRef = database.ref(model.namePlural() + '/_ids');
                _context7.next = 3;
                return keysRef.once('value');

              case 3:
                keysSnapshot = _context7.sent;
                keysRoot = keysSnapshot.val() || {};
                return _context7.abrupt('return', Object.keys(keysRoot));

              case 6:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));
    }
  }, {
    key: 'select',
    value: function select() {
      var filter = arguments.length <= 0 || arguments[0] === undefined ? _lodash2.default.stubTrue : arguments[0];

      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee8() {
        var keys, objects;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return model.allIds();

              case 2:
                keys = _context8.sent;
                objects = keys.map(function (key) {
                  return model.find(key);
                });
                _context8.t0 = _lodash2.default;
                _context8.next = 7;
                return objects;

              case 7:
                _context8.t1 = _context8.sent;

                _context8.t2 = function (object) {
                  return filter(object.val());
                };

                return _context8.abrupt('return', _context8.t0.filter.call(_context8.t0, _context8.t1, _context8.t2));

              case 10:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));
    }
  }, {
    key: 'all',
    value: function all() {
      var model = this;
      return model.select();
    }
  }, {
    key: 'sample',
    value: function sample(num) {
      var filter = arguments.length <= 1 || arguments[1] === undefined ? _lodash2.default.stubTrue : arguments[1];

      var model = this;
      return (0, _co2.default)(regeneratorRuntime.mark(function _callee9() {
        var objects, result;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return model.select(filter);

              case 2:
                objects = _context9.sent;
                result = _lodash2.default.sampleSize(objects, num || 1);

                if (num) {
                  _context9.next = 6;
                  break;
                }

                return _context9.abrupt('return', _lodash2.default.first(result));

              case 6:
                return _context9.abrupt('return', result);

              case 7:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));
    }
  }]);

  return Model;
}();

exports.default = Model;