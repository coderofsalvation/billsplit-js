require('./../node_modules/essentialjs').local()(require)
model  = require './../'
assert = require('assert').deepEqual

test = (name, result, expected) ->
  assert result, expected, "#{name}: expected #{JSON.stringify expected} but got #{JSON.stringify result}"
  console.log "OK: #{name}"

# simple memory adapter
adapter =
  read  : (key)       -> @data[key] || null
  write : (key,value) -> @data[key] = value
  update: (key,value) -> @data[key] = value
  delete: (key)       -> delete @data[key] if @data[key]?
  find  : (key,query) -> where query, values(@data[key])
  data  : {}

bindAll adapter

model.init adapter

test 'getOrCreateUser()', model.getOrCreateUser("john").name == "john", true
test 'getUser()'        , model.getUser("john").name == "john", true
test 'getUsers()'       , model.getUsers( ["john"] ).length == 1, true

test 'splitBill()'      , ( () ->
  stats = () ->
    for name in ["LQ","GR","john"]
      console.log JSON.stringify model.getUser(name).getStats({}) if process.env.DEBUG?

  john = model.getUser("john")
  LQ = model.getOrCreateUser("LQ")
  GR = model.getOrCreateUser("GR")
  john.splitBill 10.0, ["GR","LQ"], []
  stats()
  LQ.splitBill 15.0, ["john","GR"], []
  stats()
  john.splitBill 10.0, ["GR","LQ"], []
  stats()
  return true
)(), true
