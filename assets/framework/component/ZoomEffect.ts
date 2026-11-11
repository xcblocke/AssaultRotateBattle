// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Actions from "../actions/Actions";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ZoomEffect extends cc.Component {

    @property({displayName:"开始缩放值"})
    startValue = 1;

    @property({displayName:"结束缩放值"})
    endValue = 1;

    @property({displayName:"缩放差"})
    deltaValue = 0.1;

    @property({displayName:"速度"})
    speed = 1/0.8;

    @property({displayName:"缩放次数"})
    times = 0;

    @property({displayName:"衰减值"})
    damping = 0;

    @property({displayName:"周期性延时", textTips:"单摆到最高点时延时"})
    cycleDelay = 0;

    @property({displayName:"重复", textTips:"小于零表示repeatForever"})
    repeatNum = 0;

    @property({displayName:"重复延时", textTips:"重复次数不等于0时才有效"})
    repeatDelay = 0;

    onLoad () {
        let action = Actions.cycleAction(cc.scaleTo, this.startValue, this.endValue, this.deltaValue, this.speed, this.times, this.damping, this.cycleDelay);
        if (this.repeatNum > 0){
            action = cc.repeat(cc.sequence(action, cc.delayTime(this.repeatDelay)), this.repeatNum);
        } else if (this.repeatNum < 0){
            action = cc.repeatForever(cc.sequence(action, cc.delayTime(this.repeatDelay)));
        }
        this.node.runAction(action);
    }
}
