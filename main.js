let target = "";
let iValue = "";
let regValue = "////";
let flag = "";
let trash = "";
let reg;
let memory = "";
let buffer = "";
let errored = false;
let macro = false;
let inc = false;
let mtimes = 1;
let activeMacro = {};

// TODO https://www.google.com/search?q=キー+windows+mac+対応+javascript
function change() {
  let inp = $("#inputarea").val();
  $("#inputarea").val($("#outputarea").val());
  $("#outputarea").val(inp);
  $("#regex").change();
}
function stchange(replace = true) {
  iValue = $("#inputarea").val();
  if (~$("#det").text().indexOf("出力をコピー")) {
    if (replace) {
      navigator.clipboard.writeText($("#outputarea").val());
      return;
    }
    for (program of activeMacro.list) {
      const regGoing = program[2];
      if (regGoing) {
        iValue = iValue.replace(parse_regex(program[0]), program[1]);
      } else {
        iValue = iValue.split(program[0]).join(program[1]);
      }
    }
    $("#outputarea").val(iValue);
    if ($("#quote").prop("checked")) {
      iValue = '"' + iValue + '"';
    }
    return;
  }
  if (replace !== true && replace !== false) {
    replace = true;
  }
  if ($("#regok").prop("checked")) {
    [trash, regValue, flag] = $("#regex")
      .val()
      .split(/(.+)\//);
    if (!errored) {
      buffer = $("#outputarea").val();
    }
    try {
      regValue = regValue.slice(1);
    } catch (e) {
      errored = true;
      if (localStorage.edialog !== "false") {
        if (replace) {
          if (
            confirm(
              "正規表現を認識できませんでした。原因としては正規表現を//で囲んでいない可能性があります。修正しますか?\n\nエラーメッセージ▼\n" +
              e
            )
          ) {
            $("#regex").val("/正規表現を入力/g");
            $("#regex")[0].selectionStart = 1;
            $("#regex")[0].selectionEnd = 8;
            $("#regex")[0].focus();
          } else {
            if (
              confirm(
                "承知しました。以降このエラーのダイアログを表示しないようにしますか？"
              )
            ) {
              localStorage.edialog = "false";
            }
          }
        }
      }

      switch (e.message) {
        case "undefined is not an object (evaluating 'regValue.slice')":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現は/で囲ってください\n例：正規表現/g"
          );
          break;

        case "Invalid regular expression: missing )":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の(を閉じるかでエスケープしてください\n例：/正(規(表現)/g"
          );
          break;
        case "Invalid regular expression: unmatched parentheses":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の)を閉じるかでエスケープしてください\n例：/正)規(表現)/g"
          );
          break;
        case "Invalid regular expression:  at end of pattern":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現の終わりにを書くのをやめるか、でをエスケープしてください\n例：/正規表現\\/g"
          );
          break;

        case "Invalid regular expression: missing terminating ] for character class":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の[を閉じるかでエスケープしてください\n例：/正[規[表現]/g"
          );
          break;
        case "Invalid flags supplied to RegExp constructor.":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。文末の/の後には有効なフラグを使用するか、何も書かないでください\n例：/正規表現/gu"
          );
          break;
        default:
          $("#outputarea").val("正規表現に関してエラーが発生しました▼\n" + e);
          break;
      }

      return;
    }
    try {
      reg = new RegExp(regValue, flag);
      errored = false;
      $("#outputarea").val(buffer);
    } catch (e) {
      errored = true;

      if (localStorage.aedialog !== "false") {
        if (replace) {
          if (
            confirm(
              "何らかの原因により正規表現を生成できませんでした。修正しますか?\n\nエラー原因の例：\n・フラグが正しくない\n・エスケープが必要な文字に行われていない\n\nエラーメッセージ▼\n" +
              e
            )
          ) {
            $("#regex").val("/正規表現を入力/g");
            $("#regex")[0].selectionStart = 1;
            $("#regex")[0].selectionEnd = 8;
            $("#regex")[0].focus();
          } else {
            if (
              confirm(
                "承知しました。以降このエラーのダイアログを表示しないようにしますか？"
              )
            ) {
              localStorage.aedialog = "false";
            }
          }
        }
      }
      switch (e.message) {
        case "undefined is not an object (evaluating 'regValue.slice')":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現は/で囲ってください\n例：/正規表現/g"
          );
          break;

        case "Invalid regular expression: missing )":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の(を閉じるか\\でエスケープしてください\n例：/正(規(表現)/g"
          );
          break;
        case "Invalid regular expression: unmatched parentheses":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の)を閉じるか\\でエスケープしてください\n例：/正)規(表現)/g"
          );
          break;
        case "Invalid regular expression: \\ at end of pattern":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現の終わりに\\を書くのをやめるか、\\で\\をエスケープしてください\n例：/正規表現\\\\/g"
          );
          break;

        case "Invalid regular expression: missing terminating ] for character class":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。正規表現中の[を閉じるか\\でエスケープしてください\n例：/正\\[規[表現]/g"
          );
          break;
        case "Invalid flags supplied to RegExp constructor.":
          $("#outputarea").val(
            "正規表現に関してエラーが発生しました。文末の/の後には有効なフラグを使用するか、何も書かないでください\n例：/正規表現/gu"
          );
          break;
        default:
          $("#outputarea").val("正規表現に関してエラーが発生しました▼\n" + e);
          break;
      }

      return;
    }
    if (replace) {
      if ($("#quote").prop("checked")) {
        target = '"' + iValue.replace(reg, $("#astring").val()) + '"';
      } else {
        target = iValue.replace(reg, $("#astring").val());
      }

      $("#outputarea").val(target);
      if ($("#copy").prop("checked")) {
        navigator.clipboard.writeText(target).catch(function (e) {
          console.log("catched");
          var str = target;

          var listener = function (e) {
            e.clipboardData.setData("text/plain", str);
            e.preventDefault();
            document.removeEventListener("copy", listener);
          };

          document.addEventListener("copy", listener);
          document.execCommand("copy");
        });
      }
    } else {
      divtext = "";
      let loop = 0;
      val = $("#inputarea").val();
      loop = iValue.search(reg);
      count = [];
      if (loop !== -1) {
        $.each(iValue.match(reg), function (index, content) {
          count[index] = content.length;
        });
      }

      let lcount = 0;
      if (
        loop > 0 &&
        count.reduce(function (p, c) {
          return Math.max(p, c);
        }) > 0
      ) {
        while (loop !== -1) {
          inSpan(loop, count[lcount]);
          iValue = iValue.slice(loop + count[lcount], iValue.length);
          loop = iValue.search(reg);

          lcount++;
          if (lcount >= 1000) {
            alert(
              "検索が終了しないため、一時的に検索結果の表示を停止しました。置換は可能です"
            );
            throw new Error([loop, count[lcount], iValue]);
          }
        }
      }
      divtext += escape_html(iValue);
      $(".screen").html(divtext.replace(/\n/g, "<br>"));
    }
  } else {
    reg = $("#regex").val();

    if (replace) {
      if ($("#quote").prop("checked")) {
        target = '"' + iValue.split(reg).join($("#astring").val()) + '"';
      } else {
        target = iValue.split(reg).join($("#astring").val());
      }
      $("#outputarea").val(target);
      if ($("#copy").prop("checked")) {
        navigator.clipboard.writeText(target).catch(function (e) {
          console.log("catched");
          var str = target;

          var listener = function (e) {
            e.clipboardData.setData("text/plain", str);
            e.preventDefault();
            document.removeEventListener("copy", listener);
          };

          document.addEventListener("copy", listener);
          document.execCommand("copy");
        });
      }
    } else {
      divtext = "";
      let loop = 0;
      let mlength = reg.length;
      val = $("#inputarea").val();
      loop = iValue.indexOf(reg);
      let lscount = 0;
      if (loop + mlength > 0) {
        while (loop !== -1) {
          inSpan(loop, mlength);
          iValue = iValue.slice(loop + mlength, iValue.length);
          loop = iValue.search(reg);
          lscount++;
          //if (lscount>=10000) throw new Error([loop,mlength,iValue]);
        }
      }

      divtext += escape_html(iValue);
      $(".screen").html(divtext.replace(/\n/g, "<br>"));
    }
  }
  /*if ($("#check").prop("checked")){
    target="\""+iValue.replace("$1\\$2")+"\""
  }else{
    target="\""+iValue.replace(/\"/g,"\\\"")+"\""
    $("#outputarea").val(target);

  }*/
}
let divtext = "";
let val = "";
let json = { list: [] };
function inSpan(start, len) {
  const sst = start !== 0 ? iValue.slice(0, start) : "";
  spaned = iValue
    .slice(start, start + len)
    .replace(
      /\n/g,
      "↓改行(uewouiwbyuvbruywbuyiecbuervbcuerivbceurvevberuyebcuervcbuyuecbyue)"
    )
    .replace(/\s/g, "・")
    .replace(
      "改行(uewouiwbyuvbruywbuyiecbuervbcuerivbceurvevberuyebcuervcbuyuecbyue)",
      "\n"
    );

  divtext +=
    escape_html(sst) +
    '<span class="yellow">' +
    escape_html(spaned) +
    "</span>";
  return;
}
function parse_regex(regex) {
  let [_, reg, flag] = regex.split(/(.+)\//);
  try {
    reg = reg.slice(1);
    reg = new RegExp(reg, flag);
  } catch (e) {
    switch (e.message) {
      case "undefined is not an object (evaluating 'regValue.slice')":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。正規表現は/で囲ってください\n例：/正規表現/g"
        );
        break;

      case "Invalid regular expression: missing )":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。正規表現中の(を閉じるか\\でエスケープしてください\n例：/正(規(表現)/g"
        );
        break;
      case "Invalid regular expression: unmatched parentheses":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。正規表現中の)を閉じるか\\でエスケープしてください\n例：/正)規(表現)/g"
        );
        break;
      case "Invalid regular expression: \\ at end of pattern":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。正規表現の終わりに\\を書くのをやめるか、\\で\\をエスケープしてください\n例：/正規表現\\\\/g"
        );
        break;

      case "Invalid regular expression: missing terminating ] for character class":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。正規表現中の[を閉じるか\\でエスケープしてください\n例：/正\\[規[表現]/g"
        );
        break;
      case "Invalid flags supplied to RegExp constructor.":
        $("#outputarea").val(
          "正規表現に関してエラーが発生しました。文末の/の後には有効なフラグを使用するか、何も書かないでください\n例：/正規表現/gu"
        );
        break;
      default:
        $("#outputarea").val("正規表現に関してエラーが発生しました▼\n" + e);
        break;
    }
  }

  return reg;
}
function makeURL(now = true) {
  if (now) {
    const serch = $("#regex").val();
    const change = $("#astring").val();
    const json1 = {
      list: [serch, change],
      regex: $("#regok").prop("checked"),
    };
    showurl(json1);
  } else {
    if (!macro) {
      if (isNotPC()) {
        macro = confirm(
          "ここでは複数の文字列の置換処理をまとめて、関数として記録することができます。まず、一回目の処理で検索する文字の欄と、置換先の文字を入力して、もう一度このボタンを押してください"
        );
      } else {
        macro = confirm(
          "ここでは複数の文字列の置換処理をまとめて、関数として記録することができます。まず、一回目の処理で検索する文字の欄と、置換先の文字を入力して、もう一度、マクロの登録ボタンかショートカットキーの（Ctrl+M）を押してください"
        );
      }
    } else {
      const serch = $("#regex").val();
      const change = $("#astring").val();
      json.list.push([serch, change, $("#regok").prop("checked")]);
      macro = confirm(
        `${mtimes}回目の処理の登録が完了しました。登録を続けるにはOKを押してください。終了するにはキャンセルを押してください`
      );
      mtimes++;
      if (!macro) {
        mtimes = 1;
        if (
          confirm(
            `マクロのURLが完成しました。(OKを押すと1秒ほどで完成したURLがコピーされます)。\n${showurl(
              json
            )}`
          )
        ) {
          setTimeout(() => {
            navigator.clipboard.writeText(showurl(json)).then(
              () => {
                json = { list: [] };
              },
              () => {
                json = { list: [] };
              }
            );
          }, 1000);
        }
      }
    }
  }
}
function showurl(jsonv = undefined) {
  const base = location.protocol + "//" + location.host + location.pathname;
  let query =
    jsonv !== undefined
      ? "?query=" + encodeURIComponent(JSON.stringify(jsonv))
      : "";
  if (inc) {
    query += "&content=" + encodeURIComponent($("#inputarea").val());
  }
  $("#tocopy").html('<a href="' + base + query + '">' + base + query + "</a>");
  history.replaceState("", "", "index.html" + query);
  return base + query;
}
function isNotPC() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile|iPad/)) {
    return true;
  } else {
    return false;
  }
}
$(function () {
  $("#tocopy").html(
    '<a href="' + location.href + '">' + location.href + "</a>"
  );
  if (isNotPC()) {
    $("#det").text("置換");
  } else {
    $("#change").text("入力エリアと出力エリアの内容を入れ替える (Ctrl+I)");
    $("#register").text("マクロの登録 (Ctrl+M)");
  }
  shortcut.add("Ctrl+Enter", function () {
    $("#det").click();
  });
  shortcut.add("Ctrl+I", function () {
    change();
  });
  shortcut.add("Ctrl+M", function () {
    $("#register").click();
  });
  const param = new URL(location.href).searchParams;
  const query = param.get("query");
  const content = param.get("content");

  if (query === null) {
  } else {
    const ob = JSON.parse(query);
    if (ob.regex) {
      $("#regok").prop("checked", "true");
      $("#regok").trigger("change");
    }
    if ("regex" in ob) {
      $("#regex").val(ob.list[0]);
      $("#astring").val(ob.list[1]);
    } else {
      if (isNotPC()) {
        $("#det").text("出力をコピー");
      } else {
        $("#det").text("出力をコピー(Ctrl+Enter)");
      }

      $(".description").prop("hidden", true);
      activeMacro = ob;
    }
  }
  if (content === null) {
  } else {
    $("#inputarea").val(content);
  }

  document.addEventListener("paste", function (e) {
    $("#regex").change();
  });
  $("#inputarea").keyup(function () {
    $("#regex").change();
  });
  $("#regex").keyup(function () {
    $("#regex").change();
  });
  $("#regex").change(function () {
    stchange(false);
    makeURL();
  });
  $("#astring").keyup(function () {
    makeURL();
  });
  $("#copyme").click(function () {
    navigator.clipboard.writeText($("#tocopy").text());
  });
  $("#det").click(stchange);
  $(document).on("change", ".spselect", function (e) {
    if ($(this).val() === "") {
      return;
    }
    $("#regok").prop("checked", "true");
    $("#regok").trigger("change");
    switch ($(this).val()) {
      case "1":
        $("#regex").val("/\\n/g");

        break;
      case "2":
        $("#regex").val("/\\d/g");
        break;
      case "3":
        $("#regex").val("/[A-Za-z]/g");
        break;
      case "4":
        $("#regex").val("/\\w/g");
        break;
      case "5":
        $("#regex").val("/\\s/g");
        break;
      default:
    }
    $("#regex").change();
  });
  $("#include").on("change", function (e) {
    const isChecked = $("#include").prop("checked");
    if (isChecked) {
      inc = true;
      makeURL();
    } else {
      inc = false;
    }
    // localStorageに状態を保存
    localStorage.setItem("includeEnabled", isChecked.toString());
  });
  $("#register").click(function () {
    makeURL(false);
  });
  $("#regok").on("change", function (e) {
    const isChecked = $(e.target).prop("checked");

    // localStorageに状態を保存
    localStorage.setItem("regexEnabled", isChecked.toString());

    if (isChecked) {
      $(".storreg").text("正規表現　　 ");
      $("#regex").val("/正規表現を入力/g");
      $("#regex")[0].selectionStart = 1;
      $("#regex")[0].selectionEnd = 8;
      $("#regex")[0].focus();
      $("#regex").change();
      $(".special").html("");
      console.log("正規表現モードが有効になりました");
    } else {
      $(".storreg").text("検索する文字 ");
      $("#regex").val("");
      $("#regex")[0].focus();
      $("#regex").change();
      $(".special").html(
        '　特殊文字　:　<select class="spselect" name="">      <option value="">選択してください</option>      <option value="1">改行</option>      <option value="2">数字</option>      <option value="3">アルファベット</option>      <option value="4">半角英数字</option>      <option value="5">ホワイトスペース</option>    </select>'
      );
      console.log("通常の検索モードに切り替わりました");
    }
  });

  // 自動コピー設定の変更時にlocalStorageに保存
  $("#copy").on("change", function (e) {
    const isChecked = $(e.target).prop("checked");
    localStorage.setItem("autoCopy", isChecked.toString());
  });

  // クオート設定の変更時にlocalStorageに保存
  $("#quote").on("change", function (e) {
    const isChecked = $(e.target).prop("checked");
    localStorage.setItem("quoteEnabled", isChecked.toString());
  });

  // イベントハンドラー設定後にlocalStorageから設定を復元
  const regexEnabled = localStorage.getItem("regexEnabled");
  if (regexEnabled === "true") {
    $("#regok").prop("checked", true);
    $("#regok").trigger("change");
  } else if (regexEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("regexEnabled", "false");
  }

  // localStorageから自動コピーの設定を復元
  const autoCopy = localStorage.getItem("autoCopy");
  if (autoCopy === "false") {
    $("#copy").prop("checked", false);
  } else if (autoCopy === null) {
    // 初回訪問時はデフォルトでtrue（HTMLのchecked属性に従う）
    localStorage.setItem("autoCopy", "true");
  }

  // localStorageからクオートの設定を復元
  const quoteEnabled = localStorage.getItem("quoteEnabled");
  if (quoteEnabled === "true") {
    $("#quote").prop("checked", true);
  } else if (quoteEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("quoteEnabled", "false");
  }

  // localStorageからURL含める設定を復元
  const includeEnabled = localStorage.getItem("includeEnabled");
  if (includeEnabled === "true") {
    $("#include").prop("checked", true);
    inc = true;
  } else if (includeEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("includeEnabled", "false");
  }
});
