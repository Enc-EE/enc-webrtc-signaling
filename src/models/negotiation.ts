import { ConnectionWorkflowClient } from "./connectionWorkflowClient";

export class Negotiation {
    constructor(public negotiationId: string) { }
    public client1: ConnectionWorkflowClient = new ConnectionWorkflowClient();
    public client2: ConnectionWorkflowClient = new ConnectionWorkflowClient();
}