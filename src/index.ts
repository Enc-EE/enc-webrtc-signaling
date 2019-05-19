import { IncomingMessage, ServerResponse } from "http";
import { RequestProcessor } from "./requestProcessor";
import { SigServe } from "./sigServe";

var http = require('http');
var fs = require("fs");
var url = require('url');
var fileName = 'data.json';

var port = process.env.PORT || 1337;
// Compress-Archive -Path * -DestinationPath myAppFiles.zip

var requestProcessor = new RequestProcessor();
var sigServe = new SigServe();
http.createServer(requestProcessor.process).listen(port)

// http.createServer(function (req: IncomingMessage, res: ServerResponse) {
//     if (req.method == 'POST') {
//         var body: Uint8Array[] = [];
//         req.on('error', (err) => {
//             console.error(err);
//         }).on('data', (chunk) => {
//             body.push(chunk);
//         }).on('end', () => {
//             var bodyString = Buffer.concat(body).toString();
//             var requestData = body;
//             try {
//                 var requestData = JSON.parse(bodyString);
//             } catch (error) {
//                 trace(requestData);
//                 trace("parse error");
//                 trace("data: " + body);
//             }
//             processRequest(req, res, requestData);
//         });
//     } else {
//         processRequest(req, res);
//     }

// }).listen(port);

// trace('listening on port ' + port);


// // server -> create server POST create
// // client -> create connect POST connect
// // server -> create offer with desc GET connect POST connections
// // client -> create answer with desc GET connections

// var sampleEntry = {
//     server: "server",
//     connect: "id",
//     connections: [
//         {
//             id: "id",
//             server: {
//                 desc: "desc",
//                 candidates: [
//                     "can",
//                     "can"
//                 ]
//             },
//             client: {
//                 desc: "desc",
//                 candidates: [
//                     "can",
//                     "can"
//                 ]
//             }
//         }
//     ]
// }

// function processRequest(req, res, reqData) {
//     var urlObject = url.parse(req.url, true)
//     var queryParts = urlObject.pathname.split('/');
//     trace(req.method + ": " + urlObject.pathname);

//     var data = loadData();
//     var response;
//     var status = 200;

//     if (queryParts[1] == "v1") {
//         queryParts.splice(1, 1);
//         if (queryParts.length == 3) {
//             var action = queryParts[1];
//             var serverId = queryParts[2];
//             if (action && serverId) {
//                 var server = getServer(data, serverId);

//                 if (req.method == 'POST' && action == 'create') {
//                     trace("creating server");
//                     data.push({
//                         server: serverId,
//                         connect: null,
//                         connections: []
//                     });
//                     saveData(data);
//                 } else if (req.method == 'GET' && action == 'connectstart') {
//                     if (server.connect) {
//                         response = server.connect;
//                         server.connect = null;
//                         saveData(data);
//                     } else {
//                         status = 400;
//                         response = "no connection";
//                     }
//                 } else {
//                     status = 400;
//                     response = "error";
//                 }
//             } else {
//                 status = 400;
//                 response = "missing values";
//             }
//         } else if (queryParts.length == 4) {
//             var action = queryParts[1];
//             var serverId = queryParts[2];
//             var connectionId = queryParts[3];

//             var server = getServer(data, serverId);

//             if (action && serverId && server && connectionId) {
//                 var connection = getServerConnection(server, connectionId);

//                 if (req.method == 'POST' && action == 'connectstart') {
//                     if (!server.connect && !connection) {
//                         server.connect = connectionId;
//                         saveData(data);
//                     } else {
//                         status = 400;
//                         response = "not accepted";
//                     }
//                 } else if (req.method == 'POST' && action == 'connectoffer') {
//                     if (!connection && reqData) {
//                         server.connections.push({
//                             id: connectionId,
//                             server: {
//                                 desc: reqData,
//                                 candidates: []
//                             },
//                             client: {
//                                 desc: null,
//                                 candidates: []
//                             }
//                         })
//                         saveData(data);
//                     } else {
//                         status = 400;
//                         response = "connection already exists";
//                     }
//                 } else if (req.method == 'GET' && action == 'connectoffer') {
//                     if (connection) {
//                         response = connection.server.desc;
//                     } else {
//                         status = 400;
//                         response = "connection not existing";
//                     }
//                 } else if (req.method == 'POST' && action == 'connectanswer') {
//                     if (connection && reqData) {
//                         connection.client.desc = reqData;
//                         saveData(data);
//                     } else {
//                         status = 400;
//                         response = "connection or data not existing";
//                     }
//                 } else if (req.method == 'GET' && action == 'connectanswer') {
//                     if (connection && connection.client.desc) {
//                         response = connection.client.desc;
//                     } else {
//                         status = 400;
//                         response = "connection not existing";
//                     }
//                 } else if (req.method == 'POST' && action == 'servercandidate') {
//                     if (connection && reqData) {
//                         var candidate = getCandidate(connection.server.candidates, reqData);
//                         if (!candidate) {
//                             connection.server.candidates.push(reqData);
//                             saveData(data);
//                         }
//                     } else {
//                         status = 400;
//                         response = "connection or data not existing";
//                     }
//                 } else if (req.method == 'GET' && action == 'servercandidate') {
//                     if (connection) {
//                         response = connection.server.candidates;
//                     } else {
//                         status = 400;
//                         response = "connection not existing";
//                     }
//                 } else if (req.method == 'POST' && action == 'clientcandidate') {
//                     if (connection && reqData) {
//                         var candidate = getCandidate(connection.client.candidates, reqData);
//                         if (!candidate) {
//                             connection.client.candidates.push(reqData);
//                             saveData(data);
//                         }
//                     } else {
//                         status = 400;
//                         response = "connection or data not existing";
//                     }
//                 } else if (req.method == 'GET' && action == 'clientcandidate') {
//                     if (connection) {
//                         response = connection.client.candidates;
//                     } else {
//                         status = 400;
//                         response = "connection not existing";
//                     }
//                 } else {
//                     status = 400;
//                     response = "error";
//                 }
//             } else {
//                 status = 400;
//                 response = "missing values";
//             }
//         } else {
//             status = 400;
//             response = "invalid path";
//         }
//     }

//     trace("responding " + status);
//     res.writeHead(status, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': 'http://localhost:8080' });
//     res.end(status == 200 && response ? JSON.stringify(response) : response);
// }


// function getServer(data, serverId) {
//     for (let i = 0; i < data.length; i++) {
//         const entry = data[i];
//         if (entry.server == serverId) {
//             return entry;
//         }
//     }
// }

// function getServerConnection(server, connectionId) {
//     for (let i = 0; i < server.connections.length; i++) {
//         const entry = server.connections[i];
//         if (entry.id == connectionId) {
//             return entry;
//         }
//     }
// }

// function trace(message) {
//     console.log(new Date().toISOString() + ": " + message);
//     fs.appendFileSync('log.txt', "\n" + new Date().toISOString() + ": " + message);
// }

// function getCandidate(candidates, newCandidate) {
//     for (let i = 0; i < candidates.length; i++) {
//         const candidate = candidates[i];
//         if (candidate == newCandidate) {
//             return candidate;
//         }
//     }
// }