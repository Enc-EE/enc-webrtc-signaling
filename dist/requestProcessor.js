"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var routeTree_1 = require("./routeTree");
var requestContext_1 = require("./requestContext");
var RequestProcessor = /** @class */ (function () {
    function RequestProcessor() {
        var _this = this;
        this.process = function (req, res) {
            _this.parseBody(req)
                .then(function (bodyString) {
                try {
                    if (req.url) {
                        console.log(req.method + " " + req.url);
                        if (req.method === "OPTIONS") {
                            res.writeHead(200, {
                                // 'Content-Type': 'text/plain',
                                'Access-Control-Allow-Origin': '*',
                                // 'Access-Control-Allow-Headers': 'Authorization',
                                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
                            });
                            res.end();
                        }
                        else {
                            var parts = req.url.split("/");
                            if (!parts[0]) {
                                parts.splice(0, 1);
                            }
                            var currentRoutes = RequestProcessor.routes;
                            var selectedRoute;
                            var requestContext = new requestContext_1.RequestContext();
                            requestContext.body = bodyString;
                            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                                var part = parts_1[_i];
                                var foundRoute = false;
                                for (var _a = 0, currentRoutes_1 = currentRoutes; _a < currentRoutes_1.length; _a++) {
                                    var route = currentRoutes_1[_a];
                                    if (route.partName === part) {
                                        currentRoutes = route.subTree;
                                        selectedRoute = route;
                                        foundRoute = true;
                                        break;
                                    }
                                }
                                if (!foundRoute) {
                                    var variableRoute = currentRoutes.filter(function (x) { return x.partName.startsWith(":"); })[0];
                                    if (variableRoute) {
                                        requestContext.pathParameters[variableRoute.partName.substr(1)] = part;
                                        currentRoutes = variableRoute.subTree;
                                        selectedRoute = variableRoute;
                                        foundRoute = true;
                                    }
                                    else {
                                        console.log("not found");
                                        _this.end(res, 404);
                                    }
                                }
                            }
                            if (selectedRoute) {
                                var method;
                                method = RequestProcessor.translateToHttpMethod(req.method);
                                var func = selectedRoute.routeFunctions.filter(function (x) { return x.method == method; });
                                if (func && func.length > 0) {
                                    var response = func[0].function(requestContext);
                                    if (response) {
                                        console.log(response);
                                        _this.end(res, 200, response);
                                    }
                                    else {
                                        _this.end(res, 200);
                                    }
                                    return;
                                }
                            }
                        }
                    }
                    _this.end(res, 404);
                }
                catch (error) {
                    console.log(error);
                    _this.end(res, 400, "An error occurred. I don't know what to do now. Ask someone else. Maybe Mr*s Google. Or simply check some logs.");
                }
            })
                .catch(function (reason) {
                console.log(reason);
                _this.end(res, 400, "error while parsing body");
            });
        };
        this.end = function (res, status, response) {
            var headers = {};
            headers['Access-Control-Allow-Origin'] = 'http://localhost:8080';
            if (response) {
                headers['Content-Type'] = 'application/json';
            }
            res.writeHead(status, headers);
            if (response) {
                res.end(response);
            }
            else {
                res.end();
            }
        };
        this.parseBody = function (req) {
            return new Promise(function (resolve, reject) {
                if (req.method == 'POST' || req.method == 'PUT') {
                    var bodyData = [];
                    req.on('error', function (err) {
                        console.error(err);
                    }).on('data', function (chunk) {
                        bodyData.push(chunk);
                    }).on('end', function () {
                        var bodyString = Buffer.concat(bodyData).toString();
                        resolve(bodyString);
                    });
                }
                else {
                    resolve();
                }
            });
        };
    }
    RequestProcessor.addRoute = function (method, route, func) {
        var parts = route.split("/");
        var currentRoutes = RequestProcessor.routes;
        for (var i = 0; i < parts.length; i++) {
            var partName = parts[i];
            var foundRoute = void 0;
            for (var _i = 0, currentRoutes_2 = currentRoutes; _i < currentRoutes_2.length; _i++) {
                var route_1 = currentRoutes_2[_i];
                if (route_1.partName === partName) {
                    currentRoutes = route_1.subTree;
                    foundRoute = route_1;
                    break;
                }
            }
            if (!foundRoute) {
                var newRoutePart = new routeTree_1.RouteTree(partName);
                newRoutePart.routeFunctions.push({
                    method: method,
                    function: func
                });
                currentRoutes.push(newRoutePart);
                currentRoutes = newRoutePart.subTree;
            }
            else if (i == parts.length - 1) {
                if (!foundRoute.routeFunctions.map(function (x) { return x.method; }).includes(method)) {
                    foundRoute.routeFunctions.push({
                        method: method,
                        function: func
                    });
                }
                else {
                    console.log("skipping route " + RequestProcessor.translateFromHttpMethod(method) + " " + route + " because of duplicate");
                }
            }
        }
        console.log("added route " + RequestProcessor.translateFromHttpMethod(method) + " " + route);
    };
    RequestProcessor.translateToHttpMethod = function (method) {
        switch (method) {
            case "GET":
                return routeTree_1.HttpMethod.GET;
            case "POST":
                return routeTree_1.HttpMethod.POST;
            case "PUT":
                return routeTree_1.HttpMethod.PUT;
            case "DELETE":
                return routeTree_1.HttpMethod.DELETE;
            case "PATCH":
                return routeTree_1.HttpMethod.PATCH;
        }
    };
    RequestProcessor.translateFromHttpMethod = function (method) {
        switch (method) {
            case routeTree_1.HttpMethod.GET:
                return "GET";
            case routeTree_1.HttpMethod.POST:
                return "POST";
            case routeTree_1.HttpMethod.PUT:
                return "PUT";
            case routeTree_1.HttpMethod.DELETE:
                return "DELETE";
            case routeTree_1.HttpMethod.PATCH:
                return "PATCH";
        }
    };
    RequestProcessor.routes = [];
    return RequestProcessor;
}());
exports.RequestProcessor = RequestProcessor;
