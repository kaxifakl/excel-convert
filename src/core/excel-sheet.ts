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

    /**键 */
    public keyArray: string[] = null;
    /**类型 */
    public typeArray: string[] = null;
    /**值 */
    public dataArray: any[] = [];
    /**注释 */
    public annoArray: string[] = [];

    public mainKeyIndex: number = null;

    public jsonObject: any = null;

    public bookName: string = null;

    constructor(name: string, sourceData: any, excelConfig: ExcelConfig, bookName: string) {
        this.name = name;
        this.sourceData = sourceData;
        this.excelConfig = excelConfig;
        this.bookName = bookName;
        this.parse();
    }

    private parse(): void {
        for (let i = 0; i < this.sourceData.length; i++) {
            //数据array
            let array = this.sourceData[i];
            //默认标记
            let DEFAULT_SIGN = this.excelConfig.DEFAULT_SIGN;
            let sign = null;
            if (this.excelConfig.mode == 1) {
                let defaultSign = this.excelConfig.defaultSignLine[i + 1];
                sign = defaultSign || DEFAULT_SIGN.data;
            } else {
                sign = array[this.excelConfig.signIndex] || DEFAULT_SIGN.data
            }

            let signParse = this.excelConfig.defaultSignParse[sign];
            signParse?.(this, array);
        }

        if (this.mainKeyIndex != null) {
            this.mainKey = this.keyArray[this.mainKeyIndex];
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
                    console.error(this.bookName + '->' + this.name + ':' + keyStr + '的类型为空值');
                    continue;
                }
                let dataStr = dataLine[i];
                if (dataStr == null) {
                    console.log(this.bookName + '->' + this.name + ':' + keyStr + '的数据存在空值');
                }
                let data = this.parseData(dataStr, typeStr);
                this.excelConfig.dataSetterParse(dataObject, keyStr, data, i);
            }

            this.excelConfig.dataLineSetterParse(this, dataObject);
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
        return this.excelConfig.getSheetObject(this);
    }
}