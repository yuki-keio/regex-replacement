function esquote() {
  iValue = prompt("エスケープする文字列", "入力");
  target = '"' + iValue.replace(/([^\\]*?)(["'])/g, "$1\\$2") + '"';
  navigator.clipboard.writeText(target);
}

document.addEventListener('DOMContentLoaded', function () {
  shortcut.add("Meta+D", esquote);
});
