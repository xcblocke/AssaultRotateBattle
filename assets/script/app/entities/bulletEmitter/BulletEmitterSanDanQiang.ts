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
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";



export default class BulletEmitterSanDanQiang extends BulletEmitter {

    constructor(gameBulletsController:GameBulletsController){
        super(gameBulletsController);
        this._firingRange = 900;
        this._interval = 0.1;
        this._speed = 1500;
    }

    fire(start: cc.Vec2, dir: cc.Vec2) {
        this.bulletCount--;
        let powerLv = World.My.armory.levelOfEmitterPower(this._bulletEmitterID);
        let config = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp);
        let add = config[powerLv-1]['bullet_split'];
        let num = 3 + 2 * add;
        let angle = 10+5*add;
        let degrees = [];
        let half = Math.floor(num/2);
        for (let i=0; i < half; i++){
            let a = (i+1)*angle/half;
            degrees.push(a);
            degrees.push(-a);
        }
        if (num%2 == 1){
            degrees.push(0);
        }
        degrees.forEach(value => {
            let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.SanDanQiang);
            bullet.node.active = true;
            bullet.node.position = start;
            bullet.fly(dir.rotate(cc.misc.degreesToRadians(value)), this._firingRange, this._speed);
        });
    }
}
