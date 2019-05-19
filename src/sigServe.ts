import { RequestProcessor } from "./requestProcessor";
import { RequestContext } from "./requestContext";
import { Handshake } from "./models/handshake";
import { HttpMethod } from "./RouteTree";
import { Helper } from "./helper";
import { Model } from "./models/model";
import { Negotiation } from "./models/negotiation";
var fs = require("fs");

export class SigServe {
    private dataFile = "data.json";

    constructor() {
        var data = this.loadData();
        data = new Model();
        this.saveData(data);
        RequestProcessor.addRoute(HttpMethod.POST, 'api/v1/create', this.postCreate);
        RequestProcessor.addRoute(HttpMethod.GET, 'api/v1/connectstart/:client1Id', this.getConnectStart);
        RequestProcessor.addRoute(HttpMethod.POST, 'api/v1/connectstart/:client1Id', this.postConnectStart);

        RequestProcessor.addRoute(HttpMethod.GET, 'api/v1/connectoffer/:client1Id/:connectId', this.getConnectOffer);
        RequestProcessor.addRoute(HttpMethod.PUT, 'api/v1/connectoffer/:client1Id/:connectId', this.putConnectOffer);
        RequestProcessor.addRoute(HttpMethod.GET, 'api/v1/connectanswer/:client1Id/:connectId', this.getConnectAnswer);
        RequestProcessor.addRoute(HttpMethod.PUT, 'api/v1/connectanswer/:client1Id/:connectId', this.putConnectAnswer);
        RequestProcessor.addRoute(HttpMethod.GET, 'api/v1/client1icecandidates/:client1Id/:connectId', this.getClient1IceCandidates);
        RequestProcessor.addRoute(HttpMethod.PUT, 'api/v1/client1icecandidates/:client1Id/:connectId', this.putClient1IceCandidates);
        RequestProcessor.addRoute(HttpMethod.GET, 'api/v1/client2icecandidates/:client1Id/:connectId', this.getClient2IceCandidates);
        RequestProcessor.addRoute(HttpMethod.PUT, 'api/v1/client2icecandidates/:client1Id/:connectId', this.putClient2IceCandidates);
    }

    public postCreate = (requestContext: RequestContext) => {
        var data = this.loadData();
        var server = new Handshake(Helper.generateId(5));
        data.handshakes.push(server);
        this.saveData(data);
        return JSON.stringify({ id: server.client1Id });
    }

    public getConnectStart = (requestContext: RequestContext) => {
        var data = this.loadData();
        const server = data.handshakes.filter(x => x.client1Id === requestContext.pathParameters['client1Id'])[0];
        var connections = server.client2Ids.filter(x => true);
        server.client2Ids = [];
        this.saveData(data);
        return JSON.stringify(connections.map(x => { return { id: x } }));
    }

    public postConnectStart = (requestContext: RequestContext) => {
        var data = this.loadData();
        const server = data.handshakes.filter(x => x.client1Id === requestContext.pathParameters['client1Id'])[0];
        var id = Helper.generateId(5);
        server.client2Ids.push(id);
        this.saveData(data);
        return JSON.stringify({ id: id });
    }

    public getConnectOffer = (requestContext: RequestContext) => {
        var data = this.loadData();
        var client1Id = requestContext.pathParameters['client1Id'];
        var connectId = requestContext.pathParameters['connectId'];
        var negotiationId = client1Id + ":" + connectId;
        const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
        this.saveData(data);
        if (negotiation) {
            return JSON.stringify(negotiation.client1.description);
        }
        return "";
    }

    public putConnectOffer = (requestContext: RequestContext) => {
        if (requestContext.body) {
            var data = this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            const negotiation = new Negotiation(negotiationId);
            negotiation.client1.description = JSON.parse(requestContext.body);
            data.negotiations.push(negotiation);
            this.saveData(data);
        }
        return "";
    }

    public getConnectAnswer = (requestContext: RequestContext) => {
        var data = this.loadData();
        var client1Id = requestContext.pathParameters['client1Id'];
        var connectId = requestContext.pathParameters['connectId'];
        var negotiationId = client1Id + ":" + connectId;
        const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
        return JSON.stringify(negotiation.client2.description);
    }

    public putConnectAnswer = (requestContext: RequestContext) => {
        if (requestContext.body) {
            var data = this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
            negotiation.client2.description = JSON.parse(requestContext.body);
            this.saveData(data);
        }
        return "";
    }

    public getClient1IceCandidates = (requestContext: RequestContext) => {
        var data = this.loadData();
        var client1Id = requestContext.pathParameters['client1Id'];
        var connectId = requestContext.pathParameters['connectId'];
        var negotiationId = client1Id + ":" + connectId;
        const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
        var response = JSON.stringify(negotiation.client1.candidates);
        negotiation.client2.candidates = [];
        this.saveData(data);
        return response;
    }

    public putClient1IceCandidates = (requestContext: RequestContext) => {
        if (requestContext.body) {
            var data = this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
            negotiation.client1.candidates.push(JSON.parse(requestContext.body));
            this.saveData(data);
        }
        return "";
    }

    public getClient2IceCandidates = (requestContext: RequestContext) => {
        var data = this.loadData();
        var client1Id = requestContext.pathParameters['client1Id'];
        var connectId = requestContext.pathParameters['connectId'];
        var negotiationId = client1Id + ":" + connectId;
        const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
        var response = JSON.stringify(negotiation.client2.candidates);
        negotiation.client2.candidates = [];
        this.saveData(data);
        return response;
    }

    public putClient2IceCandidates = (requestContext: RequestContext) => {
        if (requestContext.body) {
            var data = this.loadData();
            var client1Id = requestContext.pathParameters['client1Id'];
            var connectId = requestContext.pathParameters['connectId'];
            var negotiationId = client1Id + ":" + connectId;
            const negotiation = data.negotiations.filter(x => x.negotiationId === negotiationId)[0];
            negotiation.client2.candidates.push(JSON.parse(requestContext.body));
            this.saveData(data);
        }
        return "";
    }

    private saveData = (data: Model) => {
        fs.writeFileSync(this.dataFile, JSON.stringify(data));
    }

    private loadData = () => {
        let data: Model = new Model();
        if (fs.existsSync(this.dataFile)) {
            data = JSON.parse(fs.readFileSync(this.dataFile));
        }
        return data;
    }
}