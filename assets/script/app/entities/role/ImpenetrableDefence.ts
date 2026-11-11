// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameProxy} from "../../game/GameProxy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ImpenetrableDefence extends cc.Component {

    @property(sp.Skeleton)
    ske:sp.Skeleton = null;

    @property(cc.Node)
    followNode:cc.Node = null;

    private rotateAction = null;


    protected onLoad(): void {
        this.followNode.on(cc.Node.EventType.POSITION_CHANGED, ()=>{
            this.node.position = this.followNode.position;
        });
        this.ske.setCompleteListener((trackEntry, loop)=>{
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            if (name == "start"){
                this.ske.setAnimation(0, "loops", true);
                this.rotateAction = cc.speed(cc.repeatForever(cc.rotateBy(0.45, 360)), 0);
                this.rotateAction.setTag(140);
                this.node.runAction(this.rotateAction);
            }else if (name == "transition"){
                this.ske.setAnimation(0, "loops", true);
            }
        });
    }

    start(){
        this.node.position = this.followNode.position;
    }

//密不透风的防御(武术)
    private _impenetrableDefenceCD = 0;

    private _defenceCD = 0;


    set impenetrableDefenceCD(value: number) {
        this._impenetrableDefenceCD = value;
        if (!this.node.active){
            this.node.active = true;
            this.node.stopAllActions();
            this.ske.setAnimation(0, "start", false);
        }
    }

    defence(){
        if (this.ske.animation == "loops"){
            // this.rotateAction.setSpeed(0);
            this.ske.setAnimation(0, "transition", false);
            // this._defenceCD = 0.5;
        }
    }

    update(dt:number){
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
        if (this.ske.animation === "loops"){
            if (this._defenceCD > 0){
                this._defenceCD -= dt;
            }else if (this.rotateAction.getSpeed() < 1){
                let speed = this.rotateAction.getSpeed() + 0.01;
                if (speed > 1){
                    speed = 1;
                }
                this.rotateAction.setSpeed(speed);
            }
        }
        this._impenetrableDefenceCD -= dt;
        if (this._impenetrableDefenceCD <= 0){
            this.node.active = false;
        }
    }
}
