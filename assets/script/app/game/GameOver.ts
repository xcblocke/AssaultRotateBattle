// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../../framework/facade/Facade";
import {ext} from "../../../framework/extend/Extend";
import {GameProxy} from "./GameProxy";
import {World} from "../info/World";
import GameOverLucky from "./GameOverLucky";
import Network from "../network/Network";
import {NetworkConfig} from "../config/NetworkConfig";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";

//curTime = 80  subTime = 0.6   addTime = 10  max = 100   7次，第8次出误点banner
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {

    @property(cc.Label)
    titleLabel:cc.Label = null;

    @property(cc.Node)
    topNode:cc.Node = null;

    @property(cc.Label)
    goldLabel:cc.Label = null;

    @property(cc.Label)
    videoGoldLabel:cc.Label = null;

    @property(cc.Label)
    videoMulLabel:cc.Label = null;

    @property(cc.ProgressBar)
    luckyProgressBar:cc.ProgressBar = null;

    @property(GameOverLucky)
    gameOverLucky:GameOverLucky = null;

    @property(cc.Node)
    oneButtonNode:cc.Node = null;

    @property(cc.Node)
    tripleButtonNode:cc.Node = null;

    @property(cc.Node)
    luckyButtonNode:cc.Node = null;

    @property(cc.Sprite)
    luckyVideoSprite:cc.Sprite = null;

    @property(cc.SpriteFrame)
    inviteSpriteFrame:cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    videoSpriteFrame:cc.SpriteFrame = null;


    private _takeGoldOne = 0;

    private _videoMul = 3;

    onLoad(){
        this.oneButtonNode.on(cc.Node.EventType.POSITION_CHANGED, ()=>{
           this.luckyButtonNode.parent.position = this.oneButtonNode.position.add(cc.v2(0, 120));
        });
    }

    onEnable () {
        this._takeGoldOne = 0;
        this._videoMul = 3;
        this.gameOverLucky.node.active = false;
        this.gameOverLucky.node.zIndex = 10;
        console.log("GameOver===>GameProxy.pauseGame = true");
        GameProxy.pauseGame = true;
        // this.oneBackgroundSprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-gray-sprite"));
        this.node.children.forEach((value, index) => {
            value.scale = 0;
            value.runAction(cc.sequence(cc.delayTime(1+0.08*index), cc.scaleTo(0.2, 1).easing(cc.easeElasticOut(0.45))));
        });

        World.Storage.unlockGun = -World.Storage.unlockGun;
        this.topNode.removeFromParent(false);
        this.node.addChild(this.topNode);
        this.topNode.getChildByName('progress').runAction(cc.sequence(cc.delayTime(0.3), cc.moveBy(0.35, cc.v2(0, -125))));
        this.topNode.getChildByName('level').runAction(cc.sequence(cc.delayTime(0.7), cc.spawn(cc.scaleTo(0.35, 2).easing(cc.easeElasticOut(0.6)), cc.moveBy(0.35, cc.v2(0, -95)).easing(cc.easeElasticOut(0.6)))));
        if (GameProxy.killCount >= GameProxy.maxEnemyNum){
            // World.Storage.passLuckyCount++;
            GameProxy.goldCount += GameProxy.passGold();
            World.Storage.gameLevel++;
            /** 上传关卡 */
            if (NetworkConfig.connectServer){
                Network.uploadLv(World.Storage.gameLevel);
            }
            /** 计算解锁最新的一把枪 */
            let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon);
            for (let item of weaponConfig){
                if (item['unlock'] == World.Storage.gameLevel){
                    World.Storage.unlockGun = item['id'];
                    break;
                }
            }
        }else {
            this.titleLabel.string = "战斗失败";
        }
        this._takeGoldOne = GameProxy.goldCount;
        this.goldLabel.string = ext.shortFormat(this._takeGoldOne);
        this.topNode.getChildByName('progress').getChildByName('goldLabel').getComponent(cc.Label).string = this.goldLabel.string;
        this.updateVideo();
        // this.oneButtonNode.active = false;
        // this.scheduleOnce(()=>this.oneButtonNode.active = true, 2);
        this.scheduleOnce(()=>{
            this.luckyButtonNode.parent.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.5, 0.95), cc.scaleTo(0.5, 1))));
        }, 2);
    }

    updateVideo(){
        this.videoMulLabel.string = `x${this._videoMul}`;
        this.videoGoldLabel.string = ext.shortFormat(this._takeGoldOne * this._videoMul);
        this.luckyProgressBar.progress = 1;
        this.tripleButtonNode.active = false;
        // this.luckyProgressBar.progress = World.Storage.passLuckyCount/5;
        // this.tripleButtonNode.active = World.Storage.passLuckyCount < 5;
        this.luckyButtonNode.active = !this.tripleButtonNode.active;
        let spriteFrame = this.inviteSpriteFrame;
        // if (WXADVideo.canPlay()){
        //     spriteFrame = this.videoSpriteFrame;
        // }
        this.luckyVideoSprite.spriteFrame = spriteFrame;
    }

    onGameOverTake(event, data){
        let num = parseInt(data);
        if (num == 1){
            if (this._takeGoldOne > 0){
                World.Storage.goldCount += this._takeGoldOne;
                Facade.executeCommand('ShowTipsCommand', `金币 +${ext.shortFormat(this._takeGoldOne)}`);
            }
        } else {
            if (this.luckyProgressBar.progress >= 1){
                console.log("幸运大奖.");
                this.gameOverLucky.node.active = true;
                let num = ext.randomElement([10,9,8,7,6,5,4]);
                this.gameOverLucky.run(num, ()=>{
                    this._videoMul = num;
                    // World.Storage.passLuckyCount = 0;
                    this.node.active = false;
                    let goldCount = this._takeGoldOne*this._videoMul;
                    if (goldCount > 0){
                        World.Storage.goldCount += goldCount;
                        Facade.executeCommand('ShowTipsCommand', `金币 +${ext.shortFormat(goldCount)}`);
                    }
                    Facade.executeCommand("LoadSceneCommand", "HomeScene");
                });
                return;
            }
            let goldCount = this._takeGoldOne*this._videoMul;
            if (goldCount > 0){
                World.Storage.goldCount += goldCount;
                Facade.executeCommand('ShowTipsCommand', `金币 +${ext.shortFormat(goldCount)}`);
            }
        }
        this.node.active = false;
        Facade.executeCommand("LoadSceneCommand", "HomeScene");
    }

}
