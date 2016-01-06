

<!-- Start lib/model.js -->

The model manages (user) logic & data, which 
eventually gets written/read from a store.
It uses an adapter instead writing directly to the store.

## schema

> `.schema`  contains validation/typeschema of the store 
> `.data`    contains the consolidated data of the store 
> `.adapter` contains the currently used adapter

## factory

> `factory` is a micro-factory: slap a module on top of given data

## create()

`factory.create` returns an object after requiring `./type`-module and 
extends the module with the passed data

## init()

initialize model with adapter (like `adapters.Ambrogio` )

## save()

Updates/Writes model `data` to adapter

## getUserData()

User functions :
> `getUserData(name)` returns user object (-functions)
> `createUserByName(name)` returns user object (+functions)
> `createUser(user)` returns user object (+functions) after passing userdata [see schema](schema.js.md)

## getUserById()

User FP functions :
> `getUserById(id)` returns user object (+functions) or null
> `factory.createUser(userdata)` returns user object (+functions)
> `getOrCreateUser(name)` returns user object 
> `getUsers(arr) returns user objects based on array with name-strings
> `getDataFlat()` returns store with expanded aliases of names

## bindAll()

lets bind functions to itself to preserve `this` ref

<!-- End lib/model.js -->

