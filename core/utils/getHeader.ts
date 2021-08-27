import { IHttpRequest } from "../http/IHttpRequest";
import * as _ from "lodash";
import {ICredential} from "../auth/ICredential";

export const getHeader = (request: IHttpRequest, credential: ICredential) => {
    var signer = require('./signer');
    var https = require("https");
    var sig = new signer.Signer();
    sig.Key = credential.getAk();
    sig.Secret = credential.getSk();
    var r = new signer.HttpRequest(request.method, request.endpoint);
    r.headers = {"Content-Type": "application/json", "X-Project-Id": request.pathParams.project_id};
    r.body = JSON.stringify(request.data);
    var opt = sig.Sign(r);
    return opt;
}