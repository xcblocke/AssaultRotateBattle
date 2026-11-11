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
import {ExcelTableNames} from "../config/ExcelTableNames";
import {ExcelConfig} from "../../../framework/config/ExcelConfig";

const {ccclass, property} = cc._decorator;

export interface TaskItemProxy {
    id:number;
    num:number;
    take:boolean;
}
export interface TaskProxy {
    list:Array<TaskItemProxy>;
    expireTime:number;
    box:boolean;
}

@ccclass
export default class Task {

    private static _taskItemsOfCurrentLv:Array<TaskItemProxy>;

    private static initCurrentLvData(){
        this._taskItemsOfCurrentLv = this._taskProxy.list.map(value => <TaskItemProxy>{id:value.id, num:0, take:false});
    }

    static  mergeCurrentLvData(){
        console.log("mergeCurrentLvData==>");
        console.log(this._taskItemsOfCurrentLv, "this._taskItemsOfCurrentLv");
        let update = false;
        this._taskItemsOfCurrentLv.forEach((value, index) => {
            let line = ExcelConfig.getExcelLine(ExcelTableNames.task, "id", value.id);
            if (value.num > 0 && this._taskProxy.list[index].num < line['num']){
                this._taskProxy.list[index].num += value.num;
                if (this._taskProxy.list[index].num >= line['num']){
                    this._taskProxy.list[index].num = line['num'];
                }
                update = true;
            }
        });
        if (update){
            this.write();
        }
    }

    static write(){
        World.Storage.task = JSON.stringify(this._taskProxy);
    }

    private static _taskProxy:TaskProxy;

    private static addNum(taskId:number, num:number){
        console.log("======>addNum", taskId, num);
        let find = this._taskItemsOfCurrentLv.find(value => value.id == taskId);
        if (find){
            find.num += num;
        }
        console.log(this._taskItemsOfCurrentLv, "----");
    }

    /** 任务只增不减 */

    /** 击碎靶子 */
    public static killEnemy(){
        this.addNum(1, 1);
    }

    /** 击碎幸运转盘 */
    public static killLuckyEnemy(){
        this.addNum(2, 1);
    }

    /** 触发疯狂模式 */
    public static triggerCrazy(){
        this.addNum(3, 1);
    }

    /** 打败Boss */
    public static killBoss(){
        this.addNum(4, 1);
    }

    /** 使用道具 */
    public static useTool(){
        this.addNum(5, 1);
    }


    public static init(){
        console.log("Task.initBullet===>");
        /** 初始每日任务表 */
        let task = <TaskProxy>JSON.parse(World.Storage.task);
        if (!task || !task.expireTime || task.expireTime <= World.My.serverTime){
            /** 更新任务 */
            task = <TaskProxy>{};
            /** 计算今天的时分秒 */
            let date = new Date(World.My.serverTime);
            console.log(`${date.getFullYear()}年${date.getMonth()}月${date.getDay()}日${date.getHours()}时${date.getMinutes()}分${date.getSeconds()}秒${date.getMilliseconds()}毫秒`);
            let cd = 24*60*60 - (date.getHours()*60*60 + date.getMinutes()*60 + date.getSeconds());
            let h = Math.floor(cd/3600);
            let m = Math.floor((cd-h*3600)/60);
            let s = cd%60;
            console.log(`${h}时${m}分${s}秒-----------`);
            task.expireTime = World.My.serverTime + cd*1000 - date.getMilliseconds();
            task.box = false;
            task.list = [];
            /** 随机三个任务 */
            let taskDatas = ExcelConfig.getExcelTable(ExcelTableNames.task).filter(value => value['type'] == 1);
            for (let i=0; i<3; i++){
                let index = Math.floor(Math.random()*100)%taskDatas.length;
                let item = taskDatas[index];
                console.log(index, item['id'], "=====");
                task.list.push({id:parseInt(item['id']), num:0, take:false});
                taskDatas.splice(index, 1);
            }
            World.Storage.task = JSON.stringify(task);
        }else if(task && !task.list) {
            this._taskProxy.list = [];
            for (let key in this._taskProxy){
                if (key != 'expireTime' && key != 'box' && key != 'list'){
                    let id = parseInt(key);
                    let num = this._taskProxy[key];
                    let line = ExcelConfig.getExcelLine(ExcelTableNames.task, "id", id);
                    if (line['num']){
                        let take = num >= line['num'];
                        this._taskProxy.list.push({id:id, num:num, take:take});
                    }
                }
            }
        }
        this._taskProxy = task;

        this.initCurrentLvData();
    }


    static get taskProxy(): TaskProxy {
        return this._taskProxy;
    }


    static get taskItemsOfCurrentLv(): Array<TaskItemProxy> {
        return this._taskItemsOfCurrentLv;
    }
}
