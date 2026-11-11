// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameProxy} from "./GameProxy";
import {ExcelTableNames} from "../config/ExcelTableNames";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {World} from "../info/World";
import CDTimer from "../../../framework/component/CDTimer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameRelive extends cc.Component {

    @property(cc.Node)
    gameOverNode:cc.Node = null;

    @property(cc.SpriteFrame)
    gunSpriteFrames:[cc.SpriteFrame] = [];

    @property(cc.Sprite)
    gunSprite:cc.Sprite = null;

    @property(cc.Label)
    bulletLabel:cc.Label = null;

    @property(cc.Label)
    cdLabel:cc.Label = null;

    @property(CDTimer)
    cdTimer:CDTimer = null;

    // LIFE-CYCLE CALLBACKS:

    onEnable () {
        console.log("GameRelive===>GameProxy.pauseGame = true");
        GameProxy.pauseGame = true;
        this.cdTimer.reset();
        this.cdTimer.pause = false;
        this.cdLabel.string = Math.ceil(this.cdTimer.cdDelta()).toString();
        // this.noReliveNode.active = false;
        this.node.stopAllActions();
        // this.node.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(()=>{
        //     this.noReliveNode.active = true;
        // })));
        let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon).filter(value => value['id'] != 1).sort(((a, b) => b['unlock'] - a['unlock']));
        for (let item of weaponConfig){
            if (GameProxy.level >= item['unlock']){
                this.gunSprite.spriteFrame = this.gunSpriteFrames[item['id'] - 1];
                this.bulletLabel.string = `子弹 ${World.My.armory.payloadAddOf(item['id']) * 3}x3`;
                break;
            }
        }
    }

    onClickRelive(event, data){
        this.node.active = false;
        GameProxy.pauseGame = false;
        GameProxy.emit(GameProxy.Event.ReliveGame);
    }


    onNoRelive(event, data){
        this.node.active = false;
        this.gameOverNode.active = true;
    }

    onProgressEvent(progress:number){
        this.cdLabel.string = Math.ceil(this.cdTimer.cdDelta()).toString();
    }
}
