// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletStrike from "./BulletStrike";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletStrikeScale extends BulletStrike {
    init(id) {
    }


    strike() {
        this.node.rotation = Math.random()*360;
        this.node.scale = 0;
        this.node.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(()=>{
            this.node.stopAllActions();
            this.node.active = false;
        })))
    }


}
