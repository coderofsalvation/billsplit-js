###*
 * The model manages (user) logic & data, which 
 * eventually gets written/read from a store.
 * It uses an adapter instead writing directly to the store.
###

typeshave         = require 'typeshave'
typeshave.onError = (err) -> console.log JSON.stringify err,null,2 # suppress exceptions because of FP pipelines
typesafe          = typeshave.typesafe
typeshave.verbose = 2 if process.env.DEBUG
defaults          = require 'json-schema-defaults'
clone             = (o) -> JSON.parse JSON.stringify o
uuid              = () -> Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

module.exports = ( () ->

  require('essentialjs').local()(require)
  dump      = ( (data) -> console.log "DUMP:" ; console.dir data ; data )
  nonempty  = (x) -> console.log x.length; x.length > 0

  ###*
   * validate data against jsonschema and (nested)data 
   * @return {Object|false} 
  ###
  validate = curry( (schema,data) -> ( if typeshave.validate data,schema then data else false ) )
  
  ###*
  * call callback when data is not false/undefined
   * @return {Object|false} 
  ###
  whenvalid = curry( (cb, data) -> (if data then cb(data) else false ) )

  model = @

  ###*
   * `.schema`  contains validation/typeschema of the store 
   * `.data`    contains the consolidated data of the store 
   * `.adapter` contains the currently used adapter
  ###
  @schema  = require './schema'
  @data    = {}
  @adapter = false 

  ###*
   # micro-factory: slap a module on top of given data 
   * `factory.create` returns an object after requiring `./type`-module and 
   * extends the module with the passed data 
   *
   * @method factory.create
   * @param {String} type (pass 'user' to resolve './user.js' e.g.)
   * @param {String} data (userdata described from getUserData())
  ###
  @factory = 
    create: (type,obj) ->
      functions = require './'+type 
      obj[k] = curry( v.bind(obj) )(model) for k,v of functions
      if functions.init?
        obj.init = functions.init 
        obj.init model
      obj
  
  ###
  # initialize model with store adapter (like `adapters.Ambrogio` )
  #     { read: function(key)
  #       write: function(key,value)
  #       update: function(key,value)
  #       delete: function(key) }
  # @param {Adapter} adapter
  ###
  @init = typesafe 
    type: "object"
    properties:
      read:   { type: "function" },
      write:  { type: "function" },
      update: { type: "function" },
      delete: { type: "function" },
      find:   { type: "function" }
  , (adapter) ->
    @adapter = adapter
    @data = adapter.read 'user'
    @_initStore() if not @data

  @_initStore = () -> @data = {} ; @data[k] = {} for k,v of @schema.properties

  ###
  # Updates/Writes model `data` to adapter 
  ###
  @save = () -> @adapter.write k,v for k,v of @data 

  ###*
   * @return user object (-functions)
   * @param {String} name of user
  ###
  @getUserData      = (name) -> @getDataFlat(@data).user[name] || false 
  
  @createUserByName = (name) -> @createUser extend defaults( @schema.properties.user ), {name:name}
  
  ###*
   * create a user
   *
   * $(.hooks/printjson lib/schema.js properties.user)
   *
   * > NOTE: you need to call model.save() in order to persist data 
   *
   * @method createUser(userdata)
   * @param {Object} userdata (see json above)
   * @return user object (+functions) or null (see schema)
  ###
  @createUser       = typesafe @schema.properties.user, (userdata) ->
    throw new Error("USER_ALREADY_EXIST") if @data.user[ userdata.name ]?
    user = @factory.createUser userdata
    user.id = uuid() if not user.id?
    @data.user[ userdata.name ] = user
    @save()
    user
    

  ###*
   * @return user object (+functions) or null
  ###
  @getUserById        = (id) -> 
    userdata = @adapter.find 'user', {id: id}
    return ( if userdata? then @factory.createUser userdata else null )                 
  
  ###*
   * returns `data` store with expanded aliases of names
  ###
  @getDataFlat        = () ->
    data = @data
    for k,user of data.user
      data.user[ alias ] = user for alias in user.aliases
    data
  
  ###
  # bind all functions to preserve `this` ref in FP functions below
  ###

  bindAll @
  
  ###*
   * FP shortcut to decorate raw userdata with functions 
   * @param {Object} userdata (see createUser)
   * @return user object (+functions)
  ###
  @factory.createUser = curry(@factory.create)('user')

  ###*
   * @param {String} username
   * @return user object (+functions)
  ###
  @getUser            = pipe validate({type:"string", required:true}),
                             @getUserData.bind(@),
                             validate @schema.properties.user
                             whenvalid @factory.createUser

  ###*
   * @param {String} username
   * @return user object (+functions)
  ###
  @getOrCreateUser    = either @getUser, @createUserByName.bind(@)
  
  ###*
   * @param {Array} usernames
   * @return Array with user objects (+functions)
  ###
  @getUsers           = map @getOrCreateUser

  @

).apply({})
