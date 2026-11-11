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

export default class PropInfo{
    constructor(map){
        this._map = map;
    }

    private _map:Map<number, number> = null;

    /** 过期时间 */
    expireTime(id:number){
        return this._map[id];
    }

    /** 是否在使用中 */
    beUsing(id:number):boolean{
       return this._map[id] && this._map[id] > new Date().getTime();
    }

    /** 使用 */
    use(id:number){
        this._map[id] = new Date().getTime() + 60*60*1000;
        World.Storage.props = this.toJson();
    }

    toJson(){
        return JSON.stringify(this._map);
    }
}
