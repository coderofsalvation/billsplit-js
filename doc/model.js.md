

<!-- Start lib/model.js -->
## lib/model.js

> The model manages (user) logic & data, which 
> eventually gets written/read from a store.
> It uses an adapter instead writing directly to the store.

## schema

> `.schema`  contains validation/typeschema of the store 
> `.data`    contains the consolidated data of the store 
> `.adapter` contains the currently used adapter

## factory.create(type, data)

> `factory` is a micro-factory: slap a module on top of given data 
> `factory.create` returns an object after requiring `./type`-module and 
> extends the module with the passed data 

__parameters:__

* **String** *type* (pass 'user' to resolve './user.js' e.g.)
* **String** *data* (userdata described from getUserData())

## init(adapter)

> initialize model with store adapter (like `adapters.Ambrogio` )
>     { read: function(key)
>       write: function(key,value)
>       update: function(key,value)
>       delete: function(key) }

__parameters:__

* **Adapter** *adapter* 

## save()

> Updates/Writes model `data` to adapter

## getUserData(name)

> 

__parameters:__

* **String** *name* of user

__returns:__

* user object (-functions)

## createUser

> create a user
> 
> generated from `properties.user` in [schemafile lib/schema.js](../lib/schema.js) :

    {
      "aliases": [],
      "currency": "US dollar",
      "owes": []
    }

__returns:__

* user object (+functions) or null (see schema)

## getUserById()

> 

__returns:__

* user object (+functions) or null

## createUser

> 

__returns:__

* user object (+functions)

## getUser

> 

__returns:__

* user object (+functions)

## getOrCreateUser

> 

__returns:__

* user object (+functions)

## getUsers

> 

__returns:__

* Array with user objects (+functions)

## getDataFlat()

> returns `data` store with expanded aliases of names

## bindAll()

> this bind functions to itself to preserve `this` ref

<!-- End lib/model.js -->
