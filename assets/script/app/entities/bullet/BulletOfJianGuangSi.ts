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
import Facade from "../../../../framework/facade/Facade";
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfJianGuangSi extends Bullet {

    private _ske:sp.Skeleton = null;


    init(id: number): void {
        this.bulletId = id;
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.Prop)[this.bulletId-1];
        this.bThrought = cfg['pierce'] === 1;
        this.repel = cfg['repel'];
        this.stiff = cfg['stiff'];
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[0];
        this.hurt = Math.floor(config['hurt']*World.My.armory.hurtMulOf(1))*cfg['hurt'];
    }


    onLoad(): void {
        super.onLoad();
        this._ske = this.getComponent(sp.Skeleton);
        this._ske.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            this.node.active = false;
        });
    }


    onCollisionEnter(other, self): void {
    }

    execute(){
        this._ske.setAnimation(0, "614", false);
        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(()=>{
            /** 对所有敌人造成伤害 */
            // console.log("对所有敌人造成伤害");
            window['GameEnemysController'].allAliveEnemy().forEach(value=>value.hp -= this.hurt);
        })));
    }
}
