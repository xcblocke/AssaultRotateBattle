// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import EnemyAABB from "./EnemyAABB";
import {ExcelTableNames} from "../../config/ExcelTableNames";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {GameProxy} from "../../game/GameProxy";
import {Music} from "../../../../framework/audio/Music";
import {ext} from "../../../../framework/extend/Extend";

const {ccclass, property} = cc._decorator;

const AttackDelayList = [0.4, 0.4, 0, 0.2, 0.3, 0.3, 0.3, 0.5];

const BASE_TIME_SCALE = 1.5;

@ccclass
export default class Enemy extends cc.Component {

    @property(sp.Skeleton)
    ske:sp.Skeleton = null;

    attackCD = 1;

    private _gameSlow = false;


    set gameSlow(value: boolean) {
        this._gameSlow = value;
        let timeScale = BASE_TIME_SCALE;
        if (this._gameSlow){
            timeScale *= 0.2;
        }
        this.ske.timeScale = timeScale;
    }

    protected _moveSpeed = 0;

    /** 速度的加成 */
    protected _speedAdd = 1;

    get speedAdd(): number {
        return this._speedAdd;
    }

    set speedAdd(value: number) {
        this._speedAdd = value;
        this.ske.timeScale = BASE_TIME_SCALE*value;
    }

    protected _bAcc = false;


    set bAcc(value: boolean) {
        this._bAcc = value;
        if (this._bAcc && this.enemyID > 3){
            Music.playSFX("sound/msc_en003", 0.6);
        }
    }

    accSpeed = 0;

    foundRange = 0;

    attackDistance = 100;

    bulletSpeed = 0;

    unrepel = 0;

    maxHp = 0;

    /** 死后爆汁缩放 */
    humorScale = 1;

    /** 金币数 */
    gold = 0;

    /** 金币图标掉落 */
    goldIconFell = 1;

    speedcut = 0;

    /** 移动标志 */
    moveFlag = false;

    /** 转向角色标志 */
    lookAtRoleFlag = false;

    /** 攻击冷却中 */
    attackCoolingFlag = false;

    /** 逻辑处理标志 */
    logicFlag = false;

    /** 移动方向 */
    moveDir = cc.v2();


    get moveSpeed(): number {
        return this._moveSpeed*(this._bAcc?this.accSpeed:1) * this._speedAdd * (this._gameSlow?0.2:1);
    }

    /** 僵硬 */
    private _stiff = false;


    get stiff(): boolean {
        return this._stiff;
    }

    set stiff(value: boolean) {
        this._stiff = value;
        this.playStand();
    }

    doStiff(stiff:number){
        this.stiff = true;
        let action = cc.sequence(cc.delayTime(stiff), cc.callFunc(()=>this.stiff = false));
        action.setTag(1230);
        this.node.stopActionByTag(1230);
        this.node.runAction(action);
    }

    doSpeedcut(){
        if (this.speedcut > 0){
            this.speedAdd = 1 - this.speedcut;
            let action = cc.sequence(cc.delayTime(0.15), cc.callFunc(()=>this.speedAdd = 1));
            action.setTag(2510);
            this.node.stopActionByTag(2510);
            this.node.runAction(action);
        }
    }

    doRepel(dir:cc.Vec2, repel:number){
        this.playBeaten();
        /** 计算与边线线段的交点 */
        let delta = dir.mul(repel);
        let destPos = this.node.position.add(delta);
        let intersections = [];
        if (dir.x > 0){
            //右边界
            if (destPos.x >= this._bounds.xMax){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMax, this._bounds.yMin), cc.v2(this._bounds.xMax, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }else if (dir.x < 0) {
            //左边界
            if (destPos.x <= this._bounds.xMin){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMin), cc.v2(this._bounds.xMin, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }

        if (dir.y > 0){
            //上边界
            if (destPos.y >= this._bounds.yMax){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMax), cc.v2(this._bounds.xMax, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }else if (dir.y < 0){
            //上边界
            if (destPos.y <= this._bounds.yMin){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMin), cc.v2(this._bounds.xMax, this._bounds.yMin), point)){
                    intersections.push(point);
                }
            }
        }

        if (intersections.length > 0){
            // console.log("重新计算destPos===>intersections", intersections);
            /** 重新计算destPos */
            if (intersections.length == 1){
                destPos = intersections[0].addSelf(dir.neg(cc.v2()));
            } else {
                /** 取距离怪物最近的那个点 */
                let p = intersections[0];
                let minDistance = p.sub(this.node.position).mag();
                for (let i=1; i<intersections.length; i++){
                    let mag = intersections[i].sub(this.node.position).mag();
                    if (mag < minDistance){
                        p = intersections[i];
                        minDistance = mag;
                    }
                }
                destPos = p.addSelf(dir.neg(cc.v2()));
            }
        }
        let distance = destPos.sub(this.node.position).mag();
        let speed = 800;
        let action = cc.sequence(cc.moveTo(distance/speed, destPos).easing(cc.easeCircleActionOut()), cc.callFunc(()=>{
            this.playBeatenBack();
        }));
        action.setTag(582);
        this.node.stopActionByTag(582);
        this.node.runAction(action);
    }

