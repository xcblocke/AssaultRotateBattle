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
import PropsController from "./PropsController";
import {World} from "../info/World";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PropsItemController extends AbstractTableItem {

    @property(PropsController)
    propsController:PropsController = null;

    @property(cc.Sprite)
    bgFrameSprite:cc.Sprite = null;

    @property(cc.Sprite)
    iconSprite:cc.Sprite = null;

    @property(cc.Label)
    nameLabel:cc.Label = null;

    @property(cc.Node)
    useNode:cc.Node = null;

    @property(cc.Node)
    usingNode:cc.Node = null;

    @property(cc.Node)
    foreverNode:cc.Node = null;

    @property(cc.Label)
    cdLabel:cc.Label = null;

    @property(cc.SpriteFrame)
    iconSpriteFrames:[cc.SpriteFrame] = [];

    private _data = null;
    private _index = null;

    onLoad(){
        this.schedule(()=>{
            if (this.node.active && this.usingNode.active && this._data){
                let id = this._data['id'];
                if (World.My.propInfo.beUsing(id)){
                    this.updateCD();
                }else {
                    this.foreverNode.active = false;
                    this.useNode.active = true;
                    this.usingNode.active = false;
                }
            }
        }, 0.99);
    }

    private updateCD(){
        let cd = Math.floor((World.My.propInfo.expireTime(this._data['id']) - new Date().getTime())/1000);
        let min = Math.floor(cd/60);
        let sec = cd%60;
        this.cdLabel.string = `剩余计时 ${("000"+min).substr(-2)+":"+("000"+sec).substr(-2)}`;
    }

    upadteItem(data: any, index: number) {
        this._data = data;
        this._index = index;
        // console.log(data, index);
        let id = data['id'];
        this.iconSprite.spriteFrame = this.iconSpriteFrames[id-1];
        this.nameLabel.string = data['prop_name'];
        if (data['unlock'] == 0){
            this.foreverNode.active = true;
            this.useNode.active = false;
            this.usingNode.active = false;
        }else if (!World.My.propInfo.beUsing(id)) {
            this.foreverNode.active = false;
            this.useNode.active = true;
            this.usingNode.active = false;
        }else {
            this.foreverNode.active = false;
            this.useNode.active = false;
            this.usingNode.active = true;
            this.updateCD();
        }
    }

    onClickDetail(){
        this.propsController.detailLabel.string = this._data['description'];
        this.propsController.detailNode.active = true;
    }

    onClickUse(){
        World.My.propInfo.use(this._data['id']);
        this.upadteItem(this._data, this._index);
    }
}
