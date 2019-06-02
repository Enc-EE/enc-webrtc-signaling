"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestProcessor_1 = require("./requestProcessor");
var handshake_1 = require("./models/handshake");
var RouteTree_1 = require("./RouteTree");
var helper_1 = require("./helper");
var model_1 = require("./models/model");
var negotiation_1 = require("./models/negotiation");
var fs = require("fs");
var SigServe = /** @class */ (function () {
    function SigServe() {
        var _this = this;
        this.dataFile = "data.json";
        this.postCreate = function (requestContext) {
            var data = _this.loadData();
            var server = new handshake_1.Handshake(helper_1.Helper.generateId(5));
            data.handshakes.push(server);
            _this.saveData(data);
            return JSON.stringify({ id: server.client1Id });
        };
        this.getConnectStart = function (requestContext) {
            var data = _this.loadData();
            var server = data.handshakes.filter(function (x) { return x.client1Id === requestContext.pathParameters['client1Id']; })[0];
            var connections = server.client2Ids.filter(function (x) { return true; });
            server.client2Ids = [];
            _this.saveData(data);
            return JSON.stringify(connections.map(function (x) { return { id: x }; }));
        };
        this.postConnectStart = function (requestContext) {
            var data = _this.loadData();
            var server = data.handshakes.filter(function (x) { return x.client1Id === requestContext.pathParameters['client1Id']; })[0];
            var id = helper_1.Helper.generateId(5);
            server.client2Ids.push(id);
            _this.saveData(data);
            return JSON.stringify({ id: id });
        };
        this.getConnectOffer = function (requestContext) {
            var data = _this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
            _this.saveData(data);
            if (negotiation) {
                return JSON.stringify(negotiation.client1.description);
            }
            return "";
        };
        this.putConnectOffer = function (requestContext) {
            if (requestContext.body) {
                var data = _this.loadData();
                var client1Id = requestContext.pathParameters['client1Id'];
                var connectId = requestContext.pathParameters['connectId'];
                var negotiationId = client1Id + ":" + connectId;
                var negotiation = new negotiation_1.Negotiation(negotiationId);
                negotiation.client1.description = JSON.parse(requestContext.body);
                data.negotiations.push(negotiation);
                _this.saveData(data);
            }
            return "";
        };
        this.getConnectAnswer = function (requestContext) {
            var data = _this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
            return JSON.stringify(negotiation.client2.description);
        };
        this.putConnectAnswer = function (requestContext) {
            if (requestContext.body) {
                var data = _this.loadData();
                var client1Id = requestContext.pathParameters['client1Id'];
                var connectId = requestContext.pathParameters['connectId'];
                var negotiationId = client1Id + ":" + connectId;
                var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
                negotiation.client2.description = JSON.parse(requestContext.body);
                _this.saveData(data);
            }
            return "";
        };
        this.getClient1IceCandidates = function (requestContext) {
            var data = _this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
            var response = JSON.stringify(negotiation.client1.candidates);
            negotiation.client2.candidates = [];
            _this.saveData(data);
            return response;
        };
        this.putClient1IceCandidates = function (requestContext) {
            if (requestContext.body) {
                var data = _this.loadData();
                var client1Id = requestContext.pathParameters['client1Id'];
                var connectId = requestContext.pathParameters['connectId'];
                var negotiationId = client1Id + ":" + connectId;
                var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
                negotiation.client1.candidates.push(JSON.parse(requestContext.body));
                _this.saveData(data);
            }
            return "";
        };
        this.getClient2IceCandidates = function (requestContext) {
            var data = _this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
            var response = JSON.stringify(negotiation.client2.candidates);
            negotiation.client2.candidates = [];
            _this.saveData(data);
            return response;
        };
        this.putClient2IceCandidates = function (requestContext) {
            if (requestContext.body) {
                var data = _this.loadData();
                var client1Id = requestContext.pathParameters['client1Id'];
                var connectId = requestContext.pathParameters['connectId'];
                var negotiationId = client1Id + ":" + connectId;
                var negotiation = data.negotiations.filter(function (x) { return x.negotiationId === negotiationId; })[0];
                negotiation.client2.candidates.push(JSON.parse(requestContext.body));
                _this.saveData(data);
            }
            return "";
        };
        this.saveData = function (data) {
            fs.writeFileSync(_this.dataFile, JSON.stringify(data));
        };
        this.loadData = function () {
            var data = new model_1.Model();
            if (fs.existsSync(_this.dataFile)) {
                data = JSON.parse(fs.readFileSync(_this.dataFile));
            }
            return data;
        };
        var data = this.loadData();
        data = new model_1.Model();
        this.saveData(data);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.POST, 'api/v1/create', this.postCreate);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.GET, 'api/v1/connectstart/:client1Id', this.getConnectStart);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.POST, 'api/v1/connectstart/:client1Id', this.postConnectStart);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.GET, 'api/v1/connectoffer/:client1Id/:connectId', this.getConnectOffer);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.PUT, 'api/v1/connectoffer/:client1Id/:connectId', this.putConnectOffer);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.GET, 'api/v1/connectanswer/:client1Id/:connectId', this.getConnectAnswer);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.PUT, 'api/v1/connectanswer/:client1Id/:connectId', this.putConnectAnswer);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.GET, 'api/v1/client1icecandidates/:client1Id/:connectId', this.getClient1IceCandidates);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.PUT, 'api/v1/client1icecandidates/:client1Id/:connectId', this.putClient1IceCandidates);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.GET, 'api/v1/client2icecandidates/:client1Id/:connectId', this.getClient2IceCandidates);
        requestProcessor_1.RequestProcessor.addRoute(RouteTree_1.HttpMethod.PUT, 'api/v1/client2icecandidates/:client1Id/:connectId', this.putClient2IceCandidates);
    }
    return SigServe;
}());
exports.SigServe = SigServe;
