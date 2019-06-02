import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from "http";
import { RouteFunction, HttpMethod, RouteTree } from "./routeTree";
import { RequestContext } from "./requestContext";

export class RequestProcessor {
    private static routes: RouteTree[] = [];

    public static addRoute(method: HttpMethod, route: string, func: RouteFunction) {
        var parts = route.split("/");
        var currentRoutes = RequestProcessor.routes;
        for (let i = 0; i < parts.length; i++) {
            const partName = parts[i];
            let foundRoute: RouteTree | undefined;
            for (const route of currentRoutes) {
                if (route.partName === partName) {
                    currentRoutes = route.subTree;
                    foundRoute = route;
                    break;
                }
            }
            if (!foundRoute) {
                const newRoutePart = new RouteTree(partName);
                newRoutePart.routeFunctions.push({
                    method: method,
                    function: func
                });
                currentRoutes.push(newRoutePart);
                currentRoutes = newRoutePart.subTree;
            } else if (i == parts.length - 1) {
                if (!foundRoute.routeFunctions.map(x => x.method).includes(method)) {
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
    }

    public process = (req: IncomingMessage, res: ServerResponse) => {
        this.parseBody(req)
            .then((bodyString) => {
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
                        } else {
                            var parts = req.url.split("/");
                            if (!parts[0]) {
                                parts.splice(0, 1);
                            }
                            var currentRoutes = RequestProcessor.routes;
                            var selectedRoute: undefined | RouteTree;
                            var requestContext = new RequestContext();
                            requestContext.body = bodyString;
                            for (const part of parts) {
                                let foundRoute = false;
                                for (const route of currentRoutes) {
                                    if (route.partName === part) {
                                        currentRoutes = route.subTree;
                                        selectedRoute = route;
                                        foundRoute = true;
                                        break;
                                    }
                                }
                                if (!foundRoute) {
                                    let variableRoute = currentRoutes.filter(x => x.partName.startsWith(":"))[0]
                                    if (variableRoute) {
                                        requestContext.pathParameters[variableRoute.partName.substr(1)] = part;
                                        currentRoutes = variableRoute.subTree;
                                        selectedRoute = variableRoute;
                                        foundRoute = true;
                                    } else {
                                        console.log("not found");
                                        this.end(res, 404);
                                    }
                                }
                            }

                            if (selectedRoute) {
                                var method: undefined | HttpMethod;
                                method = RequestProcessor.translateToHttpMethod(req.method);
                                const func = selectedRoute.routeFunctions.filter(x => x.method == method)
                                if (func && func.length > 0) {

                                    var response = func[0].function(requestContext);
                                    if (response) {
                                        console.log(response);
                                        this.end(res, 200, response);
                                    }
                                    else {
                                        this.end(res, 200);
                                    }
                                    return;
                                }
                            }
                        }
                    }
                    this.end(res, 404);
                } catch (error) {
                    console.log(error);
                    this.end(res, 400, "An error occurred. I don't know what to do now. Ask someone else. Maybe Mr*s Google. Or simply check some logs.");
                }
            })
            .catch((reason) => {
                console.log(reason);
                this.end(res, 400, "error while parsing body")
            });
    }

    private end = (res: ServerResponse, status: number, response?: string) => {
        var headers: OutgoingHttpHeaders = {};
        headers['Access-Control-Allow-Origin'] = '*';
        if (response) {
            headers['Content-Type'] = 'application/json';
        }

        res.writeHead(status, headers);
        if (response) {
            res.end(response);
        } else {
            res.end();
        }
    }

    private parseBody = (req: IncomingMessage): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (req.method == 'POST' || req.method == 'PUT') {
                var bodyData: Uint8Array[] = [];
                req.on('error', (err) => {
                    console.error(err);
                }).on('data', (chunk) => {
                    bodyData.push(chunk);
                }).on('end', () => {
                    var bodyString = Buffer.concat(bodyData).toString();
                    resolve(bodyString);
                });
            }
            else {
                resolve();
            }
        });
    }

    private static translateToHttpMethod(method: string | undefined) {
        switch (method) {
            case "GET":
                return HttpMethod.GET;
            case "POST":
                return HttpMethod.POST;
            case "PUT":
                return HttpMethod.PUT;
            case "DELETE":
                return HttpMethod.DELETE;
            case "PATCH":
                return HttpMethod.PATCH;
        }
    }

    private static translateFromHttpMethod(method: HttpMethod) {
        switch (method) {
            case HttpMethod.GET:
                return "GET";
            case HttpMethod.POST:
                return "POST";
            case HttpMethod.PUT:
                return "PUT";
            case HttpMethod.DELETE:
                return "DELETE";
            case HttpMethod.PATCH:
                return "PATCH";
        }
    }
}