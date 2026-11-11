// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ICommandInterceptor} from "../../../framework/interceptor/CommandInterceptor";
import Facade from "../../../framework/facade/Facade";
import LifeCycle from "../../../framework/component/LifeCycle";

const {ccclass, property} = cc._decorator;

const BLOCK_LAYER_NAME_PREV = "blockLayer==>";



@ccclass
export default class OpenViewInterceptor implements ICommandInterceptor {

    static BlockLayerEvent ={
        destroy : "destroy",
        viewCreateFinish : "viewCreateFinish",
        viewDisplayFinish : "viewDisplayFinish",
    };

    static async onceAwait(viewPath:string, event:string){
        let blockLayer = Facade.canvasNode.getChildByName(`${BLOCK_LAYER_NAME_PREV +viewPath}`);
        if (blockLayer){
            return blockLayer.onceAwait(event);
        } else {
            console.error("not found view==>"+viewPath);
        }
    }

    /**
     * 打开view之前处理
     * @param args 打窗口的参数
     *
     * 说明：
     * 1.如果要给阻塞层添加灰色的背景，则可以在preHandle中给this.blockLayer.addComponent(cc.Sprite);
     * 2.如果要在两个界面间插入一个界面，则可以在此处拦截并阻塞消息，直到插入的界面关闭(await Facade.canvasNode.onceAwait(xxx));
     * 3.如果要在打开窗口和其他事件同时进行的任务。比如打开窗口的同时请求网络数据，等网络数据到达时刷新界面。(Promise.all([p1, p2]));
     * */
    async preHandle(...args):Promise<boolean>{
        return new Promise<boolean>(async(resolve, reject) => {
            let colorPrefab = await cc.loader.loadResAwait("prefab/color", cc.Prefab);
            /** 添加阻塞层 */
            let blockLayer = new cc.Node(`${BLOCK_LAYER_NAME_PREV + args[0]}`);
            blockLayer.on(cc.Node.EventType.TOUCH_START, (event)=>{
                console.log(`点击了阻塞层touch start=>${blockLayer.name}`);
            });
            blockLayer.addComponent(cc.BlockInputEvents);
            let colorSpriteFrame = cc.instantiate(colorPrefab).getComponent(cc.Sprite).spriteFrame;
            blockLayer.addComponent(cc.Sprite).spriteFrame = colorSpriteFrame;
            blockLayer.color = cc.Color.BLACK;
            blockLayer.opacity = 0;
            blockLayer.setContentSize(cc.view.getVisibleSize());
            Facade.canvasNode.addChild(blockLayer);
            blockLayer.runAction(cc.fadeTo(1, 150));
            resolve(true);
        });
    }
    /**
     * 打开view之后处理
     * @param node 打开窗口的node
     * @param args 打开窗口的参数
     *
     * 说明：
     * 1.如果要处理点击阻塞层就关闭窗口，则在postHandle中监听this.blockLayer的Touch事件即可处理.
     * 2.如果要添加打开窗口的动画，则在postHandle中处理，如调用this.moveDownToFocus(res)等方法
     * */
    async postHandle(node:any, ...args):Promise{
        return new Promise(async(resolve, reject) => {
            let blockLayer = Facade.canvasNode.getChildByName(`${BLOCK_LAYER_NAME_PREV +args[0]}`);
            blockLayer.emit(OpenViewInterceptor.BlockLayerEvent.viewCreateFinish, node);
            /** 将阻塞层与节点的destroy生命周期绑定 */
            let lifeCycle = node.addComponent(LifeCycle);
            lifeCycle.addCall("onDestroy", ()=> {
                blockLayer.emit(OpenViewInterceptor.BlockLayerEvent.destroy);
                blockLayer.destroy();
            });
            if (args[0] == "prefab/task"){
                cc.director.getScene().getChildByName('top').active = true;
                await this.moveDownToFocus(node);
            }else if (args[0] == 'prefab/gameover'){
                cc.director.getScene().getChildByName('top').active = true;
            }
            blockLayer.emit(OpenViewInterceptor.BlockLayerEvent.viewDisplayFinish, node);
            resolve();
        });
    }


    /** 打开窗口的特效 */

    /** 从屏幕下方弹出 */
    async moveDownToFocus(node:cc.Node){
        let x = node.x;
        let y = node.y;
        node.y = y - cc.view.getVisibleSize().height;
        await node.runActionAwait(cc.moveTo(1.2, x, y).easing(cc.easeElasticOut(0.6)));
    }

}
