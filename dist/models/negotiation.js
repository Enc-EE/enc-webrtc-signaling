"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connectionWorkflowClient_1 = require("./connectionWorkflowClient");
var Negotiation = /** @class */ (function () {
    function Negotiation(negotiationId) {
        this.negotiationId = negotiationId;
        this.client1 = new connectionWorkflowClient_1.ConnectionWorkflowClient();
        this.client2 = new connectionWorkflowClient_1.ConnectionWorkflowClient();
    }
    return Negotiation;
}());
exports.Negotiation = Negotiation;
