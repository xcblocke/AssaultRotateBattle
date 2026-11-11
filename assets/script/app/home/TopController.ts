// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {World} from "../info/World";
import {ext} from "../../../framework/extend/Extend";
import Facade from "../../../framework/facade/Facade";
import ExchangeController from "./ExchangeController";
import LoadingCommand from "./LoadingCommand";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TopController extends cc.Component {

    @property(cc.RichText)
    goldLabel:cc.RichText = null;

    @property(cc.RichText)
    lvLabels: [cc.RichText] = [];

    init(){
        this.lvLabels.forEach((value, index) => value.string = `<b><outline color=#1e1e1e width=3>${World.Storage.gameLevel-1+index}</outline></b>`);
        if (World.Storage.gameLevel < 2){
            this.lvLabels[0].node.getParent().active = false;
        }
        this.updateView();
    }

    onLoad () {
        Facade.canvasNode.on("UpdateStorage", this.onUpdateStorageEvent, this);
        this.init();
    }

    onDestroy(){
        Facade.canvasNode.off("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onUpdateStorageEvent(key:string){
        if (key == "power"){
        } else if (key == "goldCount"){
            this.goldLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(World.Storage.goldCount)}</outline></b>`;
        } else if (key == "diamondCount"){
        }
    }

    updateView() {
        this.goldLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(World.Storage.goldCount)}</outline></b>`;
    }

    async onClickPlus(vent, data){
        data = parseInt(data);
        let [node] = await Facade.executeCommand("OpenViewCommand", "prefab/exchange");
        let exchangeController = node.getComponent("ExchangeController");
        exchangeController.type = data;
    }
}
