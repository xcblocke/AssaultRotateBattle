// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameProxy} from "./GameProxy";
import Enemy from "../entities/enemy/Enemy";
import {ext} from "../../../framework/extend/Extend";
import {World} from "../info/World";
import {Shake} from "../../../framework/extend/Shake";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import {Music} from "../../../framework/audio/Music";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property(cc.Animation)
    moreEnemyTipsAnimation:cc.Animation = null;

    @property(cc.Animation)
    bossTipsAnimation:cc.Animation = null;

    @property(cc.Node)
    supplyGuideNode:cc.Node = null;

    @property(cc.Node)
    shakeNode:cc.Node = null;

    @property(cc.Node)
    topNode:cc.Node = null;

    @property(cc.Node)
    leftNode:cc.Node = null;

    @property(cc.Node)
    rightNode:cc.Node = null;

    @property(cc.Node)
    supplyNode:cc.Node = null;

    @property(cc.Node)
    greyNode:cc.Node = null;

    @property(cc.Node)
    blockNode:cc.Node = null;

    @property(cc.Node)
    reliveNode:cc.Node = null;

    @property(cc.Node)
    gameOverNode:cc.Node = null;


    private _generating = false;

    private _shakeDuration = 0;

    onClickSupply(event,data){
        this.supplyNode.active = true;
        let newbieNode = cc.director.getScene().getChildByName("newbieNode");
        if (newbieNode){
            newbieNode.destroy();
            World.My.newbies.finish("KillFiveEnemy");
        }
    }

    playEntry(){
        let promises = [];
        this.topNode.active = true;
        this.topNode.y = cc.view.getVisibleSize().height/2 + 300;
        let speed = 700;
        let distance = this.topNode.y - cc.view.getVisibleSize().height/2;
        if (ext.isIphoneX){
            distance += 66;
        }
        promises.push(this.topNode.runActionAwait(cc.moveBy(distance/speed, cc.v2(0, -distance))));
        this.leftNode.active = true;
        this.leftNode.x = -cc.view.getVisibleSize().width/2-200;
        promises.push(this.leftNode.runActionAwait(cc.moveTo(Math.abs(-cc.view.getVisibleSize().width/2 - this.leftNode.x)/speed, cc.v2(-cc.view.getVisibleSize().width/2, this.leftNode.y))));
        this.rightNode.active = true;
        this.rightNode.x = cc.view.getVisibleSize().width/2+200;
        promises.push(this.rightNode.runActionAwait(cc.moveTo(Math.abs(cc.view.getVisibleSize().width/2 - this.rightNode.x)/speed, cc.v2(cc.view.getVisibleSize().width/2, this.rightNode.y))))
        Promise.all(promises).then(res=>{
            GameProxy.emit(GameProxy.Event.StartGame);
            this.blockNode.active = false;
        });
    }

    onLoad () {
        this.supplyNode.active = false;
        this.greyNode.active = true;
        this.greyNode.opacity = 0;
        this.reliveNode.active = false;
        this.gameOverNode.active = false;
        this.topNode.active = false;
        this.leftNode.active = false;
        this.rightNode.active = false;
        this.blockNode.active = true;
        this.node.on(GameProxy.Event.StartGenEnemy, this.startGenerating, this);
        this.node.on(GameProxy.Event.StopGenEnemy, this.stopGenerating, this);
        this.node.on(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
        this.node.on(GameProxy.Event.KillRole, this.onKillRole, this);
        this.node.on(GameProxy.Event.SlowGame, this.onSlowGame, this);
        this.node.on(GameProxy.Event.PauseGame, this.onPauseGame, this);
        this.node.on(GameProxy.Event.ShakeScreen, this.onShakeScreen, this);
        GameProxy.GameScene = this.node;
        this.playEntry();
    }

    start(){
        GameProxy.level = World.Storage.gameLevel;
        GameProxy.slowGame = false;
        GameProxy.pauseGame = false;
        this._preDisplayGun = Math.random() * 100 > 50;
        GameProxy.emit(GameProxy.Event.InitGame);
        this._propList = ExcelConfig.getExcelTable(ExcelTableNames.Prop).filter(value => value['id'] != 7 && value['id'] != 8 && value['id'] != 10 && (value['unlock'] == 0 || World.My.propInfo.beUsing(value['id']))).map(value => value['id']);
        this._gunsList = ExcelConfig.getExcelTable(ExcelTableNames.Weapon).filter(value => value['id'] != 1 && value['unlock'] <= World.Storage.gameLevel).map(value => value['id']);
    }

    onDestroy(){
        this.node.off(GameProxy.Event.StartGenEnemy, this.startGenerating, this);
        this.node.off(GameProxy.Event.StopGenEnemy, this.stopGenerating, this);
        this.node.off(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
        this.node.off(GameProxy.Event.KillRole, this.onKillRole, this);
        this.node.off(GameProxy.Event.SlowGame, this.onSlowGame, this);
        this.node.off(GameProxy.Event.PauseGame, this.onPauseGame, this);
        this.node.off(GameProxy.Event.ShakeScreen, this.onShakeScreen, this);
    }

    onShakeScreen(duration:number,strength_x:number,strength_y:number){
        if (this._shakeDuration <= duration){
            this._shakeDuration = duration;
            this.shakeNode.stopAllActions();
            this.shakeNode.position = cc.v2();
            this.shakeNode.runAction(Shake.create(duration, strength_x, strength_y));
        }
    }

    onSlowGame(slow:boolean){
        // this.updateGrey();
        window['GameEnemysController'].allActiveEnemy().forEach(value => value.gameSlow = slow);
    }

    onPauseGame(pause:boolean){
        this.updateGrey();
    }

    updateGrey(opacity:number = 190){
        console.log("updateGrey==>", GameProxy.pauseGame);
        this.greyNode.stopAllActions();
        if (GameProxy.pauseGame || GameProxy.slowGame){
            this.greyNode.runAction(cc.fadeTo(0.3, opacity));
            // cc.tween(this.greyNode)
            //     .to(0.3, { opacity: opacity })
            //     .start();
        }else {
            this.greyNode.opacity = 0;
        }
    }

    private _genEnemyCount = 0;

    /**
     * 启动怪物生成计划
     */
    startGenerating(){
        if (this._generating)return;
        this._generating = true;
        // console.log(GameProxy.enemyList, "enemyList");
        if (GameProxy.killCount < GameProxy.levelConfig.amount_p1){
            /** 第一阶段 0.5s出一个怪物 */
            /** 0.5s出一个怪物 */
            let action = cc.sequence(cc.repeat(cc.sequence(cc.callFunc(()=>this._genEnemyCount += 1), cc.delayTime(0.5)), GameProxy.levelConfig.delimit_p1), cc.callFunc(()=>{
                this._generating = false;
                this.startCDTask();
            }));
            action.setTag(1010);
            this.node.runAction(action);
        }else {
            /** 第二阶段 0.5s一次出3个 */
            /** 0.5s出一个怪物 */
            let action = cc.sequence(cc.repeat(cc.sequence(cc.callFunc(()=>this._genEnemyCount += 1), cc.delayTime(0.5)), Math.floor(GameProxy.levelConfig.delimit_p1)), cc.callFunc(()=>{
                this._generating = false;
                this.startCDTask();
            }));
            action.setTag(1010);
            this.node.runAction(action);
        }

    }

    /**
     * 停止怪物生成计划
     * */
    stopGenerating(){
        if (!this._generating)return;
        this.node.stopActionByTag(1010);
    }

    /** 计时任务 */
    startCDTask(){
        this.stopCDTask();
        let action = cc.sequence(cc.delayTime(10), cc.callFunc(()=>{
            /** 生成两只怪物 */
            this._genEnemyCount += 2;
            this.startCDTask();
        }));
        action.setTag(1041);
        this.node.runAction(action);
    }

    /** 停止计时任务 */
    stopCDTask(){
        this.node.stopActionByTag(1041);
    }

    onKillRole(){
        GameProxy.isOver = true;
        GameProxy.pauseGame = true;
        if (GameProxy.firstAidFlag){
            this.reliveNode.active = true;
        } else {
            this.reliveNode.active = true;
        }
        Music.playSFX("sound/msc_rol002");
        console.log("game over==>等待复活");
    }

    private _propList = [1, 2, 3, 4, 5, 6, 9, 11, 12, 13];
    private _gunsList = [];

    private _displayPropList = [];
    private _displayGusList = [];

    /** 掉枪 */
    private displayGun(position:cc.Vec2){
        let prop = window['GameEnemysController'].getInactiveGun();
        let testList = this._gunsList.filter(value => !this._displayGusList.includes(value));
        if (testList.length == 0){
            testList = this._gunsList;
            this._displayGusList = [];
        }
        let id = ext.randomElement(testList);
        this._displayGusList.push(id);
        prop.init(id + 100);
        prop.node.position = position;
        prop.display();
    }

    /** 掉道具 */
    private displayProp(position:cc.Vec2){
        let testList = this._propList.filter(value => !this._displayPropList.includes(value));
        if (testList.length == 0){
            testList = this._propList;
            this._displayPropList = [];
        }
        let id = ext.randomElement(testList);
        this._displayPropList.push(id);
        let prop = window['GameEnemysController'].getInactiveProp(id);
        prop.node.position = position;
        prop.display();
    }

    private _preDisplayGun = false;

    onKillEnemy(enemy:Enemy){
        if (GameProxy.killCount%10 == 0){
            let position = enemy.node.position;
            if (this._preDisplayGun){
                this.displayProp(position);
            }else {
                this.displayGun(position);
            }
            this._preDisplayGun = !this._preDisplayGun;
        }

        if (GameProxy.killCount == GameProxy.levelConfig.amount_p1 - 3){
            this.displayGun(enemy.node.position);
        }

        if (GameProxy.killCount + window['GameEnemysController'].allAliveEnemy().length < GameProxy.levelConfig.amount_p1){
            //第一阶段
            this._genEnemyCount += 2;
            this.startCDTask();
        }else if (GameProxy.enemyList.length > 0){
            //第二阶段
            this._genEnemyCount += 3;
            this.startCDTask();
        }else if (GameProxy.killCount >= GameProxy.maxEnemyNum) {
            GameProxy.isOver = true;
            GameProxy.pauseGame = true;
            console.log("game win.");
            this.blockNode.active = true;
        }
        if (GameProxy.killCount == 5){
            if (!World.My.newbies.state("KillFiveEnemy")){
                let newbieNode = new cc.Node();
                newbieNode.name = "newbieNode";
                newbieNode.position = this.supplyGuideNode.convertToWorldSpaceAR(cc.v2());
                cc.director.getScene().addChild(newbieNode);
                /** guideCircle */
                let guideCirclePrefab = cc.loader.getRes("prefab/guideCircle");
                let guideCircleNode = cc.instantiate(guideCirclePrefab);
                guideCircleNode.position = cc.v2();
                newbieNode.addChild(guideCircleNode);
                /** guideSke */
                let guideSkePrefab = cc.loader.getRes("prefab/guideSke");
                let guideSkeNode = cc.instantiate(guideSkePrefab);
                guideSkeNode.position = cc.v2();
                newbieNode.addChild(guideSkeNode);
                GameProxy.pauseGame = true;
                this.greyNode.stopAllActions();
                this.greyNode.opacity = 0;
            }
        }
    }


    genEnemy(){
        if (GameProxy.enemyList.length <= 0){
            return;
        }
        /** 判断上限 */
        /** 第一阶段 */
        let aliveCount = window['GameEnemysController'].allAliveEnemy().length;
        if (GameProxy.killCount + aliveCount <= GameProxy.levelConfig.amount_p1){
             if (aliveCount >= GameProxy.levelConfig.limit_p1){
                 return;
             }
        }else {
            if (aliveCount >= GameProxy.levelConfig.limit_p2){
                return;
            }
        }
        window['GameEnemysController'].createEnemy(GameProxy.enemyList.shift());
        this._genEnemyCount--;
        // window['GameEnemysController'].createEnemy(3);
        if (GameProxy.maxEnemyNum - GameProxy.enemyList.length  === GameProxy.levelConfig.amount_p1+1){
            this.moreEnemyTipsAnimation.node.opacity = 255;
            this.moreEnemyTipsAnimation.node.active = true;
            this.moreEnemyTipsAnimation.play();
        }

        if (GameProxy.enemyList.length == GameProxy.secondBossNum - 1){
            this.bossTipsAnimation.node.opacity = 255;
            this.bossTipsAnimation.node.active = true;
            this.bossTipsAnimation.play();
        }
    }

    update(dt:number){
        if (this._genEnemyCount > 0){
            this.genEnemy();
        }
    }
}
