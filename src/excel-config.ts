export class ExcelConfig {

    public DEFAULT_SIGN = {
        /**是否转置 */
        "isTranspose": "@T",
        /**键 */
        "key": "$k",
        /**类型 */
        "type": "$t",
        /**注释 */
        "annotation": "//",
        /**数据 */
        "data": "$d",
        /**默认 */
        "default": "@",
        /**主键 */
        "mainKey": "$m",
        /**自定义头 */
        "customData":"$c"
    }

    public reg: string[] = [
        "！", "，", "。", "；", "~", "《", "》", "（", "）", "？",
        "”", "｛", "｝", "“", "：", "【", "】", "”", "‘", "’",
        "!", ",", ".", ";", "`", "<", ">", "(", ")", "?",
        "'", "{", "}", "\"", ":", "{", "}", "\"", "\'", "\'"
    ]

    /**标记索引位置 */
    public signIndex: number = 0;

    public defaultTypeValue = {
        "number": 0,
        "string": '',
        "boolean": false,
        "number[]": [],
        "string[]": [],
        "boolean[]": [],
        "object": null
    }

    public defaultTypeParse = {
        "number": (value: string) => { return parseFloat(value) },
        "string": (value: string) => { return value },
        "boolean": (value: string) => {
            if (value === 'true') {
                return true;
            }
            return false;
        },
        "number[]": (value: string) => {
            let numberArray = value.split(',');
            let array = [];
            for (let numStr of numberArray) {
                array.push(parseFloat(numStr));
            }
            return array;
        },
        "string[]": (value: string) => {
            let strArray = value.split(',');
            return strArray;
        },
        "boolean[]": (value: string) => {
            let boolStrArray = value.split(',');
            let boolArray = [];
            for (let str of boolStrArray) {
                if (str == 'true') {
                    boolArray.push(true);
                    continue;
                }
                boolArray.push(false);
            }
            return boolArray;
        },
        "object": (value: string) => {
            return JSON.parse(value);
        }
    }
}