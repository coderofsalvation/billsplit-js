

<!-- Start lib/user.js -->
## lib/user.js

#### splitBill(amount, user, strings,)

> performs billsplitting f

__parameters:__

* **Number** *amount* 
* **Array** *user* objects
* **Array** *strings,* (optional)

<hr/>

> Strategy:
> 
> . check whether debtor accidentally included as lender?
> . determine the split ratio 
> . check if we owe something to anybody (and pay that from our share)
> . apply split ratio on remaining amount

<hr/>

#### lendMoney(lenders, amount)

> this function first looks at own i-owe-you's, and tries paybackLoan()
> and eventually adds a you-owe-me on a lenders account (the 'owes' array of a user)

__parameters:__

* **Array** *lenders* (array with users, see user schema)
* **Number** *amount* 

<hr/>

#### paybackLoan(amount, loans)

> if we still owe money to somebody, and we can pay it back 
> ( amount > (loanedamount-paid) ) then lets pay it back 

__parameters:__

* **Number** *amount* 
* **Array** *loans* (array with user loans, see 'owes' in user schema)

<hr/>

#### getStats(options)

> generate some stats to see the balance of a users's account

__parameters:__

* **Object** *options* 

<hr/>

<!-- End lib/user.js -->

