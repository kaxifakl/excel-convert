import { Tbl } from "./tbl";

let tbl = new Tbl<Abc>("")
tbl.get(1).num = 1;

export interface Abc {
    num: number,
    data: string
}