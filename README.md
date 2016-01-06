billsplitting module 

\![Build Status](https://travis-ci.org/coderofsalvation/billsplit-js.svg?branch=master)

## Usage

    npm install billsplit-js

and then 

    model = require('billsplit-js')
    model.init(...)

## API

* [model.js](doc/model.js.md)
* [user.js](doc/user.js.md)

## Asciiart!

    module.exports
              └── model
                  │
                  ├── adapter (for storage)
                  │
                  ├─── schema (for validation)
                  │       │
                  └───────┴── user
                               │
                               └─ balance

