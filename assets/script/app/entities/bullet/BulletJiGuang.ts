// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Bullet from "./Bullet";
const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletJiGuang extends Bullet {


    fly(dir: cc.Vec2, distance: number, speed: number): void {
    }


    onCollisionEnter(other, self) {
        super.onCollisionEnter(other, self);
        let action = cc.repeatForever(cc.sequence(cc.delayTime(0.3), cc.callFunc(()=>{
            super.onCollisionEnter(other, self);
        })));
        action.setTag(1333);
        other.node.stopActionByTag(1333);
        other.node.runAction(action);
    }

    onCollisionExit(other, self){
        other.node.stopActionByTag(1333);
    }
}
