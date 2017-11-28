module.exports = {
  server: {
    "port": 3001,
    "userLoginAttribute": "sAMAccountName",
    "searchBase": "dc=test,dc=com",
    "searchFilter": "(sAMAccountName={{username}})"
  },
  users: [
    {
      "dn": "cn=Bob Smith,dc=test,dc=com",
      "cn": "Bob Smith",
      "objectGUID": "a3ced714-7e2c-4269-bfb9-32f3e7a24c00",
      "sAMAccountName": "bob.smith",
      "userPrincipalName": "bob.smith@test.com",
      "name": "Bob Smith"
    },
    {
      "dn": "cn=Joe Bloggs,dc=test,dc=com",
      "cn": "Joe Bloggs",
      "objectGUID": "b3ced714-7e2c-4269-bfb9-32f3e7a24c01",
      "sAMAccountName": "joe.bloggs",
      "userPrincipalName": "joe.bloggs@test.com",
      "name": "Joe Bloggs"
    },
    {
      "dn": "cn=elencyConfig,dc=test,dc=com",
      "cn": "elencyConfig",
      "objectGUID": "129bb9ca-afe9-11e7-abc4-cec278b6b50a",
      "sAMAccountName": "elencyConfig",
      "userPrincipalName": "elencyConfig@test.com",
      "name": "elencyConfig"
    }
  ]
};
