"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Helper = /** @class */ (function () {
    function Helper() {
    }
    Helper.generateId = function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return Helper;
}());
exports.Helper = Helper;
