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

import { SdkException } from "./SdkException";

export class ServiceResponseException extends SdkException {
    private httpStatusCode: string | number;
    private errorMsg: string;
    private errorCode: string;
    private requestId: string;

    constructor(httpStatusCode: string | number, errorMsg: string, errorCode: string, requestId: string) {
        super();
        this.name = 'ServiceResponseException';
        this.httpStatusCode = httpStatusCode;
        this.errorMsg = errorMsg;
        this.errorCode = errorCode;
        this.requestId = requestId;
    }
}