var schema, typesafe, typeshave, validate;

typeshave = require('typeshave');

typeshave.verbose = 2;

typesafe = typeshave.typesafe;

validate = typeshave.validate;

schema = require('./schema');

require('essentialjs').local()(require);

module.exports = {
  init: function(model) {
    var debtor, k, ref, results;
    ref = this.owes;
    results = [];
    for (k in ref) {
      debtor = ref[k];
      results.push(this.owes[k].user = first(model.getUserById(debtor.userid)));
    }
    return results;
  },

  /*
   * performs billsplitting f
   *
   * @param {Number} amount
   * @param {Array} user objects
   * @param {Array} strings, (optional)
   * @api public
   */
  splitBill: function(model, amount, lenders, tags) {
    var lenders_users, ratio, result, user;
    if (validate(arguments, {
      amount: {
        type: "number",
        required: true
      },
      lenders: {
        type: "array",
        required: true,
        items: [
          {
            type: "string"
          }
        ]
      },
      tags: {
        type: "array",
        items: [
          {
            type: "string"
          }
        ]
      }
    })) {

      /*
       * Strategy:
       *
       * . check whether debtor accidentally included as lender?
       * . determine the split ratio 
       * . check if we owe something to anybody (and pay that from our share)
       * . apply split ratio on remaining amount
       */
      user = this;
      ratio = 1 / (lenders.length + 1);
      lenders_users = model.getUsers(lenders).filter(pipe(pluck('name'), notEq(this.name)));
      model.getUsers(lenders).filter(pipe(pluck('name'))).map(function(lender) {
        if (lender.name === this.name) {
          return amount -= amount * ratio;
        }
      });
      this.lendMoney(lenders_users, amount * ratio);
      model.data.user[this.name] = this;
      model.save();
      result = {
        code: 0,
        msg: "splitting bill total/splitted: " + amount + "/" + (amount * ratio) + " " + user.name + " -> " + lenders.join(',')
      };
      console.log(result.msg);
      return result;
    } else {
      throw "bad input @ splitBill()";
    }
  },

  /**
   * this function first looks at own i-owe-you's, and tries paybackLoan()
   * and eventually adds a you-owe-me on a lenders account (the 'owes' array of a user)
   * @param {Array} lenders (array with users, see user schema)
   * @param {Number} amount
   */
  lendMoney: function(model, lenders, amount) {
    var user;
    user = this;
    return lenders.map(function(lender) {
      var lenderamount, loansAtLender;
      lenderamount = amount;
      if (values(user.owes).length) {
        loansAtLender = where({
          userid: lender.id
        }, values(user.owes));
        lenderamount = user.paybackLoan(amount, loansAtLender);
        user.karma += lenderamount;
      }
      if (amount > 0) {
        return lender.owes.push({
          amount: lenderamount,
          paid: 0,
          userid: user.id,
          user: user,
          log: [
            {
              date: new Date().toString(),
              event: "created loan"
            }
          ]
        });
      } else {
        throw new Error("should not happen");
      }
    });
  },

  /**
   * if we still owe money to somebody, and we can pay it back 
   * ( amount > (loanedamount-paid) ) then lets pay it back 
   * @param {Number} amount 
   * @param {Array} loans (array with user loans, see 'owes' in user schema)
   */
  paybackLoan: function(model, amount, loans) {
    var user;
    if (!loans.length) {
      return amount;
    }
    user = this;
    user.paybacks++;
    loans.map(function(loan) {
      var diff, msg;
      diff = loan.amount - loan.paid;
      if (diff > 0 && (amount > diff)) {
        amount -= diff;
        msg = user.name + " pays back " + diff + " to " + loan.user.name + " open debt";
        loan.log.push({
          date: new Date().toString(),
          event: msg
        });
        if (process.env.DEBUG != null) {
          console.log(msg);
        }
        return loan.paid += diff;
      }
    });
    return amount;
  },

  /**
   * generate some stats to see the balance of a users's account
   * @param {Object} options
   */
  getStats: function(model, opts) {
    var stats, user;
    user = (opts.user != null ? opts.user : this);
    stats = {};
    stats.name = user.name;
    stats.loanTotal = fold(0, add, user.owes.map(pluck('amount')));
    stats.paidTotal = fold(0, add, user.owes.map(pluck('paid')));
    stats.balance = stats.paidTotal - stats.loanTotal;
    return stats;
  }
};
