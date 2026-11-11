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
import {ext} from "../../../framework/extend/Extend";
import Actions from "../../../framework/actions/Actions";
import {World} from "../info/World";

const {ccclass, property} = cc._decorator;

let GoldIconNodePos:cc.Vec2 = null;

@ccclass
export default class GameUIController extends cc.Component {

    @property(cc.Node)
    supplyIconNode:cc.Node = null;

    @property(cc.RichText)
    lvLabels: [cc.RichText] = [];

    @property(cc.ProgressBar)
    gameProgressBar:cc.ProgressBar = null;

    @property(cc.Label)
    gameProgressLabel:cc.Label = null;

    @property(cc.Label)
    goldLabel:cc.Label = null;

    @property(cc.Node)
    goldIconNode:cc.Node = null;

    @property(cc.Node)
    goldLayer:cc.Node = null;

    @property(cc.Node)
    gameOverNode:cc.Node = null;

    private getInactiveGoldIconNode():cc.Node{
        let node:cc.Node = this.goldLayer.children.find(value => value.active == false);
        if (node == null){
            node = cc.instantiate(this.goldIconNode);
            node.active = false;
            this.goldLayer.addChild(node);
        }
        node.opacity = 255;
        node.scale = 0.7;
        return node;
    }

    updateGold(){
        this.goldLabel.string = ext.shortFormat(GameProxy.goldCount);
    }

    onLoad () {
        this.node.on(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
        this.node.on(GameProxy.Event.InitGame, this.onInitGame, this);
        this.node.on(GameProxy.Event.StartGame, this.onStartGame, this);
        this.supplyIconNode.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.35, 0.91), cc.scaleTo(0.35, 1))));
    }

    onDestroy(){
        this.node.off(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
        this.node.off(GameProxy.Event.InitGame, this.onInitGame, this);
        this.node.off(GameProxy.Event.StartGame, this.onStartGame, this);
    }

    checkWin(){
        if (GameProxy.isOver && GameProxy.killCount >= GameProxy.maxEnemyNum && this.goldLayer.children.every(value => value.active == false)){
            console.log("金币飞完了，结算");
            this.gameOverNode.active = true;
        }
    }

    onKillEnemy(enemy){
        // console.log("======onKillEnemy====>");
        /** 分配金币 */
        let totalGold = enemy.gold * GameProxy.goldMul;
        let sigleGold = Math.floor(totalGold/enemy.goldIconFell);
        let restGold = totalGold - sigleGold * enemy.goldIconFell;
        let addFlag = false;
        let moveSpeed = 1000;
        /** 飞金币 */
        let position = enemy.node.position.add(enemy.node.getParent().getParent().position);
        if (enemy.goldIconFell < 5){
            /** 每一个延迟0.1秒执行 */
            /** 随机一个方向 */
            let sub = GoldIconNodePos.sub(position);
            let center = position.add(sub.mul(0.15));
            let p = sub.normalize().rotate(-90*Math.PI/180);
            // let duration = sub.mag()/moveSpeed;
            let duration = 0.65;
            let bLeft = (Math.random()*100)%2 === 1;
            for (let i=0; i<enemy.goldIconFell; i++){
                let left = i%2 === 0 ? bLeft : !bLeft;
                let goldIcon = this.getInactiveGoldIconNode();
                goldIcon.position = position;
                goldIcon.active = true;
                goldIcon.runAction(cc.speed(cc.sequence(cc.delayTime(i*0.1), cc.bezierTo(duration, [
                    center.add(p.mul(300*(left?-1:1))),
                    GoldIconNodePos,
                    GoldIconNodePos
                ]).easing(cc.easeCircleActionIn()), cc.callFunc(()=>{
                    goldIcon.active = false;
                    //加金币
                    if (!addFlag){
                        addFlag = true;
                        GameProxy.goldCount += sigleGold + restGold;
                    } else {
                        GameProxy.goldCount += sigleGold;
                    }
                    this.updateGold();
                    this.checkWin();
                })), 1));
            }
        }else {
            // console.log("Actions.boom===>");
            /** 像转盘一样炸开 */
            let radius = 80;
            let num = enemy.goldIconFell;
            Actions.boom(()=>{
                let node = this.getInactiveGoldIconNode();
                node.active = true;
                return node;
            }, position, GoldIconNodePos, radius, num,moveSpeed, ()=>{
                if (!addFlag){
                    addFlag = true;
                    GameProxy.goldCount += sigleGold + restGold;
                } else {
                    GameProxy.goldCount += sigleGold;
                }
                this.updateGold();
                this.checkWin();
            });
        }
        this.updateGameProgress();
    }

    onInitGame(){
        this.lvLabels.forEach((value, index) => value.string = `<b><outline color=#1e1e1e width=3>${GameProxy.level-1+index}</outline></b>`);
        if (GameProxy.level < 2){
            this.lvLabels[0].node.getParent().active = false;
        }
        this.updateGameProgress();
        this.updateGold();
    }

    onStartGame(){
        GoldIconNodePos = this.goldLayer.convertToNodeSpaceAR(this.goldIconNode.convertToWorldSpaceAR(cc.v2()));
    }

    updateGameProgress(){
        this.gameProgressBar.progress = GameProxy.killCount / GameProxy.maxEnemyNum;
        this.gameProgressLabel.string = `剩余敌人：${Math.ceil(100 * (GameProxy.maxEnemyNum - GameProxy.killCount)/GameProxy.maxEnemyNum)}%`
    }

    // update (dt) {}
}
