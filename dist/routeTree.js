"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RouteTree = /** @class */ (function () {
    function RouteTree(partName) {
        this.partName = partName;
        this.routeFunctions = [];
        this.subTree = [];
    }
    return RouteTree;
}());
exports.RouteTree = RouteTree;
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["GET"] = 0] = "GET";
    HttpMethod[HttpMethod["POST"] = 1] = "POST";
    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
    HttpMethod[HttpMethod["PATCH"] = 4] = "PATCH";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
