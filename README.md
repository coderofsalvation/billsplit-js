billsplitting module 

\![Build Status](https://travis-ci.org/coderofsalvation/billsplit-js.svg?branch=master)

## Usage

    npm install billsplit-js --production

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

## Seqdiagram!

<!-- https://www.websequencediagrams.com/?lz=dGl0bGUgQklMTFNQTElULUpTIEJBU0lDUwoKY2xpZW50LT5tb2RlbDogAAIFLmluaXQoYWRhcHRlcikKABYFLT4ACQc6IAAZBQAOCXVzZXI6IHVzZXIuYmlsbFNwbGl0KCAxMC4wLCBbIkEiLCJCIl0gKQpub3RlIG92ZXIAXgYsADIGKiBjcmVhdGVzAD0FcyBhbmQgZGl2aWRlc1xuYW1vdW50AC8GY3VycmVudABkBVxuICsAbQUgQQABCEIKdXNlcgCBBghwYXliYWNrTG9hbigpAA0NbGVuZE1vbmV5AA8JAIFOCXNhdmUAJQkAghEGOiBzaG93IHJlc3BvbnNlCg&s=napkin -->

<img alt="" src="https://www.websequencediagrams.com/?lz=dGl0bGUgQklMTFNQTElULUpTIEJBU0lDUwoKY2xpZW50LT5tb2RlbDogAAIFLmluaXQoYWRhcHRlcikKABYFLT4ACQc6IAAZBSkKbm90ZSBvdmVyIAARCXJlYWQvd3JpdGUvdXBkYXRlL2RlbGV0ZQBWEHVzZXIgPQBmB2dldE9yQ3JlYXRlVXNlcigiZm9vIikAHxQuYmlsbFNwbGl0KCAxMC4wLCBbIkEiLCJCIl0gAIEEDACBRwUsdXNlcjogKiBjAFYFcwBwBXMgYW5kIGRpdmlkZXNcbmFtb3VudACBPwZjdXJyZW50AIEXBVxuICsAgR8GQQABCEIKdXNlci0-AFAGcGF5YmFja0xvYW4oKQANDWxlbmRNb25leQAPCXNjaGVtYTp2YWxpZGF0ZQAnCQCCdAY6IHNob3cgcmVzcG9uc2UK&s=napkin">

## Developer notes:

#### schema
All data (like userdata) is typesafe and protected by [schema](https://github.com/coderofsalvation/billsplit-js/blob/master/lib/schema.js), when adding properties please :

* check http://json-schema.org for more info on the format
* don't forget to provide 'default' values for required properties, so createUser() won't nag about schema errors.

#### automatic documentation

Run __'npm run-script gendoc'__ or simply commit files to generate/update markdown documentation, it will:

* add documentation-comments of all undocumented functions in .js files 
* convert these .js files to markdown in __/doc__
