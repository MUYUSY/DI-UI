# Log Receiver Detail Design
version: 0.1

## Introduction
log receiver 负责从DI client 接收原始log，在服务器落盘持久化，生成task 待处理。

## Feature

- api 接口
- request validate
- log normalization
- 安全性验证
- 正确的存储目录结构
- 支持至少100 个并发
- 容错性
- 处理成功，提交task 到taskdb

## API Specification
[POST] `https://[DI Server]:[6021]/logupload`

### Request
Headers

```
"X-DI-DEVICEID": "095e39b5-839a-428f-8809-b82ebe5e289d"
"X-DI-TOKEN": "token"
"X-DI-TS": "1487559749"
"X-DI-MD5": "md5"
"X-DI-CEF": "CEF:0|AsiaInfo Security|Deep Inspector|1.0.1011|产品描述"
```

----
Body

事件1\n事件2\n事件N\n

```
rsp_code=200    sip=46.70.93.173    event_type=2    current_process_name=nihil.png  timestamp=1315342279    current_porcess_sha1=6d651f7e14cb597bb4a68df624ba400e8939634d   current_porcess_pid=6663    current_process_user=Nick Tang  dport=33218 sport=44218 dip=75.227.37.198
rsp_code=200    sip=195.73.78.156   event_type=2    current_process_name=numquam.wav    timestamp=992819740 current_porcess_sha1=557dec57e13ee033b3e51d7c50ffcb66b1220f21   current_porcess_pid=4426    current_process_user=Nick Tang  dport=50126 sport=42393 dip=215.120.253.182
```

body 使用zlib 

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
    "result": 0,
    "reason": ""
}
```

## Event Definition
### Event header

- Event_Time
- Device_ID
- Event_Type
- 当前进程用户
- 当前进程PID
- 当前进程文件名
- ~~当前进程MD5/SHA1~~
- ~~当前进程数字签名~~

### Event Detail
see endpoint's design

## Note
1. 后台所有事件的存储timezone 必须是UTC
1. log encoding必须是UTF-8
1. log 内容必须对特殊字符进行转义(\n, \t)
1. log 内容的key 必须全小写

## File Save
文件结构
```
/save path/<device id>/<days>/<ts>.log

days = int(timestamp)/86400
ts = int(timestamp/60*60)
```
