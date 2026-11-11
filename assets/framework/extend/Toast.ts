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

interface ToastConfig {
    x?:number;
    y?:number;
    fontSize?:number;
    string:string;
    group?:string;
}

@ccclass
export default class Toast {

    /** 飘动显示效果(适合显示label提示，类似toast) */
    private static flutterAction(): cc.FiniteTimeAction {
        let moveSeq = cc.sequence([
            cc.moveBy(0.6, cc.v2(0, 0)),
            cc.moveBy(1, cc.v2(0, 84))
        ]);

        let scaleSeq = cc.sequence([
            cc.scaleTo(0.1, 1.2),
            cc.scaleTo(0.1, 0.8),
            cc.scaleTo(0.1, 1),
        ]);

        let alphaSeq = cc.sequence([
            cc.fadeTo(0.8, 255),
            cc.fadeTo(0.8, 0),
        ]);

        let spawn = cc.spawn(moveSeq, alphaSeq);
        return spawn;
    }

    private static createRichText(config:ToastConfig){
        let name = "OnlyOneToastNode";
        let node = cc.director.getScene().getChildByName(name);
        if (!node){
            node = new cc.Node(name);
            cc.director.getScene().addChild(node, 100);
        }
        node.scale = 1;
        node.rotation = 0;
        node.opacity = 255;
        node.group = config.group || "ui";
        node.x  = config.x || cc.visibleRect.center.x;
        node.y = config.y || cc.visibleRect.center.y;
        let sprite = node.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = cc.loader.getRes("frame_fy005", cc.SpriteFrame);

        let richTextNode = node.getChildByName("RichTextNode");
        if (!richTextNode){
            richTextNode = new cc.Node("RichTextNode");
            node.addChild(richTextNode);
            richTextNode.addComponent(cc.RichText);
        }
        let richText = richTextNode.getComponent(cc.RichText);
        richText.fontSize = config.fontSize || 38;
        richText.string = config.string;
        richText.lineHeight = richText.fontSize + 10;
        node.setContentSize(richText.node.width + 30, richText.node.height + 20);
        return node;
    }


    public static flutter(config:ToastConfig){
        let node = this.createRichText(config);
        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(0.6), this.flutterAction(), cc.callFunc(()=>node.destroy())));
    }

    public static fadeOut(config:ToastConfig){
        let node = this.createRichText(config);
        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(0.8), cc.fadeTo(2, 80), cc.callFunc(()=>node.destroy())));
    }
}
