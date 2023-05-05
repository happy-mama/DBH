# what is it?
DBH is an instrument to create methods for MongoDB

It using your config and creating methods, it ables you create a lot of methods in 5 minutes

# install

```
  npm i hm-dbh
```

**initing module**

```js
  const DB = {
    login: "",    // MongoDB User login
    password: "", // MongoDB user password
    host: "",     // url to MongoDB server
    database: ""  // MongoDB database name
  }

  const options = {
    // edit default DBH config values
  }

  const GEN = require("path to GEN file")

  DBH.init(DB, options, GEN).then(() => {
    // do something
  })
```

**example usage**

```js
// req.body.auth - jwt token
DBH.User.postJWT(req.body.auth).then(user => {
  DBH.User.login(user).then(User => {
      User.name = "Vasya"
      User.save()
      // ...
```

# GEN template guide:
see ./example/gen.example.js