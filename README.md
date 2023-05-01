# what is it?
DBH is a powerfull library for creating methods to work with MongoDB

I am using it myself in [API](https://api.happy.tatar) for my site. It is very fast and simple to understand.

If you don't like to check every param from http requests, DBH has good instruments to check your params values and types. It will't able you to make mistake and save wrong data.

Also you can write your own errors names if you don't like DBH default error names

It using config params and creating methods from templates

Full guide on [my site](https://happy.tatar/instruments/DBH)

# example
```js
// req.body.auth - jwt token
DBH.User.postJWT(req.body.auth).then(user => {
  DBH.User.login(user).then(User => {
      User.name = "John"
      User.surname = "Doe"
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

# errors:
please contact me on Discord (in profile page)
