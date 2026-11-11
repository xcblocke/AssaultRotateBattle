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

const {ccclass, property} = cc._decorator;

@ccclass
export default class CloseViewInterceptor implements ICommandInterceptor {

    /**
     * 关闭view之前处理
     * */
    async preHandle(...args): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let str = args[0];
            if (typeof str != "string") {
                str = str.name;
            }
            if (str == "task") {
                let node = typeof args[0] == "string" ? Facade.canvasNode.getChildByName(str) : args[0];
                await this.moveFocusToDown(node);
            }
            resolve(true);
        });
    }


    /**
     * 关闭view之后处理
     * */
    async postHandle(res: any, ...args): Promise {
        return new Promise((resolve, reject) => {
            let str = args[0];
            if (typeof str != "string") {
                str = str.name;
            }
            if (str == "task") {
            }
            resolve();
        });
    }

    /** 关闭窗口的特效 */

    /** 从下方移出 */
    async moveFocusToDown(node: cc.Node) {
        // await node.runActionAwait(cc.moveBy(1.5, 0, -cc.view.getVisibleSize().height).easing(cc.easeElasticIn(0.6)));
        await node.runActionAwait(cc.moveBy(0.5, 0, -cc.view.getVisibleSize().height).easing(cc.easeBackIn()));
    }
}
