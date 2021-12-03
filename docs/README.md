![](./../src/img/logo.png)

## Excel-Convert是一个开源、可自定义解析的excel转json、ts工具


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

4.内置类型
|   类型    |      示例       | 默认值 |
| :-------: | :-------------: | :----: |
|  number   |        1        |   0    |
|  string   |       123       |   ''   |
|  boolean  |      true       | false  |
| number[]  |     1,2,3,4     |  [ ]   |
| string[]  |     a,b,c,d     |  [ ]   |
| boolean[] | true,false,true |  [ ]   |
|  object   |    {"num":1}    |  null  |

# 使用
1.引入
```js
const excelconvert = require('excelconvert');
```
或
```js
require('excelconvert');
globalThis.excelconvert;
```

2.快速使用

```js
require('excelconvert');

···
···

let buffer = fs.readFileSync(excelUrl);
let jsonData = globalThis.excelconvert.convert(new Uint8Array(buffer),filename);
```

3.方法
```js
/**转换为json
* @param {*} data Uint8Array格式数据
* @param {*} fileName 去除后缀的文件名
*/
convert(data, fileName)

/**json转换为ts格式
* @param {*} fileName 去除后缀的文件名
* @param {*} jsonObj convert出来的json对象
*/
convertToTs(fileName, jsonObj)

/**设置默认类型初始值
* @param {*} type 
* @param {*} value 
*/
setDefaultTypeValue(type, value)

/**获取默认类型初始值
* @param {*} type 
*/
getDefaultTypeValue(type)

/**添加自定义解析
* @param {*} type 类型,例 "BigFloat"
* @param {*} func 解析方法,例(data)=>{return parseFloat(data)}
*/
addCustomTypeParse(type, func)

/**设置解析完成后的自定义解析
* @param {*} fuc  例(excelData, fileName)=>{...}
*/
setCustomConvert(fuc)

/**将数组数据转换为对象数据
* @param {*} dataArray 数据组
* @param {*} key 主键
*/
arrayToObject(dataArray, key)
```

详细使用请查看test/test.js