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
export default class GameOverLucky extends cc.Component {

    @property(cc.Node)
    contentNode: cc.Node = null;

    @property(cc.Label)
    templateLabel: cc.Label = null;

    @property(cc.Mask)
    mask: cc.Mask = null;

    run(num: number, callback:()=>void) {
        let min = 3;
        let offsetY = 0;
        let height = this.mask.node.height/2 + this.templateLabel.node.height/2;
        // let height = this.mask.node.height;
        for (let i = 0; i < 1; i++) {
            for (let j = 10; j >= min; j--) {
                let node = cc.instantiate(this.templateLabel.node);
                node.getComponent(cc.Label).string = `x${j}`;
                node.x = 0;
                node.y = offsetY;
                offsetY += height;
                this.contentNode.addChild(node);
            }
        }
        for (let j = 10; j >= num; j--) {
            let node = cc.instantiate(this.templateLabel.node);
            node.getComponent(cc.Label).string = `x${j}`;
            node.x = 0;
            node.y = offsetY;
            offsetY += height;
            this.contentNode.addChild(node);
        }
        this.templateLabel.node.active = false;
        offsetY -= height;
        let duration = offsetY / 1250;
        console.log(duration, offsetY, this.mask.node.height);
        this.contentNode.runAction(cc.sequence(cc.moveTo(duration, cc.v2(0, -offsetY)).easing(cc.easeSineInOut()), cc.delayTime(1), cc.callFunc(()=>{
            console.log("finish.");
            callback();
        })));
    }
}
