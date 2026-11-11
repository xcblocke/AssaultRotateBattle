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
export default class GameLabelsController extends cc.Component {

    @property(cc.Node)
    labelLayer:cc.Node = null;

    @property(cc.Label)
    templateLabel:cc.Label = null;

    onLoad(){
        window['GameLabelsController'] = this;
    }


    private genLabel():cc.Label{
        let labelNode = cc.instantiate(this.templateLabel.node);
        labelNode.active = false;
        this.labelLayer.addChild(labelNode);
        return labelNode.getComponent(cc.Label);
    }

    getInactiveLabel():cc.Label{
        let findNode = this.labelLayer.children.find(value => value.active == false && value.getComponent(cc.Label));
        if (findNode){
            return findNode.getComponent(cc.Label);
        }else {
            return this.genLabel();
        }
    }

    /** 飘字 */
    fly(str:string, pos:cc.Vec2){
        let label = this.getInactiveLabel();
        label.node.active = true;
        label.string = str;
        label.node.position = pos;
        label.node.color = cc.Color.RED;

        label.node.scale = 0;
        label.node.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.1, 1), cc.fadeTo(0.1, 255), cc.moveBy(0.1, cc.v2(0, 10))), cc.delayTime(0.1), cc.spawn(cc.moveBy(0.3, cc.v2(0, 30)), cc.fadeTo(0.3, 100)), cc.callFunc(()=>{
            label.node.active = false;
        })));
    }
}
