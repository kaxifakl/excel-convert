![](./../src/img/logo.png)

# 简介
你是否曾经被**策划发来的表格迷乱了双眼？

你是否曾经陷入配表、对数据的困境？

Excel-Convert将帮助每一位程序员减少无用劳动力！

把excel甩在**策划的脸上！！！

同时你需要学会以下常用语句：

"请按规定填表！"

"请确认自己的表格准确后再提交！"

"表格错误请自行解决!"

# 规则
1.表格第一列为定义列,每行第一个单元格代表以下含义

|   符号   |               含义               |
| :------: | :------------------------------: |
|    @     |         代表这是一个表格         |
|    @T    |       代表这是一个转置表格       |
|    //    | 代表该行是注释行，不参与数据转换 |
|    $k    |      代表这是key(键)定义行       |
|    $t    |     代表这是type(类型)定义行     |
| $d或不填 |     代表这是date(数据)定义行     |

2.普通表格横向为数据类型延伸,纵向为多个数据排列; 

  转置表格则与之相反，并且需要将符号@改为@T

3.最新版cdn:https://cdn.jsdelivr.net/gh/kaxifakl/excel-convert@latest/dist/excelconvert.min.js

或对应版本cdn:https://cdn.jsdelivr.net/gh/kaxifakl/excel-convert@x.x.x/dist/excelconvert.min.js
