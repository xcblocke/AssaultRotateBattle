// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {AppConfig} from "./config/AppConfig";
import {ICommand} from "../../framework/facade/ICommand";
import {ext} from "../../framework/extend/Extend";
import {Music} from "../../framework/audio/Music";
import View from "../../framework/component/View";
import {Interceptor} from "../../framework/interceptor/Interceptor";
import OpenViewInterceptor from "./interceptor/OpenViewInterceptor";
import CloseViewInterceptor from "./interceptor/CloseViewInterceptor";
import LoadSceneIntercetor from "./interceptor/LoadSceneIntercetor";
import {LocalStorage} from "../../framework/persistence/LocalStorage";

const {ccclass, property} = cc._decorator;

@ccclass("StartupCommand")
export default class StartupCommand implements ICommand {
    async execute(...args):Promise{
        return new Promise(async resolve => {
            console.log("StartupCommand==>", AppConfig.gameName, AppConfig.version);
            LocalStorage.prefix = AppConfig.GameID;
            /** 设置帧率 */
            cc.game.setFrameRate(60);
            /**  物理引擎配置 */
            /*let physicsManager = cc.director.getPhysicsManager();
            physicsManager.enabled = true;
            physicsManager.enabledAccumulator = false;


            physicsManager.debugDrawFlags =
                0;
            // cc.PhysicsManager.DrawBits.e_aabbBit |
            //cc.PhysicsManager.DrawBits.e_jointBit |
            //cc.PhysicsManager.DrawBits.e_shapeBit
            ;*/

            /** 碰撞检测配置 */
            let manager = cc.director.getCollisionManager();
            // manager.enabled = true;
            // manager.enabledDebugDraw = true;
            // manager.enabledDrawBoundingBox = true;

            console.log(ext.isIphoneX, "isIphoneX===>");
            console.log(ext.isLandscape, "isLandscape===>");

            //关闭debug
            if(!AppConfig.isDebug){
                console.log = function () {

                };
            }

            View.clickSoundCommand = "ClickSoundCommand";


            /** 读取声音配置 */
            Music.init();


            /** 后台切入切出回调---引擎已经做了暂停游戏主循环。包含：游戏逻辑，渲染，事件处理，背景音乐和所有音效。所以我们一般情况下不需要做什么 */
            /*cc.game.on(cc.game.EVENT_SHOW, function () {
                console.log("cc.game.EVENT_SHOW============>");
            });

            cc.game.on(cc.game.EVENT_HIDE, function () {
                console.log("cc.game.EVENT_HIDE============>");
            });*/

            /** 注册拦截器 */
            Interceptor.register("OpenViewCommand", OpenViewInterceptor);
            Interceptor.register("CloseViewCommand", CloseViewInterceptor);
            Interceptor.register("LoadSceneCommand", LoadSceneIntercetor);


            /** 开始加载 */

            resolve(true);
        });
    }
}
