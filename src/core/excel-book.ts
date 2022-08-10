import { ExcelConfig } from "../excel-config";
import { ExcelSheet } from "./excel-sheet";

export class ExcelBook {
    public excelConfig: ExcelConfig = null;
    public name: string = null;
    public sheets: ExcelSheet[] = [];
    constructor(excelConfig: ExcelConfig) {
        this.excelConfig = excelConfig;
    }

    public getJsonObject(): any {
        let obj = {};
        for (let sheet of this.sheets) {
            obj[sheet.name] = sheet.getJsonObject();
        }
        return obj;
    }
}