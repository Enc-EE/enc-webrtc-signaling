import { RequestContext } from "./requestContext";

export class RouteTree {
    constructor(public partName: string) { }
    public routeFunctions: { method: HttpMethod, function: RouteFunction }[] = [];
    public subTree: RouteTree[] = [];
}

export type RouteFunction = (requestContext: RequestContext) => string;

export enum HttpMethod {
    GET,
    POST,
    PUT,
    DELETE,
    PATCH
}