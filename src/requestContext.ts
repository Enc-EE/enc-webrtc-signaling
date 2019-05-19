export class RequestContext {
    public pathParameters: { [key: string]: string } = {};
    public queryParameters: { [key: string]: string } = {};
    public body: undefined | string;
}