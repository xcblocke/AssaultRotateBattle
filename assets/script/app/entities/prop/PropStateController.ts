// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import CDTimer from "../../../../framework/component/CDTimer";
import {GameProxy} from "../../game/GameProxy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PropStateController extends cc.Component {

    @property(cc.SpriteFrame)
    spriteFrames: [cc.SpriteFrame] = [];

    @property(cc.Sprite)
    sprite:cc.Sprite = null;

    @property(cc.ProgressBar)
    prgressBar:cc.ProgressBar = null;

    @property(CDTimer)
    cdTimer:CDTimer = null;

    propID = 0;

    onEnable(){
        this.sprite.node.active = false;
        this.prgressBar.node.active = false;
    }

    onDisable(){
        this.node.stopAllActions();
    }

    init(id:number){
        this.propID = id;
        let spriteFrameIndex = 0;
        let cd = 0;
        switch (id){
            case 5:
                spriteFrameIndex = 0;
                cd = 15;
                break;
            case 9:
                spriteFrameIndex = 1;
                cd = 12;
                break;
            case 10:
                spriteFrameIndex = 2;
                cd = 12;
                break;
            case 12:
                spriteFrameIndex = 3;
                cd = 20;
                break;
            case 13:
                spriteFrameIndex = 4;
                cd = 10;
                break;
        }
        this.sprite.spriteFrame = this.spriteFrames[spriteFrameIndex];
        this.cdTimer.cd = cd;
        this.cdTimer.reset();
        this.prgressBar.progress = 1;
        this.cdTimer.pause = true;
        this.node.scale = 1;
        this.sprite.node.active = true;
        this.prgressBar.node.active = true;
    }

    onProgressEvent(progress:number){
        this.prgressBar.progress = 1 - progress;
    }

    onZeroEvent(){
        GameProxy.emit(GameProxy.Event.PropCDZero, this.propID);
        this.node.runAction(cc.sequence(cc.scaleTo(0.15, 0), cc.callFunc(()=>{
            this.node.active = false;
        })));
    }
}
