var dir = 'files';
function getDir() {
    var search = location.href.split('#');
    var dir = 'files';
    if (search.length > 1) {
        dir = decodeURIComponent(search[1]);
    }
    return dir
}
function uploadProgress(percentComplete) {
    var progressContent = document.getElementById("progressContent");
    console.log(percentComplete);
    percentComplete = parseFloat(percentComplete);
    var elem = document.getElementById("progress-bar");
    progressContent.style.display = 'inline-block';
    if (percentComplete >= 100) {
        elem.style.width = percentComplete + '%';
        elem.innerHTML = percentComplete.toFixed(2) + '%'
        progressContent.style.display = 'none';
    } else {
        elem.style.width = percentComplete + '%';
        elem.innerHTML = percentComplete.toFixed(2) + '%'
    }
}

function escapeHTML(text) {
    return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}
// Convert file sizes from bytes to human readable units

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}