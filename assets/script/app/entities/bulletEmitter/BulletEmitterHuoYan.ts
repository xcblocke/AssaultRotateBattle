// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import GameBulletsController from "../../game/GameBulletsController";
import BulletEmitter from "./BulletEmitter";

export default class BulletEmitterHuoYan extends BulletEmitter {

    private _list:Array = [];

    constructor(gameBulletsController:GameBulletsController){
        super(gameBulletsController);
        this._firingRange = 600;
        this._interval = 0.15;
        this._speed = 300;
    }

    fire(start: cc.Vec2, dir: cc.Vec2) {
        this.bulletCount--;
        let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.HuoYan);
        bullet.node.active = true;
        bullet.node.position = start;
        bullet.fly(dir, this._firingRange, this._speed);
        this._list.unshift(bullet);
        this._list = this._list.filter(value => value.node.active == true);
        // let p = start;
        // for (let i=0; i<3; i++){
        //     let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.HuoYan);
        //     bullet.node.active = true;
        //     bullet.node.position = p.add(dir.mul((3-i)*30));
        //     bullet.fly(dir, this._firingRange, this._speed);
        //     this._list.unshift(bullet);
        // }
        this._list.forEach((value, index) => value.node.zIndex = index);
    }
}
