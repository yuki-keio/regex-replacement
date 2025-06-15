function aRandom(arr) {
  return arr[Math.floor(Math.random()*(arr.length))];
}
function betweenRandom(arg1=0,arg2,includesecond=true) {
  if (includesecond){
return Math.floor(arg1+Math.random()*(arg2-arg1+1));
  }else{
      return Math.floor(arg1+Math.random()*(arg2-arg1));
  }
}
function awaited(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve,ms);
  })
}
async function waitThen(ms,returnValue=ms,callBack=function(){}) {
await awaited(ms);
callBack();
return returnValue;
}
function nAlert(num=0) {
  alert(num);
}
function functionTest(fun,iterate=10,...args) {
  for (let i=0;1<=iterate;i++){
    console.log(i+"回目:"+fun(...args));
  }
}
function escape_html (string) {
  if(typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  });
}
function toHalf(arg) {
  return arg.replace(/[０-９Ａ-Ｚａ-ｚ]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}
function toFull(arg) {
  return arg.replace(/[0-9A-Za-z]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}
