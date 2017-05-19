# EndPoint Query Design
version: 0.1

## Introduction

## Feature

- api 接口
- response

## API Specification
存储使用  
query api  
[POST] `https://[DI Server]:[6543]/diskinfo`  
探针数量  
query api  
[POST] `https://[DI Server]:[6543]/devicenum`


## Response  
###devicenum  
###Headers  

'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

###Body
{   
    "totalnum": 1,  
    "onlinenum": 1,  
    "weeknum": 1  
}

###diskinfo  
###Headers  

'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

###Body
{   
    "StorageUsed": "11620MB",  
    "StorageFree": "51106MB",  
    "StorageUsedPercent": "18.53%"  
}
  
单位：MB




