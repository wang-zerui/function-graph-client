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

export class SignerUtil {
    constructor() { } 
    // 返回请求的绝对路径
    static checkUrl(method: string, url: string) {
        // if (method === "GET") {
        //     return this.getUrl(url) + "/";
        // } else {
        //     return this.getUrl(url) + "/";
        // }
        return this.getUrl(url) + "/";
    }
    static getUrl(url: string) {
        var arrUrl = url.split("//");

        var start = arrUrl[1].indexOf("/");
        var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符

        if (relUrl.indexOf("?") != -1) {
            relUrl = relUrl.split("?")[0];
        }
        return relUrl;
    }
    static getErr(obj: any) {
        return {
            getHttpCode: () => {
                return obj.status
            },
            getErrorCode: () => {
                let code = '';
                if (obj.error_code) {
                    code = obj.error_code
                } else if (obj.code) {
                    code = obj.code
                } else {
                    for (let key in obj) {
                        if (obj[key].code) {
                            code = obj[key].code
                        }
                    }
                }
                return code
            },
            getErrorMessage: () => {
                let mes = '';
                if (obj.error_msg) {
                    mes = obj.error_msg
                } else if (obj.message) {
                    mes = obj.message
                } else {
                    for (let key in obj) {
                        if (obj[key].message) {
                            mes = obj[key].message
                        }
                    }
                }
                return mes
            }
        }
    }
}
