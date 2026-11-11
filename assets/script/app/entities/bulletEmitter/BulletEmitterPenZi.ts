// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletEmitter from "./BulletEmitter";
import GameBulletsController from "../../game/GameBulletsController";
import {World} from "../../info/World";

const magnify = 1;

export default class BulletEmitterPenZi extends BulletEmitter {

    constructor(gameBulletsController:GameBulletsController){
        super(gameBulletsController);
        this._firingRange = 800;
        this._interval = 0.05;
        this._speed = 1500;
    }

    fire(start: cc.Vec2, dir: cc.Vec2) {
        this.bulletCount--;
        let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.PenZi);
        let ske = bullet.getComponent(sp.Skeleton);
        ske.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            bullet.node.active = false;
        });
        bullet.node.active = true;
        bullet.node.position = start;
        bullet.node.scale = magnify * World.My.armory.magnifyMul(bullet.bulletId);
        bullet.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        ske.setAnimation(0, "animation", false);
    }

}
