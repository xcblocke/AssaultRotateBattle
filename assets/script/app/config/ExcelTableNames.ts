// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/**
 * 关卡配置
 */
export interface LevelConfig {
    level:number;//关卡
    delimit_p1:number;//第一阶段同屏下限基数
    limit_p1:number;//第一阶段同屏上限
    amount_p1:number;//第一阶段总数
    p1_enemy_1:number;//第一阶段怪物1的比例
    p1_enemy_2:number;
    p1_enemy_3:number;
    p1_enemy_4:number;
    p1_enemy_5:number;
    p1_enemy_6:number;
    p1_boss_7:number;
    p1_boss_8:number;
    delimit_p2:number;
    limit_p2:number;
    amount_p2:number;
    p2_enemy_1:number;
    p2_enemy_2:number;
    p2_enemy_3:number;
    p2_enemy_4:number;
    p2_enemy_5:number;
    p2_enemy_6:number;
    p2_boss_7:number;
    p2_boss_8:number;
}

export enum ExcelTableNames {
    Level = "data/level_full",
    Enemy = "data/enemy_full",
    Weapon = "data/weapon_full",
    StartEnemy = "data/startem_full",
    Prop = "data/prop_full",
    WeaponUp = "data/weapon_up_full",
    BulletUp = "data/bullet_up_full",
    EnemyUp = "data/enemy_up_full",
    GoldUp = "data/gold_up_full",
}
