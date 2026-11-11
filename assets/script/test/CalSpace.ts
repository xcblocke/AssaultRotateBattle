// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import SpacePartition from "../../framework/extend/SpacePartition";
import Enemy from "../app/entities/enemy/Enemy";
import LooseQuadTree from "../quad-tree/LooseQuadTree";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CalSpace extends cc.Component {

    @property(cc.Node)
    entityNode:cc.Node = null;

    @property(cc.Node)
    entityNode2:cc.Node = null;

    @property(cc.Node)
    enemyLayer:cc.Node = null;

    @property(cc.Graphics)
    graphics:cc.Graphics = null;

    @property(cc.Node)
    touchNode:cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    _rect:cc.Rect = cc.rect(0, 0, 600, 800);

    onTouchMove(event){
        this.touchNode.position = this.touchNode.position.add(event.getDelta());
        this.getComponent(LooseQuadTree).test(cc.rect(this.touchNode.x-this.touchNode.width/2, this.touchNode.y-this.touchNode.height/2, this.touchNode.width, this.touchNode.height));
    }

    start () {
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //获取矩形内的敌人
        this._rect.width = this.node.width;
        this._rect.height = this.node.height;
        this._rect.origin = cc.v2(-this._rect.width/2, -this._rect.height/2);
        this.graphics.rect(this._rect.x, this._rect.y, this._rect.width, this._rect.height);

        // let list:Array<cc.Rect> = [];
        // this.enemyLayer.children.forEach(value => {
        //     let space = value.getComponent(EnemyAttributes).space;
        //     let rect = cc.rect();
        //     rect.width = rect.height = space.getRadius()*2;
        //     rect.origin = space.getWorldPos().sub(cc.v2(rect.width/2, rect.height/2));
        //     let intersection = new cc.Rect();
        //     this._rect.intersection(intersection, rect);
        //     if (intersection.width > 0 && intersection.height > 0){
        //         list.push(rect);
        //     }
        // });
        // console.log(list, "list");
        // //画list
        // list.forEach(value => this.graphics.rect(value.xMin, value.yMin, value.width, value.height));
        // //开始划分含有子矩形的矩形
        // let arr = this.partitionRect(this._rect, list);
        // console.log(arr, "arr");
        // //画arr
        // arr.forEach(value => this.graphics.rect(value.xMin, value.yMin, value.width, value.height));
        let startTime = new Date().getTime();
        let count = 1;
        let partitions = [this._rect];
        let radius = this.entityNode.getComponent(Enemy).spaceCircleCollider.radius;
        let arr = SpacePartition.randomSpaces(partitions, radius*2, radius*2, count);
        console.log("生成数量:"+arr.length+" 生成时间:"+(new Date().getTime() - startTime));
        // console.log(partitions, "====>");
        console.log(arr, "===>");
        arr.forEach(value => {
            let enmeyNode = cc.instantiate(this.entityNode);
            enmeyNode.position = value.center;
            this.enemyLayer.addChild(enmeyNode);

            this.getComponent(LooseQuadTree).insert(enmeyNode.getComponent(Enemy).enemyAABB);
        });
        // partitions = this.randomEntity(partitions);
        // partitions.forEach(value => this.graphics.rect(value.xMin, value.yMin, value.width, value.height));
        this.schedule(()=>{
            if (count < 10){
                let startTime = new Date().getTime();
                let rect = SpacePartition.randomSpace(partitions, radius*2, radius*2);
                if (rect){
                    let enmeyNode = cc.instantiate(this.entityNode2);
                    enmeyNode.position = rect.center;
                    this.enemyLayer.addChild(enmeyNode);

                    this.getComponent(LooseQuadTree).insert(enmeyNode.getComponent(Enemy).enemyAABB);
                    count++;
                    console.log("生成数量:"+count+" 生成时间:"+(new Date().getTime() - startTime));
                }
            }
        }, 0.11);

        this.graphics.stroke();
    }

    // update (dt) {}
}
