// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ext} from "../../../framework/extend/Extend";
import Facade from "../../../framework/facade/Facade";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import Enemy from "../entities/enemy/Enemy";
import {Music} from "../../../framework/audio/Music";
import {MusicPaths} from "../config/MusicPaths";
import {World} from "../info/World";
import Actions from "../../../framework/actions/Actions";
import {GameProxy} from "../game/GameProxy";
import WeaponLayerController from "./WeaponLayerController";
import BulletEmitter from "../entities/bulletEmitter/BulletEmitter";

const {ccclass, property} = cc._decorator;

let OnceFlag = false;
let ShowCount = 0;

@ccclass
export default class HomeController extends cc.Component {
    @property(cc.Node)
    startGameNode:cc.Node = null;

    @property(cc.Node)
    weaponStartNode:cc.Node = null;

    @property(cc.Node)
    roleHeadNode:cc.Node = null;

    @property(cc.Node)
    enemyLayer:cc.Node = null;

    @property(sp.Skeleton)
    doorSke:sp.Skeleton = null;

    @property(cc.Node)
    bottomNode:cc.Node = null;

    @property(cc.Node)
    centerNode:cc.Node = null;

    @property(cc.Node)
    blockNode:cc.Node = null;

    @property(cc.Node)
    bottomLayers:[cc.Node] = [];

    @property(cc.Node)
    upIconNodes:[cc.Node] = [];

    @property(WeaponLayerController)
    weaponLayerController:WeaponLayerController = null;

    @property(cc.Node)
    propButtonNode:cc.Node = null;

    @property(cc.Node)
    fightButtonNode:cc.Node = null;

    @property(cc.Node)
    topNode:cc.Node = null;

    @property(cc.Node)
    rightNode:cc.Node = null;


    onDestroy(){
        OnceFlag = true;
    }

// LIFE-CYCLE CALLBACKS:


