
/**
 * The model manages (user) logic & data, which 
 * eventually gets written/read from a store.
 * It uses an adapter instead writing directly to the store.
 */
var clone, defaults, typesafe, typeshave, uuid;

typeshave = require('typeshave');

typeshave.onError = function(err) {
  return console.log(JSON.stringify(err, null, 2));
};

typesafe = typeshave.typesafe;

if (process.env.DEBUG) {
  typeshave.verbose = 2;
}

defaults = require('json-schema-defaults');

clone = function(o) {
  return JSON.parse(JSON.stringify(o));
};

uuid = function() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = (function() {
  var dump, model, nonempty, validate, whenvalid;
  require('essentialjs').local()(require);
  dump = (function(data) {
    console.log("DUMP:");
    console.dir(data);
    return data;
  });
  nonempty = function(x) {
    console.log(x.length);
    return x.length > 0;
  };

  /**
   * validate data against jsonschema and (nested)data 
   * @return {Object|false}
   */
  validate = curry(function(schema, data) {
    if (typeshave.validate(data, schema)) {
      return data;
    } else {
      return false;
    }
  });

  /**
  * call callback when data is not false/undefined
   * @return {Object|false}
   */
  whenvalid = curry(function(cb, data) {
    if (data) {
      return cb(data);
    } else {
      return false;
    }
  });
  model = this;

  /**
   * `.schema`  contains validation/typeschema of the store 
   * `.data`    contains the consolidated data of the store 
   * `.adapter` contains the currently used adapter
   */
  this.schema = require('./schema');
  this.data = {};
  this.adapter = false;

  /**
    * micro-factory: slap a module on top of given data 
   * `factory.create` returns an object after requiring `./type`-module and 
   * extends the module with the passed data 
   *
   * @method factory.create
   * @param {String} type (pass 'user' to resolve './user.js' e.g.)
   * @param {String} data (userdata described from getUserData())
   */
  this.factory = {
    create: function(type, obj) {
      var functions, k, v;
      functions = require('./' + type);
      for (k in functions) {
        v = functions[k];
        obj[k] = curry(v.bind(obj))(model);
      }
      if (functions.init != null) {
        obj.init = functions.init;
        obj.init(model);
      }
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
  this.init = typesafe({
    type: "object",
    properties: {
      read: {
        type: "function"
      },
      write: {
        type: "function"
      },
      update: {
        type: "function"
      },
      "delete": {
        type: "function"
      },
      find: {
        type: "function"
      }
    }
  }, function(adapter) {
    this.adapter = adapter;
    this.data = adapter.read('user');
    if (!this.data) {
      return this._initStore();
    }
  });
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
    var k, ref, results, v;
    ref = this.data;
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(this.adapter.write(k, v));
    }
    return results;
  };

  /**
   * @return user object (-functions)
   * @param {String} name of user
   */
  this.getUserData = function(name) {
    return this.getDataFlat(this.data).user[name] || false;
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
   * > NOTE: you need to call model.save() in order to persist data 
   *
   * @method createUser(userdata)
   * @param {Object} userdata (see json above)
   * @return user object (+functions) or null (see schema)
   */
  this.createUser = typesafe(this.schema.properties.user, function(userdata) {
    var user;
    if (this.data.user[userdata.name] != null) {
      throw new Error("USER_ALREADY_EXIST");
    }
    user = this.factory.createUser(userdata);
    if (user.id == null) {
      user.id = uuid();
    }
    this.data.user[userdata.name] = user;
    this.save();
    return user;
  });

  /**
   * @return user object (+functions) or null
   */
  this.getUserById = function(id) {
    var userdata;
    userdata = this.adapter.find('user', {
      id: id
    });
    return (userdata != null ? this.factory.createUser(userdata) : null);
  };

  /**
   * returns `data` store with expanded aliases of names
   */
  this.getDataFlat = function() {
    var alias, data, i, k, len, ref, ref1, user;
    data = this.data;
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
   * bind all functions to preserve `this` ref in FP functions below
   */
  bindAll(this);

  /**
   * FP shortcut to decorate raw userdata with functions 
   * @param {Object} userdata (see createUser)
   * @return user object (+functions)
   */
  this.factory.createUser = curry(this.factory.create)('user');

  /**
   * @param {String} username
   * @return user object (+functions)
   */
  this.getUser = pipe(validate({
    type: "string",
    required: true
  }), this.getUserData.bind(this), validate(this.schema.properties.user), whenvalid(this.factory.createUser));

  /**
   * @param {String} username
   * @return user object (+functions)
   */
  this.getOrCreateUser = either(this.getUser, this.createUserByName.bind(this));

  /**
   * @param {Array} usernames
   * @return Array with user objects (+functions)
   */
  this.getUsers = map(this.getOrCreateUser);
  return this;
}).apply({});
