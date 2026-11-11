// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Network from "../network/Network";
import Facade from "../../../framework/facade/Facade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Welcome extends cc.Component {

    @property(cc.Node)
    bgNode:cc.Node = null;

    onLoad () {
        cc.warn = ()=>{};
        let promises = [];
        promises.push(new Promise(resolve => {
            Network.login().then(res=>{
                Network.initData().then(()=>{
                    resolve();
                });
            });
        }));
        promises.push(Facade.executeCommand("LoadingCommand"));
        promises.push(new Promise(resolve => {
            this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(()=>resolve())));
        }));
        Promise.all(promises).then(()=>{
            cc.loader.loadRes("prefab/HomeScene", cc.Prefab, (error, resource) => {
                if (error == null){
                    let homeScene = cc.instantiate(resource);
                    Facade.canvasNode.addChild(homeScene);
                    this.bgNode.destroy();
                }else {
                    console.error(error);
                }
            });
        });
    }
}
