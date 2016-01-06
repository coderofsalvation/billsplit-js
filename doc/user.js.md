

<!-- Start lib/user.js -->
## lib/user.js

## splitBill(amount, debtor, user, strings,)

> performs billsplitting f

__parameters:__

* **Number** *amount* 
* **Object** *debtor* (who is providing loan)
* **Array** *user* objects
* **Array** *strings,* (optional)

> Strategy:
> 
> 1. determine the split ratio 
> 2. check if we owe something to anybody (and pay that)
> 3. apply split ratio on remaining amount

<!-- End lib/user.js -->

