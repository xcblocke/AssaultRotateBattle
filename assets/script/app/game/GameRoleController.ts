// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import BulletEmitterShanDianQiu from "../entities/bulletEmitter/BulletEmitterShanDianQiu";
import BulletEmitterHuoJianTong from "../entities/bulletEmitter/BulletEmitterHuoJianTong";
import BulletEmitterShouQiang from "../entities/bulletEmitter/BulletEmitterShouQiang";
import BulletEmitterSanDanQiang from "../entities/bulletEmitter/BulletEmitterSanDanQiang";
import Role, {SpeedType} from "../entities/role/Role";
import Actions from "../../../framework/actions/Actions";
import BulletEmitterJiGuang from "../entities/bulletEmitter/BulletEmitterJiGuang";
import BulletEmitterLiZiPao from "../entities/bulletEmitter/BulletEmitterLiZiPao";
import BulletEmitterJiaTeLin from "../entities/bulletEmitter/BulletEmitterJiaTeLin";
import BulletEmitterJuJiQiang from "../entities/bulletEmitter/BulletEmitterJuJiQiang";
import BulletEmitterHuoYan from "../entities/bulletEmitter/BulletEmitterHuoYan";
import AABBRegion from "../../quad-tree/AABBRegion";
import EnemyAABB from "../entities/enemy/EnemyAABB";
import BulletEmitter from "../entities/bulletEmitter/BulletEmitter";
import BulletEmitterPenZi from "../entities/bulletEmitter/BulletEmitterPenZi";
import {GameProxy} from "./GameProxy";
import Enemy from "../entities/enemy/Enemy";
import BulletOfFangHuDun from "../entities/bullet/BulletOfFangHuDun";
import PropBase from "../entities/prop/PropBase";
import PropStateController from "../entities/prop/PropStateController";
import {Music} from "../../../framework/audio/Music";
import {World} from "../info/World";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import GameController from "./GameController";
import {ext} from "../../../framework/extend/Extend";

const {ccclass, property} = cc._decorator;

export enum JoystickType {
    FIXED,
    FOLLOW,
}

export enum DirectionType{
    FOUR = 4,
    EIGHT = 8,
    ALL = 0,
}

const RING_OPACITY = 80;

const EmitterSfxVolumes = [0.33, 0.8, 0.8, 0.45, 1, 2, 1, 0.6, 1, 2, 1, 1, 1];

@ccclass
export default class GameRoleController extends cc.Component {

    @property(cc.Node)
    guideNode:cc.Node = null;

    @property(cc.Node)
    bulletStrikeLayer:cc.Node = null;

    @property(cc.Prefab)
    propStatePrefab:cc.Prefab = null;

    @property(cc.Node)
    propStateNode:cc.Node = null;
    @property(cc.Node)
    takePropLayer:cc.Node = null;
    @property(sp.Skeleton)
    beAttackSke:sp.Skeleton = null;

    @property(sp.Skeleton)
    weaponSke:sp.Skeleton = null;

    @property(cc.Label)
    payloadLabel:cc.Label = null;

    @property(cc.Node)
    payloadBars:[cc.Node] = [];

    @property(cc.ProgressBar)
    hpProgressBar:cc.ProgressBar = null;

    @property(cc.Node)
    hpBarNode:cc.Node = null;

    @property(cc.Node)
    bgLayer:cc.Node = null;

    @property({type:cc.Node, tooltip:"摇杆操纵点"})
    dot:cc.Node = null;

    @property({type:cc.Node, tooltip:"摇杆背景节点"})
    ring:cc.Node = null;

    @property({type:cc.Enum(JoystickType), tooltip:"触摸类型"})
    joystickType:JoystickType = JoystickType.FIXED;

    @property({type:cc.Enum(DirectionType), tooltip:"方向类型"})
    directionType:DirectionType = DirectionType.ALL;

    private _radius = 0;


    private _takeProps:Array<cc.Node> = [];

