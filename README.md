# what is it?
DBH is a powerfull library for creating methods to work with MongoDB

I am using it myself in [API](https://api.happy.tatar) for my site. It is very fast and simple to understand.

If you don't like to check every param from http requests, DBH has good instruments to check your params values and types. It will't able you to make mistake and save wrong data.

Also you can write your own errors names if you don't like DBH default error names

It using config params and creating methods from templates

Full guide on [my site](https://happy.tatar/instruments/DBH)

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
      User.name = "John"
      User.surname = "Doe"
      User.save()
      // ...
```

<<<<<<< HEAD
# GEN template guide:
see ./example/gen.example.js
