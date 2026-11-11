// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import {GameProxy} from "../../game/GameProxy";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PropBase extends cc.Component {

    // @property
    cd = 12;

    collider:cc.Collider = null;

    /** 是否触发了 */
    protected _on_off = false;

    /** 是否被磁铁吸引 */
    private _magnetic = false;

    get on_off(): boolean {
        return this._on_off;
    }


    get magnetic(): boolean {
        return this._magnetic;
    }

    set magnetic(value: boolean) {
        if (value != this._magnetic){
            this._magnetic = value;
            if (this._magnetic){
                // console.log("磁力生效===>");
                this.node.stopAllActions();
                /** 撞向角色 */
                this.moveToRole();
            }
        }
    }

    private moveToRole(){
        let gameRoleController = window['GameRoleController'];
        let speed = 1000;
        let distance = this.node.position.sub(gameRoleController.role.node.position).mag();
        this.node.runAction(cc.sequence(cc.moveTo(distance/speed, gameRoleController.role.node.position).easing(cc.easeSineIn()), cc.callFunc(()=>{
            this.moveToRole();
        })));
    }

    propID = -1;

    init(id:number){
        this.propID = id;
    }

    display(){
        this._on_off = false;
        this.node.active = true;
        //倒计时
        if (this.cd > 0){
            this.node.runAction(cc.sequence(cc.delayTime(this.cd-5), cc.blink(5, 25), cc.callFunc(()=>{
                this.node.active = false;
            })));
        }
    }

    trigger(){
        this._on_off = true;
        this.node.stopAllActions();
        GameProxy.emit(GameProxy.Event.PropTrigger, this);
        this.node.active = false;
    }

    onLoad(){
        this.collider = this.getComponent(cc.Collider);
    }


    onEnable(){
        /** 检测与角色的碰撞 */
        this._on_off = false;
        this._magnetic = false;
        window['GameEnemysController'].gameProps.push(this);
    }

    onDisable(){
        this.node.stopAllActions();
        let gameEnemysController = window['GameEnemysController'];
        gameEnemysController.gameProps.splice(gameEnemysController.gameProps.indexOf(this), 1);
    }
}
