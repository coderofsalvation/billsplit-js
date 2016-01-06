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
   * `.schema`  contains validation/typeschema of the store 
   * `.data`    contains the consolidated data of the store 
   * `.adapter` contains the currently used adapter
  ###
  @schema  = require './schema'
  @data    = false
  @adapter = false 

  ###*
   # `factory` is a micro-factory: slap a module on top of given data 
   * `factory.create` returns an object after requiring `./type`-module and 
   * extends the module with the passed data 
   *
   * @method factory.create
   * @param {String} type (pass 'user' to resolve './user.js' e.g.)
   * @param {String} data (userdata described from getUserData())
  ###
  @factory = 
    create: (type,data) ->
      functions = require './'+type 
      obj = clone data 
      obj[k] = curry( v.bind(obj) )(model) for k,v of functions
      #obj.init( model )
      console.log "init todo"
      obj
  
  ###
  # initialize model with store adapter (like `adapters.Ambrogio` )
  #     { read: function(key)
  #       write: function(key,value)
  #       update: function(key,value)
  #       delete: function(key) }
  # @param {Adapter} adapter
  ###
  @init = (adapter) ->
    @adapter = adapter
    @data = adapter.read 'balance'
    @_initStore() if not @data

  @_initStore = () -> @data = {} ; @data[k] = {} for k,v of @schema.properties

  ###
  # Updates/Writes model `data` to adapter 
  ###
  @save = () -> @adapter.write 'treasure', @data

  ###*
   * @return user object (-functions)
   * @param {String} name of user
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
   * @param {Object} minimum userdata (See above)
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
   * @param {Object} username
   * @return user object (+functions)
  ###
  @factory.createUser = curry(@factory.create)('user')

  ###*
   * @param {String} username
   * @return user object (+functions)
  ###
  @getUser            = pipe @getUserData.bind(@), @factory.createUser
 

  ###*
   * @param {String} username
   * @return user object (+functions)
  ###
  @getOrCreateUser    = either @getUser.bind(@), @createUserByName.bind(@)
  
  ###*
   * @param {Array} usernames
   * @return Array with user objects (+functions)
  ###
  @getUsers           = map( pipe @getOrCreateUser )

  ###*
   * returns `data` store with expanded aliases of names
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