    private genTakePropNode():cc.Node{
        let prefabPath = 'prefab/entities/prop/takeProp';
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        node.active = false;
        this.takePropLayer.addChild(node);
        this._takeProps.push(node);
        return node;
    }

    private getInactiveTakePropNode():cc.Node{
        let result:cc.Node = this._takeProps.find(value => value.active == false);
        if (typeof result == "undefined"){
            result = this.genTakePropNode();
        }
        return result;
    }

    @property(Role)
    role:Role = null;

    @property(BulletOfFangHuDun)
    impenetrableDefence:BulletOfFangHuDun = null;

    maxHp = 1000;

    private _hp = 0;


    get hp(): number {
        return this._hp;
    }

    set hp(value: number) {
        if (this.impenetrableDefence.node.active){
            //减速
            this.impenetrableDefence.strike(null, null);
            return;
        }
        if (this._hp <= 0)return;
        let damage = this._hp - value;
        window['GameLabelsController'] .fly(`-${ext.shortFormat(damage)}`, this.role.node.position.add(cc.v2(0, this.role.spaceCircleCollider.radius)));
        this._hp = value;
        if (value <= 0){
            GameProxy.emit(GameProxy.Event.KillRole);
        }
        this.updateHpProgress();
        this.beAttackSke.node.active = true;
        this.beAttackSke.setAnimation(0, "crazy", false);
        Music.playSFX("sound/msc_rol001");
        this.hpBarNode.color = cc.Color.RED;
        this.role.spriteNode.color = cc.Color.RED;
        let action = cc.sequence(cc.delayTime(0.2), cc.callFunc(()=>{
            this.hpBarNode.color = cc.Color.GREEN;
            this.role.spriteNode.color = cc.Color.WHITE;
        }));
        action.setTag(901);
        this.role.node.stopActionByTag(901);
        this.role.node.runAction(action);
    }

    huiXue(add:number){
        this._hp += add;
        if (this._hp > this.maxHp){
            this._hp = this.maxHp;
        }
        this.updateHpProgress();
    }

    updateHpProgress(){
        this.hpProgressBar.progress = this._hp / this.maxHp;
    }

    private _bulletEmitter:number = 0;


    get bulletEmitter(): number {
        return this._bulletEmitter;
    }