    private _hp = 0;

    get hp(): number {
        return this._hp;
    }

    set hp(value: number) {
        if (this._hp <= 0)return;
        let damage = this._hp - value;
        window['GameLabelsController'] .fly(`-${ext.shortFormat(damage)}`, this.node.position.add(cc.v2(0, this.spaceCircleCollider.radius)));
        this.ske.node.color = this.ske.node.color.fromHEX("#D85959");
        this.ske.node.runAction(cc.sequence(cc.delayTime(0.05), cc.callFunc(()=>this.ske.node.color = cc.Color.WHITE)));
        this._hp = value;
        if (value <= 0){
            GameProxy.killCount++;
            GameProxy.emit(GameProxy.Event.KillEnemy, this);
            this.node.stopAllActions();
            this._stiff = true;
            this.playDead();
        }
    }

    hurt = 0;

    hierarchy = 0;

    /** 综合属性 */

    /** 敏捷度 */
    agility = 0;

    private _strikeCompleteTime = 0;


    get strikeCompleteTime(): number {
        return this._strikeCompleteTime;
    }

    private _spaceCircleCollider:cc.CircleCollider = null;

    private _defenceBoxCollider:cc.BoxCollider = null;


    get spaceCircleCollider(): cc.CircleCollider {
        return this._spaceCircleCollider;
    }

    get defenceBoxCollider(): cc.BoxCollider {
        return this._defenceBoxCollider;
    }

    private _enemyAABB:EnemyAABB = null;


    get enemyAABB(): EnemyAABB {
        return this._enemyAABB;
    }

    private _bounds = cc.rect();

    reset(){
        this._hp = this.maxHp;
        this.stiff = false;
        this.speedAdd = 1;
        this.gameSlow = GameProxy.slowGame;
        this._bAcc = false;
        if (GameProxy.maxEnemyNum - GameProxy.enemyList.length  >= GameProxy.levelConfig.amount_p1+1){
            this.bAcc = true;
        }
        this.ske.timeScale = BASE_TIME_SCALE;
        this.moveFlag = false;
        this.lookAtRoleFlag = false;
        this.attackCoolingFlag = false;
        this.logicFlag = false;
        this.node.on(cc.Node.EventType.ROTATION_CHANGED, ()=>{
            this.moveDir = cc.v2(0, 1).normalize().rotate(cc.misc.degreesToRadians(-this.node.rotation));
        });
        /** 朝向角色 */
        let dir = window['GameRoleController'].role.node.position.sub(this.node.position);
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        this.playStand();
    }

    onEnable(){
        this.reset();
    }

    onDisable(){
        this.node.stopAllActions();
    }

    start(){
        let bgNode = this.node.getParent().getParent();
        this._bounds.x = -bgNode.width/2 + this.spaceCircleCollider.radius;
        this._bounds.y = -bgNode.height/2 + this.spaceCircleCollider.radius;
        this._bounds.width = bgNode.width - this.spaceCircleCollider.radius*2;
        this._bounds.height = bgNode.height - this.spaceCircleCollider.radius*2;
    }

