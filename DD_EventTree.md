## DI 2.5 Event Tree JSON Response 
version: 0.1

## Introduction
描述事件树前端与后端的接口

## Feature

根据

## API Specification
获取事件树
[POST] `https://[DI Server]:[6543]/eventtree`

### Request
Headers

```
normal header
```

----
Body

```
{
    "pid":1942, 
    "processname":"C:\\Program Files\\Internet Explorer\\iexplore.exe", 
    "device_guid":"1024"，
    "timestamp":"1490245524"
}
```

### Response
Headers
```
Content-Type: application/json
```
----
Status
```
200 success
400 bad request
500 internal server error 
```
----
Body
```
{
    "result":0,
    "reason":"",
    "data":{
        "name":"root",
        "event_type":"1",
        "pid":"1923",
        "children":[
            {
                "name":"chrome.exe",
                "event_type":"1",
                "pid":"1923",
                "children":[
                    {
                        "name":"jd.com",
                        "event_type":"3",
                        "pid":"1943"
                    }
                ]
            },
            {
                "name":"readme.txt",
                "event_type":"4",
                "pid":"1923"
            }
        ]
    }
}

```

