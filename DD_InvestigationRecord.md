

# Investigation Record Design
version: 0.1

## Introduction

## Feature

- api 接口

## API Specification 
query api  
[POST] `https://[DI Server]:[6543]/investigationrecord`  

## Add API
### Request
1) Post Data:  
{
    "action": "add",
	"type": 1,
	"time": "1495097482",
	"name": "张三的条件",
	"data": {
		"begin_time": "1495097482",
    	"end_time": "1495097482",
    	"device_id": [0, 1, 2],
    	"event_type": 0,
    	"filter_condition": {
	        "process_user": {
	            "include": ["nick", "admin", "guest"],
	            "exclude": []
	        },
	        "pid": {
	            "exclude": [1, 3, 5]
	        },
	        "process_name": {
	            "include": ["explorer.exe", "virus.exe"]
	        },
	        "ip": {
	        },
	        "net_protocol": {
	            "include": ["ftp", "http"]
	        },
	        "file_name": {
	            "include":["abc.doc"]
	        },
	        "url": {
	            "include": ["www.baidu.com/abc"]
	        }
	    }
	}
}

2) Post Data  
{
    "action": "add",
	"type": 2,
	"time": "1495097482",
	"name": "李四的事件树",
	"data": {
		"begin_time": "1495097482",
    	"end_time": "1495097482",
    	"device_id": [0],
    	"pid": 428
	}
}


### Response  
Headers  
'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

## Query API  
### Request  
{
    "action": "get"
}

### Response  
Headers  
'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

{    
    "type1": [{  
        "id": "111",
        "time": "1495097482",
        "user": "admin"
        "name": "张三的条件",
        "data": {
            "begin_time": "1495097482",
            "end_time": "1495097482",
            "device_id": [0, 1, 2],
            "filter_condition": {
                "process_user": {
                    "include": ["nick", "admin", "guest"],
                    "exclude": []
                },
                "pid": {
                    "exclude": [1, 3, 5]
                },
                "process_name": {
                    "include": ["explorer.exe", "virus.exe"]
                },
                "ip": {
                },
                "net_protocol": {
                    "include": ["ftp", "http"]
                },
                "file_name": {
                    "include":["abc.doc"]
                },
                "url": {
                    "include": ["www.baidu.com/abc"]
                }
            }
        }
    },{  
    ...  
    }],    
    "type2": [{
        "id": "222",
        "time": "1495097482",
        "user": "admin"
        "name": "李四的事件树",
        "data": {
            "begin_time": "1495097482",
            "end_time": "1495097482",
            "device_id": [0],
            "pid": 428
        }
    }]
}

## Del API  
### Request  
{
    "action": "del",
    "recordids": ["111","222","333"]
}

### Response  
Headers  
'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

## Modify API  
### Request  
{
    "action": "modify",
    "recordid": "111",
    "name": "王五的条件"
}

### Response  
Headers  
'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  