    onLoad(){
        this._spaceCircleCollider = this.getComponent(cc.CircleCollider);
        this._defenceBoxCollider = this.getComponent(cc.BoxCollider);
        this._enemyAABB = this.getComponent(EnemyAABB);
        this.ske.setMix("strike", "stand", 0.1);
        this.ske.setMix("walk", "strike", 0.1);
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            if (name == "strike") {
                this.playStand();
                this._strikeCompleteTime = new Date().getTime();
                this.attackCoolingFlag = true;
                this.node.runAction(cc.sequence(cc.delayTime(this.attackCD), cc.callFunc(()=>{
                    this.attackCoolingFlag = false;
                })));
            }else if (name == "beaten"){
                this.playStand();
            }else if (name == "dead"){
                this.showBlood();
                this.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
                    this.node.active = false;
                })));
            }else if (name == "stand"){
                this.playWalk();
            }
        });
    }

    private showBlood(){
        let bloodNode = window['GameEnemysController'].getInactiveEnemyBloodNode();
        bloodNode.active = true;
        bloodNode.position = this.node.position;
        bloodNode.rotation = Math.random()*360;
        bloodNode.scale = this.humorScale;
        bloodNode.opacity = 255;
        bloodNode.runAction(cc.sequence(cc.delayTime(1), cc.fadeTo(0.5, 60), cc.callFunc(()=>{
            bloodNode.active =false;
        })));
    }

    isInAttackRange():boolean{
        let sub = window['GameRoleController'].role.node.position.sub(this.node.position);
        let distance = sub.mag();
        //并且打不到敌人

        if (distance < this.attackDistance + window['GameRoleController'].role.spaceCircleCollider.radius){
            // console.log("===============>怪物可以攻击了");
            /** 根据攻击距离计算攻击夹角 */
            let attackRadian = Math.atan(window['GameRoleController'].role.spaceCircleCollider.radius/distance);
            if (sub.angle(cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-this.node.rotation))) < attackRadian){
                return true;
            }
        }
        return false;
    }

    protected doAttack(){
        /** 判断攻击角度与距离，在一定范围内则判断为攻击成功 */
        if (this.isInAttackRange()){
            Music.playSFX("sound/msc_en003");
            window['GameRoleController'].hp -= this.hurt;
        }
    }

    protected _enemyID = 0;


    get enemyID(): number {
        return this._enemyID;
    }

    init(id:number){
        this._enemyID = id;
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Enemy)[id-1];
        this.unrepel = config['unrepel'];
        this._moveSpeed = config['move'];
        this.accSpeed = config['acc_s'];
        this.foundRange = config['found_rg'];
        this.agility = config['agility'];
        this.attackDistance = config['range'];
        this.attackCD = config['fre'];
        this.bulletSpeed = config['speed'];
        this.maxHp = this._hp = Math.floor(config['health']*GameProxy.enemyHpMulOf(this._enemyID));
        this.hurt = Math.floor(config['hurt'] * GameProxy.enemyHurtMulOf(config['id']));
        this.hierarchy = config['hierarchy'];
        this.humorScale = config['humor'];
        this.gold = Math.floor(config['gold_pro'] * GameProxy.enemyGoldMulOf(this._enemyID));
        this.goldIconFell = config['gold_fell'];
        this.speedcut = config['speedcut'];
        this.node.zIndex = this.hierarchy;
        this.attackDelayTime = AttackDelayList[id-1];
        if (id > AttackDelayList.length){
            console.error("_enemyID > AttackDelayList.length");
        }
    }

    protected setAnimation(trackIndex:number, name:string, loop:boolean){
        this.ske.setAnimation(trackIndex, name, loop);
        this.moveFlag =  name == "walk";
        this.lookAtRoleFlag = name != "strike";
    }

    private attackDelayTime = -1;

    stopAttack(){
        this.node.stopActionByTag(1199);
    }

    playStand(){
        this.setAnimation(0, "stand", true);
    }

    playAttack(){
        if (this.attackDelayTime >= 0){
            let action = cc.speed(cc.sequence(cc.delayTime(this.attackDelayTime), cc.callFunc(()=>{
                if (!GameProxy.pauseGame){
                    this.doAttack();
                }
            })), 1);
            action.setTag(1199);
            this.node.runAction(action);
        }
        this.setAnimation(0, "strike", false);
    }

    playWalk(){
        this.setAnimation(0, "walk", true);
    }

    playDead(){
        this.stopAttack();
        this.ske.timeScale = BASE_TIME_SCALE;
        this.setAnimation(0, "dead", false);
    }

    playBeaten(){
        this.stopAttack();
        // console.log("beaten2.....");
        this.setAnimation(0, "beaten2", false);
    }

    playBeatenBack(){
        // console.log("beaten.....");
        this.setAnimation(0, "beaten", false);
    }

    isAttacking(){
        return this.ske.animation == "strike";
    }

    isBeating(){
        return this.ske.animation == "beaten2" || this.ske.animation == "beaten";
    }

    isWalking(){
        return this.ske.animation == "walk";
    }

    isStanding(){
        return this.ske.animation == "stand";
    }

    isDead(){
        return this._hp <=0;
    }

    turnTo(dir:cc.Vec2){
        let degree = (90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x)))%360;
        // console.log("de===>", degree);
        // console.log("dir===>x="+dir.x+" y="+dir.y);
        if (degree < 0){
            degree += 360;
        }
        let enemyRotation = this.node.rotation%360;
        if (enemyRotation < 0){
            enemyRotation += 360;
        }
        let subDegree = Math.abs(degree - enemyRotation);
        // console.log("degree="+degree);
        // console.log("enemyRotation====>"+enemyRotation);
        let speed = this._moveSpeed*this.agility*(this._bAcc?0.5:1) * this._speedAdd * (this._gameSlow?0.2:1);
        if (subDegree > 0){
            let rotation = 0;
            if (subDegree > 180){
                rotation = Math.sign(enemyRotation - degree) * speed;
                if (Math.abs(rotation) > 360 - subDegree){
                    rotation = Math.sign(rotation)*(360-subDegree);
                }
            }else {
                rotation = Math.sign(degree - enemyRotation) * speed;
                if (Math.abs(rotation) > subDegree){
                    rotation = Math.sign(rotation) * subDegree;
                }
            }
            enemyRotation += rotation;
        }
        this.node.rotation = enemyRotation;
    }

    move(){
        // console.log("len===>", len);
        let len = this.moveSpeed;
        if (len <= 0)return false;
        /** 沿着当前方向移动 */
        let position = this.node.position.add(this.moveDir.mul(len));
        /** 判断与角色的碰撞 */
        // let toRoleDistance = position.sub(window['GameRoleController'].role.node.position).mag();
        // if (toRoleDistance < this.spaceCircleCollider.radius + window['GameRoleController'].role.spaceCircleCollider.radius){
        //     return false;
        // }

        /** 判断边界 */
        if (position.x > this._bounds.xMax || position.x < this._bounds.xMin || position.y > this._bounds.yMax || position.y < this._bounds.yMin){
            return false;
        }

        if (!this._bAcc && this.foundRange > 0){
            let toRoleDistance = position.sub(window['GameRoleController'].role.node.position).mag();
            this.bAcc = toRoleDistance - len < this.foundRange;
        }

        /** 判断怪物之间的碰撞 */
        // let arr = [];
        // this._gameCollisionController.looseQuadTree.retrieve(this.enemyAABB.aabb(),arr);
        //
        // for (let aabbRegion of arr){
        //     let enemy = aabbRegion.enemy;
        //     if (enemy !== this && enemy.node.position.sub(position).mag() < enemy.spaceCircleCollider.radius + enemy.spaceCircleCollider.radius){
        //         return false;
        //     }
        // }

        this.node.position = position;
        return true;
    }

    update(dt:number){
        if (GameProxy.pauseGame || this.stiff){
            return;
        }
        /** 逻辑处理标志--优化策略为每一帧只处理固定数量的怪物逻辑 */
        if (this.logicFlag){
            /** 是否可以攻击 */
            if ((this.isWalking() || this.isStanding()) && this.isInAttackRange()){
                this.playAttack();
            }

            /** 旋转 */
            if (this.lookAtRoleFlag){
                this.turnTo(window['GameRoleController'].role.node.position.sub(this.node.position).normalize());
            }
        }
        /** 移动 */
        if (this.moveFlag){
            this.move();
        }
    }
}
