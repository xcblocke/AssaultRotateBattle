// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ICommand} from "./ICommand";
import LifeCycle from "../component/LifeCycle";
import Facade from "./Facade";

const {ccclass, property} = cc._decorator;

@ccclass("OpenViewCommand")
export default class OpenViewCommand implements ICommand {

    async execute(...args):Promise{
        return new Promise(async(resolve, reject) => {
            let prefabName:string = args[0];
            if(Facade.canvasNode.getChildByName(prefabName.substring(prefabName.lastIndexOf("/")+1))){
                console.error(`此窗口已打开===>${prefabName}`, "或者是prefab根节点名称与其他prefab根节点名称冲突...规则：prefab名称要与该prefab根节点名称一致。");
                reject();
            }else {
                let prefab = await cc.loader.loadResAwait(prefabName, cc.Prefab);
                let node:cc.Node = cc.instantiate(prefab);
                node.setParent(Facade.canvasNode);
                resolve(node);
            }
        });
    }
}
