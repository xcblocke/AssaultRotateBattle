// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {World} from "./World";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ExcelTableNames} from "../config/ExcelTableNames";

const EMITTER_POWER_LEVEL = "powerLv";
const EMITTER_FIRE_POWER_LEVEL = "firePowerLv";

// const POWER_MULS = [1,2,2,4,2,4,6,6,6,6,6];
const PAYLOAD_MULS = [1,1,10,2,5,10,1,1,1,1,1];

/** 试用加50级 */
const TRIAL_ADD = 50;

/** 武器库 */
export default class Armory {

    constructor(map){
        this._map = map;
        this._weaponUpCfg = ExcelConfig.getExcelTable(ExcelTableNames.WeaponUp);
        this._bulletUpCfg = ExcelConfig.getExcelTable(ExcelTableNames.BulletUp);
    }

    private _map:[number, number] = null;
    private _weaponUpCfg:any = null;
    private _bulletUpCfg:any = null;


    /** 伤害加成 */
    hurtMulOf(emitter:number){
        let baseMul = this._weaponUpCfg[World.Storage.ADLv-1]['fight'];
        if (emitter == 1){
            return baseMul;
        }
        let lv = this.levelOfEmitterPower(emitter);
        if (emitter == World.Storage.unlockGun){
            lv += TRIAL_ADD;
            if (lv > this._weaponUpCfg.length){
                lv = this._weaponUpCfg.length;
            }
        }
        return this._weaponUpCfg[lv-1]['hurt_add'] * baseMul;
    }

    /** 弹容量累加 */
    payloadAddOf(emitter:number){
        if (emitter == 1)return 0;
        let lv = this.levelOfEmitterFirePower(emitter);
        if (emitter == World.Storage.unlockGun){
            lv += TRIAL_ADD;
            if (lv > this._weaponUpCfg.length){
                lv = this._weaponUpCfg.length;
            }
        }
        return this._bulletUpCfg[lv-1]["gun_"+("000"+emitter).substr(-3)];
    }

    /** 发射频率加成 */
    freMulOf(emitter:number){
        let index = 0;
        if (emitter == 1){
            index = World.Storage.ADLv-1;
        }else {
            let lv = this.levelOfEmitterFirePower(emitter);
            if (emitter == World.Storage.unlockGun){
                lv += TRIAL_ADD;
                if (lv > this._weaponUpCfg.length){
                    lv = this._weaponUpCfg.length;
                }
            }
            index = lv - 1;
        }
        return this._weaponUpCfg[index]['fre'];
    }

    /** 射程加成 */
    rangeMulOf(emitter:number){
        if (emitter == 4 || emitter == 5){
            let lv = this.levelOfEmitterPower(emitter);
            if (emitter == World.Storage.unlockGun){
                lv += TRIAL_ADD;
                if (lv > this._weaponUpCfg.length){
                    lv = this._weaponUpCfg.length;
                }
            }
            return this._weaponUpCfg[lv - 1]['range_add'];
        }else {
            return 1;
        }
    }

    /** 放大加成 */
    magnifyMul(emitter:number){
        if (emitter == 2 || emitter == 9 || emitter == 10){
            let lv = this.levelOfEmitterPower(emitter);
            if (emitter == World.Storage.unlockGun){
                lv += TRIAL_ADD;
                if (lv > this._weaponUpCfg.length){
                    lv = this._weaponUpCfg.length;
                }
            }
            return this._weaponUpCfg[lv - 1]['amp_add'];
        } else {
            return 1;
        }
    }


    /** 获取武器的威力加成 */
    levelOfEmitterPower(emitter:number){
        let data = this._map[emitter];
        if (data){
            return data[EMITTER_POWER_LEVEL];
        }else {
            return 1;
        }
    }

    

    /** 获取武器的火力加成 */
    levelOfEmitterFirePower(emitter:number){
        let data = this._map[emitter];
        if (data){
            return data[EMITTER_FIRE_POWER_LEVEL];
        }else {
            return 1;
        }
    }

    addLevelOfEmitterPower(emitter:number, add:number){
        let data = this._map[emitter];
        if (!data){
            data = {};
            data[EMITTER_POWER_LEVEL] = 1;
            data[EMITTER_FIRE_POWER_LEVEL] = 1;
            this._map[emitter] = data;
        }
        data[EMITTER_POWER_LEVEL] = data[EMITTER_POWER_LEVEL]+add;
        World.Storage.armory = this.toJson();
    }

    addLevelOfEmitterFirePower(emitter:number, add:number){
        let data = this._map[emitter];
        if (!data){
            data = {};
            data[EMITTER_POWER_LEVEL] = 1;
            data[EMITTER_FIRE_POWER_LEVEL] = 1;
            this._map[emitter] = data;
        }
        data[EMITTER_FIRE_POWER_LEVEL] = data[EMITTER_FIRE_POWER_LEVEL] + add;
        World.Storage.armory = this.toJson();
    }

    toJson(){
        return JSON.stringify(this._map);
    }
}
