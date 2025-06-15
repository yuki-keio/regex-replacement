let targetc="";
let iValue="";
function esquote() {
  iValue=$("#inputarea").val();
if ($("#check").prop("checked")){
  target="\""+(iValue.replace(/([^\\]*?)(["'])/g,"$1\\$2")).replace(/\n/g,"")+"\"";
  $("#outputarea").val(target);

}else{
  target="\""+(iValue.replace(/["']/g,"\\\"")).replace(/\n/g,"")+"\""
  $("#outputarea").val(target);

}
if ($("#copy").prop("checked")){
  navigator.clipboard.writeText(target);
}

}
$(function() {
$("#det").click(esquote);

});
