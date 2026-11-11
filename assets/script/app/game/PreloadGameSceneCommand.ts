// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ICommand} from "../../../framework/facade/ICommand";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";
import {wxApi} from "../../../framework/wxApi/wxApi";

const {ccclass, property} = cc._decorator;

@ccclass("PreloadGameSceneCommand")
export default class PreloadGameSceneCommand implements ICommand {

    async execute (...args):Promise{
        return new Promise(async(resolve, reject) => {
            Promise.all([
                cc.loader.loadResAwait("prefab/entities/enemy/enemy1", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy2", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy3", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy4", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy5", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy6", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy7", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/enemy/enemy8", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet1", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet1Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet2", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet2Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet3", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet3Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet4", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet4Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet5", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet5Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet6", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet6Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet7", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet7Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet8", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet8Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet9", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet9Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet10", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet10Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet108", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/bullet108Strike", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/fire7", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/explosive/explosive9", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/enemyBullet1", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/enemyBullet2", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/enemyBullet3", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet1", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet2", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet3", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet4", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet5", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/bullet/propBullet6", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop1", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop2", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop3", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop4", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop5", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop6", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop9", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop10", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop11", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop12", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/prop13", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/guns", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/propState", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/prop/takeProp", cc.Prefab),
                cc.loader.loadResAwait("prefab/entities/blood/blood", cc.Prefab),
                cc.loader.loadResAwait("prefab/roleSupply", cc.Prefab),
            ]).then(res=>{
                resolve();
            }).catch(err=>{
                reject(err);
            });
        });
    }


}
