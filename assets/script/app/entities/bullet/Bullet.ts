// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";
import {World} from "../../info/World";

const {ccclass} = cc._decorator;


/**
 * 普通子弹，单纯的一个碰撞体，移动一段距离后消失
 */
@ccclass
export default class Bullet extends cc.Component {
    bulletId = 0;

    bThrought = false;

    hurt = 0;

    repel = 0;

    stiff = 0;

    moveDir = cc.v2();

    private _collider:cc.Collider = null;

    protected _contacts = [];


    get contacts(): any[] {
        return this._contacts;
    }

    get collider(): cc.Collider {
        return this._collider;
    }


    onLoad(){
        this._collider = this.getComponent(cc.Collider);
        this.node.on(cc.Node.EventType.ROTATION_CHANGED, ()=>{
            let dir = cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-this.node.rotation));
            this.moveDir.x = dir.x;
            this.moveDir.y = dir.y;
        });
    }


    init(id:number){
        this.bulletId = id;
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[this.bulletId%100-1];
        this.bThrought = config['pierce'] === 1;
        this.hurt = Math.floor(config['hurt']*World.My.armory.hurtMulOf(this.bulletId%100));
        this.repel = config['repel'];
        this.stiff = config['stiff'];
    }

    /** 让子弹飞 */
    fly(dir:cc.Vec2, distance:number, speed:number){
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        this.node.runAction(cc.sequence(cc.moveBy(distance/speed, dir.mul(distance)), cc.callFunc(()=>{
            this.node.active = false;
        })));
    }

    onEnable(){
        window['GameBulletsController'].roleBullets.push(this);
    }

    onDisable(){
        this.node.stopAllActions();
        this._contacts.length = 0;
        let gameBulletsController = window['GameBulletsController'];
        gameBulletsController.roleBullets.splice(gameBulletsController.roleBullets.indexOf(this), 1);
    }

    protected getStrikePos(other, self):cc.Vec2{
        let otherAABB = other.world.aabb;
        let selfAABB = self.world.aabb;
        // console.log("otherAABB==>", otherAABB);
        // console.log("selfAABB==>", selfAABB);
        // console.log("===================");

        /** 方法一 */
        /** 取包围盒的面积做比较，决策碰撞点，播放碰撞动画
         * 1.怪物比子弹大很多时就在子弹的位置播放
         * 2.子弹比怪物大很多时在怪物的位置播放
         * 3.大小差不多时取中点(小于0.5倍则取中点)
         * */
        // let rate = 1.5;
        // let selfArea = self.world.aabb.width * self.world.aabb.height;
        // let otherArea = other.world.aabb.width * other.world.aabb.height;
        // let strikePos = cc.v2();
        // if (selfArea > otherArea){
        //     if (selfArea/otherArea > rate){
        //         /** 取other节点的位置 */
        //         strikePos = other.world.aabb.center;
        //     } else {
        //         /** 取中心点 */
        //     }
        // }else {
        //     if (otherArea/selfArea > rate){
        //         /** 取self节点的位置 */
        //     } else {
        //         /** 取中心点 */
        //     }
        // }
        /** 方法二 */
        /** 用aabb包围盒判断碰撞点 */
        // let selfDir = selfAABB.center.sub(self.world.preAabb.center).normalize();
        //虽然可以用子弹的移动方向与物体的点集做运算，计算出边界碰撞位置，但是子弹已经飞过了这个位置，再在其他位置播放击中效果更突兀.
        /** 水平方向 */
        let strikePos = cc.v2();
        if (selfAABB.xMin >= otherAABB.xMin && selfAABB.xMax <= otherAABB.xMax){
            strikePos.x = selfAABB.center.x;
        }else if (selfAABB.xMax <= otherAABB.center.x && selfAABB.xMin < otherAABB.xMin){
            strikePos.x = selfAABB.xMax;
        }else if (selfAABB.xMin >= otherAABB.center.x && selfAABB.xMax > otherAABB.xMax){
            strikePos.x = selfAABB.xMin;
        }else {
            strikePos.x = otherAABB.center.x;
        }

        /** 垂直方向 */
        if (selfAABB.yMin >= otherAABB.yMin && selfAABB.yMax <= otherAABB.yMax){
            strikePos.y = selfAABB.center.y;
        }else if (selfAABB.yMax <= otherAABB.center.y && selfAABB.yMin < otherAABB.yMin){
            strikePos.y = selfAABB.yMax;
        }else if (selfAABB.yMin >= otherAABB.center.y && selfAABB.yMax > otherAABB.yMax){
            strikePos.y = selfAABB.yMin;
        }else {
            strikePos.y = otherAABB.center.y;
        }

        return strikePos;
    }

    /** 创建strike */
    strike(other, self){
        let bulletStrike = window['GameBulletsController'].getInactiveBulletStrike(this.bulletId);
        bulletStrike.node.active = true;
        bulletStrike.node.position = this.getStrikePos(other, self);
        bulletStrike.node.rotation = this.node.rotation;
        bulletStrike.strike();
    }

    doRepeal(enemy, repel){
        enemy.doRepel(this.moveDir, repel);
    }

    /**
     * 当碰撞产生的时候调用
     *  */
    protected collisionEnemy(other, self){
        this.strike(other, self);
        let enemy = other.getComponent('Enemy');
        /** 僵硬 */
        if (this.stiff > 0){
            enemy.doStiff(this.stiff);
        }
        /** 减速 */
        enemy.doSpeedcut();
        /** 击退效果 */
        let subRepel = this.repel - enemy.unrepel;
        // let subRepel = 10;
        if (subRepel > 0){
            // console.log("击退效果……。");
            this.doRepeal(enemy, subRepel);
        }else if (enemy.enemyID < 7) {
            enemy.playBeatenBack();
        }

        /** 飘血效果 */
        let damage = this.hurt;
        if (damage > 0){
            enemy.hp -= damage;
        }
    }

    /**
     * 碰撞处理
     * */
    onCollisionEnter (other, self) {

        this.collisionEnemy(other, self);

        if (!this.bThrought){
            this.node.active = false;
        }

        // console.log('子弹碰撞');
    }

    /**
     * 当碰撞产生后，碰撞结束前的情况下，每次计算碰撞结果后调用
     * */
    onCollisionStay(other, self){

    }

    /** 当碰撞结束后调用 */
    onCollisionExit(other, self){

    }

}


