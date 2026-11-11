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
import {World} from "../../info/World";
import {Music} from "../../../../framework/audio/Music";

const {ccclass} = cc._decorator;

const magnify = 1;

@ccclass
export default class BulletHuoJianTong extends Bullet {


    private _gameExplosivesController = null;


    onLoad(): void {
        super.onLoad();
        this._gameExplosivesController = Facade.findComponent("GameScene", "GameExplosivesController");
    }

    init(id: number): void {
        this.bulletId = id;
    }

    boom(){
        Music.playSFX("sound/msc_g002");
        let explosiveHuoJianTong = this._gameExplosivesController.getInactiveExplosive(9);
        explosiveHuoJianTong.node.position = this.node.position;
        explosiveHuoJianTong.node.active = true;
        explosiveHuoJianTong.node.scale = magnify * World.My.armory.magnifyMul(explosiveHuoJianTong.bulletId);
        explosiveHuoJianTong.node.rotation = Math.random()*360;
        explosiveHuoJianTong.boom();
    }


    fly(dir: cc.Vec2, distance: number, speed: number): void {
        this.node.rotation = 90 - cc.misc.radiansToDegrees(Math.atan2(dir.y, dir.x));
        this.node.runAction(cc.sequence(cc.moveBy(distance/speed, dir.mul(distance)).easing(cc.easeQuadraticActionIn()), cc.callFunc(()=>{
            this.node.active = false;
            this.boom();
        })));
    }


    onCollisionEnter(other, self): void {
        this.node.active = false;
        this.boom();
    }
}
