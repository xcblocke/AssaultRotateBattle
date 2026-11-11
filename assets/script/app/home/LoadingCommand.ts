// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {ICommand} from "../../../framework/facade/ICommand";
import Facade from "../../../framework/facade/Facade";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {wxApi} from "../../../framework/wxApi/wxApi";
import Network from "../network/Network";

const {ccclass, property} = cc._decorator;



@ccclass("LoadingCommand")
export default class LoadingCommand implements ICommand {
    async execute (...args):Promise<any>{
        return new Promise(resolve => {
            console.log("LoadingCommand===>xxx");
            let list:Array<Promise> = [];

            /** 初始化隔离层prefab */
            list.push(ExcelConfig.loadAllExcel("data/"));
            for (let i=0; i<8; i++){
                list.push(cc.loader.loadResAwait("prefab/entities/enemy/enemy"+(i+1), cc.Prefab));
            }
            list.push(cc.loader.loadResAwait("prefab/guideCircle"));
            list.push(cc.loader.loadResAwait("prefab/guideSke"));
            list.push(Facade.initSeparationLayer("prefab/separationLayer"));
            list.push(Facade.initTextTips("prefab/textTips"));
            list.push(Facade.initTextTips("prefab/color"));
            list.push(cc.loader.loadResAwait("frame_fy005", cc.SpriteFrame));
            list.push(cc.loader.loadResDirAwait("sound/"));
            /** 加载一些不是很紧急的资源 */
            cc.loader.loadRes("prefab/exchange");
            cc.loader.loadRes("prefab/friendRank");
            cc.loader.loadRes("prefab/invites");
            cc.loader.loadRes("prefab/props");
            cc.loader.loadRes("prefab/roleSupply");
            cc.loader.loadRes("prefab/settings");
            cc.loader.loadRes("prefab/takeJackpot");
            cc.loader.loadRes("prefab/tips");
            cc.loader.loadRes("prefab/recommend");

            Promise.all(list).then(()=>{
                console.log('加载完成...');
                cc.sys.garbageCollect();
                resolve();
            }).catch(err=>{
                console.error(err);
            });
        });
    }
}
