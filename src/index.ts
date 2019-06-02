import { RequestProcessor } from "./requestProcessor";
import { SigServe } from "./sigServe";

var http = require('http');

var port = process.env.PORT || 1337;

var requestProcessor = new RequestProcessor();
var sigServe = new SigServe();
http.createServer(requestProcessor.process).listen(port)
