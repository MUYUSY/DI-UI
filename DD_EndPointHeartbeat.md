# EndPoint Heartbeat Detail Design
version: 0.1

## Introduction
探针向黑匣子端注册信息，注册成功后通过心跳维持连接，黑匣子端通过心跳响应下发TOKEN和策略命令，探针通过心跳请求上报策略命令执行的结果。

大体流程：  
(1)	主机探针启动后，心跳线程立即向黑匣子注册主机探头自身信息，这些信息包括DEVICEID, 设备名，操作系统，IP地址等，注册成功后每隔1分钟重复发送一次心跳信息，连续注册3次失败探针进程退出，下次启动时重新进行注册  
(2) 如果探针信息有变化，探针发送更新消息给黑匣子  
(3) 黑匣子会在注册成功后为该探针生成第一个Token并且返回。主机探针需要将每次得到的新TOKEN保存在配置文件中，确保掉线以后下次能使用该TOKEN重新连接上。  
(4)	如果黑匣子端针对该主机探针有新的策略，那么新的策略会通过响应信息下发给该主机探针  
(5)	黑匣子端每隔一分钟接收各主机探头送来的心跳消息，包括DeviceID，Token，验证DeviceID加Token是否有效，然后更新心跳上报时间，若包含策略命令执行的结果，还要根据命令ID更新该策略命令的状态。 

Token存在有效期，验证Token有效性有下面几个场景：  
(1) 探针发送的Token在有效期内，发送该Token给探针继续使用  
(2) Token匹配成功且过期，生成新的Token发送给探针  
(3) 为了防止网络问题导致探针收不到新的Token而导致心跳无法继续，黑匣子端同时保存上一次的Token，当前Token比较不成功时，和上一次Token比较，上一次Token比较成功后，发送当前Token给探针，如果两个Token都匹配失败则返回失败（该情况不会出现，用来防止伪造的请求）  

## Feature

- api 接口
- register request
- update request
- normal heartbeat request
- heartbeat response
- 安全性验证
- 支持至少100个并发
- 容错性

## API Specification
register api
[POST] `https://[DI Server]:[6011]/online`

update api
[POST] `https://[DI Server]:[6011]/update`

heartbeat api
[POST] `https://[DI Server]:[6011]/heartbeat`

--------
### Register Request 注册请求
Headers  
```
Content-Type: application/json
```  
```
"X-DI-DEVICEID": "095e39b5839a428f8809b82ebe5e289d"
```

Body

{  
    "devicename": "EndPoint1",  
    "ip": "127.0.0.1",  
    "macaddress": "00:0c:29:59:ab:c6",  
    "os": "Linux",  
}

字段类型：  
X-DI-DEVICEID：char(64)  
devicename：char(64)  
ip:char(32)  
macaddress:char(32)  
os:char(64)  

-------------
### Update Request 更新请求
Headers  
```
Content-Type: application/json
```  
```
"X-DI-DEVICEID": "095e39b5839a428f8809b82ebe5e289d"  
"X-DI-TOKEN": "xxxxxx"
```

Body

{  
    "devicename": "EndPoint1",  
    "ip": "127.0.0.1",  
    "macaddress": "00:0c:29:59:ab:c6",  
    "os": "Linux",  
}

字段类型：  
X-DI-DEVICEID：char(64)  
X-DI-TOKEN:char(64)  
devicename：char(64)  
ip:char(32)  
macaddress:char(32)  
os:char(64)  

-----------------
### Normal Heartbeat Request 普通的心跳消息
Headers  
```
Content-Type: application/json
```  
```
"X-DI-DEVICEID": "095e39b5839a428f8809b82ebe5e289d"
"X-DI-TOKEN": "xxxxxx"
```

Body

{ 
    "result":{{"id"：111,"return": 1,"reason":"ok"},{...}...{...}}  
}

字段类型：  
X-DI-DEVICEID：char(64)  
X-DI-TOKEN:char(64)   
id:long int  
return:int  
reason:char(256)  

X-DI-DEVICEID和X-DI-TOKEN通过header携带，通过header就可以判断消息的有效性  
id为命令的唯一标识  
command result:0 "ok"; 1 "command failed";  
如果没有命令执行，result为空{}

-----------
### HeartBeat Response 响应消息（注册和心跳的响应消息格式相同）
Headers  
```
Content-Type: application/json
```  

Status  
```
200 success,
400 bad request,
401 unauthorized,
500 internal server error 
```

Body

{    
    "token": "xxxxxx",  
    "command": {{"id":111,"type":1,"content":"xxx"},{...}...{...}}  
}  

字段类型：  
token:char(64)  
id:long int  
type:int  
content:string  

状态码不为200表示请求处理失败，不需要再取body内容  
command为空{}表示没有命令下发  
id为命令的唯一标识  
type：例如 1、启动事件记录，2、关闭事件记录等操作，content可带上命令的参数（如白名单，黑名单信息）  

## Note
1. 后台所有事件的存储timezone 必须是UTC
2. encoding必须是UTF-8
