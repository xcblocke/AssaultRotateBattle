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
import Network from "../network/Network";
import {NetworkConfig} from "../config/NetworkConfig";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import {ext} from "../../../framework/extend/Extend";
import Facade from "../../../framework/facade/Facade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RoleLayerController extends cc.Component {

    @property(cc.RichText)
    hpLvLabel: cc.RichText = null;

    @property(cc.RichText)
    adLvLabel: cc.RichText = null;

    @property(cc.RichText)
    hpCostLabel: cc.RichText = null;

    @property(cc.RichText)
    adCostLabel: cc.RichText = null;

    @property(cc.RichText)
    hpWorthLabel:cc.RichText = null;

    @property(cc.RichText)
    adWorthLabel:cc.RichText = null;

    @property(cc.Button)
    hpLvButton:cc.Button = null;

    @property(cc.Button)
    adButton:cc.Button = null;

    onLoad () {
        this.updateHpUp();
        this.updateAdUp();
        cc.find('Canvas').on("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onDestroy(){
        cc.find('Canvas').off("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onUpdateStorageEvent(key:string){
        if (key == "goldCount"){
            let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[0];
            if (World.Storage.HpLv < config['lv_limit']){
                let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.HpLv-1]['life_expend'];
                this.hpLvButton.interactable = World.Storage.goldCount >= needCost;
                this.hpCostLabel.node.color = this.hpLvButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
            if (World.Storage.ADLv < config['lv_limit']){
                let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.ADLv-1]['fight_expend'];
                this.adButton.interactable = World.Storage.goldCount >= needCost;
                this.adCostLabel.node.color = this.adButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
        }
    }

    updateHpUp(){
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[0];
        this.hpLvLabel.string = `<b><outline color=#1e1e1e width=4>生命力Lv.${World.Storage.HpLv}</outline></b>`;
        if (World.Storage.HpLv >= config['lv_limit']){
            this.hpCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.hpLvButton.interactable = false;
        }else {
            let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.HpLv-1]['life_expend'];
            this.hpCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.hpLvButton.interactable = World.Storage.goldCount >= needCost;
        }
        this.hpCostLabel.node.color = this.hpLvButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        let life = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.HpLv-1]['life'];
        this.hpWorthLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(life)}</outline></b>`;
    }

    updateAdUp(){
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[0];
        this.adLvLabel.string = `<b><outline color=#1e1e1e width=4>战力Lv.${World.Storage.ADLv}</outline></b>`;
        if (World.Storage.ADLv >= config['lv_limit']){
            this.adCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.adButton.interactable = false;
        } else {
            let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.ADLv-1]['fight_expend'];
            this.adCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.adButton.interactable = World.Storage.goldCount >= needCost;
        }
        this.adCostLabel.node.color = this.adButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        let fight = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.ADLv-1]['fight'];
        this.adWorthLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(fight)}</outline></b>`;
    }

    onClickUpHpLv(event, data){
        let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.HpLv-1]['life_expend'];
        World.Storage.goldCount -= needCost;
        World.Storage.HpLv++;
        this.updateHpUp();
        Facade.canvasNode.emit("RoleUp");
    }

    private _AdUpCount = 0;

    onClickUpADLv(event, data){
        let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[World.Storage.ADLv-1]['fight_expend'];
        World.Storage.goldCount -= needCost;
        World.Storage.ADLv++;
        this.updateAdUp();
        Facade.canvasNode.emit("RoleUp");
        this._AdUpCount++;
        let newbieNode = cc.director.getScene().getChildByName("newbieNode");
        if (newbieNode && (!this.adButton.interactable || this._AdUpCount > 2)){
            newbieNode.destroy();
            World.My.newbies.finish("FirstRoleUp");
        }
    }

}
