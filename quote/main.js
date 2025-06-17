let targetc = "";
let iValue = "";
function esquote() {
  iValue = document.getElementById('inputarea').value;
  if (document.getElementById('check').checked) {
    target = '"' + (iValue.replace(/([^\\]*?)(["'])/g, "$1\\$2")).replace(/\n/g, "") + '"';
    document.getElementById('outputarea').value = target;
  } else {
    target = '"' + (iValue.replace(/["']/g, '\\"')).replace(/\n/g, "") + '"';
    document.getElementById('outputarea').value = target;
  }
  if (document.getElementById('copy').checked) {
    navigator.clipboard.writeText(target);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('det').addEventListener('click', esquote);
});
