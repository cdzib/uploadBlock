function CUploadBlob(){
    this.maxBlockSize = (1024 * 1024);  //Each file will be split in 1024 KB.   
    this.numberOfBlocks = 1;
    this.selectedFile = null;
    this.currentFilePointer = 0;
    this.totalBytesRemaining = 0;
    this.blockIds = new Array();
    this.blockIdPrefix = 'block-';
    this.submitUri = null;
    this.bytesUploaded = 0;
    this.reader = new FileReader();
    this.data = {};
}

CUploadBlob.prototype.uploadFile = function (url, file) {
    this.selectedFile = file;
    var fileSize = this.selectedFile.size;
    if (fileSize < this.maxBlockSize) {
        this.maxBlockSize = fileSize;
        console.log("max block size = " + this.maxBlockSize);
    }
    this.totalBytesRemaining = fileSize;
    if (fileSize % this.maxBlockSize == 0) {
        this.numberOfBlocks = fileSize / this.maxBlockSize;
    } else {
        this.numberOfBlocks = parseInt(fileSize / this.maxBlockSize, 10) + 1;
    }
    console.log("total blocks = " + this.numberOfBlocks);
    this.submitUri = url;
}
CUploadBlob.prototype.addData = function(datas){
    this.data = datas;
}
CUploadBlob.prototype.getData = function(){
    var formData = new FormData()
    Object.keys(this.data).forEach(key => formData.append(key, this.data[key]))
    return formData;
}
CUploadBlob.prototype.readerListener = function(blob){
    var self = this;
    var uri = self.submitUri;
    var formData = self.getData();
    formData.append('comp','block');
    formData.append('blockid',self.blockIds[self.blockIds.length - 1]);
    formData.append('blob', blob);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", uri, true);
    oReq.responseType = "json";
    oReq.onerror = function(error){
        console.log(error);
    }
    oReq.setRequestHeader('x-ms-blob-type', 'BlockBlob');
    oReq.onload = function (oEvent) {
        self.bytesUploaded += blob.size;
        console.log(blob.size);
        var percentComplete = ((parseFloat(self.bytesUploaded) / parseFloat(self.selectedFile.size)) * 100).toFixed(2);
        self.successBlob(percentComplete, oReq.status);
        self.uploadFileInBlocks();
    };
    oReq.send(formData);
}
CUploadBlob.prototype.uploadFileInBlocks = function(){
    var self = this;
    var file = self.selectedFile;
    var blob = null;
    if (self.totalBytesRemaining > 0) {
        //var fileContent = self.selectedFile.slice(self.currentFilePointer, self.currentFilePointer + self.maxBlockSize);

        if (file.slice) {
            blob = file.slice(self.currentFilePointer, self.currentFilePointer + self.maxBlockSize);
        } else if (file.webkitSlice) {
            blob = file.webkitSlice(self.currentFilePointer, self.currentFilePointer + self.maxBlockSize);
        } else if (file.mozSlice) {
            blob = file.mozSlice(self.currentFilePointer, self.currentFilePointer + self.maxBlockSize);
        }

        var blockId = self.blockIdPrefix + self.pad(self.blockIds.length, 6);
        console.log("block id = " + blockId);
        self.blockIds.push(btoa(blockId));
        self.readerListener(blob);
        self.currentFilePointer += self.maxBlockSize;
        self.totalBytesRemaining -= self.maxBlockSize;
        if (self.totalBytesRemaining < self.maxBlockSize) {
            self.maxBlockSize = self.totalBytesRemaining;
        }
    } else {
        self.commitBlockList();
    }
}
CUploadBlob.prototype.commitBlockList = function(){
    var self = this;
    var uri = self.submitUri;
    var requestBody = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
    for (var i = 0; i < this.blockIds.length; i++) {
        requestBody += '<Latest>' + this.blockIds[i] + '</Latest>';
    }
    requestBody += '</BlockList>';
    var formData = self.getData();;
    formData.append('comp','blocklist');
    formData.append('filename',self.selectedFile.name);
    formData.append('blocklist',requestBody);
    //xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
    //xhr.setRequestHeader('x-ms-blob-content-type', self.formatos(self.selectedFile.type));
    //xhr.setRequestHeader('Content-Length', blockIds.length);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", uri, true);
    oReq.responseType = "json";
    oReq.onerror = function(error){
        console.log(error);
    }
    oReq.onload = function (oEvent) {
        self.successBlobList(oEvent, oReq.status);
    };
    oReq.send(formData);
}
CUploadBlob.prototype.pad = function (number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}
CUploadBlob.prototype.successBlob = function (data, status){

}
CUploadBlob.prototype.errorBlob = function (xhr, desc, err){

}
CUploadBlob.prototype.successBlobList = function (data, status) {

}
CUploadBlob.prototype.errorBlobList = function (xhr, desc, err) {

}
CUploadBlob.prototype.formatos = function(format){
    var formats = ["application/pdf","text/xml","image/gif","image/jpeg","image/jpeg","image/png","image/tiff","image/tiff","image/x-ms-bmp"];
    for (var index = 0; index < formats.length; index++) {
        var element = formats[index];
        if(format == element){
            return format;
        }
    }
    return "application/octet-stream";
}

CUploadBlob.prototype.upload = function(){
    this.uploadFileInBlocks()
}