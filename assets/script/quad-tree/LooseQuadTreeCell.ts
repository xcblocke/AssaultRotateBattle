// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import AABBRegion from "./AABBRegion";
import LooseQuadTree from "./LooseQuadTree";


export default class LooseQuadTreeCell {

    constructor(level:number, index:number, bounds:cc.Rect, children:Array<LooseQuadTreeCell>){
        this.level = level;
        this.index = index;
        this.bounds = bounds;
        this.looseBounds = cc.rect(bounds.xMin-bounds.width/2, bounds.yMin-bounds.height/2, bounds.width*2, bounds.height*2);
        this.children = children;
        this.children.forEach(value => value.parent = this);
    }

    level = 0;
    index = 0;
    bounds:cc.Rect = null;
    looseBounds:cc.Rect = null;
    parent:LooseQuadTreeCell = null;
    /** 这里是根据索引来访问的，所以不能链表结构 */
    children:Array<LooseQuadTreeCell> = null;
    /** 这里可优化成链表，移除方便 */
    private _objects:Array<AABBRegion> = [];

    /** 子节点对象的数量 */
    private _objectCount = 0;


    get objectCount(): number {
        return this._objectCount;
    }

    get objects(): Array<AABBRegion> {
        return this._objects;
    }

    removeObject(region:AABBRegion){
        let index = this._objects.indexOf(region);
        if (index < 0){
            console.error("remove not found cell==> level="+region.level+" index="+region.index);
            return;
        }
        this._objects.splice(index, 1);
        region.index = -1;
        region.level = -1;
        let cell = this;
        while (cell){
            cell._objectCount--;
            cell = cell.parent;
        }
    }


    addObject(region:AABBRegion){
        this._objects.push(region);
        region.index = this.index;
        region.level = this.level;
        let cell = this;
        while (cell){
            cell._objectCount++;
            cell = cell.parent;
        }
    }

    retrieve(rect:cc.Rect, out:Array<AABBRegion>){
        //从根结点往下找
        if (this._objectCount > 0 && this.looseBounds.intersects(rect)){
            LooseQuadTree.retrieveCount++;
            if (this._objects.length > 0){
                out.push(...this._objects);
            }
            this.children.forEach(value => {
                if (value._objectCount > 0){
                    value.retrieve(rect, out);
                }
            });
        }
    }
}
