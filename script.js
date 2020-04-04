// ==UserScript==
// @name         Give me AV not BV
// @namespace    https://xsky123.com
// @version      1.0.1
// @description  F**king Bilibili, give my av number back!
// @author       XSky123
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/watchlater/*
// @match        https://acg.tv/*
// @match        https://b23.tv/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    /**
     * @method DetectURLType
     * @return {number} type_num, 1 for normal, 2 for watchlater, 0 for error
     * @description: get url type
     */
    let DetectURLType = function () {
        if(window.location.href.match(/.*bilibili.com\/video\/(BV|bv).*/)){
            console.log("[AVnoBV] Detected BV Number");
            return 1;
        }else if(window.location.href.match(/.*bilibili.com\/watchlater\/\#\/.*/)){
            // }else if(window.location.href.match(/.*bilibili.com\/watchlater\/\#\/BV.*/)){
            console.log("[AVnoBV] Detected BV Number in watchlater");
            return 2;
        }else{
            console.log("[AVnoBV] Detected BV Number");
            return 0;
        }
    };


    /**
     * @method URLReplace
     * @param {number} aid - av number
     * @param {number} page - which p
     * @param {string} hashtag - if has hashtag(for comment), only when mode 1
     * @description: perform page url change
     */
    let URLReplace = function(aid, page=1, hashtag=""){
        var _url;
        if (aid === undefined){
            console.warn("[AVnoBV] Failed to replace bv number, prehaps it's a bangumi page.");
            return;
        }
        switch (AVnoBV_MODE) {
            case 1:
                _url = `https://www.bilibili.com/video/av${aid}`;
                if (page > 1) {
                    _url += `?p=${page}`;
                }
                if (hashtag !== ""){
                    _url += hashtag;
                }
                break;

            case 2:
                _url = `https://www.bilibili.com/watchlater/#/av${aid}`;
                if (page > 1) {
                    _url += `/p${page}`;
                }
                break;
        }
        history.replaceState(null, null, _url);
        console.log("[AVnoBV] F**k You BV Number!");
    };


    /**
     * @method WriteAVNumber
     * @description: Parent function for av number element writing
     */
    let WriteAVNumber = function () {
        var MutationObserver = window.MutationObserver;
        var PageBodyElement = document.querySelector("body");
        var DocumentObserverConfig = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        };
        var DetectAndWriteAVNumber = function () {

        };

        switch (AVnoBV_MODE) {
            case 1:
                DetectAndWriteAVNumber = DetectAndWriteAVNumber_Normal;
                break;

            case 2:
                DetectAndWriteAVNumber = DetectAndWriteAVNumber_Watchlater;
                break;
        }
        window.RanderFinishObserver = new MutationObserver(DetectAndWriteAVNumber);
        window.RanderFinishObserver.observe(PageBodyElement, DocumentObserverConfig);
    };

    /**
     * @method DetectAndWriteAVNumber_Normal
     * @description: Observer for normal situation.
     */
    let DetectAndWriteAVNumber_Normal = function(mutationsList) {
        if(document.getElementsByClassName("view").length){
            if(document.getElementsByClassName("view")[0].innerHTML.match(/\d+/)){
                WriteAVNumberElement();
                window.RanderFinishObserver.disconnect();
            }
        }
    };


    /**
     * @method DetectAndWriteAVNumber_Watchlater
     * @description: Observer for Watchlater.
     */
    let DetectAndWriteAVNumber_Watchlater = function(mutationsList) {
        if(document.getElementsByClassName("v play").length){
            //console.log("[AVnoBV] Detected v play");
            if(document.getElementsByClassName("v play")[0].innerHTML.match(/\d+.*/)){
                if(window.aid) {
                    WriteAVNumberElement();
                    window.RanderFinishObserver.disconnect();
                }
            }
        }
    };

    /**
     * @method WriteAVNumberElement
     */
    let WriteAVNumberElement = function () {
        switch (AVnoBV_MODE) {
            case 1:
                WriteAVNumberElementNormal();
                break;
            case 2:
                WriteAVNumberElementWatchlater();
                break;
        }
        console.log("[AVnoBV] Add av number successfully!");
    };


    let WriteAVNumberElementNormal = function () {
        var video_info_element = document.getElementsByClassName("video-data")[1];
        var aid_span = document.createElement("span");
        var aid_link = document.createElement("a");
        aid_span.className = "a-crumbs";
        aid_span.style.marginLeft = "16px";
        aid_link.href = window.location.href;
        aid_link.innerText = `av${window.__INITIAL_STATE__.aid}`;
        aid_span.appendChild(aid_link);
        video_info_element.appendChild(aid_span);
    };

    let WriteAVNumberElementWatchlater = function () {

        var has_multi_page = window.location.href.match(/\/p(\d+)/); // check if has multi page

        var video_info_element = document.getElementsByClassName("video-info-module")[0];
        var aid_span = document.getElementsByClassName("aid_span");
        var has_written_aid = Boolean(aid_span.length);

        var aid_element = (has_written_aid?document.getElementsByClassName("aid_span")[0]:
            document.createElement('span'));
        var aid_link_element = (has_written_aid?document.getElementsByClassName("aid_link")[0]:
            document.createElement('a'));

        URLReplace(window.aid, has_multi_page[1]);
        aid_link_element.href = `https://www.bilibili.com/video/av${window.aid}`;
        if(has_multi_page) {
            aid_link_element.href += `?p=${has_multi_page[1]}`;
        }

        aid_link_element.innerHTML = `av${window.aid}`;

        if(!has_written_aid) {
            aid_element.className = "crumbs aid_span";
            aid_element.innerHTML = "本视频AV号: ";
            aid_element.style.color = "#99a2aa";
            aid_link_element.className = "aid_link";
            aid_link_element.style.color = "#99a2aa";
            aid_element.appendChild(aid_link_element);
            video_info_element.appendChild(aid_element);
        }

    };

    /**
     * @method ChangeURL
     * @description: Parent function for URL changing
     */
    let ChangeURL = function () {
        switch (AVnoBV_MODE) {
            case 1:
                ChangeURL_Normal();
                break;
        }
    };

    /**
     * @method ChangeURL_Normal
     * @description: URL changing directly when normal situation
     */
    let ChangeURL_Normal = function () {
        var p_match = window.location.href.match(/\?p\=(\d+)/); // Detect P, though a little ugly : P
        var comment_match = window.location.hash.substr('#', 6) === '#reply'; // Detect Comment Hash Mark

        URLReplace(window.__INITIAL_STATE__.aid, p_match?p_match[1]:1,
            comment_match?window.location.hash:"");
    };



    /**
     *  SCRIPT RUNS FROM HERE
     */
    var AVnoBV_MODE = DetectURLType();
    if (AVnoBV_MODE === 2){
        window.onhashchange = WriteAVNumberElementWatchlater;
    }
    ChangeURL();
    WriteAVNumber();


})();