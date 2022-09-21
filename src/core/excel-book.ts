import { ExcelConfig } from "../excel-config";
import { ExcelSheet } from "./excel-sheet";

export class ExcelBook {
    /**配置 */
    public excelConfig: ExcelConfig = null;
    /**表格名字 */
    public name: string = null;
    /**工作簿 */
    public sheets: ExcelSheet[] = [];

    constructor(excelConfig: ExcelConfig) {
        this.excelConfig = excelConfig;
    }

    /**获取表格json对象 */
    public getJsonObject(): any {
        let obj = {};
        for (let sheet of this.sheets) {
            obj[sheet.name] = sheet.getJsonObject();
        }
        return obj;
    }
}