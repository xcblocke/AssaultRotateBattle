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
import BulletStrikeLightning from "../bulletStrike/BulletStrikeLightning";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletShanDianQiu extends Bullet {

    strike(other, self): void {
        let gameBulletsController = window['GameBulletsController'];
        let bulletStrike = gameBulletsController.getInactiveBulletStrike(this.bulletId);
        bulletStrike.node.active = true;
        bulletStrike.node.position = cc.v2();
        bulletStrike.node.rotation = this.node.rotation;
        bulletStrike.node.setContentSize(other.node.getContentSize());
        bulletStrike.node.removeFromParent(false);
        bulletStrike.node.setParent(other.node);

        let spriteNode = (<BulletStrikeLightning>bulletStrike).spriteNode;
        bulletStrike.node.rotation = Math.random()*360;
        bulletStrike.node.runAction(cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.delayTime(0.05),
                    cc.callFunc(()=>{
                        spriteNode.active = !spriteNode.active;
                        // bulletStrike.node.rotation = Math.random()*360;
                    })
                ), 6),
            cc.callFunc(()=>{
                bulletStrike.node.stopAllActions();
                bulletStrike.node.active = false;
                bulletStrike.node.removeFromParent(false);
                bulletStrike.node.setParent(gameBulletsController.bulletLayer);
            })));
    }


    fly(dir: cc.Vec2, distance: number, speed: number): void {
        super.fly(dir, distance, speed);
        this.node.scale = 0.3;
        this.node.runAction(cc.scaleTo(distance/speed, distance/300));
    }
}
