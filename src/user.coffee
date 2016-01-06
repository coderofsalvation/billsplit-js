require('essentialjs').expose( _ = {} )
curry     = _.curry
typeshave = require 'typeshave'
typesafe  = typeshave.typesafe
validate  = typeshave.validate
schema    = require './schema'

module.exports = 

  init: (model) ->
    for k,debtor of @owes
      @owes[k].user = model.getUserById debtor.userid

  ###
  # performs billsplitting f
  #
  # @param {Number} amount
  # @param {Object} debtor (who is providing loan)
  # @param {Array} user objects
  # @param {Array} strings, (optional)
  # @api public
  ###
  splitBill: (model, amount, debtor, lenders, tags ) ->
    ok = validate arguments, 
      amount: type: "number", required: true
      users:  type: "array",  required: true, items: [schema.properties.user]
      tags:   type: "array",  items: [{type:"string"}]
    if ok
      amount = amount.toFixed(2)
      ###
      # Strategy:
      #
      # 1. determine the split ratio 
      # 2. check if we owe something to anybody (and pay that)
      # 3. apply split ratio on remaining amount 
      ###
      console.dir @
      console.log "splitting bill"
    else 
      throw "bad input @ splitBill()"

