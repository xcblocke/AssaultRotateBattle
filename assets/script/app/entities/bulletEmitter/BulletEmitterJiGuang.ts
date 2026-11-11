// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import GameBulletsController from "../../game/GameBulletsController";
import BulletEmitter from "./BulletEmitter";
import Bullet from "../bullet/Bullet";
import Role from "../role/Role";


export default class BulletEmitterJiGuang extends BulletEmitter {

    constructor(gameBulletsController:GameBulletsController){
        super(gameBulletsController);
        this._firingRange = 800;
        this._interval = 0.05;
        this._speed = 1500;
    }

    private _bulletJiGuang:Bullet = null;
    private _bulletJiGuangSke:sp.Skeleton = null;

    private _role:Role = null;

    onEnter(){
        let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiGuang);
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
                this.bulletCount--;
                bullet.collider.enabled = false;
                bullet.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
                    if (!bullet.collider.enabled){
                        bullet.node.active = false;
                    }
                })));
            }
        });
        this._bulletJiGuangSke = ske;
        this._bulletJiGuang = bullet;

        this._role = window['GameRoleController'].role;
        this.changeBulletPosition();
        this._role.node.on(cc.Node.EventType.POSITION_CHANGED, this.changeBulletPosition, this);
        this._role.node.on(cc.Node.EventType.ROTATION_CHANGED, this.changeBulletPosition, this);
    }
    onExit(){
        this._bulletJiGuang.node.active = false;
        this._role.node.off(cc.Node.EventType.POSITION_CHANGED, this.changeBulletPosition, this);
        this._role.node.off(cc.Node.EventType.ROTATION_CHANGED, this.changeBulletPosition, this);
    }

    changeBulletPosition(){
        this._bulletJiGuang.node.rotation = this._role.node.rotation;
        this._bulletJiGuang.node.position = this._role.node.position.add(cc.v2(0, 1).rotate(cc.misc.degreesToRadians(-this._role.node.rotation)).normalize().mul(this._role.gunTopNode.y + 20));
    }

    fire(start: cc.Vec2, dir: cc.Vec2) {
        if (!this._bulletJiGuang.node.active){
            this._bulletJiGuang.node.active = true;
            this._bulletJiGuangSke.setAnimation(0, "xuneng", false);
        }else if (this._bulletJiGuangSke.animation === "jiguang" && !this._bulletJiGuang.collider.enabled){
            this._bulletJiGuangSke.setAnimation(0, "jiguang", false);
        }
    }
}
