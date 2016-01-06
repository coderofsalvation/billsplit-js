

<!-- Start lib/user.js -->

## init({})

Description

### Params:

* *{}* model

### Return:

* results

## splitBill({}, amount, debtor, {}, {})

performs billsplitting f

### Params:

* *{}* model
* **Number** *amount* 
* **Object** *debtor* (who is providing loan)
* *{}* lenders
* *{}* tags

### Return:

* 

Strategy:

1. determine the split ratio 
2. check if we owe something to anybody (and pay that)
3. apply split ratio on remaining amount

<!-- End lib/user.js -->

