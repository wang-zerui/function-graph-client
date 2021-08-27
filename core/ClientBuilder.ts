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

import { HcClient } from "./HcClient";
import { ICredential } from "./auth/ICredential";
import { DefaultHttpClient } from "./http/DefaultHttpClient";
import extend from 'extend';
import { RequiredError } from "./auth/AKSKSigner";
import { BasicCredentials } from "./auth/BasicCredentials";
import { GlobalCredentials } from "./auth/GlobalCredentials";
const path = require('path');

interface CredParams {
    ak?: string;
    sk?: string,
    project_id?: string,
    domain_id?: string,
}
export class ClientBuilder<T> {
    private init: Function;
    private endpoint: string | undefined;
    private credential: ICredential | undefined;
    private proxyAgent: string | undefined;
    public credentialType: string[] = ["BasicCredentials", "GlobalCredentials"];
    public envParams: CredParams = process.env;

    public constructor(init: (hcClient: HcClient) => T, credentialType?: string) {
        this.init = init;
        if (credentialType !== null && credentialType !== undefined) {
            this.credentialType = credentialType.split(",");
        }
    }

    public withEndpoint(endpoint: string): ClientBuilder<T> {
        this.endpoint = endpoint;
        return this;
    }

    public withCredential(credential?: ICredential): ClientBuilder<T> {
        this.credential = credential;
        return this;
    }

    public withProxyAgent(proxyAgent: string): ClientBuilder<T> {
        this.proxyAgent = proxyAgent;
        return this;
    }

    public build(): T {
        const axiosOptions = {
            disableSslVerification: true
        };
        if (this.proxyAgent) {
            extend(axiosOptions, { proxyAgent: this.proxyAgent });
        }

        if (this.credential === null || this.credential === undefined) {
            this.credential = this.getCredentialFromEnvironment();
        } 
        
        const client = new DefaultHttpClient(axiosOptions);
        const hcClient = new HcClient(client);
        hcClient.withEndpoint(this.endpoint).withCredential(this.credential);
        return this.init(hcClient);
    }

    public getCredentialFromEnvironment(): ICredential {
        const sdkType: any = process.env.HUAWEICLOUD_SDK_TYPE;
        const credentialTYPE = this.whichCredential(sdkType)
        return this.getInputParamCredential(credentialTYPE, this.envParams);
        // 从环境变量获取 HUAWEICLOUD_SDK_TYPE 
        // 环境变量里没有则使用 credentialType[0]
        // 生成credential实体
        // 从环境变量获取 AK SK projectId/domainId 进行赋值， 如果环境变量是GlobalCredentials，则赋值domainId
        // 返回Credentials
    }

    public whichCredential(sdkType: string) {
        let credentialTYPE;
        if (sdkType) {
            switch (sdkType) {
                case 'BasicCredentials':
                    credentialTYPE = new BasicCredentials();
                    break;
                case 'GlobalCredentials':
                    credentialTYPE = new GlobalCredentials();
                    break;
                default:
                    const obj = {}; 
                    const definedCredPath = path.join(this.init().getPath(), `${sdkType}`);
                    if (!obj[sdkType]) {
                        credentialTYPE = require(definedCredPath);
                        // 多加一层
                        obj[sdkType] = credentialTYPE[sdkType];
                    }
                    credentialTYPE = new obj[sdkType]();
                    break;
            }
        } else {
            // 默认是basic
            credentialTYPE = new BasicCredentials();
        }
        return credentialTYPE;
    }

    public getInputParamCredential(CredentialsType: any, credential: CredParams) {
        // 判断是否有_
        let hash = {};
        for (let key in credential) {
            if (key.indexOf("HUAWEICLOUD_SDK_") == 0) {
                const value = credential[key]
                key = key.substring(16);
                if (key.indexOf('_') == -1) {
                    key = key.toLowerCase();
                    key = 'with' + key.charAt(0).toUpperCase() + key.slice(1);
                } else {
                    const arr = key.split('_').map(item => {
                        item = item.toLowerCase();
                        return item.charAt(0).toUpperCase() + item.slice(1);
                    })
                    if (Array.isArray(arr)) {
                        key = 'with' + arr.join("");
                    }
                }
                hash[key] = value
            }
        }
        credential = hash;
        for (const key in credential) {
            if (CredentialsType[key]) {
                CredentialsType[key](credential[key]);
            }
        }
        return CredentialsType;
    }

}