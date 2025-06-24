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

// 新しいUI用のヘルパー関数
let isUpdatingFromUI = false; // 無限ループ防止フラグ

function updateFlags(flagString) {
  document.getElementById('flagG').checked = flagString.includes('g');
  document.getElementById('flagI').checked = flagString.includes('i');
  document.getElementById('flagM').checked = flagString.includes('m');
  document.getElementById('flagS').checked = flagString.includes('s');
  document.getElementById('flagU').checked = flagString.includes('u');
  document.getElementById('flagY').checked = flagString.includes('y');
}

function getFlagsFromUI() {
  let flags = '';
  if (document.getElementById('flagG').checked) flags += 'g';
  if (document.getElementById('flagI').checked) flags += 'i';
  if (document.getElementById('flagM').checked) flags += 'm';
  if (document.getElementById('flagS').checked) flags += 's';
  if (document.getElementById('flagU').checked) flags += 'u';
  if (document.getElementById('flagY').checked) flags += 'y';
  return flags;
}

function updateRegexFromUI() {
  if (isUpdatingFromUI) return; // 無限ループ防止

  const pattern = document.getElementById('regexPattern').value;
  const flags = getFlagsFromUI();
  const regex = document.getElementById('regex');

  isUpdatingFromUI = true;
  regex.value = `/${pattern}/${flags}`;
  regex.dispatchEvent(new Event('change'));
  isUpdatingFromUI = false;
}

// regex要素の変更をregexPatternに反映する関数
function syncRegexToPattern() {
  if (isUpdatingFromUI) return; // 無限ループ防止

  const regok = document.getElementById('regok');
  if (regok.checked) {
    const regex = document.getElementById('regex');
    const regexPattern = document.getElementById('regexPattern');

    const match = regex.value.match(/^\/(.*)\/([gimsuvy]*)$/);
    if (match) {
      isUpdatingFromUI = true;
      regexPattern.value = match[1];
      updateFlags(match[2]);
      isUpdatingFromUI = false;
    }
  }
}