    onLoad () {
        GameProxy.firstAidFlag = true;
        this.weaponStartNode.active = true;
        this.weaponStartNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.35, 0.91), cc.scaleTo(0.35, 1))));
        this.weaponStartNode.active = false;
        this.topNode.y = cc.view.getVisibleSize().height/2 + 250;
        this.rightNode.x = 289 + 200;
        this.bottomNode.y = -this.bottomNode.height/2 - cc.view.getVisibleSize().height/2;
        this.centerNode.x  = -cc.view.getVisibleSize().width;
        this.blockNode.active = true;
        this.upIconNodes.forEach(value => {
            value.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5, cc.v2(0, 15)), cc.moveBy(0.5, cc.v2(0,-15)))));
            value.active = false;
        });

        /** 生成敌人 */
        let arr = ExcelConfig.getExcelTable(ExcelTableNames.StartEnemy).slice(0);
        let action = cc.repeatForever(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
            if (arr.length > 0){
                let item = arr.shift();
                let id = item['id'];
                let prefabPath = 'prefab/entities/enemy/enemy'+id;
                cc.loader.loadRes(prefabPath, cc.Prefab, (error, resource) => {
                    if (error == null){
                        // console.log("id===>"+id);
                        let node = cc.instantiate(resource);
                        let enemy = <Enemy>node.getComponent(Enemy);
                        enemy.onLoad = ()=>{};
                        enemy.start = ()=>{};
                        enemy.onEnable = ()=>{};
                        enemy.update = ()=>{};
                        this.enemyLayer.addChild(node);
                        enemy.init(id);
                        enemy.stiff = true;
                        enemy.playWalk();
                        let startPos = cc.v2(item['cd_sx'], item['cd_sy']);
                        let endPos = cc.v2(item['cd_ex'], item['cd_ey']);
                        let sub = endPos.sub(startPos);
                        let rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(sub.y, sub.x));
                        let distance = sub.mag();
                        let speed = enemy.moveSpeed*15;
                        let duration = distance/speed;
                        node.position = startPos;
                        node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(()=>{
                            enemy.node.rotation = rotation;
                        }),cc.moveTo(duration, endPos), cc.callFunc(()=>{
                            enemy.node.rotation = rotation+180;
                        }), cc.moveTo(duration, startPos))));
                    }
                });
            }else {
                this.node.stopActionByTag(2583);
            }
        })));
        action.setTag(2583);
        this.node.runAction(action);
        this.showUpIcon();
        let bulletEmitterType = 2;
        let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon).filter(value => value['id'] != 1).sort(((a, b) => b['unlock'] - a['unlock']));
        for (let item of weaponConfig){
            if (World.Storage.gameLevel >= item['unlock']){
                bulletEmitterType = item['id'];
                break;
            }
        }
        if (bulletEmitterType > 7){
            bulletEmitterType = 7;
        }
        cc.loader.loadRes('prefab/entities/bullet/bullet'+bulletEmitterType)
        if (bulletEmitterType == BulletEmitter.TYPES.LiZiPao){
            cc.loader.loadRes('prefab/entities/bullet/bullet108')
        }else if (bulletEmitterType == BulletEmitter.TYPES.HuoJianTong){
            cc.loader.loadRes('prefab/entities/explosive/explosive9')
        }else if (bulletEmitterType == BulletEmitter.TYPES.JuJiQiang){
            cc.loader.loadRes('prefab/entities/bullet/fire7')
        }
    }

    start(){
        this.openDoor();
    }

    openDoor(){
        console.log("openDoor..");
        Music.setBgm(MusicPaths.HomeBg);
        let skeName = "animation";
        if (OnceFlag){
            skeName = "opened";
        }else {
            Music.playSFX("sound/msc_openDoor", 2);
        }
        this.doorSke.node.active = true;
        this.doorSke.setCompleteListener((trackEntry, loop)=>{
            this.playEntry();
        });
        this.doorSke.setAnimation(0, skeName, false);
    }

    private playNodeAction(node:cc.Node){
        node.stopAllActions();
        let cycleRotation = Actions.cycleAction(cc.rotateTo, 0, 0, 8, 360/2, 8, 0);
        let cycleScale = Actions.cycleAction(cc.scaleTo, 1, 1, 0.1, 1/0.8, 0, 0, 0.5);
        node.runAction(cycleRotation);
        node.runAction(cycleScale);
    }

    private playNodeActionStart(){
        this.startGameNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.35, 0.91), cc.scaleTo(0.35, 1))));
        this.schedule(()=>{
            this.playNodeAction(this.propButtonNode);
        }, 3);
    }

    playEntry(){
        console.log("playEntry...");
        let speed = 700;
        let promises = [];
        let distance = 250 + this.topNode.height/2;
        if(ext.isIphoneX){
            distance += 66;
        }
        promises.push(this.topNode.runActionAwait(cc.moveBy(distance/speed, cc.v2(0, -distance))));

        promises.push(this.rightNode.runActionAwait(cc.moveBy(200/speed, cc.v2(-200, 0))));

        promises.push(this.bottomNode.runActionAwait(cc.moveBy(this.bottomNode.height/speed, cc.v2(0, this.bottomNode.height))));

        promises.push(this.centerNode.runActionAwait(cc.moveTo(cc.view.getVisibleSize().width/speed, cc.v2(0, 0))));


        Promise.all(promises).then(async res=>{
            this.playNodeActionStart();
            if (!World.My.newbies.state("FirstEntryHome")){
                let newbieNode = new cc.Node();
                newbieNode.name = "newbieNode";
                newbieNode.position = this.startGameNode.convertToWorldSpaceAR(cc.v2());
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
            }
            /*if (OnceFlag){
                if (!World.My.newbies.state("FirstRoleUp")){
                    let newbieNode = new cc.Node();
                    newbieNode.name = "newbieNode";
                    newbieNode.position = this.roleHeadNode.convertToWorldSpaceAR(cc.v2());
                    cc.director.getScene().addChild(newbieNode);
                    /!** guideCircle *!/
                    let guideCirclePrefab = cc.loader.getRes("prefab/guideCircle");
                    let guideCircleNode = cc.instantiate(guideCirclePrefab);
                    guideCircleNode.position = cc.v2();
                    newbieNode.addChild(guideCircleNode);
                    /!** guideSke *!/
                    let guideSkePrefab = cc.loader.getRes("prefab/guideSke");
                    let guideSkeNode = cc.instantiate(guideSkePrefab);
                    guideSkeNode.position = cc.v2();
                    newbieNode.addChild(guideSkeNode);
                }
            }*/
            this.blockNode.active = false;

            if (!cc.director.getScene().getChildByName("newbieNode")){
                if (!OnceFlag || ShowCount%3 === 2){
                    ShowCount = 0;
                    let show = true;
                    let unlocks = ExcelConfig.getExcelTable(ExcelTableNames.Prop).filter(value => value['id'] != 7 && value['id'] != 8 && value['id'] != 10 && value['unlock'] != 0)
                    for (let item of unlocks){
                        if(World.My.propInfo.beUsing(item['id'])){
                            show = false;
                            break;
                        }
                    }
                    if (show){
                        this.blockNode.active = true;
                        this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(()=>{
                            Facade.executeCommand("OpenViewCommand", "prefab/recommendProps");
                            this.blockNode.active = false;
                        })));
                    }
                }else {
                    ShowCount++;
                }
            }
        });
    }

    playExit(){
        this.blockNode.active = true;
        let newbieNode = cc.director.getScene().getChildByName("newbieNode");
        if (newbieNode){
            newbieNode.destroy();
            World.My.newbies.finish("FirstEntryHome");
        }
        Facade.executeCommand("LoadSceneCommand", "GameScene");
        /*let whiteNode = this.whiteNode;
        whiteNode.active = true;
        whiteNode.removeFromParent(false);
        cc.director.getScene().addChild(whiteNode);
        whiteNode.position = cc.visibleRect.center;
        whiteNode.opacity = 0;
        whiteNode.runAction(cc.sequence(cc.fadeTo(0.5, 255), cc.callFunc(()=>{
            Facade.executeCommand("LoadSceneCommand", "GameScene");
        }), cc.delayTime(0.2), cc.fadeTo(0.5, 0), cc.callFunc(()=>{
            whiteNode.destroy();
        })));*/
        /*let promises = [];
        let speed = 700;
        let distance = 250 + this.topNode.height/2;
        if(ext.isIphoneX){
            distance += 66;
        }
        let moveSpeed = 1200;
        for (let i=0; i<this.bottomLayers.length; i++){
            let node = this.bottomLayers[i];
            node.stopAllActions();
            promises.push(node.runActionAwait(cc.moveTo(Math.abs(node.y - node.height/2+ this.bottomNode.height/2)/moveSpeed, cc.v2(0, -node.height/2 + this.bottomNode.height/2))))
        }
        promises.push(this.topNode.runActionAwait(cc.moveBy(distance/speed, cc.v2(0, distance))));
        promises.push(this.bottomNode.runActionAwait(cc.moveBy(this.bottomNode.height/speed, cc.v2(0, -this.bottomNode.height))));
        promises.push(this.rightNode.runActionAwait(cc.moveBy(200/speed, cc.v2(200, 0))));
        promises.push(this.centerNode.runActionAwait(cc.moveTo(cc.view.getVisibleSize().width/speed, cc.v2(-cc.view.getVisibleSize().width, 0))));
        Promise.all(promises).then(res=>{
            this.node.runAction(cc.sequence(cc.scaleTo(1, 1/0.4), cc.callFunc(()=>{
                //切换场景
                Facade.executeCommand("LoadSceneCommand", "GameScene");
            })));
        });*/
    }

    onToggleEvent(toggle, data){
        data = parseInt(data);
        // console.log(toggle.node.name, toggle.isChecked);
        /** 其他对象关闭，然后再处理自己 */
        let moveSpeed = 1200;
        let promises = [];
        for (let i=0; i<this.bottomLayers.length; i++){
            let node = this.bottomLayers[i];
            node.stopAllActions();
            if (i != data - 1){
                promises.push(node.runActionAwait(cc.moveTo(Math.abs(node.y - node.height/2+ this.bottomNode.height/2)/moveSpeed, cc.v2(0, -node.height/2 + this.bottomNode.height/2))))
            }
        }
        let node = this.bottomLayers[data-1];
        let destPos = cc.v2(0, - node.height/2+ this.bottomNode.height/2);
        if (toggle.isChecked){
            destPos.y = node.height/2 + this.bottomNode.height/2;
            this.upIconNodes.forEach(value => value.active = false);
        }
        if ((data == 2 && !toggle.isChecked) || data != 2){
            this.startGameNode.active = true;
            this.weaponStartNode.active = false;
        }
        promises.push(node.runActionAwait(cc.moveTo(Math.abs(destPos.y - node.y)/moveSpeed, destPos)));
        Promise.all(promises).then(res=>{
            console.log("finish.");
            if (!toggle.isChecked){
                this.showUpIcon();
            }else {
                if (data == 2){
                    this.startGameNode.active = false;
                    this.weaponStartNode.active = true;
                }
            }

            if (data == 1){
                let newbieNode = cc.director.getScene().getChildByName("newbieNode");
                if (newbieNode){
                    this.blockNode.active = true;
                    newbieNode.getChildByName("guideSke").active = false;
                    newbieNode.runAction(cc.sequence(cc.moveTo(0.5, this.fightButtonNode.convertToWorldSpaceAR(cc.v2())), cc.callFunc(()=>{
                        this.blockNode.active = false;
                        newbieNode.getChildByName("guideSke").active = true;
                    })))
                }
            }
        });
    }

    private showUpIcon(){
        this.upIconNodes.forEach(value => value.active = true);
        let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon);
        let config = weaponConfig[0];
        let weaponUpConfig = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp);
        let hpCanUp = World.Storage.HpLv < config['lv_limit'] && World.Storage.goldCount >= weaponUpConfig[World.Storage.HpLv-1]['life_expend'];
        let adCanUp = World.Storage.ADLv < config['lv_limit'] && World.Storage.goldCount >= weaponUpConfig[World.Storage.ADLv-1]['life_expend'];
        this.upIconNodes[0].active = hpCanUp || adCanUp;

        this.upIconNodes[1].active = false;
        for (let i=1; i<weaponConfig.length; i++){
            let cfg = weaponConfig[i];
            let bLock = World.Storage.gameLevel < cfg['unlock'];
            let firePowerLv = World.My.armory.levelOfEmitterFirePower(cfg['id']);
            let fireCanUp = firePowerLv < cfg['lv_limit'] && World.Storage.goldCount >= weaponUpConfig[firePowerLv-1]['fire_expend'];
            let powerLv = World.My.armory.levelOfEmitterPower(cfg['id']);
            let powerCanUp = powerLv < cfg['lv_limit'] && World.Storage.goldCount >= weaponUpConfig[powerLv-1]['power_expend'];
            if (!bLock && (fireCanUp || powerCanUp)){
                this.upIconNodes[1].active = true;
                break;
            }
        }

        let goldUpConfig = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        let goldCanUp = World.Storage.goldLv < goldUpConfig.length && World.Storage.goldCount >= goldUpConfig[World.Storage.goldLv-1]['gvalue_expend'];
        let earnCanUp = World.Storage.dayEarnLv < goldUpConfig.length && World.Storage.goldCount >= goldUpConfig[World.Storage.dayEarnLv-1]['on_hook_expend'];
        this.upIconNodes[2].active = goldCanUp || earnCanUp;
    }

    onTouchBG(event, data){
        if (!this.weaponStartNode.active){
            let newbieNode = cc.director.getScene().getChildByName("newbieNode");
            if (newbieNode){
                this.playExit();
            }else {
                Facade.executeCommand("OpenViewCommand", "prefab/recommend");
            }
        }
    }

    onClickWeaponStart(event, data){
        GameProxy.prepareGun = this.weaponLayerController.focusGunID();
        this.playExit();
    }

}
