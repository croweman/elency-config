module.exports = {
  server: {
    "port": 3001,
    "userLoginAttribute": "sAMAccountName",
    "searchBase": "dc=test,dc=com",
    "searchFilter": "(sAMAccountName=username)"
  },
  users: [
    {
      "dn": "cn=Bob Smith,dc=test,dc=com",
      "cn": "Bob Smith",
      "objectGUID": "a3ced714-7e2c-4269-bfb9-32f3e7a24c00",
      "sAMAccountName": "bob.smith",
      "userPrincipalName": "bob.smith@test.com",
      "name": "Bob Smith",
      "password": 'f178hJ4$a!'
    },
    {
      "dn": "cn=Joe Bloggs,dc=test,dc=com",
      "cn": "Joe Bloggs",
      "objectGUID": "26271726-1c91-48e5-ac40-70875d509cc5",
      "sAMAccountName": "joe.bloggs",
      "userPrincipalName": "joe.bloggs@test.com",
      "name": "Joe Bloggs",
      "password": 'aA1!aaaa'
    },
    {
      dn: 'cn=Adam Zapel,dc=test,dc=com',
      cn: 'Adam Zapel',
      objectGUID: 'e68f9f00-446e-4052-b8fb-76c0951f7e54',
      sAMAccountName: 'adam.zapel',
      userPrincipalName: 'adam.zapel@test.com',
      name: 'Adam Zapel',
      password: 'aA1!aaaa'
    },
    {
      dn: 'cn=Biff Wellington,dc=test,dc=com',
      cn: 'Biff Wellington',
      objectGUID: 'fccd317f-cbcd-4b61-901b-7c0ccba4852a',
      sAMAccountName: 'biff.wellington',
      userPrincipalName: 'biff.wellington@test.com',
      name: 'Biff Wellington',
      password: 'bB1!bbbb'
    },
    {
      dn: 'cn=Chris Cross,dc=test,dc=com',
      cn: 'Chris Cross',
      objectGUID: '67dbddc5-4d71-46c5-949c-92b8913452d6',
      sAMAccountName: 'chris.cross',
      userPrincipalName: 'chris.cross@test.com',
      name: 'Chris Cross',
      password: 'cC1!cccc'
    },
    {
      dn: 'cn=Dick Long,dc=test,dc=com',
      cn: 'Dick Long',
      objectGUID: '903536c7-4fd3-487a-be1f-5a753ef20dcb',
      sAMAccountName: 'dick.long',
      userPrincipalName: 'dick.long@test.com',
      name: 'Dick Long',
      password: 'dD1!dddd'
    },
    {
      dn: 'cn=Dilbert Pickles,dc=test,dc=com',
      cn: 'Dilbert Pickles',
      objectGUID: 'f65f430e-dafd-4481-afa0-719a0982579e',
      sAMAccountName: 'dilbert.pickles',
      userPrincipalName: 'dilbert.pickles@test.com',
      name: 'Dilbert Pickles',
      password: 'eE1!eeee'
    },
    {
      dn: 'cn=Dinah Soares,dc=test,dc=com',
      cn: 'Dinah Soares',
      objectGUID: '2b0fe37b-a8dd-4fa0-b37c-e5548b449cda',
      sAMAccountName: 'dinah.soares',
      userPrincipalName: 'dinah.soares@test.com',
      name: 'Dinah Soares',
      password: 'fF1!ffff'
    },
    {
      dn: 'cn=Donald Duck,dc=test,dc=com',
      cn: 'Donald Duck',
      objectGUID: '6f56624f-1655-4710-9ac7-81a5520ddcce',
      sAMAccountName: 'donald.duck',
      userPrincipalName: 'donald.duck@test.com',
      name: 'Donald Duck',
      password: 'gG1!gggg'
    },
    {
      dn: 'cn=Drew Peacock,dc=test,dc=com',
      cn: 'Drew Peacock',
      objectGUID: '079e7c13-b875-4581-a1a6-d0a107442ad5',
      sAMAccountName: 'drew.peacock',
      userPrincipalName: 'drew.peacock@test.com',
      name: 'Drew Peacock',
      password: 'hH1!hhhh'
    },
    {
      dn: 'cn=Faith Christian,dc=test,dc=com',
      cn: 'Faith Christian',
      objectGUID: '2ab8e84d-4628-45cc-8074-d7db5d4a6caa',
      sAMAccountName: 'faith.christian',
      userPrincipalName: 'faith.christian@test.com',
      name: 'Faith Christian',
      password: 'iI1!iiii'
    },
    {
      dn: 'cn=Honey Bee,dc=test,dc=com',
      cn: 'Honey Bee',
      objectGUID: '0902d713-38d8-475a-a0d3-532932882547',
      sAMAccountName: 'honey.bee',
      userPrincipalName: 'honey.bee@test.com',
      name: 'Honey Bee',
      password: 'jJ1!jjjj'
    },
    {
      dn: 'cn=Jack Haas,dc=test,dc=com',
      cn: 'Jack Haas',
      objectGUID: 'c8f473d1-f984-4a17-8071-4d4d04c7c3e4',
      sAMAccountName: 'jack.haas',
      userPrincipalName: 'jack.haas@test.com',
      name: 'Jack Haas',
      password: 'kK1!kkkk'
    },
    {
      dn: 'cn=Jenny Tull,dc=test,dc=com',
      cn: 'Jenny Tull',
      objectGUID: '226a61db-5f6a-45d6-a7c2-d4c0d2868816',
      sAMAccountName: 'jenny.tull',
      userPrincipalName: 'jenny.tull@test.com',
      name: 'Jenny Tull',
      password: 'lL1!llll'
    },
    {
      dn: 'cn=Lily Pond,dc=test,dc=com',
      cn: 'Lily Pond',
      objectGUID: '75721a8a-fec3-4c44-b238-570140946f7a',
      sAMAccountName: 'lily.pond',
      userPrincipalName: 'lily.pond@test.com',
      name: 'Lily Pond',
      password: 'mM1!mmmm'
    },
    {
      dn: 'cn=Lou Pole,dc=test,dc=com',
      cn: 'Lou Pole',
      objectGUID: '820b880b-2707-403e-bc95-4a4e76be1587',
      sAMAccountName: 'lou.pole',
      userPrincipalName: 'lou.pole@test.com',
      name: 'Lou Pole',
      password: 'nN1!nnnn'
    },
    {
      dn: 'cn=Lucy Fer,dc=test,dc=com',
      cn: 'Lucy Fer',
      objectGUID: '3c107149-ebe9-4096-a45a-755c07b1fe6c',
      sAMAccountName: 'lucy.fer',
      userPrincipalName: 'lucy.fer@test.com',
      name: 'Lucy Fer',
      password: 'oO1!oooo'
    },
    {
      dn: 'cn=Marshall Law,dc=test,dc=com',
      cn: 'Marshall Law',
      objectGUID: '4a456105-1719-48d4-83c5-3136321dac75',
      sAMAccountName: 'marshall.law',
      userPrincipalName: 'marshall.law@test.com',
      name: 'Marshall Law',
      password: 'pP1!pppp'
    },
    {
      dn: 'cn=Max Power,dc=test,dc=com',
      cn: 'Max Power',
      objectGUID: 'c28d1908-5a88-4baa-8ea7-f1d4f634217a',
      sAMAccountName: 'max.power',
      userPrincipalName: 'max.power@test.com',
      name: 'Max Power',
      password: 'qQ1!qqqq'
    },
    {
      dn: 'cn=Mister Bates,dc=test,dc=com',
      cn: 'Mister Bates',
      objectGUID: '0064dcd3-4da5-438c-91c8-24dc17bbaa84',
      sAMAccountName: 'mister.bates',
      userPrincipalName: 'mister.bates@test.com',
      name: 'Mister Bates',
      password: 'rR1!rrrr'
    },
    {
      dn: 'cn=Paige Turner,dc=test,dc=com',
      cn: 'Paige Turner',
      objectGUID: '9287822d-6118-49fc-8389-2c3207a32435',
      sAMAccountName: 'paige.turner',
      userPrincipalName: 'paige.turner@test.com',
      name: 'Paige Turner',
      password: 'sS1!ssss'
    },
    {
      dn: 'cn=Pat McCann,dc=test,dc=com',
      cn: 'Pat McCann',
      objectGUID: 'dcc86ccb-4ca5-44ed-9a6d-bc019f2b811e',
      sAMAccountName: 'pat.mccann',
      userPrincipalName: 'pat.mccann@test.com',
      name: 'Pat McCann',
      password: 'tT1!tttt'
    },
    {
      dn: 'cn=Royal Payne,dc=test,dc=com',
      cn: 'Royal Payne',
      objectGUID: '96ef8af8-a98d-4b95-9a3e-3a44a70ceb9f',
      sAMAccountName: 'royal.payne',
      userPrincipalName: 'royal.payne@test.com',
      name: 'Royal Payne',
      password: 'uU1!uuuu'
    },
    {
      dn: 'cn=Sarah Bellum,dc=test,dc=com',
      cn: 'Sarah Bellum',
      objectGUID: '83289a2d-bee4-4ba7-af21-ab675e97d8e9',
      sAMAccountName: 'sarah.bellum',
      userPrincipalName: 'sarah.bellum@test.com',
      name: 'Sarah Bellum',
      password: 'vV1!vvvv'
    },
    {
      dn: 'cn=Tim Burr,dc=test,dc=com',
      cn: 'Tim Burr',
      objectGUID: 'c4c15145-2848-487a-be3b-9dd3792a87af',
      sAMAccountName: 'tim.burr',
      userPrincipalName: 'tim.burr@test.com',
      name: 'Tim Burr',
      password: 'wW1!wwww'
    },
    {
      dn: 'cn=Urich Hunt,dc=test,dc=com',
      cn: 'Urich Hunt',
      objectGUID: '9f625f2b-fa0f-46c1-a269-54850e72bf6d',
      sAMAccountName: 'urich.hunt',
      userPrincipalName: 'urich.hunt@test.com',
      name: 'Urich Hunt',
      password: 'xX1!xxxx'
    },
    {
      dn: 'cn=Virginia Beach,dc=test,dc=com',
      cn: 'Virginia Beach',
      objectGUID: 'b3f553cb-5ac4-4e93-9dfc-25431a6fe1e9',
      sAMAccountName: 'virginia.beach',
      userPrincipalName: 'virginia.beach@test.com',
      name: 'Virginia Beach',
      password: 'yY1!yyyy'
    },
    {
      dn: 'cn=Woody Forrest,dc=test,dc=com',
      cn: 'Woody Forrest',
      objectGUID: 'c31bb0e8-54d9-4d05-9d00-f07cf8c4704e',
      sAMAccountName: 'woody.forrest',
      userPrincipalName: 'woody.forrest@test.com',
      name: 'Woody Forrest',
      password: 'zZ1!zzzz'
    }
  ]
};
