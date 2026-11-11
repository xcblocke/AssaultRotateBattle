// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletOfSpider from "../bullet/BulletOfSpider";
import {Music} from "../../../../framework/audio/Music";
import {GameProxy} from "../../game/GameProxy";
import Enemy from "./Enemy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpiderEnemy extends Enemy {

    @property(cc.Node)
    blinkNode:cc.Node = null;

    set bAcc(value: boolean) {
        this._bAcc = value;
        if (this._bAcc && !this.blinkNode.active){
            this.blinkNode.active = true;
            this.blinkNode.runAction(cc.repeatForever(cc.blink(1, 3)));
            let duration = 0.5;
            let repeatFunc = ()=>{
                if (!GameProxy.pauseGame){
                    Music.playSFX("sound/msc_en002");
                }
                // this.node.runAction(cc.sequence(cc.delayTime(duration), cc.callFunc(repeatFunc)));
                // if (duration > 0.3){
                //     duration -= duration/10;
                // }
            };
            repeatFunc();
        }
    }


    protected doAttack(): void {
        this.hp = 0;
        console.log("爆炸蜘蛛死掉")
    }


    playDead(): void {
        super.playDead();
        /** 爆炸 */
        let bullet = <BulletOfSpider>window['GameBulletsController'].getInactiveEnemyBullet(this._enemyID);
        bullet.node.position = this.node.position;
        bullet.node.rotation = this.node.rotation;
        bullet.node.active = true;
        bullet.boom();
    }

    reset(): void {
        super.reset();
        this.blinkNode.stopAllActions();
        this.blinkNode.active = false;
    }



}
