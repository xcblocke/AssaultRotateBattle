// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {Music} from "../../../../framework/audio/Music";
import Enemy from "./Enemy";

const {ccclass} = cc._decorator;

@ccclass
export default class EmitBulletEnemy extends Enemy {

    protected doAttack(): void {
        Music.playSFX("sound/msc_en001");
        let bullet = window['GameBulletsController'].getInactiveEnemyBullet(this._enemyID);
        bullet.node.active = true;
        bullet.node.position = this.node.position;
        bullet.node.rotation = this.node.rotation;
        let dir = cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-bullet.node.rotation)).normalizeSelf();
        bullet.node.runAction(cc.sequence(cc.moveBy(this.attackDistance/this.bulletSpeed, dir.mul(this.attackDistance)), cc.callFunc(()=>{
            bullet.node.active = false;
        })));
    }
}
