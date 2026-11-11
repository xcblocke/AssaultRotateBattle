// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

/** 公式模块 */
export module Formula {
    /** 金币 */
    export class Gold {
        /** 金币价值 */
        public static goldCost(lv:number, maxLv:number,　cost:number):number{
            if (lv > maxLv){
                return cost + (lv - maxLv);
            } else {
                return cost;
            }
        }

        /** 日常收益 */
        public static dayGet(lv:number):number{
            return Math.floor(lv * 1.8);
        }

        /** 升级消耗 */
        public static upgradeCost(lv:number):number{
            return lv * 120;
        }
    }

}
