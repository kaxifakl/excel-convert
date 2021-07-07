// console.log(XLSX);
// console.log(js_beautify)
const ec = new excelconvert();
const zip = new JSZip();

let app = new Vue({
    el: "#app",
    data: {
        files: '',
        tex: '',
        needBeautify: false
    },
    mounted() {

    },
    methods: {
        /**上传文件 */
        inputfile(e) {
            this.files = e.target.files[0];
            console.log(this.files)
            var reader = new FileReader();
            reader.onload = (e) => {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
                let jsonData = ec.formatData(workbook);
                this.tex = jsonData.strData;
            };
            reader.readAsArrayBuffer(this.files);
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