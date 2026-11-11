// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ICommand} from "../../../framework/facade/ICommand";
import {ext} from "../../../framework/extend/Extend";
import View from "../../../framework/component/View";

const {ccclass, property} = cc._decorator;

@ccclass('ShowTipsCommand')
export default class ShowTipsCommand implements ICommand {

    async execute (...args):Promise{
        return new Promise((resolve, reject) => {
            cc.loader.loadRes('prefab/tips', cc.Prefab, (error, resource) => {
               if (error==null){
                    let node = cc.instantiate(resource);
                    let titleLabel = node.getChildByName('title').getComponent(cc.RichText);
                    let string = args[0] || "您忘记传参数喽";
                    titleLabel.string = `<b><outline color=#1e1e1e width=3>${string.replace(">", "》").replace("<", "《")}</outline></b>`;
                    if (cc.director.getScene()){
                        cc.director.getScene().addChild(node);
                        node.getComponent(cc.Layout).updateLayout();
                        node.position = cc.v2(cc.view.getVisibleSize().width/2, cc.view.getVisibleSize().height);
                        let duration = ext.isIphoneX?0.3:0.2;
                        let y = ext.isIphoneX?cc.view.getVisibleSize().height-node.height-View.IPHONEX_TOP_BLACK_HEIGHT:cc.view.getVisibleSize().height-node.height;
                        node.runAction(cc.sequence(
                            cc.moveTo(duration, cc.v2(cc.view.getVisibleSize().width/2, y)),
                            cc.delayTime(2),
                            cc.moveTo(duration, cc.v2(cc.view.getVisibleSize().width/2, cc.view.getVisibleSize().height)),
                            cc.callFunc(()=>{
                                node.destroy();
                                resolve();
                            })));
                    }
               } else {
                   console.error(error);
               }
            });
        });
    }
}
