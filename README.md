# before use:

first you need to create template in ./gen.js or create it anywhere and input as first param to .init() method `DBH.init(myTemplate)` (example template in example folder)

then input MongoDB data in ./config.json

# integrate it to project:

```js
DBH.init().then(() => { //do something })
```

templates will gen as their names in DBH class

gen.js:
```js
const props = {
  users: {
    name: "User"
    //...
  format: [
    {
      name: "login"
      //...
```
your file:
```js
DBH.User.login()
```

# template guide:
see ./example/gen.example.js
