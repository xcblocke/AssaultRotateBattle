// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {World} from "../info/World";
import {AppConfig} from "../config/AppConfig";
import HttpProtocol from "../../../framework/http/HttpProtocol";
import {HttpClient} from "../../../framework/http/HttpClient";
import {HttpOption} from "../../../framework/http/HttpOption";
import {LocalStorage} from "../../../framework/persistence/LocalStorage";
import Facade from "../../../framework/facade/Facade";
import {NetworkConfig} from "../config/NetworkConfig";

export default class Network {

    static async post(protocol:HttpProtocol, httpOption?:HttpOption):Promise<any>{
        return new Promise(async(resolve, reject) => {
            try {
                let data = await HttpClient.post(protocol);
                resolve(data);
            }catch (e) {
                console.log(e, "网络出错了…………");
                if (e.status == 0){
                    Facade.executeCommand('ShowTipsCommand', `${e.message}:请检查网络连接`);
                }else if (e.status == 1){
                    Facade.executeCommand('ShowTipsCommand', `${e.message}:uri=${e.protocol.uri}`);
                } else if (e.status == 200) {
                    if (e.protocol.getResponseStatus() == -2){
                        /** not login*/
                        await Network.login();
                        let data = await Network.post(e.protocol, httpOption);
                        resolve(data);
                        return;
                    }else {
                        Facade.executeCommand('ShowTipsCommand', `${e.message}:uri=${e.protocol.uri} status=${e.protocol.getResponseStatus()}`);
                    }
                }else {
                    Facade.executeCommand('ShowTipsCommand', `${e.message}:uri=${e.protocol.uri} status=${e.status}`);
                }
                reject(e);
            }
        });
    }

    static async login():Promise{
        return new Promise(async resolve => {
            resolve();
        });
    }

    static async uploadInfo():Promise{
        return new Promise(async (resolve, reject) => {
            resolve();
        });
    }

    static async initData(){
        if (NetworkConfig.connectServer){
            await Network.initGameData();
        }else {
            World.Storage.init();
        }
    }

    static async uploadLv(lv:number):Promise<any>{
        return new Promise(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/addRecord";
            protocol.request = {gameId:AppConfig.GameID, key:AppConfig.rankKey, score:lv};
            await Network.post(protocol);
            this.pushStorage();
            resolve();
        });
    }


    static async buyItem(itemId:number, num:number = 1):Promise<any>{
        return new Promise(async(resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/mall/buy";
            protocol.request = {id:itemId, num:num};
            await Network.post(protocol);
            resolve();
        });
    }

    static async syncBought():Promise<Array<any>>{
        return new Promise<Array<any>>(async(resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/user/items";
            let list = <Array<any>>await Network.post(protocol);
            resolve(list);
        });
    }

    static async totalRankList():Promise<Array<any>>{
        return new Promise<Array<any>>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/getTotalRank";
            protocol.request = {gameId: AppConfig.GameID, key:AppConfig.rankKey};
            try {
                let {list} = await Network.post(protocol);
                resolve(list);
            }catch (e) {
                reject(e);
            }
        });
    }


    static async addDiamond(add:number):Promise<number>{
        return new Promise<number>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/user/addDiamond";
            protocol.request = {num:add};
            let {diamond} = await Network.post(protocol);
            resolve(diamond);
        });
    }

    static async expendDiamond(expend:number):Promise<number>{
        return new Promise<number>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/user/expendDiamond";
            protocol.request = {num:expend};
            let {diamond} = await Network.post(protocol);
            resolve(diamond);
        });
    }

    static async onShare(shareKey: string, playerId: number): Promise {
        return new Promise(async (resolve, reject) => {
            if (World.My.playerId != 0){
                let protocol = new HttpProtocol();
                protocol.uri = "/game/onShare";
                protocol.request = {shareKey: shareKey, fromPlayerId: playerId};
                await Network.post(protocol);
            }
            resolve();
        });
    }

    static async getShareList(shareKey: string): Promise<Array> {
        return new Promise<Array>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/getShareList";
            protocol.request = {shareKey: shareKey};
            let list = await Network.post(protocol);
            resolve(list);
        });
    }

    static async takeShareReward(shareKey: string, playerId: number): Promise {
        return new Promise(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/receiveSharedRecord";
            protocol.request = {shareKey: shareKey, receivePlayerId: playerId};
            await Network.post(protocol);
            resolve();
        });
    }

    private static async setStorage(key:string, value:string):Promise<boolean>{
        return new Promise<boolean>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/setStorage";
            protocol.request = {key:key, value:value};
            await Network.post(protocol);
            resolve(true);
        });
    }

    private static async multiSetStorage(pairs:KVData<string>):Promise<boolean>{
        return new Promise<boolean>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/multiSetStorage";
            protocol.request = {pairs:JSON.stringify(pairs)};
            await Network.post(protocol);
            resolve(true);
        });
    }

    private static async getStorage(key:string):Promise<string>{
        return new Promise<string>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/getStorage";
            protocol.request = {key:key};
            let data = await Network.post(protocol);
            resolve(data);
        });
    }

    private static async multiGetStorage(keys:Array<string>):Promise<KVData<string>>{
        return new Promise<KVData<string>>(async (resolve, reject) => {
            let protocol = new HttpProtocol();
            protocol.uri = "/game/multiGetStorage";
            protocol.request = {keys:JSON.stringify(keys)};
            let data = await Network.post(protocol);
            resolve(data);
        });
    }


    public static async initGameData():Promise{
        return new Promise(async (resolve, reject) => {
            /** 以服务器为主,除了updateStorageKeys里面没更新的数据以客户端为主 **/
            let keys = World.Storage.allKeys().filter(value => !World.updateStorageKeys.includes(value));
            let values = await Network.multiGetStorage(keys);
            for (let key in values){
                let data = values[key];
                /** 字符串类型则不转成int */
                if (typeof World.Storage["_"+key] == "number"){
                    data = parseInt(data);
                }else if (typeof World.Storage["_"+key] == "boolean"){
                    data = data.toLowerCase() == "true";
                }
                World.Storage[key] = data;
            }
            resolve();
        });
    }

    /** 推送缓存里的数据到远程服务器 */
    public static async pushStorage(){
        return new Promise(async (resolve, reject) => {
            console.log("========>pushStorage", World.updateStorageKeys);
            if (World.updateStorageKeys.length == 0){
                resolve();
            } else {
                let kvDatas = {};
                World.pushStorageKeys = World.updateStorageKeys;
                World.updateStorageKeys = [];
                World.pushStorageKeys.forEach(value => {
                    kvDatas[value] = World.Storage[value];
                });
                await Network.multiSetStorage(kvDatas);
                World.pushStorageKeys = [];
                LocalStorage.setString("updateKVData", JSON.stringify(World.updateStorageKeys));
            }
        });
    }
}
