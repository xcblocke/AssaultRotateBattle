// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestAngle extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.node.on(cc.Node.EventType.ROTATION_CHANGED, ()=>{
            let radians = cc.misc.degreesToRadians(-this.node.rotation);
            let dir = cc.v2(0, 1).rotate(radians);
            let angle = cc.v2(0, 1).angle(dir);
            console.log(`angle=${angle} rotation=${this.node.rotation} radians=${radians} dir.x=${dir.x} dir.y=${dir.y}`);
        });
        this.node.runAction(cc.rotateBy(3, 360));
    }

    // update (dt) {}
}
