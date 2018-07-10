// ==UserScript==
// @name        baiduShareCopyForZhidaoV2
// @namespace   https://github.com/dodying/Dodying-UserJs
// @name:zh-CN  【百度云】分享-答题专用V2
// @description:zh-CN
// @include     http://pan.baidu.com/disk/home*
// @version     2.0
// @grant       GM_setClipboard
// @author      dodying
// @namespace   https://github.com/dodying/Dodying-UserJs
// @supportURL  https://github.com/dodying/Dodying-UserJs/issues
// @icon        https://raw.githubusercontent.com/dodying/UserJs/master/Logo.png
// @require     https://greasyfork.org/scripts/18532-filesaver/code/FileSaver.js?version=127839
// @run-at      document-end
// ==/UserScript==
var interval = setInterval(function () {
  if (document.querySelector('input.share-url')) {
    var inputUrl = document.querySelector('input.share-url');
    inputUrl.oncopy = function (e) {
      e.preventDefault();
      var sharedName = document.querySelector('.item-active>.file-name>.text>a.filename').innerText.replace(/\.(.*?)$/, '');
      var sharedSize = document.querySelector('.item-active>.file-size').innerText;
      var sharedUpdateTime = document.querySelector('.item-active>.ctime').innerText;
      var inputPwd = document.querySelector('.share-password');
      var clip = '链接:' + inputUrl.value;
      if (inputPwd.value !== '') { //无提取密码
        clip += ' 密码:' + inputPwd.value;
      };
      //clip = '文件名称:' + sharedName + '\n文件大小:' + sharedSize + '\n上传时间:' + sharedUpdateTime + '\n' + clip;
      var word = '你好，这可能是你需要的[' + sharedName + ']，\n文件大小为[' + sharedSize + ']，请享用。\n如无误，请及时采纳，谢谢。（￣︶￣）/\n如果，有问题，请随意追问，我会及时回复。\n';
      //word = word + clip;
      //GM_setClipboard(word);
      textToImg(word, 20, 'normal', '#1f8dbd');
      GM_setClipboard(clip);
    }
    clearInterval(interval);
  }
}, 200);
function textToImg(txt, size, weight, color) {
  var len = 0;
  var txtArray = txt.split('\n');
  var i;
  for (i = 0; i < txtArray.length; i++) {
    if (len < txtArray[i].length) len = txtArray[i].length;
  }
  if (txtArray.length === 1) txtArray.push('');
  i = 0;
  var fontSize = size;
  var canvas = document.createElement('canvas');
  canvas.width = fontSize * len;
  canvas.height = fontSize * (txtArray.length - 1) + (fontSize / 2);
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.font = weight + ' ' + fontSize + 'px sans-serif';
  context.textBaseline = 'top';
  canvas.style.display = 'none';
  for (var j = 0; j < txtArray.length; j++) {
    context.fillText(txtArray[j], 0, (fontSize / 4 + fontSize * i), canvas.width);
    context.fillText('\n', 0, (fontSize / 4 + fontSize * i++), canvas.width);
  }
  canvas.toBlob(function (blob) {
    saveAs(blob, '1.png');
  });
}
