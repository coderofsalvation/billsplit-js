

<!-- Start lib/model.js -->
## lib/model.js

> The model manages (user) logic & data, which 
> eventually gets written/read from a store.
> It uses an adapter instead writing directly to the store.

<hr/>

#### schema

> `.schema`  contains validation/typeschema of the store 
> `.data`    contains the consolidated data of the store 
> `.adapter` contains the currently used adapter

<hr/>

#### factory.create(type, data)

> `factory` is a micro-factory: slap a module on top of given data 
> `factory.create` returns an object after requiring `./type`-module and 
> extends the module with the passed data 

__parameters:__

* **String** *type* (pass 'user' to resolve './user.js' e.g.)
* **String** *data* (userdata described from getUserData())

<hr/>

#### init(adapter)

> initialize model with store adapter (like `adapters.Ambrogio` )
>     { read: function(key)
>       write: function(key,value)
>       update: function(key,value)
>       delete: function(key) }

__parameters:__

* **Adapter** *adapter* 

<hr/>

#### save()

> Updates/Writes model `data` to adapter

<hr/>

#### getUserData(name)

> 

__parameters:__

* **String** *name* of user

__returns:__

* user object (-functions)

<hr/>

#### createUser(userdata)(minimum)

> create a user
> 
>     {
      "name": "John Doe",
      "aliases": [],
      "currency": "US dollar",
      "owes": []
    }

__parameters:__

* **Object** *minimum* userdata (See above)

__returns:__

* user object (+functions) or null (see schema)

<hr/>

#### getUserById()

> 

__returns:__

* user object (+functions) or null

<hr/>

#### createUser

> 

__parameters:__

* **Object** *username* 

__returns:__

* user object (+functions)

<hr/>

#### getUser

> 

__parameters:__

* **String** *username* 

__returns:__

* user object (+functions)

<hr/>

#### getOrCreateUser

> 

__parameters:__

* **String** *username* 

__returns:__

* user object (+functions)

<hr/>

#### getUsers

> 

__parameters:__

* **Array** *usernames* 

__returns:__

* Array with user objects (+functions)

<hr/>

#### getDataFlat()

> returns `data` store with expanded aliases of names

<hr/>

#### bindAll()

> this bind functions to itself to preserve `this` ref

<hr/>

<!-- End lib/model.js -->
