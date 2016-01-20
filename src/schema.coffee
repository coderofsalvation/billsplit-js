module.exports =
  type: "object"
  properties: 
    user:
      type: "object"
      required: true
      properties:
        "name":     type: "string", required: true, default: "John Doe"
        "balance":  type: "number", required: true, default: 0
        "aliases":  type: "array",  required: true, default: [], items: { type: "string", required: true }
        "currency": type: "string", required: true, default: "US dollar", enum: ["US dollar"]
        "paybacks": type: "integer",required: true, default: 0
        "karma":    type: "number", required: true, default: 0
        "owes": type: "array", default: [], items: [{
          type: "object"
          properties:
            amount: type: "number", required: true
            paid:   type: "number", required: true, default: 0
            userid: type: "string", required: true
            log:    type: "array" , required: true, default:[], items: [
              type:"object"
              properties:
                event: type: "string", required: true
                date:  type: "string", required: true
            ]
            user: { "$ref" : "#/properties/user" }
        }]
