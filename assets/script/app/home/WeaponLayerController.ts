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
import {ext} from "../../../framework/extend/Extend";
import Toast from "../../../framework/extend/Toast";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";
import Facade from "../../../framework/facade/Facade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WeaponLayerController extends cc.Component {

    @property(cc.RichText)
    firePowerLvLabel: cc.RichText = null;

    @property(cc.RichText)
    powerLvLabel: cc.RichText = null;

    @property(cc.RichText)
    firePowerCostLabel: cc.RichText = null;

    @property(cc.RichText)
    powerCostLabel: cc.RichText = null;

    @property(cc.RichText)
    firePowerWorthLabel: cc.RichText = null;

    @property(cc.RichText)
    powerWorthLabel: cc.RichText = null;

    @property(cc.Button)
    firePowerButton:cc.Button = null;

    @property(cc.Button)
    powerButton:cc.Button = null;

    @property(cc.ScrollView)
    scrollView:cc.ScrollView = null;

    @property(cc.Node)
    upEffectNode:cc.Node = null;

    @property(cc.Node)
    trialNode:cc.Node = null;

    weaponButtons:[cc.Button] = [];

    private _weaponFocus = -1;

    focusGunID(){
        return this._orders[this._weaponFocus]['id'];
    }


    set weaponFocus(value: number) {
        if (this._weaponFocus != value){
            this.upEffectNode.removeFromParent(false);
            this.weaponButtons[value].node.addChild(this.upEffectNode);
            this._weaponFocus = value;
            this.weaponButtons.forEach((value, index) => value.target.getComponent(cc.Sprite).enabled = index == this._weaponFocus);
            this.updateWeaponAttr();
        }
    }

    updateWeaponAttr(){
        this.updateFirePower();
        this.updatePower();
    }

    private _orders = [];

    onLoad () {
        this.trialNode.active = false;
        this.weaponButtons = this.scrollView.content.children.map(value => value.getComponent(cc.Button));
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon);
        this._orders = config.filter(value => value['id'] != 1).sort(((a, b) => {
            return a['order'] - b['order'];
        }));
        this.weaponButtons.forEach(value => {
            let id = parseInt(value.node.name);
            let cfg = this._orders[id-2];
            value.node.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = cfg['gun_name'];
            // let weaponSke = value.node.getChildByName("Background").getChildByName("weapon").getComponent(sp.Skeleton);
            // weaponSke.setSkin(("000"+cfg['id']).substr(-3));
            // weaponSke.setAnimation(0, "gun", false);
            value.node.getChildByName("Background").getChildByName("weapon").active = false;
            let sprite = value.node.getChildByName("Background").getChildByName("weaponSprite").getComponent(cc.Sprite);
            let bLock = World.Storage.gameLevel < cfg['unlock'];
            sprite.setMaterial(0, cc.Material.getBuiltinMaterial(bLock?"2d-gray-sprite":"2d-sprite"));
            sprite.node.opacity = bLock?128:255;
        });
        cc.find('Canvas').on("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    start(){
        /** 选中最新解锁的武器 */
        let num = 0;
        for (let item of this._orders){
            if (World.Storage.gameLevel >= item['unlock']){
                num++;
            }else {
                break;
            }
        }

        if (num <= 3){
            this.scrollView.scrollToLeft();
        }else if (num >= this._orders.length - 1){
            this.scrollView.scrollToRight();
        } else {
            let x = (num-3) * this.weaponButtons[0].node.width;
            this.scrollView.scrollToOffset(cc.v2(x, this.scrollView.content.y));
        }
        this.weaponFocus = num-1;
        if (World.Storage.unlockGun > 0){
            let index = this._orders.findIndex(value => value['id'] == World.Storage.unlockGun);
            if (typeof index == "undefined"){
                console.error("not found gun for id===>", World.Storage.unlockGun);
            }else {
                this.trialNode.removeFromParent(false);
                this.trialNode.active = true;
                this.weaponButtons[index].node.addChild(this.trialNode);
            }
        }
    }

    onDestroy(){
        cc.find('Canvas').off("UpdateStorage", this.onUpdateStorageEvent, this);
    }

    onUpdateStorageEvent(key:string){
        if (key == "goldCount"){
            let cfg = this._orders[this._weaponFocus];
            let id = cfg['id'];
            let firePowerLv = World.My.armory.levelOfEmitterFirePower(id);
            if (firePowerLv < cfg['lv_limit']){
                let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[firePowerLv-1]['fire_expend'];
                this.firePowerButton.interactable = World.Storage.goldCount >= needCost;
                this.firePowerCostLabel.node.color = this.firePowerButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
            let powerLv = World.My.armory.levelOfEmitterPower(id);
            if (powerLv < cfg['lv_limit']){
                let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[powerLv-1]['power_expend'];
                this.powerButton.interactable = World.Storage.goldCount >= needCost;
                this.powerCostLabel.node.color = this.powerButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
            }
        }
    }

    updateFirePower(){
        let cfg = this._orders[this._weaponFocus];
        let id = cfg['id'];
        let firePowerLv = World.My.armory.levelOfEmitterFirePower(id);
        this.firePowerLvLabel.string = `<b><outline color=#1e1e1e width=4>弹量 [Lv.${firePowerLv}]</outline></b>`;
        if (firePowerLv >= cfg['lv_limit']){
            this.firePowerCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.firePowerButton.interactable = false;
        } else {
            let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[firePowerLv-1]['fire_expend'];
            this.firePowerCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.firePowerButton.interactable = World.Storage.goldCount >= needCost;
        }
        this.firePowerCostLabel.node.color = this.firePowerButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        this.firePowerWorthLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(World.My.armory.payloadAddOf(id))}</outline></b>`;
    }

    updatePower(){
        let cfg = this._orders[this._weaponFocus];
        let id = cfg['id'];
        let powerLv = World.My.armory.levelOfEmitterPower(id);
        this.powerLvLabel.string = `<b><outline color=#1e1e1e width=4>火力 [Lv.${powerLv}]</outline></b>`;
        if (powerLv >= cfg['lv_limit']){
            this.powerCostLabel.string = `<b><outline color=#1e1e1e width=3>满级</outline></b>`;
            this.powerButton.interactable = false;
        }else {
            let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[powerLv-1]['power_expend'];
            this.powerCostLabel.string = `<b><outline color=#1e1e1e width=3>${ext.shortFormat(needCost)}</outline></b>`;
            this.powerButton.interactable = World.Storage.goldCount >= needCost;
        }
        this.powerCostLabel.node.color = this.powerButton.interactable?cc.Color.WHITE:cc.Color.RED.fromHEX("#924338");
        let hurt_add = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[powerLv-1]['hurt_add'];
        this.powerWorthLabel.string = `<b><outline color=#1e1e1e width=3>${Math.floor(hurt_add*100)}%</outline></b>`;
    }

    onClickWeapon(event, data){
        data = parseInt(data);
        let cfg = this._orders[data-2];
        let bLock = World.Storage.gameLevel < cfg['unlock'];
        if (bLock){
            Toast.flutter({string:`<color=#faffff><b><outline color=#1e1e1e width=4>第${cfg['unlock']}关解锁该武器</outline></b></color>`, fontSize:30, y:cc.visibleRect.center.y});
        }else {
            this.weaponButtons[this._weaponFocus].node.getChildByName("Background").getChildByName("weaponSprite").active = true;
            this.weaponButtons[this._weaponFocus].node.getChildByName("Background").getChildByName("weapon").active = false;
            this.weaponFocus = data - 2;
        }
    }

    onClickUpWeaponFirePower(event, data){
        let cfg = this._orders[this._weaponFocus];
        let id = cfg['id'];
        let firePowerLv = World.My.armory.levelOfEmitterFirePower(id);
        if (firePowerLv >= World.Storage.ADLv){
            Toast.flutter({string:"<color=#faffff><b><outline color=#1e1e1e width=4>等级不得高于基础战斗力</outline></b></color>", fontSize:30, y:cc.visibleRect.center.y});
            return;
        }
        let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[firePowerLv-1]['fire_expend'];
        World.Storage.goldCount -= needCost;
        World.My.armory.addLevelOfEmitterFirePower(id, 1);
        this.updateFirePower();
        Facade.canvasNode.emit("WeaponUp");
    }

    onClickUpWeaponPower(event, data){
        let cfg = this._orders[this._weaponFocus];
        let id = cfg['id'];
        let powerLv = World.My.armory.levelOfEmitterPower(id);
        if (powerLv >= World.Storage.ADLv){
            Toast.flutter({string:"<color=#faffff><b><outline color=#1e1e1e width=4>等级不得高于基础战斗力</outline></b></color>", fontSize:30, y:cc.visibleRect.center.y});
            return;
        }
        let needCost = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp)[powerLv-1]['power_expend'];
        World.Storage.goldCount -= needCost;
        World.My.armory.addLevelOfEmitterPower(id, 1);
        this.updatePower();
        Facade.canvasNode.emit("WeaponUp");
    }

    onClickToggle(toggle, data){
        console.log("WeaponLayerController===>onClickToggle...");
        if (toggle.isChecked){
            if (World.Storage.unlockGun > 0){
                /** 切换focus */
                let index = this._orders.findIndex(value => value['id'] == World.Storage.unlockGun);
                console.log("index===>", index);
                if (typeof index == "undefined"){
                    console.error("not found gun for id===>", World.Storage.unlockGun);
                } else {
                    this.weaponFocus = index;
                    /** 播放流光动画 */
                    this.weaponButtons[index].node.getChildByName("Background").getChildByName("weaponSprite").active = false;
                    this.weaponButtons[index].node.getChildByName("Background").getChildByName("weapon").active = true;
                    this.weaponButtons[index].node.getChildByName("Background").getChildByName("weapon").getComponent(sp.Skeleton).setAnimation(0, "gun_002", true);
                }
            }
        }
    }
}
