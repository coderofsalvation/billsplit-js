###*
 * The model manages (user) logic & data, which 
 * eventually gets written/read from a store.
 * It uses an adapter instead writing directly to the store.
###

typeshave = require 'typeshave'
typesafe  = typeshave.typesafe
defaults  = require 'json-schema-defaults'
clone     = (o) -> JSON.parse JSON.stringify o
uuid      = () -> Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

module.exports = ( () ->

  require('essentialjs').local()(require)

  model = @

  ###*
   * > `.schema`  contains validation/typeschema of the store 
   * > `.data`    contains the consolidated data of the store 
   * > `.adapter` contains the currently used adapter
  ###
  @schema  = require './schema'
  @data    = false
  @adapter = false 

  ###
  # > `factory` is a micro-factory: slap a module on top of given data 
  ###
  @factory = 
    ###
    # `factory.create` returns an object after requiring `./type`-module and 
    # extends the module with the passed data 
    ###
    create: (type,data) ->
      functions = require './'+type 
      obj = clone data 
      obj[k] = curry( v.bind(obj) )(model) for k,v of functions
      #obj.init( model )
      console.log "init todo"
      obj
  
  ###
  # initialize model with adapter (like `adapters.Ambrogio` )
  ###
  @init = (adapter) ->
    @adapter = adapter
    @data = adapter.read 'balance'
    @initStore() if not @data

  @initStore = () -> @data = {} ; @data[k] = {} for k,v of @schema.properties

  ###
  # Updates/Writes model `data` to adapter 
  ###
  @save = () -> @adapter.write 'treasure', @data

  ###*
   * User functions :
   * > `getUserData(name)` returns user object (-functions)
   * > `createUserByName(name)` returns user object (+functions)
   * > `createUser(user)` returns user object (+functions) after passing userdata [see schema](schema.js.md)
  ###
  @getUserData      = (name) -> 
    result = filter( eq {name:name}, @getDataFlat @data )
    result[0] || false
  
  @createUserByName = (name) -> @createUser extend defaults( @schema.properties.user ), {name:name}
  
  ###*
   * create a user
   *
   * $(.hooks/printjson lib/schema.js properties.user)
   *
   * @params {Object} minimum userdata (See above)
   * @return user object (+functions) or null (see schema)
  ###
  @createUser       = typesafe @schema.properties.user, (user) ->
    throw "USER_ALREADY_EXIST" if @data.user[ user.name ]?
    user.id = uuid()
    @data.user[ user.name ] = user 
    @factory.createUser user

  ###*
   * @return user object (+functions) or null
  ###
  @getUserById        = (id) -> @getDataFlat(@data).filter eq {id: id}

  ###*
   * @params {Object} username
   * @return user object (+functions)
  ###
  @factory.createUser = curry(@factory.create)('user')

  ###*
   * @params {String} username
   * @return user object (+functions)
  ###
  @getUser            = pipe @getUserData.bind(@), @factory.createUser
 

  ###*
   * @params {String} username
   * @return user object (+functions)
  ###
  @getOrCreateUser    = either @getUser.bind(@), @createUserByName.bind(@)
  
  ###*
   * @params {Array} usernames
   * @return Array with user objects (+functions)
  ###
  @getUsers           = map( pipe @getOrCreateUser )

  ###*
   * > `getDataFlat()` returns store with expanded aliases of names
  ###
  @getDataFlat        = () ->
    data = clone @data
    for k,user of data.user
      data.user[ alias ] = user for alias in user.aliases
    data
  
  ###
  # this bind functions to itself to preserve `this` ref
  ###

  bindAll model
  
  @

).apply({})
