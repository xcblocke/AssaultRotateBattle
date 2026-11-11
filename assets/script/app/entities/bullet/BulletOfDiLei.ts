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
import {GameProxy} from "../../game/GameProxy";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";
import {World} from "../../info/World";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfDiLei extends Bullet {

    private _gameExplosivesController = null;


    strike(other, self): void {
        // super.strike(other, self);
    }

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
        this._gameExplosivesController = Facade.findComponent("GameScene", "GameExplosivesController");
    }



    onCollisionEnter(other, self): void {
        /** 爆炸 */
        this.node.active = false;
        this.boom();
    }

    boom(){
        let explosiveHuoJianTong = this._gameExplosivesController.getInactiveExplosive(9);
        explosiveHuoJianTong.node.position = this.node.position;
        explosiveHuoJianTong.node.active = true;
        explosiveHuoJianTong.node.scale = 0.5;
        explosiveHuoJianTong.node.rotation = Math.random()*360;
        explosiveHuoJianTong.boom();
        GameProxy.emit(GameProxy.Event.ShakeScreen, 0.08, 2, 2);
    }
}
