// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BulletEmitter from "./BulletEmitter";
import GameBulletsController from "../../game/GameBulletsController";


export default class BulletEmitterJiaTeLin extends BulletEmitter {

    private degree = 0;

    private num = 0;

    constructor(gameBulletsController:GameBulletsController){
        super(gameBulletsController);
        this._firingRange = 1000;
        this._interval = 0.1;
        this._speed = 1200;
    }

    fire(start: cc.Vec2, dir: cc.Vec2) {
        this.bulletCount--;
        switch (this.num%4){
            case 0:
                /** 发射一颗 */
            {
                let degree = Math.random()*2;
                this.degree = this.degree > 0 ? -degree : degree;
                let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet.node.active = true;
                bullet.node.position = start;

                bullet.fly(dir.rotate(cc.misc.degreesToRadians(this.degree)), this._firingRange, this._speed);
            }
                break;
            case 1:
                /** 小角度同时发射两颗 */
            {
                let degree = 3 + Math.random() * 5;
                let bullet1 = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet1.node.active = true;
                bullet1.node.position = start.add(dir.mul(Math.random()*-10));

                bullet1.fly(dir.rotate(cc.misc.degreesToRadians(this.degree+degree)), this._firingRange, this._speed);

                let bullet2 = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet2.node.active = true;
                bullet2.node.position = start.add(dir.mul(Math.random()*10));

                bullet2.fly(dir.rotate(cc.misc.degreesToRadians(-this.degree-degree)), this._firingRange, this._speed);
            }
                break;
            case 2:
                /** 发射一颗 */
            {
                let degree = Math.random()*2;
                this.degree = this.degree > 0 ? -degree : degree;
                let bullet = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet.node.active = true;
                bullet.node.position = start;

                bullet.fly(dir.rotate(cc.misc.degreesToRadians(this.degree)), this._firingRange, this._speed);
            }
                break;
            case 3:
                /** 大角度同时发射两颗 */
            {
                let degree = 10 + Math.random() * 5;
                let bullet1 = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet1.node.active = true;
                bullet1.node.position = start.add(dir.mul(Math.random()*-15));

                bullet1.fly(dir.rotate(cc.misc.degreesToRadians(this.degree+degree)), this._firingRange, this._speed);

                let bullet2 = this.gameBulletsController.getInactiveBullet(BulletEmitter.TYPES.JiaTeLin);
                bullet2.node.active = true;
                bullet2.node.position = start.add(dir.mul(Math.random()*15));

                bullet2.fly(dir.rotate(cc.misc.degreesToRadians(-this.degree-degree)), this._firingRange, this._speed);
            }
                break;
        }
        this.num++;
    }
}

