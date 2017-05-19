# EndPoint Query Design
version: 0.1

## Introduction

## Feature

- api 接口
- response

## API Specification
query api
[POST] `https://[DI Server]:[6543]/deviceinfo`


## Response
###Headers  

'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

###Body
{   
    "data": [{  
        "groupname":"default",  
        "devices": [{  
            "deviceid": "095e39b5839a428f8809b82ebe5e289d"  
            "devicename": "EndPoint1",  
            "ip": "127.0.0.1",  
            "os": "Linux",  
            "assettag": "Lab"  
            "status": "online"  
            "lastcontacttime": "1494569155"  
        },{  
        ...  
        }]  
    },{  
    ...  
    }]  
}

字段类型：  
deviceid：char(64)  
devicename：char(64)  
ip:char(32)   
os:char(64)  
assettag:char(32)  
status:char(32)  
lastcontacttime:datetime



