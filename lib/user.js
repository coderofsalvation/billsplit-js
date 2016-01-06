var _, curry, schema, typesafe, typeshave, validate;

require('essentialjs').expose(_ = {});

curry = _.curry;

typeshave = require('typeshave');

typesafe = typeshave.typesafe;

validate = typeshave.validate;

schema = require('./schema');

module.exports = {
  /**
   * Description
   * @method init
   * @param {} model
   * @return results
   */
  init: function(model) {
    var debtor, k, ref, results;
    ref = this.owes;
    results = [];
    for (k in ref) {
      debtor = ref[k];
      results.push(this.owes[k].user = model.getUserById(debtor.userid));
    }
    return results;
  },

  /**
   * performs billsplitting f
   * @api public
   * @method splitBill
   * @param {} model
   * @param {Number} amount
   * @param {Object} debtor (who is providing loan)
   * @param {} lenders
   * @param {} tags
   * @return 
   */
  splitBill: function(model, amount, debtor, lenders, tags) {
    var ok;
    ok = validate(arguments, {
      amount: {
        type: "number",
        required: true
      },
      users: {
        type: "array",
        required: true,
        items: [schema.properties.user]
      },
      tags: {
        type: "array",
        items: [
          {
            type: "string"
          }
        ]
      }
    });
    if (ok) {
      amount = amount.toFixed(2);

      /*
       * Strategy:
       *
       * 1. determine the split ratio 
       * 2. check if we owe something to anybody (and pay that)
       * 3. apply split ratio on remaining amount
       */
      console.dir(this);
      return console.log("splitting bill");
    } else {
      throw "bad input @ splitBill()";
    }
  }
};
