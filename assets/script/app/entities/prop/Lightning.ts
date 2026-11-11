// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import Enemy from "../enemy/Enemy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Lightning extends cc.Component {

    /** 默认高度375 */
    @property(sp.Skeleton)
    ske:sp.Skeleton = null;

    private lightEnemys:Array<Enemy> = [];

    protected onLoad(): void {
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            let name = trackEntry.animation ? trackEntry.animation.name : '';
            this.node.active = false;
            /** 生成一个新的 */
            if (this.lightEnemys.length < 6){

            }
        });
    }

    joint(enemy:Enemy){
        this.lightEnemys.push(enemy);
        let sub = enemy.node.position.sub(this.node.position);
        let distance = sub.mag();
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(sub.y, sub.x));
        this.node.scaleY = distance/375;
        this.node.active = true;
        this.ske.setAnimation(0, "animation", false);
    }
}
