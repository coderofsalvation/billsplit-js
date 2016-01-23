var adapter, assert, model, test;

require('./../node_modules/essentialjs').local()(require);

model = require('./../');

assert = require('assert').deepEqual;

test = function(name, result, expected) {
  assert(result, expected, name + ": expected " + (JSON.stringify(expected)) + " but got " + (JSON.stringify(result)));
  return console.log("OK: " + name);
};

adapter = {
  read: function(key) {
    return this.data[key] || null;
  },
  write: function(key, value) {
    return this.data[key] = value;
  },
  update: function(key, value) {
    return this.data[key] = value;
  },
  "delete": function(key) {
    if (this.data[key] != null) {
      return delete this.data[key];
    }
  },
  find: function(key, query) {
    return where(query, values(this.data[key]));
  },
  data: {}
};

bindAll(adapter);

model.init(adapter);

test('getOrCreateUser()', model.getOrCreateUser("john").name === "john", true);

test('getUser()', model.getUser("john").name === "john", true);

test('getUsers()', model.getUsers(["john"]).length === 1, true);

test('splitBill()', (function() {
  var GR, LQ, john, stats;
  stats = function() {
    var i, len, name, ref, results;
    ref = ["LQ", "GR", "john"];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      if (process.env.DEBUG != null) {
        results.push(console.log(JSON.stringify(model.getUser(name).getStats({}))));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  john = model.getUser("john");
  LQ = model.getOrCreateUser("LQ");
  GR = model.getOrCreateUser("GR");
  john.splitBill(10.0, ["GR", "LQ"], []);
  stats();
  LQ.splitBill(15.0, ["john", "GR"], []);
  stats();
  john.splitBill(10.0, ["GR", "LQ"], []);
  stats();
  return true;
})(), true);
