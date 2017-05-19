

# Dashboard Log Stats Query Design
version: 0.1

## Introduction

## Feature

- api 接口
- response

## API Specification 
query api  
[POST] `https://[DI Server]:[6543]/dashboardsum`  
[POST] `https://[DI Server]:[6543]/dashboardquery`  


## Response
###dashboardsum 
###Headers  

'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

###Body
{   
    "total": 12345,  
    "30D": 12345,  
    "7D": 12345
}

###dashboardquery 
###Headers  

'''  
200 success,  
400 bad request,  
401 unauthorized,  
500 internal server error  
'''  

###Body
{   
    "eventtype": "1",  
    "period": "24H",  
    "begintime": "1494921600",  
    "endtime": "1494932500",  
    "devices": ["all"]  
}

eventtype: 1, 2, 3, 4, 5  
period: 24H, 7D, 30D  
devices: list["all"] or ["111", "222"]  

###Response

{
	"xData": ["1494921600", "1494925200", "1494928800", "1494932400", "1494936000", "1494939600", "1494943200", "1494946800", "1494950400", "1494954000", "1494957600", "1494961200", "1494964800", "1494968400", "1494972000", "1494975600", "1494979200", "1494982800", "1494986400", "1494990000", "1494993600", "1494997200", "1495000800", "1495004400"],
	"yData": {
		"1": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx],
		"2": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx],
		"3": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx],
		"4": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx],
		"5": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx],
		"6": [xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx,xx]
	}
}


{
	"xData": ["1494921600", "1494925200", "1494928800", "1494932400", "1494936000", "1494939600", "1494943200"],
	"yData": {
		"1": [xx,xx,xx,xx,xx,xx,xx],
		"2": [xx,xx,xx,xx,xx,xx,xx],
		"3": [xx,xx,xx,xx,xx,xx,xx],
		"4": [xx,xx,xx,xx,xx,xx,xx],
		"5": [xx,xx,xx,xx,xx,xx,xx],
		"6": [xx,xx,xx,xx,xx,xx,xx]
	}
}

...




