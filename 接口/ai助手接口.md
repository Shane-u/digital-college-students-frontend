---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# 聊天控制器

## POST 流式聊天接口

POST /chat/completions/stream

使用Server-Sent Events (SSE) 实现流式输出

> Body 请求参数

```json
"{\n    \"messages\": [\n        {\n            // \"reasoning_content\": \"你是谁\",\n            \"role\": \"user\",\n            \"content\": \"你好，你是谁\"\n        },\n    ],\n    \"model\": \"doubao-seed-1-6-251015\",\n    \"temperature\": 0.7,\n    \"stream\": false,\n    \"maxTokens\": 2048,\n    \"userId\": 1\n}"
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Content-Type|header|string| 否 |none|
|body|body|[ChatRequest](#schemachatrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "timeout": 0,
  "handler": {},
  "earlySendAttempts": [
    {
      "data": {},
      "mediaType": {
        "type": "",
        "subtype": "",
        "parameters": {
          "": ""
        },
        "toStringValue": ""
      }
    }
  ],
  "complete": false,
  "failure": {
    "detailMessage": "",
    "cause": {
      "detailMessage": "",
      "cause": {},
      "stackTrace": [
        {
          "classLoaderName": "",
          "moduleName": "",
          "moduleVersion": "",
          "declaringClass": "",
          "methodName": "",
          "fileName": "",
          "lineNumber": 0,
          "format": 0
        }
      ],
      "suppressedExceptions": [
        {}
      ]
    },
    "stackTrace": [
      {
        "classLoaderName": "",
        "moduleName": "",
        "moduleVersion": "",
        "declaringClass": "",
        "methodName": "",
        "fileName": "",
        "lineNumber": 0,
        "format": 0
      }
    ],
    "suppressedExceptions": [
      {
        "detailMessage": "",
        "cause": {},
        "stackTrace": [
          {
            "classLoaderName": "",
            "moduleName": "",
            "moduleVersion": "",
            "declaringClass": "",
            "methodName": "",
            "fileName": "",
            "lineNumber": 0,
            "format": 0
          }
        ],
        "suppressedExceptions": [
          {}
        ]
      }
    ]
  },
  "timeoutCallback": {
    "delegate": {}
  },
  "errorCallback": {},
  "completionCallback": {
    "delegate": {}
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[SseEmitter](#schemasseemitter)|

## POST 创建聊天会话

POST /chat/sessions

> Body 请求参数

```json
{
  "title": "string",
  "userId": 0
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|[ChatSessionRequest](#schemachatsessionrequest)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": {
    "id": "",
    "userId": 0,
    "title": "",
    "createTime": "",
    "updateTime": ""
  },
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[BaseResponseChatSessionVO](#schemabaseresponsechatsessionvo)|

## GET 获取用户的会话列表

GET /chat/sessions

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|userId|query|integer| 是 |用户ID|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": [
    {
      "id": "",
      "userId": 0,
      "title": "",
      "createTime": "",
      "updateTime": ""
    }
  ],
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[BaseResponseListChatSessionVO](#schemabaseresponselistchatsessionvo)|

## GET 获取会话的消息列表

GET /chat/sessions/{sessionId}/messages

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|sessionId|path|string| 是 |会话ID|
|userId|query|integer| 是 |用户ID|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": [
    {
      "id": "",
      "sessionId": "",
      "userId": 0,
      "role": "",
      "content": "",
      "imageUrls": [
        ""
      ],
      "videoUrls": [
        ""
      ],
      "createTime": ""
    }
  ],
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[BaseResponseListChatMessageVO](#schemabaseresponselistchatmessagevo)|

## DELETE 删除会话（软删除）

DELETE /chat/sessions/{sessionId}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|sessionId|path|string| 是 |会话ID|
|userId|query|integer| 是 |用户ID|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "data": null,
  "message": ""
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[BaseResponseVoid](#schemabaseresponsevoid)|

# 数据模型

<h2 id="tocS_Message">Message</h2>

<a id="schemamessage"></a>
<a id="schema_Message"></a>
<a id="tocSmessage"></a>
<a id="tocsmessage"></a>

```json
{
  "reasoning_content": "string",
  "role": "string",
  "imageUrls": [
    "string"
  ],
  "videoUrls": [
    "string"
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|reasoning_content|string|false|none||推理内容|
|role|string|false|none||消息角色<br />system: 系统消息<br />user: 用户消息<br />assistant: AI助手消息|
|imageUrls|[string]|false|none||图片URL列表（简化方式，用于前端传参）|
|videoUrls|[string]|false|none||视频URL列表（简化方式，用于前端传参）|

<h2 id="tocS_ChatRequest">ChatRequest</h2>

<a id="schemachatrequest"></a>
<a id="schema_ChatRequest"></a>
<a id="tocSchatrequest"></a>
<a id="tocschatrequest"></a>

```json
{
  "messages": [
    {
      "reasoning_content": "string",
      "role": "string",
      "imageUrls": [
        "string"
      ],
      "videoUrls": [
        "string"
      ]
    }
  ],
  "model": "string",
  "temperature": 0,
  "stream": true,
  "maxTokens": 0,
  "topP": 0,
  "sessionId": "string",
  "userId": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|messages|[[Message](#schemamessage)]|false|none||消息列表|
|model|string|false|none||模型名称（可选，不传则使用配置中的默认模型）|
|temperature|number|false|none||温度参数，控制输出的随机性（0-2之间，默认0.7）<br />值越大输出越随机，值越小输出越确定|
|stream|boolean|false|none||是否启用流式输出（默认true）|
|maxTokens|integer|false|none||最大生成令牌数（可选）|
|topP|number|false|none||Top-p 采样参数（可选）|
|sessionId|string|false|none||会话ID（用于关联历史对话）|
|userId|integer(int64)|false|none||用户ID（用于隔离聊天记录）|

<h2 id="tocS_Handler">Handler</h2>

<a id="schemahandler"></a>
<a id="schema_Handler"></a>
<a id="tocShandler"></a>
<a id="tocshandler"></a>

```json
{}

```

### 属性

*None*

<h2 id="tocS_MapString">MapString</h2>

<a id="schemamapstring"></a>
<a id="schema_MapString"></a>
<a id="tocSmapstring"></a>
<a id="tocsmapstring"></a>

```json
{
  "key": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|key|string|false|none||none|

<h2 id="tocS_MediaType">MediaType</h2>

<a id="schemamediatype"></a>
<a id="schema_MediaType"></a>
<a id="tocSmediatype"></a>
<a id="tocsmediatype"></a>

```json
{
  "type": "string",
  "subtype": "string",
  "parameters": {
    "key": "string"
  },
  "toStringValue": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|type|string|false|none||none|
|subtype|string|false|none||none|
|parameters|[MapString](#schemamapstring)|false|none||none|
|toStringValue|string¦null|false|none||none|

<h2 id="tocS_DataWithMediaType">DataWithMediaType</h2>

<a id="schemadatawithmediatype"></a>
<a id="schema_DataWithMediaType"></a>
<a id="tocSdatawithmediatype"></a>
<a id="tocsdatawithmediatype"></a>

```json
{
  "data": {},
  "mediaType": {
    "type": "string",
    "subtype": "string",
    "parameters": {
      "key": "string"
    },
    "toStringValue": "string"
  }
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|data|object|false|none||none|
|mediaType|[MediaType](#schemamediatype)|false|none||none|

<h2 id="tocS_Throwable">Throwable</h2>

<a id="schemathrowable"></a>
<a id="schema_Throwable"></a>
<a id="tocSthrowable"></a>
<a id="tocsthrowable"></a>

```json
{
  "detailMessage": "string",
  "cause": "this",
  "stackTrace": "new StackTraceElement[0]",
  "suppressedExceptions": "Collections.emptyList()"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|detailMessage|string|false|none||Specific details about the Throwable.  For example, for<br />{@code FileNotFoundException}, this contains the name of<br />the file that could not be found.|
|cause|[Throwable](#schemathrowable)|false|none||The throwable that caused this throwable to get thrown, or null if this<br />throwable was not caused by another throwable, or if the causative<br />throwable is unknown.  If this field is equal to this throwable itself,<br />it indicates that the cause of this throwable has not yet been<br />initialized.|
|stackTrace|[[StackTraceElement](#schemastacktraceelement)]|false|none||The stack trace, as returned by{@link #getStackTrace()}.<br /><br />The field is initialized to a zero-length array.  A{@code<br />    * null} value of this field indicates subsequent calls to{@link<br />    * #setStackTrace(StackTraceElement[])} and{@link<br />    * #fillInStackTrace()} will be no-ops.|
|suppressedExceptions|[[Throwable](#schemathrowable)]|false|none||The list of suppressed exceptions, as returned by{@link<br />    * #getSuppressed()}.  The list is initialized to a zero-element<br />unmodifiable sentinel list.  When a serialized Throwable is<br />read in, if the{@code suppressedExceptions} field points to a<br />zero-element list, the field is reset to the sentinel value.|

<h2 id="tocS_StackTraceElement">StackTraceElement</h2>

<a id="schemastacktraceelement"></a>
<a id="schema_StackTraceElement"></a>
<a id="tocSstacktraceelement"></a>
<a id="tocsstacktraceelement"></a>

```json
{
  "classLoaderName": "string",
  "moduleName": "string",
  "moduleVersion": "string",
  "declaringClass": "string",
  "methodName": "string",
  "fileName": "string",
  "lineNumber": 0,
  "format": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|classLoaderName|string|false|none||The name of the class loader.|
|moduleName|string|false|none||The module name.|
|moduleVersion|string|false|none||The module version.|
|declaringClass|string|false|none||The declaring class.|
|methodName|string|false|none||The method name.|
|fileName|string|false|none||The source file name.|
|lineNumber|integer|false|none||The source line number.|
|format|integer|false|none||Control to show full or partial module, package, and class names.|

<h2 id="tocS_Runnable">Runnable</h2>

<a id="schemarunnable"></a>
<a id="schema_Runnable"></a>
<a id="tocSrunnable"></a>
<a id="tocsrunnable"></a>

```json
{}

```

### 属性

*None*

<h2 id="tocS_DefaultCallback">DefaultCallback</h2>

<a id="schemadefaultcallback"></a>
<a id="schema_DefaultCallback"></a>
<a id="tocSdefaultcallback"></a>
<a id="tocsdefaultcallback"></a>

```json
{
  "delegate": {}
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|delegate|[Runnable](#schemarunnable)|false|none||none|

<h2 id="tocS_ErrorCallback">ErrorCallback</h2>

<a id="schemaerrorcallback"></a>
<a id="schema_ErrorCallback"></a>
<a id="tocSerrorcallback"></a>
<a id="tocserrorcallback"></a>

```json
{}

```

### 属性

*None*

<h2 id="tocS_SseEmitter">SseEmitter</h2>

<a id="schemasseemitter"></a>
<a id="schema_SseEmitter"></a>
<a id="tocSsseemitter"></a>
<a id="tocssseemitter"></a>

```json
{
  "timeout": 0,
  "handler": {},
  "earlySendAttempts": [
    {
      "data": {},
      "mediaType": {
        "type": "string",
        "subtype": "string",
        "parameters": {
          "key": "string"
        },
        "toStringValue": "string"
      }
    }
  ],
  "complete": true,
  "failure": {
    "detailMessage": "string",
    "cause": "this",
    "stackTrace": "new StackTraceElement[0]",
    "suppressedExceptions": "Collections.emptyList()"
  },
  "timeoutCallback": {
    "delegate": {}
  },
  "errorCallback": {},
  "completionCallback": {
    "delegate": {}
  }
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|timeout|integer(int64)¦null|false|none||none|
|handler|[Handler](#schemahandler)|false|none||none|
|earlySendAttempts|[[DataWithMediaType](#schemadatawithmediatype)]|false|none||none|
|complete|boolean|false|none||none|
|failure|[Throwable](#schemathrowable)|false|none||none|
|timeoutCallback|[DefaultCallback](#schemadefaultcallback)|false|none||none|
|errorCallback|[ErrorCallback](#schemaerrorcallback)|false|none||none|
|completionCallback|[DefaultCallback](#schemadefaultcallback)|false|none||none|

<h2 id="tocS_ChatSessionVO">ChatSessionVO</h2>

<a id="schemachatsessionvo"></a>
<a id="schema_ChatSessionVO"></a>
<a id="tocSchatsessionvo"></a>
<a id="tocschatsessionvo"></a>

```json
{
  "id": "string",
  "userId": 0,
  "title": "string",
  "createTime": "string",
  "updateTime": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|false|none||会话ID|
|userId|integer(int64)|false|none||用户ID|
|title|string|false|none||会话标题|
|createTime|string|false|none||创建时间|
|updateTime|string|false|none||更新时间|

<h2 id="tocS_BaseResponseChatSessionVO">BaseResponseChatSessionVO</h2>

<a id="schemabaseresponsechatsessionvo"></a>
<a id="schema_BaseResponseChatSessionVO"></a>
<a id="tocSbaseresponsechatsessionvo"></a>
<a id="tocsbaseresponsechatsessionvo"></a>

```json
{
  "code": 0,
  "data": {
    "id": "string",
    "userId": 0,
    "title": "string",
    "createTime": "string",
    "updateTime": "string"
  },
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||none|
|data|[ChatSessionVO](#schemachatsessionvo)|false|none||none|
|message|string|false|none||none|

<h2 id="tocS_ChatSessionRequest">ChatSessionRequest</h2>

<a id="schemachatsessionrequest"></a>
<a id="schema_ChatSessionRequest"></a>
<a id="tocSchatsessionrequest"></a>
<a id="tocschatsessionrequest"></a>

```json
{
  "title": "string",
  "userId": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|string|false|none||会话标题（可选，如果不提供则使用第一条消息的前20个字符）|
|userId|integer(int64)|false|none||用户ID|

<h2 id="tocS_BaseResponseListChatSessionVO">BaseResponseListChatSessionVO</h2>

<a id="schemabaseresponselistchatsessionvo"></a>
<a id="schema_BaseResponseListChatSessionVO"></a>
<a id="tocSbaseresponselistchatsessionvo"></a>
<a id="tocsbaseresponselistchatsessionvo"></a>

```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "userId": 0,
      "title": "string",
      "createTime": "string",
      "updateTime": "string"
    }
  ],
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||none|
|data|[[ChatSessionVO](#schemachatsessionvo)]|false|none||none|
|message|string|false|none||none|

<h2 id="tocS_ChatMessageVO">ChatMessageVO</h2>

<a id="schemachatmessagevo"></a>
<a id="schema_ChatMessageVO"></a>
<a id="tocSchatmessagevo"></a>
<a id="tocschatmessagevo"></a>

```json
{
  "id": "string",
  "sessionId": "string",
  "userId": 0,
  "role": "string",
  "content": "string",
  "imageUrls": [
    "string"
  ],
  "videoUrls": [
    "string"
  ],
  "createTime": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string|false|none||消息ID|
|sessionId|string|false|none||会话ID|
|userId|integer(int64)|false|none||用户ID|
|role|string|false|none||消息角色：user/assistant/system|
|content|string|false|none||文本内容|
|imageUrls|[string]|false|none||图片URL列表|
|videoUrls|[string]|false|none||视频URL列表|
|createTime|string|false|none||创建时间|

<h2 id="tocS_BaseResponseListChatMessageVO">BaseResponseListChatMessageVO</h2>

<a id="schemabaseresponselistchatmessagevo"></a>
<a id="schema_BaseResponseListChatMessageVO"></a>
<a id="tocSbaseresponselistchatmessagevo"></a>
<a id="tocsbaseresponselistchatmessagevo"></a>

```json
{
  "code": 0,
  "data": [
    {
      "id": "string",
      "sessionId": "string",
      "userId": 0,
      "role": "string",
      "content": "string",
      "imageUrls": [
        "string"
      ],
      "videoUrls": [
        "string"
      ],
      "createTime": "string"
    }
  ],
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||none|
|data|[[ChatMessageVO](#schemachatmessagevo)]|false|none||none|
|message|string|false|none||none|

<h2 id="tocS_BaseResponseVoid">BaseResponseVoid</h2>

<a id="schemabaseresponsevoid"></a>
<a id="schema_BaseResponseVoid"></a>
<a id="tocSbaseresponsevoid"></a>
<a id="tocsbaseresponsevoid"></a>

```json
{
  "code": 0,
  "data": null,
  "message": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none||none|
|data|null|false|none||none|
|message|string|false|none||none|

