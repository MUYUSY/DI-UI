## Log report format
1. 每次上传请求的数据为一个report，每个report内含单个客户端一分钟内的数据。
2. report内由`\n`分割为多个event。
3. event由EventHeader和EventDetail组成，中间使用`\t`分割。
4. EventHeader及EventDetail内部均为Key-Value格式，每组Key-Value间使用`\t`分割，具体格式如下。
5. 在上传时对report整体使用zlib压缩算法进行压缩。

```
+---------------------------------+
|                                 |
| +-----------------------------+ |
| |EventHeader|\t|EventDetail|\n| |
| +-----------------------------+ |
| |EventHeader|\t|EventDetail|\n| |
| +-----------------------------+ |
| |              .              | |
| |              .              | |
| |              .              | |
| +-----------------------------+ |
| |EventHeader|\t|EventDetail|\n| |
| +-----------------------------+ |
|                                 |
|         Zlib Compressed         |
+---------------------------------+
```
### Event Header
```
clf_event_time=	clf_device_name=	clf_user=	clf_pid=	clf_processname=	clf_subtype=	clf_src_file=	clf_dst_file=	clf_url=	clf_src_ip=	clf_dst_ip=	clf_netprotocol=	clf_eventtype=
```

### Event Detail

#### clf_event_type
Value | Description
------|------------
1 | DI_FILE_EVENT_TYPE
2 | DI_PROCESS_EVENT_TYPE
3 | DI_NETWORK_EVENT_TYPE
4 | DI_SYSTEM_EVENT_TYPE
5 | DI_CONFIG_EVENT_TYPE

#### DI_FILE_EVENT_TYPE
```
version=	type=1	status=	time=	subject_proc_id=	subject_user_account=	subject_process=	operation=3	desired_access=	options=	file_attributes=	share_access=	file_src_path=	file_dst_path=	str_file_sha1=
```

#### DI_PROCESS_EVENT
```
version=	type=2	status=	time=	subject_proc_id=	subject_user_account=	subject_process=	operation=  target_pid= target_file_path= target_file_sign= file_sha1=
```

#### DI_NETWORK_EVENT_TYPE
```
version=	type=3	status=	time=	subject_proc_id=	subject_user_account=	subject_process=	operation=1	source_ip=	source_port=	dest_ip=	dest_port=	protocol_name=	detail_info=
```
