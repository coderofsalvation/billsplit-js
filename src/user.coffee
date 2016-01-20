typeshave = require 'typeshave'
typeshave.verbose = 2
typesafe  = typeshave.typesafe
validate  = typeshave.validate
schema    = require './schema'
require('essentialjs').local()(require)

module.exports = 

  init: (model) ->
    for k,debtor of @owes 
      @owes[k].user = first model.getUserById( debtor.userid )

  ###
  # performs billsplitting f
  #
  # @param {Number} amount
  # @param {Array} user objects
  # @param {Array} strings, (optional)
  # @api public
  ###
  splitBill: (model, amount, lenders, tags ) ->
    if validate {amount:amount,lenders:lenders,tags:tags}, {
        amount:   type: "number", required: true
        lenders:  type: "array",  required: true, items: [{type:"string"}]
        tags:     type: "array",  items: [{type:"string"}]
      }
      ###
      # Strategy:
      #
      # . check whether debtor accidentally included as lender?
      # . determine the split ratio 
      # . check if we owe something to anybody (and pay that from our share)
      # . apply split ratio on remaining amount 
      ###
      user  = @
      lenders_users = model.getUsers( lenders ).filter pipe( pluck('name'), notEq( @name ) )
      ratio = 1/(lenders.length+1)
      @lendMoney lenders_users, (amount * ratio)
      model.data.user[ @name ] = @
      model.save()
      result = {code: 0, msg: "splitting bill total/splitted: "+amount+"/"+(amount*ratio)+" "+user.name+" -> "+lenders.join ','}
      console.log result.msg 
      return result
    else 
      throw "bad input @ splitBill()"

  ###*
   * this function first looks at own i-owe-you's, and tries paybackLoan()
   * and eventually adds a you-owe-me on a lenders account (the 'owes' array of a user)
   * @param {Array} lenders (array with users, see user schema)
   * @param {Number} amount 
  ###
  lendMoney: (model, lenders, amount) ->
    user = @
    lenders.map (lender) ->
      lenderamount = amount
      if values(user.owes).length
        loansAtLender = where {userid: lender.id}, values(user.owes)
        lenderamount = user.paybackLoan amount, loansAtLender
        user.karma += lenderamount
        # TODO: improve fairness by equally distributing payback across debtors as much as possible
      if amount > 0
        lender.owes.push
          amount: lenderamount
          paid: 0
          userid: user.id
          user: user
          log: [{ date: new Date().toString(), event: "created loan" }]
      else throw new Error("should not happen")

  ###*
   * if we still owe money to somebody, and we can pay it back 
   * ( amount > (loanedamount-paid) ) then lets pay it back 
   * @param {Number} amount 
   * @param {Array} loans (array with user loans, see 'owes' in user schema)
  ###
  paybackLoan: (model, amount, loans ) ->
    return amount if not loans.length 
    user = @
    user.paybacks++
    loans.map (loan) ->
      diff = loan.amount - loan.paid
      if diff > 0 and ( amount > diff )
        amount -= diff
        msg = user.name+" pays back "+diff+" to "+loan.user.name+" open debt" 
        loan.log.push {date: new Date().toString(), event: msg }
        console.log msg if process.env.DEBUG?
        loan.paid += diff
    amount

  ###*
   * generate some stats to see the balance of a users's account
   * @param {Object} options 
  ###
  getStats: (model,opts) ->
    user = (if opts.user? then opts.user else @ )
    stats = {}
    stats.name      = user.name
    stats.loanTotal = fold 0, add, user.owes.map( pluck 'amount' )
    stats.paidTotal = fold 0, add, user.owes.map( pluck 'paid'   )
    stats.balance   = stats.paidTotal - stats.loanTotal
    stats
