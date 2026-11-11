// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import RoleAABB from "./RoleAABB";
import {GameProxy} from "../../game/GameProxy";
import RoleSupply from "./RoleSupply";

const {ccclass, property} = cc._decorator;

export enum SpeedType {
    STOP,
    NORMAL,
    FAST,
}


@ccclass
export default class Role extends cc.Component {

    @property(cc.Sprite)
    fireSprite:cc.Sprite = null;

    @property(cc.Node)
    gunTopNode:cc.Node = null;

    @property(cc.Node)
    spriteNode:cc.Node = null;

    private _speedType:SpeedType = SpeedType.STOP;
    private _speed = 0;

    private _roleAABB:RoleAABB = null;

    private _spaceCircleCollider:cc.CircleCollider = null;


    get spaceCircleCollider(): cc.CircleCollider {
        return this._spaceCircleCollider;
    }

    get roleAABB(): RoleAABB {
        return this._roleAABB;
    }

    get speed(): number {
        return this._speed*this.accSpeed;
    }

    @property({type:cc.Enum(SpeedType), tooltip:"速度级别"})
    get speedType(){
        return this._speedType;
    }

    set speedType(value:SpeedType){
        switch (value){
            case SpeedType.STOP:
                this._speed = this.stopSpeed;
                break;
            case SpeedType.NORMAL:
                this._speed = this.normalSpeed;
                break;
            case SpeedType.FAST:
                this._speed = this.fastSpeed;
                break;
        }
        this._speedType = value;
    }

    @property({tooltip:"停止时速度"})
    stopSpeed = 0;

    @property({tooltip:"正常速度"})
    normalSpeed = 100;

    @property({tooltip:"最快速度"})
    fastSpeed = 200;

    @property
    accSpeed = 1;

    onLoad(){
        this._roleAABB = this.getComponent(RoleAABB);
        this._spaceCircleCollider = this.getComponent(cc.CircleCollider);
    }

s
    /** 碰撞处理 */
    onCollisionEnter (other, self) {
        /** 如果是怪物 */
        if (other.tag == 1){
            console.log("角色被攻击了.");
        }
    }

    addSupply(id:number){
        let prefab = cc.loader.getRes('prefab/roleSupply', cc.Prefab);
        let node = cc.instantiate(prefab);
        node.getComponent(RoleSupply).setSupply(id, this.node);
        this.node.getParent().addChild(node);
    }

}
