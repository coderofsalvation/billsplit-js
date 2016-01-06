try 
  fetch = require 'node-fetch'
catch e 

module.exports = (ambrogio) ->

  ###*
   * > `.adapters` contains an array of adapters
  ###
  adapters =

    ###*
     * `.adapters.Ambrogio` adapter 
     *
     * functions:
     *
     *     read(key)
     *     write(key,value) 
     *     delete(key)
     *     update(key,value)
     *
     * @api public
    ###
    Ambrogio:
      read:   ambrogio.retrieveValue
      write:  ambrogio.storeValue
      update: ambrogio.storeValue
      delete: (k) -> delete ambrogio.storage[k] if ambrogio.storage[k]?

#  adapters.REST = 
#    version: "1.0"
#    read: 
#    write:
#    update:
#    delete:
