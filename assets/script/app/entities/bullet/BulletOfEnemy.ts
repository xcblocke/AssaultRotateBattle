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
import {ExcelTableNames} from "../../config/ExcelTableNames";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {GameProxy} from "../../game/GameProxy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfEnemy extends Bullet {


    init(id: number): void {
        this.bulletId = id;
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Enemy)[id%100-1];
        this.bThrought = false;
        this.hurt = Math.floor(config['hurt'] * GameProxy.enemyHurtMulOf(config['id']));
        this.repel = 0;
        this.stiff = 0;
    }

    onEnable(){
        window['GameBulletsController'].enemyBullets.push(this);
    }

    onDisable(){
        this.node.stopAllActions();
        this._contacts.length = 0;
        let gameBulletsController = window['GameBulletsController'];
        gameBulletsController.enemyBullets.splice(gameBulletsController.enemyBullets.indexOf(this), 1);
    }

    onCollisionEnter(other, self) {
        console.log("角色被子弹击中");
        window['GameRoleController'].hp -= this.hurt;
        if (!this.bThrought){
            this.node.active = false;
        }
    }

    onCollisionStay(other, self) {
        // super.onCollisionStay(other, self);
    }

    onCollisionExit(other, self) {
        // super.onCollisionExit(other, self);
    }
}
