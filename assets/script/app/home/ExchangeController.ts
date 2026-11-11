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
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ExchangeController extends cc.Component {

    @property(cc.Button)
    exchangeButton:cc.Button = null;

    @property(cc.Label)
    diamondLabel: cc.Label = null;

    @property(cc.Label)
    exchangeLabel: cc.Label = null;

    @property(cc.Sprite)
    exchangeSprite:cc.Sprite = null;

    @property(cc.SpriteFrame)
    exchangeSpriteFrames:[cc.SpriteFrame] = [];

    private _diamondCount = 0;


    get diamondCount(): number {
        return this._diamondCount;
    }

    set diamondCount(value: number) {
        this._diamondCount = value;
        if (this._type == 1){
            this.exchangeLabel.string = ext.shortFormat(this.getGoldCount());
        }else {
            this.exchangeLabel.string = `${this.getPowerCount()}`;
        }
        this.updateView();
    }

    private _type = 1;


    set type(value: number) {
        this._type = value;
        this.exchangeSprite.spriteFrame = this.exchangeSpriteFrames[this._type-1];
        this.diamondCount = World.Storage.diamondCount;
    }

    getGoldCount(){
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        return cfg[World.Storage.goldLv-1]['diamond_ex']*this._diamondCount;
    }

    getPowerCount(){
        return 5 * this._diamondCount;
    }

    updateView(){
        this.exchangeButton.interactable = this._diamondCount > 0;
        this.diamondLabel.string = `${this._diamondCount}`;
    }

    onDiamondPlus(){
        if (this._diamondCount < World.Storage.diamondCount){
            this.diamondCount++;
        }
    }

    onDiamondMinus(){
        if (this._diamondCount > 0){
            this.diamondCount--;
        }
    }

    onExchange(){
        if (this._type == 1){
            World.Storage.goldCount += this.getGoldCount();
        }else {
            World.Storage.power += this.getPowerCount();
        }
        this.node.destroy();
    }
}
