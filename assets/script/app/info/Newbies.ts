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

export default class Newbies{
    constructor(map){
        this._map = map;
    }
    private _map:[string, number] = null;

    state(key:string):boolean{
        let val = this._map[key];
        return !!val;
    }

    finish(key:string){
        this._map[key] =  1;
        World.Storage.newbies = this.toJson();
    }

    toJson(){
        return JSON.stringify(this._map);
    }
}
