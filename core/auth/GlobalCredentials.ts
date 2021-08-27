/*
 * Copyright 2020 Huawei Technologies Co.,Ltd.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ICredential } from "./ICredential";
import { IHttpRequest } from "../http/IHttpRequest";
import { AKSKSigner } from "./AKSKSigner";
import { HttpRequestBuilder } from "../http/IHttpRequestBuilder";
import extend from "extend";
import { RequiredError } from "./AKSKSigner";

export class GlobalCredentials implements ICredential {
    private ak: string | undefined;
    private sk: string | undefined;
    private securityToken: string | undefined;
    private domainId: string | undefined;

    public withAk(ak: string | undefined): GlobalCredentials {
        this.ak = ak;
        return this;
    }

    public withSk(sk: string | undefined): GlobalCredentials {
        this.sk = sk;
        return this;
    }

    public withDomainId(domainId: string | undefined): GlobalCredentials {
        this.domainId = domainId;
        return this;
    }

    public withSecurityToken(securityToken: string | undefined): GlobalCredentials {
        this.securityToken = securityToken;
        return this;
    }

    public getAk(): string | undefined {
        return this.ak;
    }
    public getSk(): string | undefined {
        return this.sk;
    }

    public getPathParams() {
        const pathParams = {};
        if (this.domainId) {
            extend(pathParams, { domain_id: this.domainId });
        }
        return pathParams;
    }
    public processAuthRequest(httpRequest: IHttpRequest): IHttpRequest {

        if (this.ak === null || this.ak === undefined) {
            throw new RequiredError('AK cannot be empty or undefined.');
        }
        if (this.sk === null || this.sk === undefined) {
            throw new RequiredError('SK cannot be empty or undefined.');
        }

        const builder = new HttpRequestBuilder();
        builder.addPathParams(this.getPathParams());

        // 替换所有的path参数
        if (this.domainId) {
            let url = parsePath(httpRequest.endpoint, this.getPathParams());
            builder.withEndpoint(url);
        }

        if (this.domainId) {
            builder.addHeaders("X-Domain-Id", this.domainId);
        }

        if (this.securityToken) {
            builder.addHeaders("X-Security-Token", this.securityToken);
        }

        // builder.addHeaders("Content-Type", "application/json");
        builder.addAllHeaders(httpRequest.headers);
        extend(httpRequest, builder.build());
        const headers = AKSKSigner.sign(httpRequest, this);

        builder.addAllHeaders(headers);

        return extend(httpRequest, builder.build());
    }
}

function parsePath(path: string | undefined, params: any): string {
    if (!path || !params) {
        return <string>path;
    }
    return Object.keys(params).reduce((parsedPath, param) => {
        const value = encodeURIComponent(params[param]);
        return parsedPath.replace(new RegExp(`{${param}}`), value);
    }, path);
}