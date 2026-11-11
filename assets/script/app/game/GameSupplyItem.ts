// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import AbstractTableItem from "../../../framework/tableview/AbstractTableItem";
import GameSupply from "./GameSupply";
import {World} from "../info/World";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameSupplyItem extends AbstractTableItem {

    static gameSupply:GameSupply = null;

    @property(cc.Label)
    lockLabel:cc.Label = null;

    @property(cc.Sprite)
    bgSprite:cc.Sprite = null;

    @property(cc.Sprite)
    weaponSprite: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    bulletLabel:cc.Label = null;

    @property(cc.Label)
    numLabel:cc.Label = null;

    @property(cc.SpriteFrame)
    weaponSpriteFrames:[cc.SpriteFrame] = [];

    @property(cc.SpriteFrame)
    bgSpriteFrames:[cc.SpriteFrame] = [];

    private _index = 0;
    private _data = null;

    upadteItem(data: any, index: number) {
        this._data = data;
        this._index = index;
        this.bgSprite.spriteFrame = this.bgSpriteFrames[GameSupplyItem.gameSupply.focus == index?1:0];
        this.weaponSprite.spriteFrame = this.weaponSpriteFrames[data['id']-1];
        this.nameLabel.string = data['gun_name'];
        this.numLabel.string = `${World.My.armory.payloadAddOf(data['id'])}x3`;
        this.lockLabel.string = `${data['unlock']}关解锁`;
        let bLock = World.Storage.gameLevel < data['unlock'];
        this.lockLabel.node.active = bLock;
        this.nameLabel.node.active = !bLock;
        this.weaponSprite.setMaterial(0, cc.Material.getBuiltinMaterial(bLock?"2d-gray-sprite":"2d-sprite"));
        this.weaponSprite.node.opacity = bLock?128:255;
    }

    onClickButton(event, data){
        if (World.Storage.gameLevel < this._data['unlock']){
            return;
        }
        GameSupplyItem.gameSupply.focus = this._index;
    }
}
