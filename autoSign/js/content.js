/*
 * @author liudaoyu
 * @since 2014-10
 * @file 自动签到
 * update list
 * 2015-6-15 增加一键签到功能
 * 利用本地存储减少一键签到的请求
 *
 * */


var url = 'http://tieba.baidu.com/sign/add';
var onekeySignUrl = 'http://tieba.baidu.com/tbmall/onekeySignin1';
// 页面提交信息
var pageInfo = null;

var isDebug = false;


var userInfo = getUserInfo();

var CHROME_SIGNED_KEY = 'chrome-onekeysigned_' + userInfo.user_id || '';

var beginAutoSignCls = ' autosign-animated autosign-hinge ';

var successAutoSignCls = ' autosign-animated autosign-rollIn ';

var failedAutoSignCls = ' autosign-animated autosign-wobble ';

var beginForumSignCls = ' autosign-animated autosign-rubberBand ';



// 设置单吧签到效果
function setForumSignCls(flag){
   var btn =  document.querySelector('.j_sign_box');
        if (!btn) {
            return ;
        }


        switch(flag){
            case 'begin':

                btn.className = btn.className + beginForumSignCls;
                break;

            case 'success':
                
                break;

            case 'failed':
               
                break;
        }


}

// 设置一键签到效果
// @param 'begin','success','failed'
function setOneKeySignCls(flag){

        var onekey_btn = document.querySelector('.onekey_btn');
        if (!onekey_btn) {
            return ;
        }


        switch(flag){
            case 'begin':

                onekey_btn.className = onekey_btn.className + beginAutoSignCls;
                break;

            case 'success':
                
                onekey_btn.className = onekey_btn.className + " signed_btn";
                onekey_btn.className = onekey_btn.className.replace(beginAutoSignCls,'');
                onekey_btn.className = onekey_btn.className + successAutoSignCls;

                break;


            case 'failed':
                onekey_btn.className = onekey_btn.className + failedAutoSignCls;
                break;
        }

}


// 判断今天是否使用了一键签到
function isSignedToday() {

    if (!window.localStorage) {
        return false;
    }
    var storage = window.localStorage;
    var date = new Date();
    var today = date.toLocaleDateString();
    var val = storage.getItem(CHROME_SIGNED_KEY);
    if (val == today) {
        return true;
    }
    return false;
}
function setSignedToday() {

    if (!window.localStorage) {
        return false;
    }
    var storage = window.localStorage;
    var date = new Date();
    var today = date.toLocaleDateString();
    storage.setItem(CHROME_SIGNED_KEY, today);
}


function print(obj) {
    if (isDebug) {
        console.log(obj);
    }
}

function httpRequest(url, postData, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
        }
    };
    xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    xhr.send(postData);

}

function getUserInfo(){

   var head = document.querySelector('head');
    var domText = head.innerHTML;
    var result = domText.match(/PageData.user =[^;]+/g);
    var userInfo = {};
    if (result) {
       var str = result[0];
       if(str){
        var start = str.indexOf('{');
        str = str.substr(start,str.length);
        userInfo = eval('(' + str + ')');
       }

    }

    return userInfo;
}





/**
 获取tbs和吧名，不能获取页面上js变量，只能在模板中查找，可能会不准确。
 */
