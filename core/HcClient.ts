import { HttpClient } from "./http/HttpClient";
import { ICredential } from "./auth/ICredential";
import { IHttpRequest } from "./http/IHttpRequest";
import { HttpRequestBuilder } from "./http/IHttpRequestBuilder";
import { SdkResponse } from "./SdkResponse";
import { ExceptionUtil } from "./exception/ExceptionUtil";
import { getLogger, Logger, LogLevel } from './logger';
import { DefaultHttpResponse } from "./http/DefaultHttpResponse";
import { ClientRequest } from "http"

export class HcClient {
    private httpClient: HttpClient;
    private endpoint: string | undefined;
    private credential: ICredential | undefined;
    private proxyAgent: string = '';
    private static loggerName = 'HcClient';
    private logger: Logger;

    public constructor(client: HttpClient) {
        this.httpClient = client;

        // Logging
        this.logger = getLogger(HcClient.loggerName, LogLevel.INFO);
        this.logger.debug('initialized');
    }

    public withEndpoint(endpoint: string | undefined): HcClient {
        this.endpoint = endpoint;
        return this;
    }

    public withCredential(credential: ICredential | undefined): HcClient {
        this.credential = credential;
        return this;
    }

    public withHttpsAgent(proxyAgent: string) {
        this.proxyAgent = proxyAgent;
        return this;
    }

    public sendRequest<T extends SdkResponse>(options: any): Promise<T> | Promise<any> {
        this.logger.debug('send request');

        const request = this.buildRequest(options);
        
        // @ts-ignore
        return this.httpClient.sendRequest<T>(request).then(res => {
            return this.extractResponse<T>(res);
        }, err => {
            return ExceptionUtil.generalException(err);
        });
    }

    private buildRequest(options: any): IHttpRequest {
        let url = this.endpoint + options.url;
        const pathParams = options.pathParams;
        Object.keys(pathParams).forEach(x => {
            url = url.replace("{" + x + "}", pathParams[x]);
        });

        const builder = new HttpRequestBuilder();
        let httpRequest = builder
            .withEndpoint(url)
            .withHeaders(options.headers)
            .withMethod(options.method)
            .withPathParams(options.pathParams)
            .withData(options.data)
            .withQueryParams(options.queryParams)
            .build();

        // @ts-ignore
        httpRequest = this.credential.processAuthRequest(httpRequest);
        if (options['responseHeaders']) {
            httpRequest['responseHeaders'] = options['responseHeaders'];
        }
        httpRequest.proxy = this.proxyAgent;
        return httpRequest;
    }

    private extractResponse<T extends SdkResponse>(result: DefaultHttpResponse<T>): T {
        const headers = result.headers;
        let contentType = headers['content-type'];
        contentType = contentType.toLowerCase();
        if (contentType && contentType == 'application/octet-stream') {
            return result.data as T;
        } else {
            let response = result.data instanceof Object ? result.data : {} as T;
            let sdkRespone = response as SdkResponse;
            sdkRespone.httpStatusCode = result.statusCode;

            return response;
        }
    }
}