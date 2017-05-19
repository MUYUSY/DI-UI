query raw log

## API
url: "logquery"
### Request
```
{
	"task_id": -1,
	"sort_type": 0,
	"skip": 0,
	"count": 10000,
    "begin_time": ts,
    "end_time": ts,
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

### Response
{
	"task_id": 1,
	"skip": 5,
    "total_count": 10253,
    "data": [
        {
            clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n
            clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n
            clf_eventtype=2\tclf_user=Guest\tclf_processname=magni.wav\tclf_pid=1789\tclf_file=None\n
			...
            
        }
    ]
}

##API

url:"processquery"

###Request

{
	"task_id": 1
}

###Response




/*parameter:
*  filename(string): compress data file name with path;
*  pyobjfilter_list(list): filter (not include msgtype,
       for each filter item support multi-value);
*  pyobjfilter_indexes(list): column index for each filter item;
*  pyobjfilter_match:  match strategy for each filter item, 1 is full match, 0 is partial match
*   pyobjfilter_length: length for each filter item
*  filter_length (int): total filter item count;
*  pyobjmsgtype_values(list): msgtype filter;
*  msgtype_index(int): msgtype column position index value;
*  msgtype_length (int): msg length;
*  pyobjdevice_values(list): device list, empty for all devices;
*  device_index: device column position index;
*  device_length: device list length;
*  skip (int): skip count, 0 means no skipping log;
*  limit (return): return limit max length
*/