1. 将原始文件进行合并大文件?
zip 多个文件成一个, 一次解压?
2. index 查询, 多进程+多线程模型
3. index 查询, gevent 模型
4. 优化binary 解析为分钟部分
5. 是否将raw log部分的,查询字段集中再做一个简单索引?
6. pg_trgm 加速like
7. gzip 压缩response
nginx配置, 但是后端两个服务之间是否考虑需要压缩
8. 是否把后端127.0.0.1 改为unix file
9. commonlog 里fgets 是否比较fread()会造成效率低下
http://www.nextpoint.se/?p=540

10. mmap or memcached/redios 缓存数据 + 缓存原始文件
11. hdfs/hbase方案
http://blog.cloudera.com/blog/2009/02/the-small-files-problem/
12. io performance学习
http://simpsonlab.github.io/2015/05/19/io-performance/
13. k/v storage
14. ulimit 调整
15. raid 选项优化
15. 分页
start, length. 后端按时间数量预估查询第一包和最后一包数据, 其他交由后台处理程序慢慢查询
后台完成, 后续的请求走,memory cache

问题:
有index的情况才会有total和具体时间估算
如果查询条件包含没有index的数据,则无法估算数量和时间段
如果查询包含不包含也无法做

前端异步加载,先加载第一次返回, 然后一直等待total值, 一旦拿到代表后端数据已全部完成(无index情况),
有index情况,则立即生成. 前端提供完成百分比, 完成再显式total以及真实的页数



16. 排序

---
## 当前实现方案
- 数据按\t分割,没有key值, 顺序严格按照schema 排列, 没有的值补空
- 查询时必需提供至少一种logmsgtype, 并且查询值需要提供对应的index 位置
- 查询的一个条件里不支持or多个, 严格的=匹配, 不支持子串

---
ls /didata/abc123/17263/|wc -l
3072

/win/DI2.5/server/diserver/commonlog
[root@promote commonlog]# time python test.py

real	0m35.912s
user	0m1.675s
sys	0m19.038s

[root@promote commonlog]# time python test2.py

real	0m35.140s
user	0m1.828s
sys	0m18.542s


- commonlog
支持一个字段多个or

- commonlog_v1
原始版本

- commonlog_v2
去除解压功能


- commonlog_v3
增加不包含功能