# what is it?
DBH is an instrument to create methods for MongoDB

It using your config and creating methods, it ables you create a lot of methods in 5 minutes

# example
```js
// req.body.auth - jwt token
DBH.User.postJWT(req.body.auth).then(user => {
  DBH.User.login(user).then(User => {
      User.name = "Vasya"
      User.save()
      // ...
```

# before use:

first you need to create template in ./gen.js or create it anywhere and input as first param to .init() method `DBH.init(myTemplate)` (example template in example folder)

then input MongoDB data in ./config.json

# integrate it to project:

```js
DBH.init().then(() => { //do something
```

templates will gen as their names in DBH class

gen.js:
```js
const props = {
  users: {
    name: "User"
    //...
  format: {
    login: { // method name
      //...
```
your file:
```js
DBH.User.login()
```

# template guide:
see ./example/gen.example.js
