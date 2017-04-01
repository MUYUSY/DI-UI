query raw log

## API

### Request
```
{
    "begin_time": ts,
    "end_time": ts,
    "device_id": [0, 1, 2],
    "event_type": 0,
    "filter_condition": {
        "CLF_ProcessUser": ["nick", "admin", "guest"],
        "pid": [1, 3, 5],
        "pname": ["explorer.exe", "virus.exe"],
        "ip": [],
        "netprotocol": ["ftp", "http"],
        "filename": ["abc.doc"],
        "url": ["www.baidu.com/abc"]
    }
}
```
### Response
{
    "total_count": 1000,
    "data": [
        {
            "timestamp": 1490174640,
            "rows": [
                "clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n",
                "clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n",
                "clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n"
            ]
        }
        {
            ...
        }
    ]
}


clf_eventtime, clf_devicename, clf_user, clf_pid, clf_processname, clf_eventtype
