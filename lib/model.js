
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
   * > `.schema`  contains validation/typeschema of the store 
   * > `.data`    contains the consolidated data of the store 
   * > `.adapter` contains the currently used adapter
   */
  this.schema = require('./schema');
  this.data = false;
  this.adapter = false;

  /*
   * > `factory` is a micro-factory: slap a module on top of given data
   */
  this.factory = {

    /*
     * `factory.create` returns an object after requiring `./type`-module and 
     * extends the module with the passed data
     */
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
   * initialize model with adapter (like `adapters.Ambrogio` )
   */
  this.init = function(adapter) {
    this.adapter = adapter;
    this.data = adapter.read('balance');
    if (!this.data) {
      return this.initStore();
    }
  };
  this.initStore = function() {
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
   * User functions :
   * > `getUserData(name)` returns user object (-functions)
   * > `createUserByName(name)` returns user object (+functions)
   * > `createUser(user)` returns user object (+functions) after passing userdata [see schema](schema.js.md)
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
  this.createUser = typesafe(this.schema.properties.user, function(user) {
    if (this.data.user[user.name] != null) {
      throw "USER_ALREADY_EXIST";
    }
    user.id = uuid();
    this.data.user[user.name] = user;
    return this.factory.createUser(user);
  });

  /**
   * User FP functions :
   * > `getUserById(id)` returns user object (+functions) or null
   * > `factory.createUser(userdata)` returns user object (+functions)
   * > `getOrCreateUser(name)` returns user object 
   * > `getUsers(arr) returns user objects based on array with name-strings
   * > `getDataFlat()` returns store with expanded aliases of names
   */
  this.getUserById = function(id) {
    return this.getDataFlat(this.data).filter(eq({
      id: id
    }));
  };
  this.factory.createUser = curry(this.factory.create)('user');
  this.getUser = pipe(this.getUserData.bind(this), this.factory.createUser);
  this.getOrCreateUser = either(this.getUser.bind(this), this.createUserByName.bind(this));
  this.getUsers = map(pipe(this.getOrCreateUser));
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
   * lets bind functions to itself to preserve `this` ref
   */
  bindAll(model);
  return this;
}).apply({});
