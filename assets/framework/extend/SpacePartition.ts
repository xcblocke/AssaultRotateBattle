// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpacePartition  {

    static randomSpace(partitions:Array<cc.Rect>, width:number, height:number):cc.Rect{
        let arr = partitions.filter(value => value.width > width && value.height > height);
        if (arr.length === 0)return null;
        let index = Math.floor(Math.random() * arr.length)%arr.length;
        let partition = arr[index];
        let x = partition.xMin + Math.random()*(partition.width - width);
        let y = partition.yMin + Math.random()*(partition.height - height);

        let result = cc.rect(x, y, width, height);

        /** 跟它相交的要重新划分 */
        this.partitionRect(partitions, result);

        return result;
    }

    static randomSpaces(partitions:Array<cc.Rect>, width:number, height:number, count:number):Array<cc.Rect>{
        let result = [];
        for (let i = 0; i < count; i++){
            let rect = this.randomSpace(partitions, width, height);
            if (rect){
                result.push(rect);
            } else {
                break;
            }
        }
        return result;
    }

    static partitionRect(out:Array<cc.Rect>, rect:cc.Rect, minWidth:number = 0, minHeight:number = 0){
        let list = out.splice(0);
        list.forEach(value => {
            let intersection = new cc.Rect();
            value.intersection(intersection, rect);
            if (intersection.width > 0 && intersection.height > 0){
                SpacePartition.partitionRects(out, value, [rect], minWidth, minHeight);
            }else {
                out.push(value);
            }
        });
    }

    /** 根据相交拆分矩形 */
    private static partitionRects(out:Array<cc.Rect>, rect:cc.Rect, intersects:Array<cc.Rect>, minWidth:number, minHeight:number){
        if (rect.width < minWidth || rect.height < minHeight){
            return;
        }
        if (intersects.length == 0){
            //干净的空间
            out.push(rect);
            return;
        }
        let cutRect = intersects.pop();
        //左
        if (rect.xMin < cutRect.xMin){
            let leftRect = cc.rect(rect.xMin, rect.yMin, cutRect.xMin - rect.xMin, rect.height);
            this.partitionRects(out, leftRect, intersects.filter(value => {
                let intersection = new cc.Rect();
                value.intersection(intersection, leftRect);
                return intersection.width > 0 && intersection.height > 0;
            }), minWidth, minHeight)
        }
        //右
        if (rect.xMax > cutRect.xMax){
            let rightRect = cc.rect(cutRect.xMax, rect.yMin, rect.xMax - cutRect.xMax, rect.height);
            this.partitionRects(out, rightRect, intersects.filter(value => {
                let intersection = new cc.Rect();
                value.intersection(intersection, rightRect);
                return intersection.width > 0 && intersection.height > 0;
            }), minWidth, minHeight)
        }

        //上
        if (rect.yMax > cutRect.yMax){
            let upRect = cc.rect(rect.xMin, cutRect.yMax, rect.width, rect.yMax - cutRect.yMax);
            this.partitionRects(out, upRect, intersects.filter(value => {
                let intersection = new cc.Rect();
                value.intersection(intersection, upRect);
                return intersection.width > 0 && intersection.height > 0;
            }), minWidth, minHeight)
        }

        //下
        if (rect.yMin < cutRect.yMin){
            let downRect = cc.rect(rect.xMin, rect.yMin, rect.width, cutRect.yMin - rect.yMin);
            this.partitionRects(out, downRect, intersects.filter(value => {
                let intersection = new cc.Rect();
                value.intersection(intersection, downRect);
                return intersection.width > 0 && intersection.height > 0;
            }), minWidth, minHeight)
        }
    }
}
