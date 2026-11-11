// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import GameBulletsController from "../../game/GameBulletsController";
import {ExcelTableNames} from "../../config/ExcelTableNames";
import {ExcelConfig} from "../../../../framework/config/ExcelConfig";
import {GameProxy} from "../../game/GameProxy";
import {World} from "../../info/World";

/**
 * 子弹发射器只负责发射子弹
 * 控制一次发射的子弹个数及每一颗子弹的发射
 */


export default abstract class BulletEmitter {

    static TYPES = {
        ShouQiang : 1,
        PenZi : 2,
        JiaTeLin : 3,
        SanDanQiang : 4,
        HuoYan : 5,
        JiGuang : 6,
        JuJiQiang : 7,
        LiZiPao : 8,
        HuoJianTong : 9,
        ShanDianQiu : 10,
    };

    protected constructor(gameBulletsController:GameBulletsController){
        this._gameBulletsController = gameBulletsController;
    }
    private _gameBulletsController:GameBulletsController = null;


    /** 射程 */
    protected _firingRange = 0;

    get firingRange(): number {
        return this._firingRange;
    }

    /** 发射间隔 */
    protected _interval = 0;


    get interval(): number {
        return this._interval;
    }

    /** 子弹的速度 */
    protected _speed = 0;


    get speed(): number {
        return this._speed;
    }

    /** 弹容量 */
    private _payload = 0;

    get payload(): number {
        return this._payload;
    }

    set payload(value: number) {
        this._payload = value;
        this.bulletCount = this._payload;
    }

    /** 剩余弹量 */
    private _bulletCount = 0;


    get bulletCount(): number {
        return this._bulletCount;
    }


    set bulletCount(value: number) {
        this._bulletCount = value;
        GameProxy.emit(GameProxy.Event.UpdateBulletCount);
    }

    /** 是否子弹用尽 */
    isUseUp(){
        return this._payload != 0 && this._bulletCount < 1;
    }

    get gameBulletsController(): GameBulletsController {
        return this._gameBulletsController;
    }


    protected _bulletEmitterID = 0;

    init(id:number){
        this._bulletEmitterID = id;
        let config = ExcelConfig.getExcelTable(ExcelTableNames.Weapon)[this._bulletEmitterID-1];
        this._speed = config['speed'];
        this._firingRange = config['range']*World.My.armory.rangeMulOf(this._bulletEmitterID);
        this._interval = config['fre']*World.My.armory.freMulOf(this._bulletEmitterID);
        this.payload = World.My.armory.payloadAddOf(this._bulletEmitterID);
        console.log('payload===>', this._payload);
    }

    abstract fire(start: cc.Vec2, dir: cc.Vec2);

    onEnter(){}
    onExit(){}
}

