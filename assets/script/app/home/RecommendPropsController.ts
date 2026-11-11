// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Role from "../entities/role/Role";
import {World} from "../info/World";
import {ext} from "../../../framework/extend/Extend";
import BulletOfJianGuangSi from "../entities/bullet/BulletOfJianGuangSi";
const {ccclass, property} = cc._decorator;

/** 侯选列表 */
const candidateList = [3, 4, 5];

@ccclass
export default class RecommendPropsController extends cc.Component {

    @property(Role)
    role:Role = null;

    @property(sp.Skeleton)
    fangHuDunSke:sp.Skeleton = null;

    @property(cc.Node)
    useNode:cc.Node = null;

    @property(cc.Node)
    noUseNode:cc.Node = null;

    /**
     * 道具id
     * */
    private _propId = 0;

    onLoad () {
        this.fangHuDunSke.node.active = false;
        this.noUseNode.on(cc.Node.EventType.POSITION_CHANGED, ()=>{
            this.useNode.position = this.noUseNode.position.add(cc.v2(0, 87));
        });
        let gameBulletsController = window['GameBulletsController'];
        gameBulletsController.bulletLayer.on(cc.Node.EventType.CHILD_ADDED, (bulletNode:cc.Node)=>{
            bulletNode.group = "ui";
        });
        let list = candidateList.filter(value => !World.My.propInfo.beUsing(value));
        if (list.length == 0){
            list = candidateList;
        }
        this._propId = ext.randomElement(list);
        let prefabPath = 'prefab/entities/bullet/propBullet'+this._propId;

        cc.loader.loadRes(prefabPath, cc.Prefab, (error, resource) => {
            if (error == null){
                this.updateShown();
            }
        });
    }

    updateShown(){
        console.log("updateShown===>", this._propId);
        switch (this._propId){
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
                let startPos = cc.v2(this.role.node.x, this.role.node.y);
                for (let i=0; i<num; i++){
                    this.node.runAction(cc.sequence(cc.delayTime(i*onceTime), cc.callFunc(()=>{
                        let bullet = window['GameBulletsController'].getInactivePropBullet(3);
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
                        let bullet = window['GameBulletsController'].getInactivePropBullet(3);
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
                this.node.runAction(cc.sequence(cc.delayTime(time+1), cc.callFunc(()=>{
                    this.updateShown();
                })));
            }
                break;
            case 4:
            {
                /** 播放见光死的动画 */
                let bullet = <BulletOfJianGuangSi>window['GameBulletsController'].getInactivePropBullet(4);
                bullet.node.position = this.role.node.position;
                bullet.node.active = true;
                bullet.getComponent(sp.Skeleton).setAnimation(0, "614", true);
                bullet.getComponent(sp.Skeleton).setCompleteListener(()=>{});
                bullet.node.removeComponent(BulletOfJianGuangSi);
            }
                break;
            case 5:
                this.fangHuDunSke.node.active = true;
                this.fangHuDunSke.setAnimation(0, "start", false);
                this.fangHuDunSke.setCompleteListener((trackEntry, loopCount) => {
                    let name = trackEntry.animation ? trackEntry.animation.name : '';
                    // console.log("=============>completeLis..", name);
                    if (name == "start" || name == "transition"){
                        this.fangHuDunSke.setAnimation(0, "loops", false);
                        if (!this.node.getActionByTag(114)){
                            let speedAction = cc.speed(cc.repeatForever(cc.rotateBy(1.25, 720)), 0);
                            speedAction.setTag(114);
                            this.fangHuDunSke.node.runAction(speedAction);
                            cc.tween(speedAction)
                                .to(1, {_speed:1}, { easing: 'sineIn'})
                                .start();
                        }
                    }
                });
                break;
        }
    }

    onClickUse(event, data){
        World.My.propInfo.use(this._propId);
        this.node.destroy();
    }

    onClickNoUse(event, data){
        this.node.destroy();
    }
}
