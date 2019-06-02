"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestProcessor_1 = require("./requestProcessor");
var sigServe_1 = require("./sigServe");
var http = require('http');
var port = process.env.PORT || 1337;
var requestProcessor = new requestProcessor_1.RequestProcessor();
var sigServe = new sigServe_1.SigServe();
http.createServer(requestProcessor.process).listen(port);
