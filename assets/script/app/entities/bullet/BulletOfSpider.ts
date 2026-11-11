// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletOfEnemy from "./BulletOfEnemy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfSpider extends BulletOfEnemy {

    ske:sp.Skeleton = null;


    init(id: number): void {
        super.init(id);
        this.bThrought = true;
        this.ske = this.getComponent(sp.Skeleton);
        this.ske.setCompleteListener(()=>{
            this.node.active = false;
        })
    }

    boom(){
        this.ske.setAnimation(0, "slow", false);
    }
}
