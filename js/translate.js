
translate_cache = {
  get: function(src_string, tar_lang) {
    try {
      var stored_value = localStorage.getItem(src_string) || "{}";
      stored_value = JSON.parse(stored_value);
      if (stored_value.hasOwnProperty(tar_lang)) {
        var stored_text = stored_value[tar_lang];

        return stored_text;
      }

      return undefined;
    }
    catch(exception) {
      // old user's cache structure makes error here
      // inject empty object
      localStorage.setItem(src_string, "{}");
      console.log(exception);
      return undefined;
    }
  },
  set: function(src_string, tar_lang, res_string) {
    var stored_value = localStorage.getItem(src_string) || "{}";
    stored_value = JSON.parse(stored_value);
    stored_value[tar_lang] = res_string;
    localStorage.setItem(src_string, JSON.stringify(stored_value));
  }
};


function translate(src_string, tar_lang, context) {
  /*
  * TODO: https://translate.googleapis.com/translate_a/t?anno=3&client=te_lib&format=html&v=1.0&key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&logld=vTE_20180625_00&sl=zh-CN&tl=ko&sp=nmt&tc=7&sr=1&tk=598684.1024865&mode=1
  * 이 url에 data q: word1 q: word2 q: word3 q: word4
  * q=%E7%A4%BE%E4%BC%9A%E7%A7%91%E5%AD%A6%E5%A4%A7%E5%AD%A6&q=%E7%A4%BE%E4%BC%9A%E7%A6%8F%E7%A5%89%E5%AD%A6%E7%A7%91&q=%E8%A1%8C%E6%94%BF%E5%AD%A6%E7%A7%91&q=%E6%94%BF%E6%B2%BB%E5%A4%96%E4%BA%A4%E5%AD%A6%E7%A7%91&q=%E8%A8%80%E8%AE%BA%E5%BC%98%E6%8A%A5%E5%AD%A6%E7%A7%91&q=%E6%83%85%E6%8A%A5%E7%A4%BE%E4%BC%9A%E5%AD%A6%E7%A7%91&q=%E7%BB%8F%E8%90%A5%E5%A4%A7%E5%AD%A6%E5%9B%BD%E9%99%85%E9%80%9A%E5%95%86%E5%AD%A6%E7%A7%91&q=%E7%BB%8F%E8%90%A5%E5%AD%A6%E9%83%A8&q=%E7%BB%8F%E6%B5%8E%E9%80%9A%E5%95%86%E5%A4%A7%E5%AD%A6%E7%BB%8F%E6%B5%8E%E5%AD%A6%E7%A7%91
  * 이런식으로 같이 보내보기
  * chrome browser에서 쓰는 api
  *
  * */
  //return new Promise(function(resolve, reject){
    matching();
    /*
    var req = new XMLHttpRequest();
    var base_url = "https://translate.google.com/translate_a/single?client=t&sl=auto&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=7&";

    var url = base_url + "tl=" + tar_lang + "&hl=" + tar_lang + "&tk=" + vM(src_string) + "&q=" + encodeURIComponent(src_string);
    req.open("GET", url, true);

    req.onload = function (aEvt) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          var res_arr = eval(req.responseText); // convert string to array-like object
          var len = res_arr[0].length - 1;
          var ret = "";
          for (var i = 0; i < len; i++) {
            ret += res_arr[0][i][0];
          }

          translate_cache.set(src_string, tar_lang, ret);

          if (ret.replace(/\n/g, "") === src_string.replace(/\n/g, "")) {
            //if result is same with original text, do nothing
          } else {
            resolve({translate_result: ret, context: context});
          }
        } else {
          // if response is not okay
          reject(req);
        }
      }
    };
    req.send();
  });
  */
}

function translatePopup(src_text) {
  chrome.storage.sync.get(function (data) {
    var tar_lang = "ko";
    if (data)
      tar_lang = data.tar_lang;
    else
      tar_lang = "ko";

    function on_success (res) {
      var translate_result = res.translate_result;
      document.querySelector('#result').innerText = beautify_result_text(translate_result);
      return translate_result;
    }

    function on_fail(req) {
      chrome.tabs.create({"url": req.responseURL,"selected": true}, function (tab) {});
      document.querySelector('#result').innerText = "error occured o_O";
      return req.responseURL;
    }

    var stored_string = translate_cache.get(src_text, tar_lang);
    if (stored_string === undefined) {
      translate(src_text, tar_lang).then(on_success).catch(on_fail);
    }else {
      on_success({translate_result: stored_string});
    }
  });
}

function selectionTranslate(selected_string) {
  chrome.storage.sync.get(function (data) {
    var tar_lang = "ko";
    if (data !== undefined) {
      tar_lang = data.tar_lang;
    }
    else
      tar_lang = "ko";

    function on_success(res) {
      var translate_result = res.translate_result;
      if (translate_result.trim() === "") {
        return;
      }
      nhpup.popup(beautify_result_html(translate_result));

      if (translate_result.length < 15) {
        nhpup.pup.width(150);
      } else if (translate_result.length < 26) {
        nhpup.pup.width(300);
      } else if (translate_result.length > 100) {
        nhpup.pup.width(750);
      } else {
        nhpup.pup.width(550);
      }
    }

    function on_fail(req) {
      window.open(req.responseURL, "_self");
      return req.responseURL;
    }


    var stored_string = translate_cache.get(selected_string, tar_lang);
    if (stored_string === undefined) {
      translate(selected_string, tar_lang).then(on_success).catch(on_fail);
    } else {
      if (stored_string.replace(/\n/g, "") === selected_string.replace(/\n/g, "")) {
        return;
      }

      on_success({translate_result: stored_string});
    }

  });
}

function beautify_result_html(ret) {
  return ret.replace(/(\n)/g, '<br/>').replace(/\. /g, '.<br/>');
}

function beautify_result_text(ret) {
  return ret.replace(/(\n)/g, '\n').replace(/\. /g, '.\n');
}

document.querySelector("#btn").addEventListener('click', function(){
  matching();
})

function matching(){
  const url = "https://kapi.kakao.com/v1/translation/translate";
  const key = "af35956434233a16d98f0c2170840ca3";

  var userWord = "hello";
  var btn_value = 'to_english';

  var src_lang = '';
            var target_lang = '';
            if(btn_value == 'to_english'){
                src_lang = 'kr';
                target_lang = 'en';
            } else {
                src_lang = 'en';
                target_lang = 'kr';
            }

            var final_url = url + "?src_lang=" + src_lang + "&target_lang=" + target_lang + "&query=" + userWord;
            var options = {
                method: 'GET',
                headers: {
                    'Authorization' : 'KakaoAK ' + key,
                },
            }
            
  fetch(final_url, options).then(res => res.json()).then(data => {
    if(data.translated_text.length == 0) return;
    var result = "";
    for (let i = 0 ; i < data.translated_text.length ; i++){
        result += '<div style="1px solid border">';
        result += '<p style="font-size:10px">' + data.translated_text[i] + '</p>';
        result += '</div>';
    };
    document.querySelector("#tmp").innerHTML = result;
  }).catch(error => document.querySelector("#tmp").innerHTML = error)
}