    set bulletEmitter(value: number) {
        if (this._bulletEmitter != 0){
            Music.playSFX("sound/msc_rol003");
        }
        if (this._bulletEmitter != value){
            this._bulletEmitter = value;
            let gameBulletsController = window['GameBulletsController'];
            let bulletEmitter:BulletEmitter = null;
            switch (this._bulletEmitter){
                case BulletEmitter.TYPES.ShouQiang:
                    bulletEmitter = new BulletEmitterShouQiang(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.PenZi:
                    bulletEmitter = new BulletEmitterPenZi(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.JiaTeLin:
                    bulletEmitter = new BulletEmitterJiaTeLin(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.SanDanQiang:
                    bulletEmitter = new BulletEmitterSanDanQiang(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.JuJiQiang:
                    bulletEmitter = new BulletEmitterJuJiQiang(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.LiZiPao:
                    bulletEmitter = new BulletEmitterLiZiPao(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.HuoJianTong:
                    bulletEmitter = new BulletEmitterHuoJianTong(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.ShanDianQiu:
                    bulletEmitter = new BulletEmitterShanDianQiu(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.JiGuang:
                    bulletEmitter = new BulletEmitterJiGuang(gameBulletsController);
                    break;
                case BulletEmitter.TYPES.HuoYan:
                    bulletEmitter = new BulletEmitterHuoYan(gameBulletsController);
                    break;
            }
            this.bulletEmitterDelegate = bulletEmitter;
            bulletEmitter.init(this._bulletEmitter);
            // this.weaponSke.node.scale = 0;
            // this.weaponSke.node.runAction(cc.scaleTo(0.35, 0.55).easing(cc.easeBackOut()));
            this.weaponSke.setSkin(("000"+this._bulletEmitter).substr(-3));
            this.weaponSke.setAnimation(0, "gun_002", false);
        }
    }

    private _bulletEmitterDelegate:BulletEmitter = null;


    get bulletEmitterDelegate(): BulletEmitter {
        return this._bulletEmitterDelegate;
    }

    set bulletEmitterDelegate(value: BulletEmitter) {
        if (this._bulletEmitterDelegate){
            this._bulletEmitterDelegate.onExit();
        }
        this._bulletEmitterDelegate = value;
        this._bulletEmitterDelegate.onEnter();
    }


    private _touchId = null;
    private _bMove = false;
    private _dir = cc.v2();


    set touchId(value: any) {
        this._touchId = value;
        // if (this._touchId == null){
        //     GameProxy.slowGame = true;
        // } else {
        //     GameProxy.slowGame = false;
        // }
    }

    private _fireCD = 0;

    private _bgBounds = cc.rect();
    private _roleBounds = cc.rect();


    get dir(): cc.Vec2 {
        return this._dir;
    }

    get bMove(): boolean {
        return this._bMove;
    }

    onLoad () {
        this._radius = this.ring.width/2;
        if (this.joystickType == JoystickType.FOLLOW) {
            this.ring.opacity = 0;
            this.dot.opacity = 0;
        }
        this.role.node.on(cc.Node.EventType.POSITION_CHANGED, this.onRolePositionChanged, this);
        this.node.on(GameProxy.Event.PauseGame, this.onPauseGame, this);
        this.node.on(GameProxy.Event.InitGame, this.onInitGame, this);
        this.node.on(GameProxy.Event.StartGame, this.onStartGame, this);
        this.node.on(GameProxy.Event.ReliveGame, this.onReliveGame, this);
        this.node.on(GameProxy.Event.UpdateBulletCount, this.onUpdateBulletCount, this);
        this.node.on(GameProxy.Event.PropTrigger, this.onPropTrigger, this);
        this.node.on(GameProxy.Event.PropCDZero, this.onPropCDZero, this);
        this.beAttackSke.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            this.beAttackSke.node.active = false;
        });
        this.beAttackSke.node.active = false;
        this.beAttackSke.node.scaleY = cc.view.getVisibleSize().height/1334;
        this.weaponSke.setCompleteListener((trackEntry, loopCount) =>{
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            if (name == 'gun_002'){
                this.weaponSke.setAnimation(0, "gun", false);
            }
        });
        window['GameRoleController'] = this;
    }

    onUpdateBulletCount(){
        let str = `x${this._bulletEmitterDelegate.bulletCount}`;
        if (this._bulletEmitter == 1){
            str = '∞';
        }
        this.payloadLabel.string = str;
        let num = this.payloadBars.length;
        if (this._bulletEmitterDelegate.payload > 0){
            num = Math.ceil(this._bulletEmitterDelegate.bulletCount/this._bulletEmitterDelegate.payload*this.payloadBars.length);
        }
        this.payloadBars.forEach((value, index) => value.active = index < num);
    }

    onPauseGame(pause:boolean){
        if (pause){
            this.touchId = null;
            this._bMove = false;
            this.dot.setPosition(this.ring.getPosition());
            if (this.joystickType == JoystickType.FOLLOW) {
                this.ring.opacity = 0;
                this.dot.opacity = 0;
            }
        }
    }

    onInitGame(){
        this.maxHp = this._hp = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.HpLv-1]['life'];
        this.updateHpProgress();
        this.setImpenetrableDefenceCD(3);
    }

    setImpenetrableDefenceCD(cd:number){
        console.log("setImpenetrableDefenceCD==>", cd);
        this.impenetrableDefence.node.active = true;
        this.impenetrableDefence.unblink();
        let action = cc.sequence(cc.delayTime(cd-1), cc.callFunc(()=>{
            this.impenetrableDefence.blink();
        }), cc.delayTime(1), cc.callFunc(()=>{
            this.impenetrableDefence.node.active = false;
        }));
        action.setTag(889);
        this.role.node.stopActionByTag(889);
        this.role.node.runAction(action);
    }

    onStartGame(){
        console.log("onStartGame===>", GameProxy.pauseGame);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        if (!World.My.newbies.state("FirstEntryGame")){
            this.guideNode.active = true;
        }else {
            this.getComponent(GameController).startGenerating();
        }
    }

    onReliveGame(){
        this.onInitGame();
        let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon).filter(value => value['id'] != 1).sort(((a, b) => b['unlock'] - a['unlock']));
        for (let item of weaponConfig){
            if (GameProxy.level >= item['unlock']){
                this.bulletEmitter = item['id'];
                this.bulletEmitterDelegate.payload = this.bulletEmitterDelegate.payload * 3;
                break;
            }
        }
    }

    onRolePositionChanged(){
        this.hpProgressBar.node.position = this.role.node.position;
        this._takeProps.forEach(value => {
            if (value.active){
                value.position = this.role.node.position;
            }
        });
    }

    onPropTrigger(prop:PropBase) {
        let takePropNode = this.getInactiveTakePropNode();
        takePropNode.position = this.role.node.position;
        takePropNode.active = true;
        takePropNode.scale = 1;
        takePropNode.opacity = 255;
        takePropNode.runAction(cc.sequence(cc.scaleTo(0.3, 4), cc.fadeTo(0.3, 80), cc.callFunc(()=>{
            takePropNode.active = false;
        })));
        let propID = prop.propID;
        let propMove = (callback?:()=>void)=>{
            let propBaseNode = cc.instantiate(prop.node);
            propBaseNode.position = this.propStateNode.getParent().convertToNodeSpaceAR(prop.node.convertToWorldSpaceAR(cc.v2()));
            this.propStateNode.getParent().addChild(propBaseNode);
            /** 飞到状态栏的位置 */
            let flyDuration = 0.3;
            let propStateNode = cc.instantiate(this.propStatePrefab);
            this.propStateNode.addChild(propStateNode);
            propStateNode.scale = 0;
            propStateNode.runAction(cc.scaleTo(flyDuration, 1));
            propBaseNode.runAction(cc.sequence(cc.moveTo(flyDuration, this.propStateNode.position.add(cc.v2(0, -78/2))), cc.callFunc(()=>{
                this.propStateNode.children.forEach(value => {
                    let propStateConroller = value.getComponent(PropStateController);
                    if (propStateConroller.propID == propID && value != propStateNode){
                        propStateConroller.cdTimer.pause = true;
                        propStateConroller.node.active = false;
                    }
                });
                let propStateConroller = propStateNode.getComponent(PropStateController);
                propStateConroller.init(propID);
                propStateConroller.cdTimer.pause = false;
                propBaseNode.destroy();
                if (callback){
                    callback();
                }
            })));
        };
        switch (propID) {
            case 5:
                this.setImpenetrableDefenceCD(10+0.3);
                break;
            case 11:
                this.role.addSupply(propID);
                this.huiXue(Math.floor(this.maxHp*0.3));
                break;
            case 9:
                this.role.addSupply(propID);
                propMove();
                this.role.accSpeed = 1.5;
                break;
            case 10:
                propMove();
                break;
            case 12:
                this.role.addSupply(propID);
                propMove();
                GameProxy.goldMul = 2;
                break;
            case 13:
                GameProxy.magnetic = true;
                propMove();
                break;
            case 102:
            case 103:
            case 104:
            case 105:
            case 106:
            case 107:
            case 108:
            case 109:
            case 110:
                if (this.bulletEmitter == propID - 100){
                    this.bulletEmitterDelegate.bulletCount = this.bulletEmitterDelegate.payload;
                }else {
                    this.bulletEmitter = propID - 100;
                }
                break;
        }
    }

    onPropCDZero(id:number){
        switch (id){
            case 5:
                this.impenetrableDefence.node.active = false;
                break;
            case 9:
                this.role.accSpeed = 1;
                break;
            case 10:
                break;
            case 12:
                GameProxy.goldMul = 1;
                break;
            case 13:
                GameProxy.magnetic = false;
                break;
        }
    }

    private _bgNode:cc.Node = null;
    private _screenRect:cc.Rect = cc.rect(0, 0, cc.visibleRect.width, cc.visibleRect.height);

    start(){
        let bgNode = this.role.node.getParent();
        this._bgNode = bgNode;
        this._roleBounds.x = -bgNode.width/2 + this.role.spaceCircleCollider.radius;
        this._roleBounds.y = -bgNode.height/2 + this.role.spaceCircleCollider.radius;
        this._roleBounds.width = bgNode.width - this.role.spaceCircleCollider.radius*2;
        this._roleBounds.height = bgNode.height - this.role.spaceCircleCollider.radius*2;

        this._bgBounds.x = -this.bgLayer.width/2 + cc.view.getVisibleSize().width/2;
        this._bgBounds.y = -this.bgLayer.height/2 + cc.view.getVisibleSize().height/2;
        this._bgBounds.width = this.bgLayer.width - cc.view.getVisibleSize().width;
        this._bgBounds.height = this.bgLayer.height - cc.view.getVisibleSize().height;


        // console.log(this._roleBounds, "this._roleBounds===>");
        // let node = new cc.Node();
        // bgNode.addChild(node);
        // let graphic = node.addComponent(cc.Graphics);
        // graphic.strokeColor = cc.Color.RED;
        // graphic.lineWidth = 5;
        // graphic.rect(-bgNode.width/2, -bgNode.height/2, bgNode.width, bgNode.height);
        // graphic.stroke();
        //
        // graphic = this.role.node.addComponent(cc.Graphics);
        // graphic.strokeColor = cc.Color.RED;
        // graphic.lineWidth = 3;
        // graphic.circle(this.role.spaceCircleCollider.offset.x, this.role.spaceCircleCollider.offset.y, this.role.spaceCircleCollider.radius);
        // graphic.stroke();
        /** 移动控制 */
        this.node.runAction(Actions.update(dt=>{
            /**
             * 角色移动
             * 有控制的情况下才能移动
             * 小于边界内才能移动
             * */
            let roleMoveLen = this.role.speed*dt;
            if (this._bMove && !GameProxy.pauseGame){
                let deltaPos = this._dir.mul(roleMoveLen);
                let destPos = this.role.node.position.add(deltaPos);

                let arr:Array<AABBRegion> = [];
                window['GameCollisionController'].looseQuadTree.retrieve(this.role.roleAABB.aabb(),arr);
                let flag = false;

                for (let aabbRegion of arr){
                    let enemy = (<EnemyAABB>aabbRegion).enemy;
                    if (enemy.node.position.sub(destPos).mag() < enemy.spaceCircleCollider.radius + this.role.spaceCircleCollider.radius){
                        flag = true;
                        break;
                    }
                }
                if (!flag){
                    if (destPos.x > this._roleBounds.xMax || destPos.x < this._roleBounds.xMin || destPos.y > this._roleBounds.yMax || destPos.y < this._roleBounds.yMin){
                        flag = true;
                    }
                }

                if (!flag){
                    this.role.node.position = destPos;
                }
                /*if (deltaPos.x > 0){
                    if (destPos.x > this._roleBounds.xMax){
                        destPos.x = this._roleBounds.xMax;
                    }
                }else if (deltaPos.x < 0){
                    if (destPos.x < this._roleBounds.xMin){
                        destPos.x = this._roleBounds.xMin;
                    }
                }

                if (deltaPos.y > 0){
                    if (destPos.y > this._roleBounds.yMax){
                        destPos.y = this._roleBounds.yMax;
                    }
                }else if (deltaPos.y < 0){
                    if (destPos.y < this._roleBounds.yMin){
                        destPos.y = this._roleBounds.yMin;
                    }
                }*/


                // let intersections = [];
                // /** 求线段与边线的交点 */
                // if (deltaPos.x > 0 && destPos.x > this._roleBounds.xMax){
                //     //与右边界的交点
                //     let point = cc.v2();
                //     if(cc.Intersection.pLineIntersect(this.role.node.position, destPos, cc.v2(this._roleBounds.xMax, this._roleBounds.yMin), cc.v2(this._roleBounds.xMax, this._roleBounds.yMax), point)){
                //         intersections.push(point);
                //     }
                // }
                // if (deltaPos.x < 0 && destPos.x < this._roleBounds.xMin){
                //     //与左边界的交点
                //     let point = cc.v2();
                //     if(cc.Intersection.pLineIntersect(this.role.node.position, destPos, cc.v2(this._roleBounds.xMin, this._roleBounds.yMin), cc.v2(this._roleBounds.xMin, this._roleBounds.yMax), point)){
                //         intersections.push(point);
                //     }
                // }
                // if (deltaPos.y > 0 && destPos.y > this._roleBounds.yMax){
                //     //与上边界的交点
                //     let point = cc.v2();
                //     if(cc.Intersection.pLineIntersect(this.role.node.position, destPos, cc.v2(this._roleBounds.xMin, this._roleBounds.yMax), cc.v2(this._roleBounds.xMax, this._roleBounds.yMax), point)){
                //         intersections.push(point);
                //     }
                // }
                // if (deltaPos.y < 0 && destPos.y < this._roleBounds.yMin){
                //     //与下边界的交点
                //     let point = cc.v2();
                //     if(cc.Intersection.pLineIntersect(this.role.node.position, destPos, cc.v2(this._roleBounds.xMin, this._roleBounds.yMin), cc.v2(this._roleBounds.xMax, this._roleBounds.yMin), point)){
                //         intersections.push(point);
                //     }
                // }

                /** 求线段与圆的交点 */

                // arr.forEach(value => {
                //     let enemy = value.getComponent(Enemy);
                //     // cc.Intersection.pLineCircle(this.role.node.position, destPos, {position:enemy.node.position, radius:enemy.spaceCircleCollider.radius}, intersections);
                //     let doubleRadius = enemy.spaceCircleCollider.radius + this.role.spaceCircleCollider.radius;
                //     if (cc.Intersection.pointLineDistance(enemy.node.position, this.role.node.position, destPos, true) < doubleRadius){
                //         console.log("与怪物相交，求最小移动距离");
                //         /** 距离 */
                //         let centerSub = enemy.node.position.sub(this.role.node.position);
                //         let centerLen = centerSub.mag();
                //         if (centerLen > doubleRadius){
                //             /** 求夹角 */
                //             let radians = destPos.angle(centerSub);
                //             if (radians > 0){
                //                 /** 求垂线 */
                //                 let vLen = centerLen * Math.sin(radians);
                //                 if (vLen < doubleRadius){
                //                     let sideLen = Math.sqrt(doubleRadius*doubleRadius - vLen*vLen);
                //                     let hLen = centerLen * Math.cos(radians);
                //                     intersections.push(this.node.position.add(this._dir.mul(hLen - sideLen)));
                //                 }
                //             } else {
                //                 intersections.push(this.node.position.add(this._dir.mul(centerLen - doubleRadius)));
                //             }
                //         }
                //     }
                // });

                // if (intersections.length > 0){
                //     console.log(intersections, "intersections..");
                //     if (intersections.length == 1){
                //         let t = cc.v2();
                //         this.role.node.position = intersections[0].addSelf(this._dir.neg(t));
                //     }else {
                //         /** 求距离role最近的那个 */
                //         let p = intersections[0];
                //         let minDistance = p.sub(this.role.node.position).mag();
                //         for (let i=1; i<intersections.length; i++){
                //             let mag = intersections[i].sub(this.role.node.position).mag();
                //             if (mag < minDistance){
                //                 p = intersections[i];
                //                 minDistance = mag;
                //             }
                //         }
                //         let t = cc.v2();
                //         this.role.node.position = p.addSelf(this._dir.neg(t));
                //     }
                // } else {
                //     this.role.node.position = destPos;
                // }
            }

            /**
             * 地图的移动
             * --它的移动速度比角色要慢一点
             * --要保证角色的点在屏幕中心
             * */
            let sub = cc.v2(-this.role.node.x, -this.role.node.y).sub(bgNode.position);
            let mag = sub.mag();
            let normalize = sub.normalize();
            if (mag > 0){
                let speed = roleMoveLen*(mag>50?1:5/6);
                let x = speed*normalize.x;
                let y = speed*normalize.y;
                if (Math.abs(x) > Math.abs(sub.x)){
                    x = sub.x;
                }
                if (Math.abs(y) > Math.abs(sub.y)){
                    y = sub.y;
                }
                let destX = bgNode.x + x;
                let destY = bgNode.y + y;
                if (destX < this._bgBounds.xMin){
                    destX = this._bgBounds.xMin;
                } else if (destX > this._bgBounds.xMax){
                    destX = this._bgBounds.xMax;
                }
                if (destY < this._bgBounds.yMin){
                    destY = this._bgBounds.yMin;
                } else if (destY > this._bgBounds.yMax){
                    destY = this._bgBounds.yMax;
                }
                bgNode.x = destX;
                bgNode.y = destY;
            }
        }));
        let gameEnemysController = window['GameEnemysController'];
        if (GameProxy.prepareGun > 0){
            this.bulletEmitter = GameProxy.prepareGun;
            this.bulletEmitterDelegate.payload = this.bulletEmitterDelegate.payload * 3;
            GameProxy.prepareGun = 0;
        } else {
            this.bulletEmitter = BulletEmitter.TYPES.ShouQiang;
        }
        /** 发射控制 */
        this.node.runAction(Actions.update(dt => {
            if (GameProxy.pauseGame || GameProxy.slowGame)return;
            if (this._fireCD > 0){
                this._fireCD -= dt;
            }
            /** 找到离角度最近的敌人 */
            let enemyNode:cc.Node = null;
            let minSub = null;
            let minDistance = this.bulletEmitterDelegate.firingRange;
            // console.log(minDistance, "minDistance");
            this._screenRect.x = -this._bgNode.x - cc.visibleRect.center.x;
            this._screenRect.y = -this._bgNode.y - cc.visibleRect.center.y;
            let rolePos = this.role.node.position;
            gameEnemysController.enemyLayer.children.forEach(value => {
                if (value.active && value.getComponent(Enemy).hp > 0 && this._screenRect.contains(value.position)){
                    let sub = value.position.sub(rolePos);
                    let mag = sub.mag();
                    if (mag < minDistance){
                        minSub = sub;
                        minDistance = mag;
                        enemyNode = value;
                    }
                }
            });
            if (enemyNode){
                /** 转向敌人 */
                this.turnTo(minSub);
                if (this._fireCD <= 0){
                    /** 根据攻击距离计算攻击夹角 */
                    let attackRadian = Math.atan(enemyNode.getComponent(Enemy).spaceCircleCollider.radius/minDistance);
                    if (minSub.angle(cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-this.role.node.rotation))) < attackRadian){
                        /** fire */
                        this._fireCD = this.bulletEmitterDelegate.interval;
                        let dir = enemyNode.position.sub(rolePos).normalize();
                        if (dir.x == 0 && dir.y == 0){
                            dir = cc.v2(0, 1).normalize().rotate(cc.misc.degreesToRadians(-this.role.node.rotation));
                        }
                        if (this._bulletEmitter == BulletEmitter.TYPES.JuJiQiang){
                            let bulletStrikePrefab = cc.loader.getRes("prefab/entities/bullet/fire7");
                            let bulletStrikeNode = cc.instantiate(bulletStrikePrefab);
                            this.bulletStrikeLayer.addChild(bulletStrikeNode);
                            bulletStrikeNode.position = this.role.node.position.add(dir.mul(this.role.gunTopNode.y));
                            bulletStrikeNode.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
                            bulletStrikeNode.getComponent(sp.Skeleton).setCompleteListener(()=>{
                                bulletStrikeNode.destroy();
                            });
                        } else if (this._bulletEmitter !== BulletEmitter.TYPES.JiGuang && this._bulletEmitter !== BulletEmitter.TYPES.PenZi){
                            this.role.fireSprite.node.scale = 1;
                            this.role.fireSprite.node.active = true;
                            this.role.fireSprite.node.runAction(cc.sequence(cc.scaleTo(0.05, 0.5), cc.callFunc(()=>{
                                this.role.fireSprite.node.active = false;
                            })));
                        }
                        this._bulletEmitterDelegate.fire(this.role.node.position.add(dir.mul(this.role.gunTopNode.y)), dir);
                        let str = 'sound/msc_g'+( "0000000000000000" + this._bulletEmitter ).substr( -3 );
                        Music.playSFX(str, EmitterSfxVolumes[this._bulletEmitter-1]);
                        if (this._bulletEmitterDelegate.isUseUp()){
                            this.bulletEmitter = BulletEmitter.TYPES.ShouQiang;
                        }
                    }
                }
            }

        }))
    }

    turnTo(dir:cc.Vec2){
        let degree = (90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x)))%360;
        // console.log("de===>", degree);
        // console.log("dir===>x="+dir.x+" y="+dir.y);
        if (degree < 0){
            degree += 360;
        }
        let enemyRotation = this.role.node.rotation%360;
        if (enemyRotation < 0){
            enemyRotation += 360;
        }
        let subDegree = Math.abs(degree - enemyRotation);
        // console.log("degree="+degree);
        // console.log("enemyRotation====>"+enemyRotation);
        if (subDegree > 0){
            let rotation = 0;
            if (subDegree > 180){
                rotation = Math.sign(enemyRotation - degree) * 10;
                if (Math.abs(rotation) > 360 - subDegree){
                    rotation = Math.sign(rotation)*(360-subDegree);
                }
            }else {
                rotation = Math.sign(degree - enemyRotation) * 10;
                if (Math.abs(rotation) > subDegree){
                    rotation = Math.sign(rotation) * subDegree;
                }
            }
            enemyRotation += rotation;
        }
        this.role.node.rotation = enemyRotation;
    }

