// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Bullet from "./Bullet";
import Facade from "../../../../framework/facade/Facade";
import {GameProxy} from "../../game/GameProxy";
import {World} from "../../info/World";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../../config/ExcelTableNames";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletOfShouLei extends Bullet {

    private _ske:sp.Skeleton = null;

    private _bounds:cc.Rect = cc.rect();

    private _gameExplosivesController = null;


    strike(other, self): void {
        // super.strike(other, self);
    }

    init(id: number): void {
        this.bulletId = id;
        let cfg = ExcelConfig.getExcelTable(ExcelTableNames.Prop)[this.bulletId-1];
        this.bThrought = cfg['pierce'] === 1;
        this.repel = cfg['repel'];
        this.stiff = cfg['stiff'];
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[0];
        this.hurt = Math.floor(config['hurt']*World.My.armory.hurtMulOf(1))*cfg['hurt'];
        let bgNode = cc.find('Canvas').getChildByName('GameScene').getChildByName('shakeNode').getChildByName('bg');
        this._bounds.x = - bgNode.width/2;
        this._bounds.y = - bgNode.height/2;
        this._bounds.width = bgNode.width;
        this._bounds.height = bgNode.height;
    }


    onLoad(): void {
        super.onLoad();
        this._ske = this.getComponent(sp.Skeleton);
        this._gameExplosivesController = Facade.findComponent("GameScene", "GameExplosivesController");
    }


    move(dir: cc.Vec2): void {
        if (this.node.x <= this._bounds.xMin || this.node.x >= this._bounds.xMax || this.node.y <= this._bounds.yMin || this.node.y >= this._bounds.yMax){
            this.node.active = false;
            return;
        }
        this._ske.setAnimation(0, "animation", true);
        /** 计算终点 */
        let destPos = dir.mul(this._bounds.height+this._bounds.width);
        let intersections = [];
        if (dir.x > 0){
            //右边界
            if (destPos.x >= this._bounds.xMax){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMax, this._bounds.yMin), cc.v2(this._bounds.xMax, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }else if (dir.x < 0) {
            //左边界
            if (destPos.x <= this._bounds.xMin){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMin), cc.v2(this._bounds.xMin, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }

        if (dir.y > 0){
            //上边界
            if (destPos.y >= this._bounds.yMax){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMax), cc.v2(this._bounds.xMax, this._bounds.yMax), point)){
                    intersections.push(point);
                }
            }
        }else if (dir.y < 0){
            //上边界
            if (destPos.y <= this._bounds.yMin){
                let point = cc.v2();
                if(cc.Intersection.pLineIntersect(this.node.position, destPos, cc.v2(this._bounds.xMin, this._bounds.yMin), cc.v2(this._bounds.xMax, this._bounds.yMin), point)){
                    intersections.push(point);
                }
            }
        }

        if (intersections.length > 0){
            // console.log("重新计算destPos===>intersections", intersections);
            /** 重新计算destPos */
            if (intersections.length == 1){
                destPos = intersections[0];
            } else {
                /** 取距离怪物最近的那个点 */
                let p = intersections[0];
                let minDistance = p.sub(this.node.position).mag();
                for (let i=1; i<intersections.length; i++){
                    let mag = intersections[i].sub(this.node.position).mag();
                    if (mag < minDistance){
                        p = intersections[i];
                        minDistance = mag;
                    }
                }
                destPos = p;
            }
        }

        let distance = destPos.sub(this.node.position).mag();
        let speed = 50;
        let action = cc.sequence(cc.moveTo(distance/speed, destPos), cc.callFunc(()=>{
            this.node.active = false;
        }));
        this.node.runAction(action);
    }

    onCollisionEnter(other, self): void {
        /** 爆炸 */
        this.node.active = false;
        this.boom();
    }

    boom(){
        let explosiveHuoJianTong = this._gameExplosivesController.getInactiveExplosive(9);
        explosiveHuoJianTong.node.position = this.node.position;
        explosiveHuoJianTong.node.active = true;
        explosiveHuoJianTong.node.scale = 0.5;
        explosiveHuoJianTong.node.rotation = Math.random()*360;
        explosiveHuoJianTong.boom();
        GameProxy.emit(GameProxy.Event.ShakeScreen, 0.08, 2, 2);
    }
}
