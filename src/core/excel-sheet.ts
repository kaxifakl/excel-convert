import { ExcelConfig } from "../excel-config";

export class ExcelSheet {
    /**工作簿名字 */
    public name: string = null;
    /**配置 */
    public excelConfig: ExcelConfig = null;
    /**源数据 */
    public sourceData: any[] = null;
    /**主键 */
    public mainKey: string = null;

    public configArray: string[] = null;
    /**键 */
    public keyArray: string[] = null;
    /**类型 */
    public typeArray: string[] = null;
    /**值 */
    public dataArray: any[] = [];

    private jsonObject: any = null;

    constructor(name: string, sourceData: any, excelConfig: ExcelConfig) {
        this.name = name;
        this.sourceData = sourceData;
        this.excelConfig = excelConfig;
        this.parse();
    }

    private parse(): void {
        let mainKeyIndex = null;
        for (let i = 0; i < this.sourceData.length; i++) {
            let array = this.sourceData[i];
            let head = array[this.excelConfig.signIndex];
            let DEFAULT_SIGN = this.excelConfig.DEFAULT_SIGN;
            if (head === DEFAULT_SIGN.key) {
                array.splice(this.excelConfig.signIndex, 1);
                this.keyArray = array;
                continue;
            } else if (head === DEFAULT_SIGN.type) {
                array.splice(this.excelConfig.signIndex, 1);
                this.typeArray = array;
                continue;
            } else if (head == null || head == DEFAULT_SIGN.data) {
                array.splice(this.excelConfig.signIndex, 1);
                this.dataArray.push(array);
            } else if (head == DEFAULT_SIGN.default || DEFAULT_SIGN.isTranspose) {
                array.splice(this.excelConfig.signIndex, 1);
                this.configArray = array;
                for (let ele of this.configArray) {
                    if (ele == DEFAULT_SIGN.mainKey) {
                        mainKeyIndex = this.configArray.indexOf(ele);
                    }
                }
            }
        }
        if (mainKeyIndex != null && mainKeyIndex != -1) {
            this.mainKey = this.keyArray[mainKeyIndex];
        }

        this.jsonObject = [];
        for (let dataLine of this.dataArray) {
            let dataObject = {};
            for (let i = 0; i < this.keyArray.length; i++) {
                let keyStr = this.keyArray[i];
                if (keyStr == null) {
                    continue;
                }
                let typeStr = this.typeArray[i];
                if (typeStr == null) {
                    console.error(this.name + ':' + keyStr + '的类型为空值');
                    continue;
                }
                let dataStr = dataLine[i];
                if (dataStr == null) {
                    console.log(this.name + ':' + keyStr + '的数据存在空值');
                }
                let data = this.parseData(dataStr, typeStr);
                dataObject[keyStr] = data;
            }
            this.jsonObject.push(dataObject);
        }
    }

    private parseData(dataStr: string, typeStr: string): any {

        if (dataStr == null) {
            return this.excelConfig.defaultTypeValue[typeStr];
        }

        //中文符号替换
        let reg = this.excelConfig.reg;
        for (let i = 0; i < reg.length / 2; i++) {
            if (dataStr != null) {
                dataStr = dataStr.replace(new RegExp(reg[i], 'g'), reg[i + reg.length / 2]);
            }
        }

        let defaultTypeParse = this.excelConfig.defaultTypeParse[typeStr];
        if (defaultTypeParse != null) {
            return defaultTypeParse(dataStr);
        }
        return null;
    }

    public getJsonObject(): any {
        if (this.mainKey != null) {
            let obj = {};
            for (let data of this.jsonObject) {
                obj[data[this.mainKey]] = data;
            }
            return obj;
        } else {
            return this.jsonObject;
        }
    }
}