    onDestroy(){
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event:cc.Event.EventTouch){
        // console.log("onTouchStart===>", this._touchId, GameProxy.pauseGame);
        if (this._touchId == null){
            this.touchId = event.getID();
            this._bMove = false;
            this.ring.opacity = RING_OPACITY;
            this.dot.opacity = RING_OPACITY;
            // 更改摇杆的位置
            this.ring.setPosition(event.getLocation().sub(cc.visibleRect.center));
            this.dot.setPosition(cc.v2(0, 0));
        }
    }

    onTouchMove(event:cc.Event.EventTouch){
        // console.log("onTouchMove===>", this._touchId, GameProxy.pauseGame);
        if (!GameProxy.pauseGame && event.getID() == this._touchId){
            this._bMove = true;
            if (this.guideNode.active && this.dot.position.mag() > 30){
                this.guideNode.active = false;
                World.My.newbies.finish("FirstEntryGame");
                this.getComponent(GameController).startGenerating();
            }

            let pos = this.dot.position.add(event.getDelta());
            this._dir = pos.normalize();
            if (pos.mag() >= this._radius){
                this.dot.position = this._dir.mul(this._radius);
                this.role.speedType = SpeedType.FAST;
                this.ring.position = event.getLocation().sub(cc.visibleRect.center).sub(this.dot.position);
            }else {
                this.dot.position = pos;
                this.role.speedType = SpeedType.NORMAL;
            }
        }
    }

    onTouchEnd(event:cc.Event.EventTouch){
        // console.log("onTouchEnd===>", this._touchId, GameProxy.pauseGame);
        if (!GameProxy.pauseGame && event.getID() == this._touchId){
            this.touchId = null;
            this._bMove = false;
            this.dot.setPosition(this.ring.getPosition());
            if (this.joystickType == JoystickType.FOLLOW) {
                this.ring.opacity = 0;
                this.dot.opacity = 0;
            }
            // this.role.speedType = SpeedType.STOP;
        }
    }

}
