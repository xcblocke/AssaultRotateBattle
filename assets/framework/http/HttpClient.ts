// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html



import {HttpOption} from "./HttpOption";
import HttpProtocol from "./HttpProtocol";
import {NetworkConfig} from "../../script/app/config/NetworkConfig";

const {ccclass, property} = cc._decorator;

let cookieMap = new Map<string, any>();


/** http默认配置 */
let httpOption = new HttpOption();
httpOption.host = NetworkConfig.host;
httpOption.port = 443;
httpOption.timeout = 3*6000;
httpOption.cookieKey = "vertx-cookie";
// 不支持FormData的浏览器的处理
if(typeof FormData == "undefined") {
    httpOption.headers.set("content-type", "application/x-www-form-urlencoded");
}

/**
 * 错误处理:
 * error.status 0表示网络异常，1表示网络超时  >=200表示http请求状态码
 * */
export class HttpClient{

    static defaultHttpOption:HttpOption = httpOption;

    static deleteCookie(cookieKey:string){
        cookieMap.delete(cookieKey);
    }

    static async get(protocol:HttpProtocol, httpOption?:HttpOption){
        return this.send("GET", protocol, httpOption);
    }

    static async post(protocol:HttpProtocol, httpOption?:HttpOption){
        return this.send("POST", protocol, httpOption);
    }


    static async send(method:string, protocol:HttpProtocol, httpOption?:HttpOption){
        return new Promise(async(resolve, reject) => {
            let option = httpOption || HttpClient.defaultHttpOption;
            let xmlrequest = new XMLHttpRequest();
            xmlrequest.timeout = option.timeout;
            xmlrequest.ontimeout = function (e) {
                console.log(e, "ontimeout...");
                reject({
                    message:"网络超时",
                    status:1,
                    protocol:protocol
                });
            };

            xmlrequest.onerror = function(err){
                console.log(err, "onerror...");
                if (typeof wx != "undefined" && (<string>err).indexOf('timeout') !== -1) {
                    reject({
                        message:"网络超时",
                        status:1,
                        protocol:protocol
                    });
                }else {
                    reject({
                        message:"网络错误",
                        status:1,
                        protocol:protocol
                    });
                }
            };

            xmlrequest.onloadend = function (e) {
                if (xmlrequest.readyState == 4){
                    if (option.cookieKey && !cookieMap.get(option.cookieKey)){
                        cookieMap.set(option.cookieKey, xmlrequest.getResponseHeader(option.cookieKey))
                    }
                    if (xmlrequest.status === 200) {
                        try {
                            protocol.decode(xmlrequest.responseText);
                            resolve(protocol.getResponseData());
                        }catch (e) {
                            reject({
                                message:"服务器状态出错==>"+protocol.getResponseMessage(),
                                status:200,
                                protocol:protocol
                            });
                        }
                    }else {
                        if (xmlrequest.status == 0 && e.timeStamp && e.timeStamp > xmlrequest.timeout){
                            /** 超时在超时回调里处理 */
                            return;
                        }
                        let msg;
                        if (xmlrequest.status === 0){
                            msg = "网络异常";
                        } else {
                            msg = "服务器异常";
                        }
                        reject({
                            message:msg,
                            status:xmlrequest.status,
                            protocol:protocol
                        });
                    }
                }
            };

            let url = option.host;
            if (option.port != 80 && option.port != 443){
                url += `:${option.port}`;
            }
            url += protocol.uri;
            xmlrequest.open(method,url);

            if (option.cookieKey){
                let val = cookieMap.get(option.cookieKey);
                if (val != null){
                    xmlrequest.setRequestHeader(option.cookieKey, val);
                }
            }

            option.headers.forEach((value, key) => xmlrequest.setRequestHeader(key, value));
            let res = protocol.encode();
            xmlrequest.send(res);
        });
    }
}


