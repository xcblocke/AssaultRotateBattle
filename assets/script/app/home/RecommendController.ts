// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletEmitterShouQiang from "../entities/bulletEmitter/BulletEmitterShouQiang";
import BulletEmitterJuJiQiang from "../entities/bulletEmitter/BulletEmitterJuJiQiang";
import BulletEmitterJiaTeLin from "../entities/bulletEmitter/BulletEmitterJiaTeLin";
import BulletEmitterJiGuang from "../entities/bulletEmitter/BulletEmitterJiGuang";
import BulletEmitterHuoYan from "../entities/bulletEmitter/BulletEmitterHuoYan";
import BulletEmitterHuoJianTong from "../entities/bulletEmitter/BulletEmitterHuoJianTong";
import BulletEmitterLiZiPao from "../entities/bulletEmitter/BulletEmitterLiZiPao";
import BulletEmitterPenZi from "../entities/bulletEmitter/BulletEmitterPenZi";
import BulletEmitterSanDanQiang from "../entities/bulletEmitter/BulletEmitterSanDanQiang";
import BulletEmitterShanDianQiu from "../entities/bulletEmitter/BulletEmitterShanDianQiu";
import BulletEmitter from "../entities/bulletEmitter/BulletEmitter";
import Role from "../entities/role/Role";
import Actions from "../../../framework/actions/Actions";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import {World} from "../info/World";
import Facade from "../../../framework/facade/Facade";
import HomeController from "./HomeController";
import {GameProxy} from "../game/GameProxy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RecommendController extends cc.Component {

    @property(Role)
    role:Role = null;

    @property(cc.Node)
    useNode:cc.Node = null;

    @property(cc.Node)
    noUseNode:cc.Node = null;

    private _fireCD = 0;

    private _gunId = 1;

    start () {
        this.noUseNode.on(cc.Node.EventType.POSITION_CHANGED, ()=>{
            this.useNode.position = this.noUseNode.position.add(cc.v2(0, 87));
        });
        let gameBulletsController = window['GameBulletsController'];
        gameBulletsController.bulletLayer.on(cc.Node.EventType.CHILD_ADDED, (bulletNode:cc.Node)=>{
            bulletNode.group = "ui";
        });
        let bulletEmitter:BulletEmitter = null;
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
        this._gunId = bulletEmitterType;
        let promises = [];
        promises.push(cc.loader.loadResAwait('prefab/entities/bullet/bullet'+bulletEmitterType));
        if (bulletEmitterType == BulletEmitter.TYPES.LiZiPao){
            promises.push(cc.loader.loadResAwait('prefab/entities/bullet/bullet108'));
        }else if (bulletEmitterType == BulletEmitter.TYPES.HuoJianTong){
            promises.push(cc.loader.loadResAwait('prefab/entities/explosive/explosive9'));
        }else if (bulletEmitterType == BulletEmitter.TYPES.JuJiQiang){
            promises.push(cc.loader.loadResAwait('prefab/entities/bullet/fire7'));
        }
        Promise.all(promises).then(()=>{
            switch (bulletEmitterType){
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
            bulletEmitter.init(bulletEmitterType);
            if (bulletEmitterType == BulletEmitter.TYPES.JiGuang){
                let bullet = bulletEmitter.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiGuang);
                bullet.collider.enabled = false;
                let ske = bullet.getComponent(sp.Skeleton);
                ske.setStartListener((trackEntry, loopCount)=>{
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    if(name === "jiguang"){
                        bullet.collider.enabled = true;
                    }
                });
                ske.setCompleteListener((trackEntry, loopCount) => {
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    if (name === "xuneng") {
                        ske.setAnimation(0, "jiguang", false);
                    }else if(name === "jiguang"){
                        bulletEmitter.bulletCount--;
                        bullet.collider.enabled = false;
                        bullet.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
                            if (!bullet.collider.enabled){
                                bullet.node.active = false;
                            }
                        })));
                    }
                });
                bulletEmitter._bulletJiGuangSke = ske;
                bulletEmitter._bulletJiGuang = bullet;
                bulletEmitter._bulletJiGuang.node.rotation = this.role.node.rotation;
                bulletEmitter._bulletJiGuang.node.position = this.role.node.position.add(cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-this.role.node.rotation)).normalize().mul(this.role.gunTopNode.y + 20));
            }

            let dir = cc.v2(0, 1000).sub(this.role.node.position).normalize();

            this.node.runAction(Actions.update(dt => {
                if (this._fireCD > 0) {
                    this._fireCD -= dt;
                }else {
                    this._fireCD = bulletEmitter.interval;
                    if (bulletEmitterType == BulletEmitter.TYPES.JuJiQiang){
                        let bulletStrikePrefab = cc.loader.getRes("prefab/entities/bullet/fire7");
                        let bulletStrikeNode = cc.instantiate(bulletStrikePrefab);
                        gameBulletsController.bulletLayer.addChild(bulletStrikeNode, 0);
                        bulletStrikeNode.position = this.role.node.position.add(dir.mul(this.role.gunTopNode.y));
                        bulletStrikeNode.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
                        bulletStrikeNode.getComponent(sp.Skeleton).setCompleteListener(()=>{
                            bulletStrikeNode.destroy();
                        });
                    } else if (bulletEmitterType !== BulletEmitter.TYPES.JiGuang && bulletEmitterType !== BulletEmitter.TYPES.PenZi){
                        this.role.fireSprite.node.scale = 1;
                        this.role.fireSprite.node.active = true;
                        this.role.fireSprite.node.runAction(cc.sequence(cc.scaleTo(0.05, 0.5), cc.callFunc(()=>{
                            this.role.fireSprite.node.active = false;
                        })));
                    }
                    bulletEmitter.fire(this.role.node.position.add(dir.mul(this.role.gunTopNode.y)), dir);
                }
            }));
        });
    }

    onClickUse(event, data){
        GameProxy.prepareGun = this._gunId;
        Facade.findComponent("HomeScene", HomeController).playExit();
        this.node.destroy();
    }

    onClickNoUse(event, data){
        Facade.findComponent("HomeScene", HomeController).playExit();
        this.node.destroy();
    }
}
