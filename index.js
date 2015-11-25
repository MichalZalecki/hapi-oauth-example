require('dotenv').load({ path: `./.env.${process.env.NODE_ENV || "development"}` });
require("babel-core/register");
require("./server.js");
