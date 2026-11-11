// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Enemy from "../entities/enemy/Enemy";
import SpacePartition from "../../../framework/extend/SpacePartition";
import {GameProxy} from "./GameProxy";
import PropBase from "../entities/prop/PropBase";

const {ccclass, property} = cc._decorator;

let MAX_LOGIC_COUNT = 10;

@ccclass
export default class GameEnemysController extends cc.Component {

    @property(cc.Node)
    propLayer:cc.Node = null;

    @property(cc.Node)
    enemyLayer:cc.Node = null;

    @property(cc.Node)
    enemyBloodLayer:cc.Node = null;

    @property(cc.Node)
    bgNode:cc.Node = null;

    private _enemyCount = 0;

    private enemyLogicList:Array<Enemy> = [];


    get enemyCount(): number {
        return this._enemyCount;
    }

    set enemyCount(value: number) {
        this._enemyCount = value;
    }

    private _enmeyMap = new Map<number, Array<Enemy>>();
    private _enmeyBloodArray:Array<cc.Node> = [];

    private _propMap = new Map<number, Array<PropBase>>();
    private _gunsArr:Array<PropBase> = [];

    gameProps:Array<PropBase> = [];

    private genEnemy(id:number):Enemy{
        let prefabPath = 'prefab/entities/enemy/enemy'+id;
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        node.active = false;
        this.enemyLayer.addChild(node);
        let enemy = <Enemy>node.getComponent(Enemy);
        enemy.init(id);
        let arr = this._enmeyMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._enmeyMap.set(id, arr);
        }
        arr.push(enemy);
        return enemy;
    }

    private getInactiveEnemy(id:number):Enemy{
        let result:Enemy = undefined;
        let arr = this._enmeyMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genEnemy(id);
        }
        return result;
    }

    private genEnemyBloodNode():cc.Node{
        let prefabPath = 'prefab/entities/blood/blood';
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        node.active = false;
        this.enemyBloodLayer.addChild(node);
        this._enmeyBloodArray.push(node);
        return node;
    }

    private getInactiveEnemyBloodNode():cc.Node{
        let result:cc.Node = this._enmeyBloodArray.find(value => value.active == false);
        if (typeof result == "undefined"){
            result = this.genEnemyBloodNode();
        }
        return result;
    }

    private genProp(id:number):PropBase{
        let prefabPath = 'prefab/entities/prop/prop'+id;
        let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
        let node = cc.instantiate(entityPrefab);
        node.active = false;
        this.propLayer.addChild(node);
        let prop = <PropBase>node.getComponent(PropBase);
        prop.init(id);
        let arr = this._propMap.get(id);
        if (typeof arr == "undefined"){
            arr = [];
            this._propMap.set(id, arr);
        }
        arr.push(prop);
        return prop;
    }

    getInactiveProp(id:number):PropBase{
        let result:PropBase = undefined;
        let arr = this._propMap.get(id);
        if (typeof arr != 'undefined'){
            result = arr.find(value => value.node.active == false);
        }
        if (typeof result == "undefined"){
            result = this.genProp(id);
        }
        return result;
    }

    getInactiveGun():PropBase{
        let result = this._gunsArr.find(value => value.node.active == false);
        if (typeof result == "undefined"){
            let prefabPath = 'prefab/entities/prop/guns';
            let entityPrefab = cc.loader.getRes(prefabPath, cc.Prefab);
            let node = cc.instantiate(entityPrefab);
            this.propLayer.addChild(node);
            node.active = false;
            result = <PropBase>node.getComponent(PropBase);
            this._gunsArr.push(result);
        }
        return result;
    }

    onLoad(){
        this.node.on(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
        window['GameEnemysController'] = this;
    }

    onDestroy(){
        this.node.off(GameProxy.Event.KillEnemy, this.onKillEnemy, this);
    }

    private _screenRect:cc.Rect = cc.rect(0, 0, cc.visibleRect.width, cc.visibleRect.height);
    allAliveAndInScreenEnemy():Array<Enemy>{
        let list = [];
        this._screenRect.x = -this.bgNode.x - cc.visibleRect.center.x;
        this._screenRect.y = -this.bgNode.y - cc.visibleRect.center.y;
        for (let node of this.enemyLayer.children){
            let enemy = node.getComponent(Enemy);
            if (!enemy.node.active || enemy.hp <= 0 || enemy.node.x + enemy.spaceCircleCollider.radius <= this._screenRect.xMin || enemy.node.x - enemy.spaceCircleCollider.radius > this._screenRect.xMax || enemy.node.y + enemy.spaceCircleCollider.radius < this._screenRect.yMin || enemy.node.y - enemy.spaceCircleCollider.radius > this._screenRect.yMax){
                continue;
            }
            list.push(enemy);
        }
        return list;
    }

    allAliveEnemy():Array<Enemy>{
        return this.enemyLayer.children.filter(value => value.active && value.getComponent(Enemy).hp > 0).map(value => value.getComponent(Enemy));
    }

    allActiveEnemy():Array<Enemy>{
        return this.enemyLayer.children.filter(value => value.active).map(value => value.getComponent(Enemy));
    }

    createEnemy(id:number){
        // console.log("createEnemy==>", id);
        this.enemyCount++;
        //绑定
        //角色900范围内随机出现
        let x1 = Math.max(-this.bgNode.x - cc.visibleRect.center.x, -this.bgNode.width/2);
        let y1 = Math.max(-this.bgNode.y - cc.visibleRect.center.y, -this.bgNode.height/2);
        let w1 = Math.min(cc.visibleRect.width, this.bgNode.width/2 - x1);
        let h1 = Math.min(cc.visibleRect.height, this.bgNode.height/2 - y1);
        let screenRect = cc.rect(x1, y1, w1, h1);
        let range = 200;
        let x2 = Math.max(x1 - range, -this.bgNode.width/2);
        let y2 = Math.max(y1 - range, -this.bgNode.height/2);
        let w2 = Math.min(cc.visibleRect.width + range*2, this.bgNode.width/2 - x2);
        let h2 = Math.min(cc.visibleRect.height + range*2, this.bgNode.height/2 - y2);
        let rangeRect = cc.rect(x2, y2, w2, h2);
        let partitions = [rangeRect];
        SpacePartition.partitionRect(partitions, screenRect, 30, 30);
        // let partitions = [cc.rect(-this._bgNode.width/2, -this._bgNode.height/2, this._bgNode.width, this._bgNode.height)];
        // this.allActiveEnemy().forEach(value => {
        //     SpacePartition.partitionRect(partitions, value.enemyAABB.aabb());
        // });
        //
        // SpacePartition.partitionRect(partitions, this._gameRoleController.role.roleAABB.aabb());
        let enemy = this.getInactiveEnemy(id);
        let radius = enemy.getComponent(cc.CircleCollider).radius;
        let rect = SpacePartition.randomSpace(partitions, radius*2, radius*2);

        if (rect){
            enemy.node.position = rect.center;
            enemy.node.active = true;
            this.enemyLogicList.push(enemy);
            window['GameCollisionController'].looseQuadTree.insert(enemy.enemyAABB);
        }else {
            console.error("没有空间了...", partitions);
        }
    }

    onKillEnemy(enemy:Enemy){
        this.enemyLogicList.splice(this.enemyLogicList.indexOf(enemy), 1);
        window['GameCollisionController'].looseQuadTree.remove(enemy.enemyAABB);
        this.enemyCount--;
    }

    lateUpdate(){
        if (GameProxy.pauseGame){
            return;
        }
        /** 每次处理固定数量的敌人逻辑 */
        let preNum = 0;
        for (let enemy of this.enemyLogicList){
            if (enemy.logicFlag){
                preNum++;
                enemy.logicFlag = false;
            }else {
                break;
            }
        }
        this.enemyLogicList.push(...this.enemyLogicList.splice(0, preNum));
        let count = Math.min(MAX_LOGIC_COUNT, this.enemyLogicList.length);
        for (let i=0; i<count; i++){
            this.enemyLogicList[i].logicFlag = true;
        }
    }
}
