# Journey Tracker Backend

This is the backend part of Journey Tracker. 

## How to use

Clone this repo. Install all dependencies. Then make a .env file to contain the token secret used by JWT. The secret is a random string, you can generate it with

```javascript
require("crypto").randomBytes(64).toString("hex");
```

Copy and paste it into the .env file. The env file should look like this:

```bash
TOKEN_SECRET=6d96ef165435afce423bd828c300daae82feeb60d525d90882df34b296ef71b667af907246eba3beff663e0eb483bbe1f46282c5efcbf3a1a6adc67a1d5c45dc
```

You should keep this .env file safely on your server.

Install and run MongoDB.

Last step, run

```bash
node app.mjs
```

