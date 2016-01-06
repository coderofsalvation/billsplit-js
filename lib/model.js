
/**
 * The model manages (user) logic & data, which 
 * eventually gets written/read from a store.
 * It uses an adapter instead writing directly to the store.
 */
var clone, defaults, typesafe, typeshave, uuid;

typeshave = require('typeshave');

typesafe = typeshave.typesafe;

defaults = require('json-schema-defaults');

clone = function(o) {
  return JSON.parse(JSON.stringify(o));
};

uuid = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = (function() {
  var model;
  require('essentialjs').local()(require);
  model = this;

  /**
   * `.schema`  contains validation/typeschema of the store 
   * `.data`    contains the consolidated data of the store 
   * `.adapter` contains the currently used adapter
   */
  this.schema = require('./schema');
  this.data = false;
  this.adapter = false;

  /**
    * `factory` is a micro-factory: slap a module on top of given data 
   * `factory.create` returns an object after requiring `./type`-module and 
   * extends the module with the passed data 
   *
   * @method factory.create
   * @param {String} type (pass 'user' to resolve './user.js' e.g.)
   * @param {String} data (userdata described from getUserData())
   */
  this.factory = {
    create: function(type, data) {
      var functions, k, obj, v;
      functions = require('./' + type);
      obj = clone(data);
      for (k in functions) {
        v = functions[k];
        obj[k] = curry(v.bind(obj))(model);
      }
      console.log("init todo");
      return obj;
    }
  };

  /*
   * initialize model with store adapter (like `adapters.Ambrogio` )
   *     { read: function(key)
   *       write: function(key,value)
   *       update: function(key,value)
   *       delete: function(key) }
   * @param {Adapter} adapter
   */
  this.init = function(adapter) {
    this.adapter = adapter;
    this.data = adapter.read('balance');
    if (!this.data) {
      return this._initStore();
    }
  };
  this._initStore = function() {
    var k, ref, results, v;
    this.data = {};
    ref = this.schema.properties;
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(this.data[k] = {});
    }
    return results;
  };

  /*
   * Updates/Writes model `data` to adapter
   */
  this.save = function() {
    return this.adapter.write('treasure', this.data);
  };

  /**
   * @return user object (-functions)
   * @param {String} name of user
   */
  this.getUserData = function(name) {
    var result;
    result = filter(eq({
      name: name
    }, this.getDataFlat(this.data)));
    return result[0] || false;
  };
  this.createUserByName = function(name) {
    return this.createUser(extend(defaults(this.schema.properties.user), {
      name: name
    }));
  };

  /**
   * create a user
   *
   * $(.hooks/printjson lib/schema.js properties.user)
   *
   * @param {Object} minimum userdata (See above)
   * @return user object (+functions) or null (see schema)
   */
  this.createUser = typesafe(this.schema.properties.user, function(user) {
    if (this.data.user[user.name] != null) {
      throw "USER_ALREADY_EXIST";
    }
    user.id = uuid();
    this.data.user[user.name] = user;
    return this.factory.createUser(user);
  });

  /**
   * @return user object (+functions) or null
   */
  this.getUserById = function(id) {
    return this.getDataFlat(this.data).filter(eq({
      id: id
    }));
  };

  /**
   * @param {Object} username
   * @return user object (+functions)
   */
  this.factory.createUser = curry(this.factory.create)('user');

  /**
   * @param {String} username
   * @return user object (+functions)
   */
  this.getUser = pipe(this.getUserData.bind(this), this.factory.createUser);

  /**
   * @param {String} username
   * @return user object (+functions)
   */
  this.getOrCreateUser = either(this.getUser.bind(this), this.createUserByName.bind(this));

  /**
   * @param {Array} usernames
   * @return Array with user objects (+functions)
   */
  this.getUsers = map(pipe(this.getOrCreateUser));

  /**
   * returns `data` store with expanded aliases of names
   */
  this.getDataFlat = function() {
    var alias, data, i, k, len, ref, ref1, user;
    data = clone(this.data);
    ref = data.user;
    for (k in ref) {
      user = ref[k];
      ref1 = user.aliases;
      for (i = 0, len = ref1.length; i < len; i++) {
        alias = ref1[i];
        data.user[alias] = user;
      }
    }
    return data;
  };

  /*
   * this bind functions to itself to preserve `this` ref
   */
  bindAll(model);
  return this;
}).apply({});
