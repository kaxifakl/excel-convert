const zip = new JSZip();

let app = new Vue({
    el: "#app",
    data: {
        files: null,
        needBeautify: false,
        toTs: false,
        jsonDataArray: [],
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
                    let fileName = file.name.replace('.xlsx', '').replace('.xls', '');
                    let jsonData = excelconvert.convert(data, fileName);
                    this.jsonDataArray.push({ name: fileName, data: jsonData });
                };
                reader.readAsArrayBuffer(file);
            }
        },
        download() {
            if (this.jsonDataArray.length <= 0) {
                return;
            }

            let fileExt = '.json';
            if (this.toTs) {
                fileExt = '.ts'
            }
            for (let jsonData of this.jsonDataArray) {
                let strData = JSON.stringify(jsonData.data);
                if (this.toTs) {
                    strData = excelconvert.convertToTs(jsonData.name, jsonData.data);
                }
                if (this.needBeautify) {
                    strData = js_beautify(strData);
                }
                zip.file(jsonData.name + fileExt, strData);
            }
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