// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../../framework/facade/Facade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UpEffectController extends cc.Component {

    @property
    eventName = "";

    @property(sp.Skeleton)
    ske:sp.Skeleton = null;


    onShowEffect(){
        this.ske.node.active = true;
        this.ske.setAnimation(0, "vfxAll", false);
    }

    onLoad () {
        if (this.eventName !== ""){
            Facade.canvasNode.on(this.eventName, this.onShowEffect, this);
        }
        this.ske.setCompleteListener(()=>{
            if (cc.isValid(this) && cc.isValid(this.ske)){
                this.ske.node.active = false;
            }
        });
        this.ske.node.active = false;
    }

    onDestroy(){
        Facade.canvasNode.off(this.eventName, this.onShowEffect, this);
    }
}
