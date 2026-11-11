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
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfFangHuDun extends Bullet {

    private _ske:sp.Skeleton = null;


    strike(other, self): void {
        this._ske.setAnimation(0, "transition", false);
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
        this.init(5);
        this._ske = this.getComponent(sp.Skeleton);
        this._ske.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            // console.log("=============>completeLis..", name);
            if (name == "start" || name == "transition"){
                this._ske.setAnimation(0, "loops", false);
                if (!this.node.getActionByTag(114)){
                    let speedAction = cc.speed(cc.repeatForever(cc.rotateBy(1.25, 720)), 0);
                    speedAction.setTag(114);
                    this.node.runAction(speedAction);
                    cc.tween(speedAction)
                        .to(1, {_speed:1}, { easing: 'sineIn'})
                        .start();
                }
            }
        });
        window['GameRoleController'].role.node.on(cc.Node.EventType.POSITION_CHANGED, ()=>{
            this.node.position = window['GameRoleController'].role.node.position;
        });
    }

    blink(){
        this.unblink();
        let action = cc.repeatForever(cc.sequence(cc.fadeTo(0.1, 0), cc.fadeTo(0.1, 255)));
        action.setTag(485);
        this.node.runAction(action);
    }

    unblink(){
        this.node.stopActionByTag(485);
        this.node.opacity = 255;
    }

    onDisable(): void {
        this.unblink();
        super.onDisable();
        window['GameRoleController'].role.spaceCircleCollider.radius = 25;
    }

    protected onEnable(): void {
        super.onEnable();
        window['GameRoleController'].role.spaceCircleCollider.radius = 80;
        this.node.position = window['GameRoleController'].role.node.position;
        this.node.stopAllActions();
        this._ske.setAnimation(0, "start", false);
    }

    /*update(dt:number){
        if (GameProxy.pauseGame)return;
        if (this.node.color.getR() < 255){
            this.node.color.setR(this.node.color.getR() + 1);
        }
        if (this.node.color.getG() < 255){
            this.node.color.setG(this.node.color.getG() + 1);
        }
        if (this.node.color.getB() < 255){
            this.node.color.setB(this.node.color.getB() + 1);
        }
        this._impenetrableDefenceCD -= dt;
        if (this._impenetrableDefenceCD <= 0){
            this.node.active = false;
        }
    }*/


    onCollisionStay(other, self) {
        this.strike(other, self);
    }


    protected collisionEnemy(other, self): void {
        this.strike(other, self);
        let enemy = other.getComponent('Enemy');
        /** 僵硬 */
        if (this.stiff > 0){
            enemy.doStiff(this.stiff);
        }
        /** 减速 */
        enemy.doSpeedcut();
        /** 击退效果 */
        this.doRepeal(enemy, this.repel);

        /** 飘血效果 */
        let damage = this.hurt;
        if (damage > 0){
            enemy.hp -= damage;
        }
    }

    doRepeal(enemy, repel): void {
        enemy.doRepel(enemy.node.position.sub(this.node.position).normalize(), repel);
    }
}
