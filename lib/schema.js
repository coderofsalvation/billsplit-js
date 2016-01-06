module.exports = {
  type: "object",
  properties: {
    user: {
      type: "object",
      required: true,
      properties: {
        "name": {
          type: "string",
          required: true
        },
        "aliases": {
          type: "array",
          required: true,
          "default": [],
          items: {
            type: "string",
            required: true
          }
        },
        "currency": {
          type: "string",
          required: true,
          "default": "US dollar",
          "enum": ["US dollar"]
        },
        "owes": {
          type: "array",
          "default": [],
          items: [
            {
              type: "object",
              properties: {
                amount: {
                  type: "user",
                  required: true
                },
                userid: {
                  type: "string",
                  required: true
                },
                user: {
                  "$ref": "#/properties/user"
                }
              }
            }
          ]
        }
      }
    }
  }
};
