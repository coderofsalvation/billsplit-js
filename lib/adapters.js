var e, error, fetch;

try {
  fetch = require('node-fetch');
} catch (error) {
  e = error;
}

module.exports = function(ambrogio) {

  /**
   * > `.adapters` contains an array of adapters
   */
  var adapters;
  return adapters = {

    /**
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
     */
    Ambrogio: {
      read: ambrogio.retrieveValue,
      write: ambrogio.storeValue,
      update: ambrogio.storeValue,
      "delete": function(k) {
        if (ambrogio.storage[k] != null) {
          return delete ambrogio.storage[k];
        }
      }
    }
  };
};
