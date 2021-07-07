// console.log(XLSX);
// console.log(js_beautify)
const ec = new excelconvert();
const zip = new JSZip();

let app = new Vue({
    el: "#app",
    data: {
        files: null,
        tex: '',
        needBeautify: false,
        jsonDataArray: []
    },
    mounted() {

    },
    methods: {
        /**上传文件 */
        inputfile(e) {
            this.files = e.target.files;
            for (let file of this.files) {
                var reader = new FileReader();
                reader.onload = (fileProgress) => {
                    var data = new Uint8Array(fileProgress.target.result);
                    var workbook = XLSX.read(data, { type: 'array' });
                    let jsonData = ec.formatData(workbook);
                    this.jsonDataArray.push({ name: file.name.replace('.xlsx', '').replace('.xls', ''), data: jsonData });
                    console.log(this.jsonDataArray)
                        //this.tex = jsonData.strData;
                };
                reader.readAsArrayBuffer(file);
            }
        },
        download() {
            if (this.tex == '') {
                return;
            }
            zip.file('a.json', this.tex);
            zip.generateAsync({ type: "blob" })
                .then(function(content) {
                    var eleLink = document.createElement('a');
                    eleLink.download = 'excelconvert.zip';
                    eleLink.style.display = 'none';
                    eleLink.href = URL.createObjectURL(content);
                    document.body.appendChild(eleLink);
                    eleLink.click();
                    document.body.removeChild(eleLink);
                });
        }
    },
    computed: {

    }
})