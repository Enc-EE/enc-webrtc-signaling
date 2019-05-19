import { Handshake } from "./handshake";
import { Negotiation } from "./negotiation";

export class Model {
    public handshakes: Handshake[] = [];
    public negotiations: Negotiation[] = [];
}