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
import Enemy from "../enemy/Enemy";
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfLighting extends Bullet {

    private _ske:sp.Skeleton = null;

    private _lightEnemys:Array<Enemy> = [];


    onDisable(): void {
        super.onDisable();
        this._lightEnemys.length = 0;
    }

    strike(other, self): void {
        let gameBulletsController = window['GameBulletsController'];
        this._lightEnemys.push(other.getComponent(Enemy));
        let bulletStrike = gameBulletsController.getInactiveBulletStrike(10);
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
            /** 寻找新的怪物攻击 */
            /** 找最近的怪生成闪电 */
            if (this._lightEnemys.length > 0 && this._lightEnemys.length < 6){
                let list = window['GameEnemysController'].allAliveAndInScreenEnemy().filter(value => !this._lightEnemys.includes(value));
                if (list.length > 0){
                    let minDistance = -1;
                    let enemy = null;
                    list.forEach(value => {
                        let distance = this.node.position.sub(value.node.position).mag();
                        if (minDistance < 0 || distance < minDistance){
                            minDistance = distance;
                            enemy = value;
                        }
                    });
                    /** 生成闪电 */
                    let bullet = <BulletOfLighting>window['GameBulletsController'].getInactivePropBullet(6);
                    bullet.node.position = this._lightEnemys[this._lightEnemys.length-1].node.position;
                    bullet._lightEnemys.push(...this._lightEnemys);
                    bullet.joint(enemy.node.position);
                }
            }
            this.node.active = false;
        });
    }

    joint(pos:cc.Vec2){
        let sub = pos.sub(this.node.position);
        let distance = sub.mag();
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(sub.y, sub.x));
        this.node.scaleY = distance/380;
        this.node.active = true;
        this._ske.setAnimation(0, "animation", false);
    }
}
