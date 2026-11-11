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
export default class RoleSupply extends cc.Component {

    @property(sp.Skeleton)
    ske:sp.Skeleton = null;

    roleNode:cc.Node = null;


    onLoad () {
        this.ske.setCompleteListener(()=>{
            this.node.destroy();
        });
    }

    setSupply(id:number,roleNode:cc.Node){
        this.roleNode = roleNode;
        this.roleNode.on(cc.Node.EventType.POSITION_CHANGED, this.onFollowRole, this);
        let skinName = "prop_"+("0000000000"+id).substr(-3);
        this.ske.setSkin(skinName);
        this.ske.setAnimation(0, "supplyLong", false);
    }

    onFollowRole(){
        this.node.position = this.roleNode.position;
    }

    onDestroy(){
        if (this.roleNode){
            this.roleNode.off(cc.Node.EventType.POSITION_CHANGED, this.onFollowRole, this);
        }
    }
}
