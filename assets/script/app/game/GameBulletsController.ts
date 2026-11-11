// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletStrike from "../entities/bulletStrike/BulletStrike";
import Bullet from "../entities/bullet/Bullet";
import {GameProxy} from "./GameProxy";
import PropBase from "../entities/prop/PropBase";
import BulletOfShouLei from "../entities/bullet/BulletOfShouLei";
import BulletOfJianGuangSi from "../entities/bullet/BulletOfJianGuangSi";
import BulletOfLighting from "../entities/bullet/BulletOfLighting";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameBulletsController extends cc.Component {

    @property(cc.Node)
    bulletLayer:cc.Node = null;

    @property(cc.Node)
    bulletStrikeLayer:cc.Node = null;

    @property(cc.Node)
    enemyBulletLayer:cc.Node = null;

    private _bulletMap = new Map<number, Array<Bullet>>();

    private _bulletStrikeMap = new Map<number, Array<BulletStrike>>();

    private _enemyBulletMap = new Map<number, Array<Bullet>>();
    private _propBulletMap = new Map<number, Array<Bullet>>();

    roleBullets:Array<Bullet> = [];
    enemyBullets:Array<Bullet> = [];


    private genBullet(id:number):Bullet{
        let prefabPath = 'prefab/entities/bullet/bullet'+id;
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        this.bulletLayer.addChild(node);
        let bullet = <Bullet>node.getComponent(Bullet);
        bullet.init(id);
        let arr = this._bulletMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._bulletMap.set(id, arr);
        }
        arr.push(bullet);
        node.active = false;
        return bullet;
    }

    getInactiveBullet(id:number):Bullet{
        let result:Bullet = undefined;
        let arr = this._bulletMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genBullet(id);
        }
        return result;
    }


    private genBulletStrike(id:number):BulletStrike{
        let prefabPath = 'prefab/entities/bullet/bullet'+id + "Strike";
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        this.bulletStrikeLayer.addChild(node);
        let bulletStrike = <BulletStrike>node.getComponent(BulletStrike);
        bulletStrike.init(id);
        let arr = this._bulletStrikeMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._bulletStrikeMap.set(id, arr);
        }
        arr.push(bulletStrike);
        node.active = false;
        return bulletStrike;
    }

    getInactiveBulletStrike(id:number):BulletStrike{
        let result:BulletStrike = undefined;
        let arr = this._bulletStrikeMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genBulletStrike(id);
        }
        return result;
    }


    private genEnemyBullet(id:number):Bullet{
        let prefabPath = 'prefab/entities/bullet/enemyBullet'+id;
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        this.enemyBulletLayer.addChild(node);
        let bullet = <Bullet>node.getComponent(Bullet);
        bullet.init(id);
        let arr = this._enemyBulletMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._enemyBulletMap.set(id, arr);
        }
        arr.push(bullet);
        node.active = false;
        return bullet;
    }

    getInactiveEnemyBullet(id:number):Bullet{
        let result:Bullet = undefined;
        let arr = this._enemyBulletMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genEnemyBullet(id);
        }
        return result;
    }


    private genPropBullet(id:number):Bullet{
        let prefabPath = 'prefab/entities/bullet/propBullet'+id;
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        this.bulletLayer.addChild(node);
        let bullet = <Bullet>node.getComponent(Bullet);
        bullet.init(id);
        let arr = this._propBulletMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._propBulletMap.set(id, arr);
        }
        arr.push(bullet);
        node.active = false;
        return bullet;
    }

    getInactivePropBullet(id:number):Bullet{
        let result:Bullet = undefined;
        let arr = this._propBulletMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genPropBullet(id);
        }
        return result;
    }

    onLoad(){
        this.node.on(GameProxy.Event.PropTrigger, this.onPropTrigger, this);
        window['GameBulletsController'] = this;
    }

    onDestroy(){
        this.node.off(GameProxy.Event.PropTrigger, this.onPropTrigger, this);
    }

    onPropTrigger(prop:PropBase){
        switch (prop.propID){
            case 1:
                {
                    /** 两个方向 360度 一遍转圈 一遍开炮 */
                    let firingRange = 500;
                    let speed = 1000;
                    let bulletDuration = firingRange/speed;
                    let duration = 2;
                    let num = 20;
                    let onceTime = duration/num;
                    let onceDegree = 360/num;
                    let startPos = cc.v2(prop.node.x, prop.node.y);
                    for (let i = 0; i<num; i++){
                        this.node.runAction(cc.sequence(cc.delayTime(i*onceTime), cc.callFunc(()=>{
                            /** 发射火炮 */
                            let bullet = this.getInactivePropBullet(1);
                            bullet.node.active = true;
                            bullet.node.rotation = i * onceDegree;
                            let dir = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-bullet.node.rotation)).normalizeSelf();
                            bullet.node.position = startPos.add(dir.mul(60));
                            bullet.node.runAction(cc.sequence(cc.moveBy(bulletDuration, dir.mul(firingRange)).easing(cc.easeSineOut()), cc.callFunc(()=>{
                                bullet.node.active = false;
                            })));

                            let bullet2 = this.getInactivePropBullet(1);
                            bullet2.node.active = true;
                            bullet2.node.rotation = i * onceDegree + 180;
                            let dir2 = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-bullet2.node.rotation)).normalizeSelf();
                            bullet2.node.position = startPos.add(dir2.mul(60));
                            bullet2.node.runAction(cc.sequence(cc.moveBy(bulletDuration, dir2.mul(firingRange)).easing(cc.easeSineOut()), cc.callFunc(()=>{
                                bullet2.node.active = false;
                            })));
                        })));
                    }
                }
                break;
            case 2:
                {
                    /** 全方位炸弹：依次弹出6颗手雷（顺时针） 炸弹各个方向滚动 撞到怪物后爆炸 */
                    let num = 6;
                    let onceDegree = 360/6;
                    let onceTime = 0.05;
                    let moveLen = 100;
                    let moveSpeed = 1000;
                    let moveDuration = moveLen/moveSpeed;
                    let startPos = cc.v2(prop.node.x, prop.node.y);
                    for (let i=0; i<num; i++){
                        this.node.runAction(cc.sequence(cc.delayTime(i*onceTime), cc.callFunc(()=>{
                            let bullet = this.getInactivePropBullet(2);
                            bullet.node.active = true;
                            let degree = 30+ i * onceDegree;
                            bullet.node.rotation = degree - 90;
                            let dir = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-degree)).normalizeSelf();
                            bullet.node.position = startPos;
                            bullet.node.scale = 0;
                            bullet.node.runAction(cc.scaleTo(moveDuration, 1));
                            bullet.node.runAction(cc.sequence(cc.moveBy(moveDuration, dir.mul(moveLen)), cc.delayTime((num-i-1)*onceTime), cc.callFunc(()=>{
                                (<BulletOfShouLei>bullet).move(dir);
                            })));
                        })));
                    }
                }
                break;
            case 3:
                {
                    /** 发出12个地雷 怪物踩到就会爆炸 地雷持续20S */
                    let num = 6;
                    let onceDegree = 360/6;
                    let onceTime = 0.05;
                    let moveLen = 80;
                    let moveSpeed = 1000;
                    let moveDuration = moveLen/moveSpeed;
                    let time = 20;
                    let startPos = cc.v2(prop.node.x, prop.node.y);
                    for (let i=0; i<num; i++){
                        this.node.runAction(cc.sequence(cc.delayTime(i*onceTime), cc.callFunc(()=>{
                            let bullet = this.getInactivePropBullet(3);
                            bullet.node.active = true;
                            let degree = 30+ i * onceDegree;
                            bullet.node.rotation = degree - 90;
                            let dir = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-degree)).normalizeSelf();
                            bullet.node.position = startPos;
                            bullet.node.scale = 0;
                            bullet.node.runAction(cc.scaleTo(moveDuration, 1));
                            bullet.collider.enabled = false;
                            bullet.node.runAction(cc.sequence(cc.moveBy(moveDuration, dir.mul(moveLen)), cc.callFunc(()=>{
                                bullet.collider.enabled = true;
                                bullet.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(()=>{
                                    bullet.node.active = false;
                                })));
                            })));
                        })));
                    }

                    for (let i=0; i<num; i++){
                        this.node.runAction(cc.sequence(cc.delayTime((i+num)*onceTime), cc.callFunc(()=>{
                            let bullet = this.getInactivePropBullet(3);
                            bullet.node.active = true;
                            let degree = 60 + i * onceDegree;
                            bullet.node.rotation = degree - 90;
                            let dir = cc.v2(0, 1).rotateSelf(cc.misc.degreesToRadians(-degree)).normalizeSelf();
                            bullet.node.position = startPos;
                            bullet.node.scale = 0;
                            bullet.node.runAction(cc.scaleTo(moveDuration, 1));
                            bullet.collider.enabled = false;
                            bullet.node.runAction(cc.sequence(cc.moveBy(moveDuration, dir.mul(moveLen+60)), cc.callFunc(()=>{
                                bullet.collider.enabled = true;
                                bullet.node.runAction(cc.sequence(cc.delayTime(time), cc.callFunc(()=>{
                                    bullet.node.active = false;
                                })));
                            })));
                        })));
                    }
                }
                break;
            case 4:
                {
                    /** 播放见光死的动画 */
                    let bullet = <BulletOfJianGuangSi>this.getInactivePropBullet(4);
                    bullet.node.position = prop.node.position;
                    bullet.node.active = true;
                    bullet.execute();
                }
                break;
            case 6:
                {
                    /** 找最近的怪生成闪电 */
                    let list = window['GameEnemysController'].allAliveAndInScreenEnemy();
                    // console.log("list===>", list);
                    if (list.length > 0){
                        let minDistance = -1;
                        let enemy = null;
                        list.forEach(value => {
                            let distance = prop.node.position.sub(value.node.position).mag();
                            if (minDistance < 0 || distance < minDistance){
                                minDistance = distance;
                                enemy = value;
                            }
                        });
                        /** 生成闪电 */
                        let bullet = <BulletOfLighting>this.getInactivePropBullet(6);
                        bullet.node.position = prop.node.position;
                        bullet.joint(enemy.node.position);
                    }
                }
                break;
        }
    }

}
