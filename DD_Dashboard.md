For Jim:

探针:

	1. 总探针数量
	2. 在线探针数量
	3. 近一周探针增量(need or not?)


容量:

	1. 总空间
	2. 可用空间
	3. 存储占比


For Nick:

按时间统计,需要讨论:时间跨度,粒度,支持选择对应探针;

Total:


	1. 总数据量
	2. 近一月数据量
	3. 近一周数据量
	4. (今天数据量)if needed


网络事件:(需要的资料:支持的网络协议类型)

目前:

	1. HTTP请求
	2. HTTP响应
	3. FTP命令
	4. FTP应答


文件操作:

	1. 文件打开
	2. 文件关闭
	3. 文件创建文件
	5. 写文件
	4. 读
	6. 删除文件


TODO:
系统操作:

	1. 登录
	2. 注销
	3. 修改密码
	4. 移动设备接入
	5. 移动设备拔出


进程操作:

	1. 创建进程
	2. 终止进程
	3. 加载模块


注册表操作(仅windows):

	1. 设置key
	2. 读取key
	3. 创建key
	4. 删除key

-------------
backend design
创建3 张表

1. dashboard_stats_by_minute
1. dashboard_stats_by_day
1. dashboard_stats_by_month



