// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html




import {ExcelTableNames, LevelConfig} from "../config/ExcelTableNames";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {ext} from "../../../framework/extend/Extend";
import {World} from "../info/World";

let ENEMY_HURT_MUL = 1;
let ENEMY_HP_MUL = 1;
let ENEMY_GOLD_MUL = 1;
let PASS_GOLD_MUL = 1;


export class GameProxy {
    static GameScene:cc.Node = null;
    static Event = {
        StartGenEnemy:"StartGenEnemy",
        StopGenEnemy:"StopGenEnemy",
        KillEnemy:"KillEnemy",
        KillRole:"KillRole",
        PauseGame:"PauseGame",
        SlowGame:"SlowGame",
        InitGame:"InitGame",
        StartGame:"StartGame",
        ReliveGame:"ReliveGame",
        OverGame:"OverGame",
        UpdateBulletCount:"UpdateBulletCount",
        ShakeScreen:"ShakeScreen",
        PropCDZero:"PropCDZero",
        PropTrigger:"PropTrigger",
    };

    static emit(e:string, ...args){
        if (this.GameScene){
            this.GameScene.emit(e, ...args);
        }
    }

    static firstAidFlag = true;

    static secondBossNum = 0;

    /** 关卡 */
    private static _level = 0;

    static get level(): number {
        return this._level;
    }

    static set level(value: number) {
        this._level = value;
        console.log("_level===>", this._level);
        let goldUpCfg = ExcelConfig.getExcelTable(ExcelTableNames.GoldUp);
        let enemyUpCfg = ExcelConfig.getExcelTable(ExcelTableNames.EnemyUp);
        ENEMY_HURT_MUL = enemyUpCfg[this._level]['enemy_hurt'];
        ENEMY_HP_MUL = enemyUpCfg[this._level]['enemy_health'];
        ENEMY_GOLD_MUL = enemyUpCfg[this._level]['enemy_gold'] * goldUpCfg[World.Storage.goldLv-1]['gvalue'];
        PASS_GOLD_MUL = enemyUpCfg[this._level]['clear_gold'];
        let levelConfig = ExcelConfig.getExcelTable(ExcelTableNames.Level);
        if (this._level <= levelConfig.length - 4){
            this._levelConfig = levelConfig[this._level-1];
        }else {
            /** 最后四关里随机一关 */
            this._levelConfig = levelConfig[levelConfig.length - 4 + Math.ceil(Math.random()*100)%4];
        }
        if (!this._levelConfig){
            console.error("levelConfig error==>"+this._level);
        }
        /** 生成敌人列表 */
        let enemyArr1 = [], enemyArr2 = [];
        let maxEnemyId1 = 0, maxEnemyId2 = 0;
        let max1 = 0, max2 = 0;
        let enemyID = 1;
        while (typeof this._levelConfig[`p1_enemy_${enemyID}`] !== "undefined"){
            if (this._levelConfig[`p1_enemy_${enemyID}`] > 0){
                for (let i=0; i<Math.floor(this._levelConfig[`p1_enemy_${enemyID}`] * this._levelConfig.amount_p1); i++){
                    enemyArr1.push(enemyID);
                }
                if (this._levelConfig[`p1_enemy_${enemyID}`] > max1){
                    max1 = this._levelConfig[`p1_enemy_${enemyID}`];
                    maxEnemyId1 = enemyID;
                }
            }

            if (this._levelConfig[`p2_enemy_${enemyID}`] > 0){
                for (let i=0; i<Math.floor(this._levelConfig[`p2_enemy_${enemyID}`] * this._levelConfig.amount_p2); i++){
                    enemyArr2.push(enemyID);
                }
                if (this._levelConfig[`p2_enemy_${enemyID}`] > max2){
                    max2 = this._levelConfig[`p2_enemy_${enemyID}`];
                    maxEnemyId2 = enemyID;
                }
            }
            enemyID++;
        }

        this._levelConfig.amount_p1 = enemyArr1.length;
        this._levelConfig.amount_p2 = enemyArr2.length;

        /** 打乱顺序 */
        ext.shuffle(enemyArr1);
        ext.shuffle(enemyArr2);

        /** 得到敌人列表 */
        this._enemyList.length = 0;
        this._enemyList.push(...enemyArr1);
        for (let i=0; i<this._levelConfig.p1_boss_7; i++){
            this._enemyList.push(7);
        }
        for (let i=0; i<this._levelConfig.p1_boss_8; i++){
            this._enemyList.push(8);
        }

        this._enemyList.push(...enemyArr2);
        for (let i=0; i<this._levelConfig.p2_boss_7; i++){
            this._enemyList.push(7);
        }
        for (let i=0; i<this._levelConfig.p2_boss_8; i++){
            this._enemyList.push(8);
        }

        //初始化属性
        this.isOver = false;
        this.killCount = 0;
        this.goldCount = 0;
        this.secondBossNum = this._levelConfig.p2_boss_7 + this._levelConfig.p2_boss_8;
        this._maxEnemyNum = this._enemyList.length;
        this._slowGame = false;
        this._pauseGame = false;
        this.magnetic = false;
    }

    /** 关卡配置 */
    private static _levelConfig:LevelConfig = null;


    static get levelConfig(): LevelConfig {
        return this._levelConfig;
    }

    /** 敌人列表 */
    private static _enemyList:Array<number> = [];


    static get enemyList(): Array<number> {
        return this._enemyList;
    }

    /** 预选枪支 */
    static prepareGun = 0;

    /** 是否结束 */
    static isOver = false;

    /** 杀敌数 */
    static killCount = 0;

    /** 金币数 */
    static goldCount = 0;

    /** 金币番倍 */
    static goldMul = 1;

    /** 暂停 */
    private static _pauseGame = false;

    /** 磁力道具 */
    static magnetic = false;


    static get pauseGame(): boolean {
        return this._pauseGame;
    }

    static set pauseGame(value: boolean) {
        console.log("GameProxy===>pauseGame", value);
        if (this._pauseGame != value){
            this._pauseGame = value;
            this.emit(this.Event.PauseGame, this._pauseGame);
        }
    }

    /** 变慢 */
    private static _slowGame = false;

    static get slowGame(): boolean {
        return this._slowGame;
    }

    static set slowGame(value: boolean) {
        if (this._slowGame != value){
            this._slowGame = value;
            this.emit(this.Event.SlowGame, this._slowGame);
        }
    }

    /** 敌人总数 */
    private static _maxEnemyNum = 0;

    static get maxEnemyNum(): number {
        return this._maxEnemyNum;
    }

    /** 敌人伤害公式 */
    static enemyHurtMulOf(enemyId:number){
        return ENEMY_HURT_MUL;
    }

    /** 敌人血量公式 */
    static enemyHpMulOf(enemyId:number){
        return ENEMY_HP_MUL;
    }

    /** 敌人金币产量公式 */
    static enemyGoldMulOf(enemyId:number){
        return ENEMY_GOLD_MUL;
    }

    /** 过关金币公式 */
    static passGold(){
        return PASS_GOLD_MUL;
    }
}