// TODO https://www.google.com/search?q=キー+windows+mac+対応+javascript
function change() {
  const inputarea = document.getElementById('inputarea');
  const outputarea = document.getElementById('outputarea');
  const regex = document.getElementById('regex');

  let inp = inputarea.value;
  inputarea.value = outputarea.value;
  outputarea.value = inp;

  // change イベントを発火
  const event = new Event('change');
  regex.dispatchEvent(event);
}
function escape_html(string) {
  if (typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function (match) {
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
function stchange(replace = true) {
  const inputarea = document.getElementById('inputarea');
  const outputarea = document.getElementById('outputarea');
  const det = document.getElementById('det');
  const quote = document.getElementById('quote');
  const regok = document.getElementById('regok');
  const regex = document.getElementById('regex');
  const astring = document.getElementById('astring');
  const copy = document.getElementById('copy');
  const screen = document.querySelector('.screen');

  iValue = inputarea.value;
  if (det.textContent.indexOf("出力をコピー") !== -1) {
    if (replace) {
      navigator.clipboard.writeText(outputarea.value);
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
    outputarea.value = iValue;
    if (quote.checked) {
      iValue = '"' + iValue + '"';
    }
    return;
  }
  if (replace !== true && replace !== false) {
    replace = true;
  }
  if (regok.checked) {
    [trash, regValue, flag] = regex.value.split(/(.+)\//);
    if (!errored) {
      buffer = outputarea.value;
    }
    try {
      regValue = regValue.slice(1);
    } catch (e) {
      errored = true;
      if (localStorage.edialog !== "false") {
        if (replace) {
          if (
            confirm(
              "正規表現を認識できませんでした。\n\nエラーメッセージ▼\n" +
              e
            )
          ) {
            regex.value = "/正規表現を入力/g";
            regex.selectionStart = 1;
            regex.selectionEnd = 8;
            regex.focus();
            syncRegexToPattern(); // 正規表現モードの場合にregexPatternに反映
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
          outputarea.value =
            "正規表現に関してエラーが発生しました。";
          break;

        case "Invalid regular expression: missing )":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の(を閉じるか\\でエスケープしてください\n例：/正(規(表現)/g";
          break;
        case "Invalid regular expression: unmatched parentheses":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の)を閉じるか\\でエスケープしてください\n例：/正)規(表現)/g";
          break;
        case "Invalid regular expression:  at end of pattern":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現の終わりに\\を書くのをやめるか、\\で\\をエスケープしてください\n例：/正規表現\\/g";
          break;

        case "Invalid regular expression: missing terminating ] for character class":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の[を閉じるか\\でエスケープしてください\n例：/正[規[表現]/g";
          break;
        case "Invalid flags supplied to RegExp constructor.":
          outputarea.value =
            "正規表現に関してエラーが発生しました";
          break;
        default:
          outputarea.value = "正規表現に関してエラーが発生しました▼\n" + e;
          break;
      }

      return;
    }
    try {
      reg = new RegExp(regValue, flag);
      errored = false;
      outputarea.value = buffer;
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
            regex.value = "/正規表現を入力/g";
            regex.selectionStart = 1;
            regex.selectionEnd = 8;
            regex.focus();
            syncRegexToPattern(); // 正規表現モードの場合にregexPatternに反映
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
          outputarea.value =
            "正規表現に関して「未定義」エラーが発生しました。";
          break;

        case "Invalid regular expression: missing )":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の(を閉じるか\\でエスケープしてください\n例：/正(規(表現)/g";
          break;
        case "Invalid regular expression: unmatched parentheses":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の)を閉じるか\\でエスケープしてください\n例：/正)規(表現)/g";
          break;
        case "Invalid regular expression: \\ at end of pattern":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現の終わりに\\を書くのをやめるか、\\で\\をエスケープしてください\n例：/正規表現\\\\/g";
          break;

        case "Invalid regular expression: missing terminating ] for character class":
          outputarea.value =
            "正規表現に関してエラーが発生しました。正規表現中の[を閉じるか\\でエスケープしてください\n例：/正\\[規[表現]/g";
          break;
        case "Invalid flags supplied to RegExp constructor.":
          outputarea.value =
            "正規表現のフラグに関してエラーが発生しました。";
          break;
        default:
          outputarea.value = "正規表現に関してエラーが発生しました▼\n" + e;
          break;
      }
      return;
    }
    if (replace) {
      if (quote.checked) {
        target = '"' + iValue.replace(reg, astring.value) + '"';
      } else {
        target = iValue.replace(reg, astring.value);
      }

      outputarea.value = target;
      if (copy.checked) {
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
      let currentPos = 0;
      let match;

      // 正規表現のグローバル検索を適切に処理
      if (reg.global) {
        reg.lastIndex = 0; // グローバル検索のインデックスをリセット
      }

      // 新しい正規表現オブジェクトを作成（元のオブジェクトの状態を保持するため）
      const searchReg = new RegExp(reg.source, reg.flags);

      while ((match = searchReg.exec(iValue)) !== null) {
        // マッチする前の部分を追加
        divtext += escape_html(iValue.slice(currentPos, match.index));

        // マッチした部分をハイライト
        const matchedText = match[0]
          .replace(/\n/g, "↓改行(uewouiwbyuvbruywbuyiecbuervbcuerivbceurvevberuyebcuervcbuyuecbyue)")
          .replace(/\s/g, "・")
          .replace("改行(uewouiwbyuvbruywbuyiecbuervbcuerivbceurvevberuyebcuervcbuyuecbyue)", "\n");
        divtext += '<span class="yellow">' + escape_html(matchedText) + '</span>';

        currentPos = match.index + match[0].length;

        // グローバル検索でない場合は1回だけ
        if (!reg.global) {
          break;
        }

        // 無限ループ防止
        if (match[0].length === 0) {
          searchReg.lastIndex++;
        }
        if (searchReg.lastIndex > iValue.length) {
          break;
        }
      }

      // 残りの部分を追加
      divtext += escape_html(iValue.slice(currentPos));
      screen.innerHTML = divtext.replace(/\n/g, "<br>");
    }
  } else {
    reg = regex.value;

    if (replace) {
      if (quote.checked) {
        target = '"' + iValue.split(reg).join(astring.value) + '"';
      } else {
        target = iValue.split(reg).join(astring.value);
      }
      outputarea.value = target;
      if (copy.checked) {
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
      val = inputarea.value;
      loop = iValue.indexOf(reg);
      let lscount = 0;
      if (loop + mlength > 0) {
        while (loop !== -1) {
          inSpan(loop, mlength);
          iValue = iValue.slice(loop + mlength, iValue.length);
          loop = iValue.indexOf(reg);
          lscount++;
          //if (lscount>=10000) throw new Error([loop,mlength,iValue]);
        }
      }

      divtext += escape_html(iValue);
      screen.innerHTML = divtext.replace(/\n/g, "<br>");
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
    const outputarea = document.getElementById('outputarea');
    switch (e.message) {
      case "undefined is not an object (evaluating 'regValue.slice')":
        outputarea.value =
          "正規表現に関してエラーが発生しました。正規表現は/で囲ってください\n例：/正規表現/g";
        break;

      case "Invalid regular expression: missing )":
        outputarea.value =
          "正規表現に関してエラーが発生しました。正規表現中の(を閉じるか\\でエスケープしてください\n例：/正(規(表現)/g";
        break;
      case "Invalid regular expression: unmatched parentheses":
        outputarea.value =
          "正規表現に関してエラーが発生しました。正規表現中の)を閉じるか\\でエスケープしてください\n例：/正)規(表現)/g";
        break;
      case "Invalid regular expression: \\ at end of pattern":
        outputarea.value =
          "正規表現に関してエラーが発生しました。正規表現の終わりに\\を書くのをやめるか、\\で\\をエスケープしてください\n例：/正規表現\\\\/g";
        break;

      case "Invalid regular expression: missing terminating ] for character class":
        outputarea.value =
          "正規表現に関してエラーが発生しました。正規表現中の[を閉じるか\\でエスケープしてください\n例：/正\\[規[表現]/g";
        break;
      case "Invalid flags supplied to RegExp constructor.":
        outputarea.value =
          "正規表現に関してエラーが発生しました。文末の/の後には有効なフラグを使用するか、何も書かないでください\n例：/正規表現/gu";
        break;
      default:
        outputarea.value = "正規表現に関してエラーが発生しました▼\n" + e;
        break;
    }
  }

  return reg;
}
function makeURL(now = true) {
  const regex = document.getElementById('regex');
  const astring = document.getElementById('astring');
  const regok = document.getElementById('regok');

  if (now) {
    const serch = regex.value;
    const change = astring.value;
    const json1 = {
      list: [serch, change],
      regex: regok.checked,
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
      const serch = document.getElementById('regex').value;
      const change = document.getElementById('astring').value;
      json.list.push([serch, change, document.getElementById('regok').checked]);
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
    query += "&content=" + encodeURIComponent(document.getElementById('inputarea').value);
  }
  document.getElementById('tocopy').innerHTML = '<a href="' + base + query + '">' + base + query + "</a>";
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
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('tocopy').innerHTML =
    '<a href="' + location.href + '">' + location.href + "</a>";
  document.getElementById('regex').addEventListener('change', function () {
    stchange(false);
    makeURL();
  });
  if (isNotPC()) {
    document.getElementById('det').textContent = "置換";
  } else {
    document.getElementById('change').textContent = "入力エリアと出力エリアの内容を入れ替える (Ctrl+I)";
    document.getElementById('register').textContent = "マクロの登録 (Ctrl+M)";
  }
  shortcut.add("Ctrl+Enter", function () {
    document.getElementById('det').click();
  });
  shortcut.add("Ctrl+I", function () {
    change();
  });
  shortcut.add("Ctrl+M", function () {
    document.getElementById('register').click();
  });
  const param = new URL(location.href).searchParams;
  const query = param.get("query");
  const content = param.get("content");
  if (query !== null) {
    const ob = JSON.parse(query);
    if (ob.regex) {
      document.getElementById('regok').checked = true;
      localStorage.setItem("regexEnabled", "true");
      document.getElementById('regok').dispatchEvent(new Event('change'));
    } else {
      document.getElementById('regok').checked = false;
      localStorage.setItem("regexEnabled", "false");
      document.getElementById('regok').dispatchEvent(new Event('change'));
    }
    if ("regex" in ob) {
      document.getElementById('regex').value = ob.list[0];
      document.getElementById('astring').value = ob.list[1];
      syncRegexToPattern(); // 正規表現モードの場合にregexPatternに反映
      setTimeout(() => {
        document.getElementById('regex').dispatchEvent(new Event('change'));
      }, 30);
    } else {
      if (isNotPC()) {
        document.getElementById('det').textContent = "出力をコピー";
      } else {
        document.getElementById('det').textContent = "出力をコピー(Ctrl+Enter)";
      }

      document.querySelector('.description').hidden = true;
      activeMacro = ob;
    }
  }
  if (content === null) {
  } else {
    document.getElementById('inputarea').value = content;
  }

  document.addEventListener("paste", function (e) {
    document.getElementById('regex').dispatchEvent(new Event('change'));
  });
  document.getElementById('inputarea').addEventListener('keyup', function () {
    document.getElementById('regex').dispatchEvent(new Event('change'));
  });
  document.getElementById('regex').addEventListener('keyup', function () {
    document.getElementById('regex').dispatchEvent(new Event('change'));
  });
  document.getElementById('astring').addEventListener('keyup', function () {
    makeURL();
  });
  document.getElementById('copyme').addEventListener('click', function () {
    navigator.clipboard.writeText(document.getElementById('tocopy').textContent);
  });
  document.getElementById('det').addEventListener('click', stchange);
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains('spselect')) {
      if (e.target.value === "") {
        return;
      }
      if (!document.getElementById('regok').checked) {
        document.getElementById('regok').checked = true;
        document.getElementById('regok').dispatchEvent(new Event('change'));
      }
      switch (e.target.value) {
        case "1":
          document.getElementById('regex').value = "/\\n/g";
          break;
        case "2":
          document.getElementById('regex').value = "/\\d/g";
          break;
        case "3":
          document.getElementById('regex').value = "/[A-Za-z]/g";
          break;
        case "4":
          document.getElementById('regex').value = "/\\w/g";
          break;
        case "5":
          document.getElementById('regex').value = "/\\s/g";
          break;
        default:
      }
      document.getElementById('regex').dispatchEvent(new Event('change'));
      syncRegexToPattern(); // 正規表現モードの場合にregexPatternに反映
    }
  });
  document.getElementById('include').addEventListener('change', function (e) {
    const isChecked = e.target.checked;
    if (isChecked) {
      inc = true;
      makeURL();
    } else {
      inc = false;
    }
    // localStorageに状態を保存
    localStorage.setItem("includeEnabled", isChecked.toString());
  });
  document.getElementById('register').addEventListener('click', function () {
    makeURL(false);
  });
  document.getElementById('regok').addEventListener('change', function (e) {
    const isChecked = e.target.checked;
    const regexMode = document.getElementById('regexMode');
    const regex = document.getElementById('regex');

    // localStorageに状態を保存
    localStorage.setItem("regexEnabled", isChecked.toString());

    if (isChecked) {
      document.querySelector('.storreg').textContent = "正規表現　　 ";
      regexMode.style.display = 'block';
      regex.style.display = 'none';

      // 既存の値を新しいUIに移行
      const currentValue = regex.value;
      if (currentValue && currentValue.startsWith('/') && currentValue.includes('/')) {
        const match = currentValue.match(/^\/(.*)\/([gimsuvy]*)$/);
        if (match) {
          document.getElementById('regexPattern').value = match[1];
          updateFlags(match[2]);
        }
      } else {
        // 初期状態の設定
        document.getElementById('regexPattern').value = "";
        document.getElementById('flagG').checked = true;
        document.getElementById('flagI').checked = false;
        document.getElementById('flagM').checked = false;
        document.getElementById('flagS').checked = false;
        document.getElementById('flagU').checked = false;
        document.getElementById('flagY').checked = false;
        updateRegexFromUI();
      }

      document.getElementById('regexPattern').focus();
      console.log("正規表現モードが有効になりました");
    } else {
      document.querySelector('.storreg').textContent = "検索する文字 ";
      regexMode.style.display = 'none';
      regex.style.display = 'block';
      regex.value = "";
      regex.focus();
      regex.dispatchEvent(new Event('change'));
      console.log("通常の検索モードに切り替わりました");
    }
  });

  // 自動コピー設定の変更時にlocalStorageに保存
  document.getElementById('copy').addEventListener('change', function (e) {
    const isChecked = e.target.checked;
    localStorage.setItem("autoCopy", isChecked.toString());
  });

  // クオート設定の変更時にlocalStorageに保存
  document.getElementById('quote').addEventListener('change', function (e) {
    const isChecked = e.target.checked;
    localStorage.setItem("quoteEnabled", isChecked.toString());
  });

  // イベントハンドラー設定後にlocalStorageから設定を復元
  const regexEnabled = localStorage.getItem("regexEnabled");
  if (regexEnabled === "true") {
    document.getElementById('regok').checked = true;
    // 正規表現モードのUIを表示
    document.getElementById('regexMode').style.display = 'block';
    document.getElementById('regex').style.display = 'none';
    document.querySelector('.storreg').textContent = "正規表現　　 ";
    document.getElementById('regok').dispatchEvent(new Event('change'));
  } else if (regexEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("regexEnabled", "false");
  }

  // localStorageから自動コピーの設定を復元
  const autoCopy = localStorage.getItem("autoCopy");
  if (autoCopy === "false") {
    document.getElementById('copy').checked = false;
  } else if (autoCopy === null) {
    // 初回訪問時はデフォルトでtrue（HTMLのchecked属性に従う）
    localStorage.setItem("autoCopy", "true");
  }

  // localStorageからクオートの設定を復元
  const quoteEnabled = localStorage.getItem("quoteEnabled");
  if (quoteEnabled === "true") {
    document.getElementById('quote').checked = true;
  } else if (quoteEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("quoteEnabled", "false");
  }

  // localStorageからURL含める設定を復元
  const includeEnabled = localStorage.getItem("includeEnabled");
  if (includeEnabled === "true") {
    document.getElementById('include').checked = true;
    inc = true;
  } else if (includeEnabled === null) {
    // 初回訪問時はデフォルトでfalse
    localStorage.setItem("includeEnabled", "false");
  }

  document.getElementById('regexPattern').addEventListener('input', updateRegexFromUI);
  document.getElementById('flagG').addEventListener('change', updateRegexFromUI);
  document.getElementById('flagI').addEventListener('change', updateRegexFromUI);
  document.getElementById('flagM').addEventListener('change', updateRegexFromUI);
  document.getElementById('flagS').addEventListener('change', updateRegexFromUI);
  document.getElementById('flagU').addEventListener('change', updateRegexFromUI);
  document.getElementById('flagY').addEventListener('change', updateRegexFromUI);

  // regex要素の変更を監視して、正規表現モードの時にregexPatternに反映
  const regexInput = document.getElementById('regex');
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
        syncRegexToPattern();
      }
    });
  });

  // 値の変更も監視
  regexInput.addEventListener('input', syncRegexToPattern);
  regexInput.addEventListener('change', syncRegexToPattern);

  // プロパティの変更を監視
  observer.observe(regexInput, { attributes: true, attributeFilter: ['value'] });

  // 詳細設定の開閉機能
  document.getElementById('advancedToggle').addEventListener('click', function () {
    const panel = document.getElementById('regexFlagsPanel');
    const icon = this.querySelector('.toggle-icon');

    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      icon.classList.add('rotated');
      this.querySelector('span').textContent = '閉じる';
    } else {
      panel.style.display = 'none';
      icon.classList.remove('rotated');
      this.querySelector('span').textContent = 'フラグ設定';
    }
  });
});