function getPageInfo() {
    var wrap2 = document.querySelector('.wrap2 script');
    if(!wrap2){
        return ;
    }

    var domText = wrap2.innerHTML;

    var result = domText.match(/PageData.tbs[\s]*=[\s]*"[0-9a-z]*";/g);
    if (!result) {
        result = domText.match(/tbs[\s]*:[\s]*['|"][0-9a-z]*['|"],/g);
    }
    var tbs = "";
    var tbslist = result && result[0];
    if (tbslist.indexOf("'") > 0) {
        tbs = tbslist.split("'")[1];
    } else if (tbslist.indexOf('"') > 0) {
        tbs = tbslist.split('"')[1];
    }


    result = domText.match(/PageData.forum.name[\s]*=[\s]*['|"][^;]*['|"];/g);
    if (!result) {
        result = domText.match(/PageData.forum.forum_name[\s]*=[\s]*['|"][^;]*['|"];/g);
    }
    if (!result) {
        result = domText.match(/forum_name[\s]*:[\s]*['|"][^,]*['|"],/g);
    }
    var name = "";
    var names = result && result[0];
    if (names) {
        if (names.indexOf("'") > 0) {
            name = names.split("'")[1];
        } else if (names.indexOf('"') > 0) {
            name = names.split('"')[1];
        }
    }

    return {
        "name": name,
        "tbs": tbs
    };

}

function getPageInfoOnBigpipe(){

   var head = document.querySelector('head');
    if(!head){
        return ;
    }

    var domText = head.innerHTML;
    var result = domText.match(/tbs['"]:.*/g); 
    var tbs = '';
    if(result){
        tbs = result[0].split('"')[1]; 
    }
    
    result = domText.match(/name['"]:.*/g);
    var name = '';
    if(result){
        name = result[0].split('"')[1];
    } 
    

   return {
        "name": name,
        "tbs": tbs
    };

}


// 单吧签到
function getPostData() {
    var data = "ie=utf-8&kw=" + encodeURIComponent(pageInfo.name) + "&tbs=" + pageInfo.tbs;
    return data + "";
}

// 一键签到
function getOnekeySignPostData() {
    var data = "ie=utf-8&tbs=" + pageInfo.tbs;
    return data + "";
}


// 首页一键签到
// onekey_btn onekey_btn_vip signed_btn
function onekeySign() {


    var signed_btn = document.querySelector('.signed_btn');

    // 已经签到了
    if (signed_btn) {
        return;
    }

    console.log('开始一键签到');

    setOneKeySignCls('begin');




    var data = getOnekeySignPostData();

    httpRequest(onekeySignUrl, data, function (response) {

        var json = JSON.parse(response);
        if (json.no == 0) {

            /*var onekey_btn = document.querySelector('.onekey_btn');
            if (onekey_btn) {
                onekey_btn.className = onekey_btn.className + " signed_btn";
            }*/

            setOneKeySignCls('success');

           setSignedToday();

            console.log('一键签到完成');

        } else {
             setOneKeySignCls('failed');

            console.log('一键签到失败');
            console.log('进入单吧签到模式');
            signForum();
        }

        // 减少服务端的请求
        // setSignedToday();
        print(response);

    });


}

// 签到单吧
function signForum() {
//没有登陆不能签
    var not_login = document.querySelector('.u_login');
//存在登陆按钮
    if (not_login) {
        return;
    }

//没有签到按钮不能签
    var not_in_signed = document.querySelector('.j_sign_box');
    if (!not_in_signed) {
        return;
    }
//签过到的就不需要了
    var signed = document.querySelector('.sign_box_bright_signed');
    if (signed) {
        return;
    }

    console.log('开始自动签到');
    var data = getPostData();
    print(data);
    httpRequest(url, data, function (response) {

        var json = JSON.parse(response);
        if (json.no == 0) {
            not_in_signed.className = not_in_signed.className + " sign_box_bright_signed";
            console.log('自动签到完成');

        } else {
            console.log('自动签到error');
        }

        setForumSignCls('begin');



        print(response);

    });
}

// 签到入口
function sign() {
    console.log('自动签到检测');

    pageInfo = getPageInfo();
    pageInfo = !!pageInfo? pageInfo : getPageInfoOnBigpipe();

    if(!pageInfo){
       return;
    }

    if (!isSignedToday()) {
        onekeySign();
    } else {
        signForum();
    }


}

/************************************************************/
/*
 * CHROME EXTENSION
 */

/* JSON Finder Chrome Extension */
(function () {

    var rawjson;

    // bootstrap on page ready
    window.addEventListener("load", domready, false);

    function domready() {
        var pre;
        if (document.body && document.body.childNodes[0] && document.body.childNodes[0].tagName == "DIV") {

            // bootstrap();
        }
    }

    function loadInternalResource(names, callback) {
        var _resourcesCount = 0;
        if (typeof names === 'string') names = [names];
        names.forEach(function (name) {
            _resourcesCount++;
            _loadInternalResource(name, onload);
        });

        function onload() {
            _resourcesCount--;
            if (_resourcesCount === 0) {
                callback();
            }
        }

        function _loadInternalResource(name, callback) {
            var comp = name.split('.');
            if (comp.length === 0) {
                console.error('invalid resource name: ' + name);
                return false;
            }
            var ext = comp[comp.length - 1];
            var e;
            switch (ext) {
                case 'html':
                    if (jQuery) {
                        jQuery.get(chrome.extension.getURL('/' + name))
                            .done(function (data, textstatus, jqxhr) {
                                $('body').append($(data));
                            })
                            .always(function () {
                                callback();
                            });
                    } else {
                        console.warn('required jQuery for ajax');
                    }
                    break;
                case 'js':
                    e = document.createElement("script");
                    e.type = "text/javascript";
                    e.src = chrome.extension.getURL('/js/' + name);
                    document.head.appendChild(e);
                    onready(e);
                    break;
                case 'css':
                    var e = document.createElement('link');
                    e.rel = 'stylesheet';
                    e.type = 'text/css';
                    e.href = chrome.extension.getURL('/' + name);
                    document.head.appendChild(e);
                    onready(e);
                    break;
                default:
                    console.debug('unknown resource extension: ' + name);
                    break;
            }
            function onready(e) {
                if (e) {
                    e.onreadystatechange = e.onload = function () {
                        // if (name.indexOf('.html')>=0) { debugger; }
                        var state = e.readyState;
                        if (!state || /loaded|complete/.test(state)) {
                            callback();
                        }
                    };
                }
            }

            return true;
        }
    }

    function bootstrap() {
        // load resources
        var resources = [
           /* 'jquery.js'*/
           'css/sign.css'

        ];
        loadInternalResource(resources, function () {

            // start app
           // createApplication(jQuery);

           createApplication();
        });

    }


    function createApplication() {

        /*$('.forum_table table tr').find('td:first').find('a').each(function (e) {
            var $a = $(this);
            var query = $a.attr('href');
            console.log(query);
            window.open('http://tieba.baidu.com' + query);
        });*/
    }


    bootstrap();


})();

function getNoticeForum() {

    $('.forum_table table tr td').find('a[href*=f]').each(function (e) {
        console.log(e)
    });
}


/************************************************************/

window.onload = function () {
    sign();
    //getNoticeForum();
};



