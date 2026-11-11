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
import BulletEmitter from "../bulletEmitter/BulletEmitter";
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletLiZiPao extends Bullet {

    private _distance = 0;
    private _speed = 0;

    boom(){
        let powerLv = World.My.armory.levelOfEmitterPower(this.bulletId);
        let config = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp);
        let add = config[powerLv-1]['bullet_split'];
        let num = 4 + 2 * add;
        for (let i=0; i<num; i++){
            let degree = i * 360/num;
            let newBullet = window['GameBulletsController'].getInactiveBullet(BulletEmitter.TYPES.LiZiPao + 100);
            newBullet.node.rotation = this.node.rotation + degree;
            let dir = cc.v2(0, 1).normalize().rotate(cc.misc.degreesToRadians(-newBullet.node.rotation));
            newBullet.node.position = this.node.position.add(dir.mul(130));
            newBullet.node.active = true;

            newBullet.node.runAction(cc.sequence(cc.moveBy(this._distance/this._speed, dir.mul(this._distance)), cc.callFunc(()=>{
                newBullet.node.active = false;
            })));
        }
    }

    fly(dir: cc.Vec2, distance: number, speed: number): void {
        this._distance = distance;
        this._speed = speed;
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        this.node.runAction(cc.sequence(cc.moveBy(distance/speed, dir.mul(distance)), cc.callFunc(()=>{
            this.node.active = false;
        })));
    }

    protected collisionEnemy(other, self): void {
        super.collisionEnemy(other, self);
        this.boom();
    }

}
