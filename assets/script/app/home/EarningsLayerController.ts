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
import {NetworkConfig} from "../config/NetworkConfig";
import Network from "../network/Network";
import {ext} from "../../../framework/extend/Extend";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import Facade from "../../../framework/facade/Facade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EarningsLayerController extends cc.Component {

    @property(cc.RichText)
    goldLvLabel: cc.RichText = null;

    @property(cc.RichText)
    dayEarnLvLabel: cc.RichText = null;

    @property(cc.RichText)
    goldCostLabel: cc.RichText = null;

    @property(cc.RichText)
    dayEarnCostLabel: cc.RichText = null;

    @property(cc.RichText)
    goldWorthLabel:cc.RichText = null;

    @property(cc.RichText)
    dayEarnWorthLabel:cc.RichText = null;

    @property(cc.Button)
    goldLvButton:cc.Button = null;

    @property(cc.Button)
    dayEarnButton:cc.Button = null;

    onLoad () {
        this.updateGoldUp();
        this.updateDayEarnUp();
        cc.find('Canvas').on("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onDestroy(){
        cc.find('Canvas').off("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onUpdateStorageEvent(key:string){
        if (key == "goldCount"){
            let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
            if (World.Storage.goldLv < cfg.length){
                let needCost = cfg[World.Storage.goldLv-1]['gvalue_expend'];
                this.goldLvButton.interactable = World.Storage.goldCount >= needCost;
                this.goldCostLabel.node.color = this.goldLvButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
            if (World.Storage.dayEarnLv < cfg.length){
                let needCost = cfg[World.Storage.dayEarnLv-1]['on_hook_expend'];
                this.dayEarnButton.interactable = World.Storage.goldCount >= needCost;
                this.dayEarnCostLabel.node.color = this.dayEarnButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
        }
    }

    updateGoldUp(){
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        this.goldLvLabel.string = `<b><outline color=#1e1e1e width=4>金币价值Lv.${World.Storage.goldLv}</outline></b>`;
        if (World.Storage.goldLv >= cfg.length){
            this.goldCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.goldLvButton.interactable = false;
        }else {
            let needCost = cfg[World.Storage.goldLv-1]['gvalue_expend'];
            this.goldCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.goldLvButton.interactable = World.Storage.goldCount >= needCost;
        }
        this.goldCostLabel.node.color = this.goldLvButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        this.goldWorthLabel.string = `<b><outline color=#1e1e1e width=3>${Math.floor(cfg[World.Storage.goldLv-1]['gvalue']*100)}%</outline></b>`;
    }

    updateDayEarnUp(){
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        this.dayEarnLvLabel.string = `<b><outline color=#1e1e1e width=4>日常收益Lv.${World.Storage.dayEarnLv}</outline></b>`;
        if (World.Storage.dayEarnLv >= cfg.length){
            this.dayEarnCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.dayEarnButton.interactable = false;
        }else {
            let needCost = cfg[World.Storage.dayEarnLv-1]['on_hook_expend'];
            this.dayEarnCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.dayEarnButton.interactable = World.Storage.goldCount >= needCost;
        }

        this.dayEarnCostLabel.node.color = this.dayEarnButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        this.dayEarnWorthLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(cfg[World.Storage.dayEarnLv-1]['on_hook'])}</outline></b>`;
    }

    onClickUpGoldLv(event, data){
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        let needCost = cfg[World.Storage.goldLv-1]['gvalue_expend'];
        World.Storage.goldCount -= needCost;
        World.Storage.goldLv++;
        this.updateGoldUp();
        Facade.canvasNode.emit("GoldWorthUp");
    }

    onClickUpDayEarnLv(event, data){
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        let needCost = cfg[World.Storage.dayEarnLv-1]['on_hook_expend'];
        World.Storage.dayEarnLv++;
        World.Storage.goldCount -= needCost;
        this.updateDayEarnUp();
        Facade.canvasNode.emit("GoldDayEarnUp");
    }
}
