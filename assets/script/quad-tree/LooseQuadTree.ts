// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import LooseQuadTreeCell from "./LooseQuadTreeCell";
import AABBRegion from "./AABBRegion";

const {ccclass, property} = cc._decorator;

/** 松散四叉树的主要思想：
 *  可以考虑到在相交测试中，扩大包围盒总是保守的（这里的保守是指近似化不会做成错误结果）。如果把四叉／八叉树的正方／立方空间当作包围盒，那么扩大这些包围盒以容纳刚好在边界上相交的物体也是保守的
 *  1.将cell的区域放大一倍，保证分层后，每个物体必定被某个cell包含
 *  2.松散后，碰撞判断也是根节点往往下，判断testRect与cell的相交，如果相交则判断与其子节点相交的判断，否则就过滤掉其cell。
 *  3.放大测试区域不会有错误的结果，同时也解决了在特殊位置上的物体被放到父节点的问题。
 * **/
/** 以节点中心为正中心，以节点最大宽高为边长 */

@ccclass
export default class LooseQuadTree extends cc.Component {

    @property({tooltip: "最小物体边长"})
    minSideLength = 10;

    /** 按层划分cell，放到不同的网格中 */
    private _grids: Array<Array<LooseQuadTreeCell>> = [];

    /** 计算总层数，构造每一次的网格Grid，提前构造网络，虽然内存消耗大，但不用运行时动态创建和销毁cell，提高运行效率。 */
    private init() {
        /** 构造世界矩形 */
        let maxSide = Math.max(this.node.width, this.node.height);
        /** 计算层数 */
        let maxLevel = Math.ceil(Math.log2(maxSide / this.minSideLength));
        /** 构建所有网格 */
        let minX = -maxSide / 2;
        let maxY = maxSide/2;
        /** 有maxLevel层 */
        let sideCount = Math.pow(2, maxLevel);
        for (let i = maxLevel-1; i >= 0; i--) {
            this._grids[i] = [];
            sideCount = sideCount/2;
            let cellLength = maxSide / sideCount;
            /** 构建每一层的网格 */
            for (let r = 0; r < sideCount; r++) {
                for (let c = 0; c < sideCount; c++) {
                    let rect = cc.rect(minX + cellLength * c, maxY - (r+1) * cellLength, cellLength, cellLength);
                    let quads = [];
                    /** 构建四元子树 */
                    if (i < maxLevel-1){
                        /** 取两行两列 */
                        let nextSideCount = sideCount*2;
                        for (let j=0; j<2; j++){
                            for (let k=0; k<2; k++){
                                quads.push(this._grids[i+1][(r*2+j)*nextSideCount + c*2+k]);
                            }
                        }
                    }
                    let index = r * sideCount + c;
                    this._grids[i][index] = new LooseQuadTreeCell(i, index, rect, quads);
                }
            }
        }
    }

    private updateCell(cell:LooseQuadTreeCell){
        if (cell.objectCount > 0){
            cell.objects.forEach(value => this.updateRegion(value));
            cell.children.forEach(value => {
                if (value.objectCount > 0){
                    this.updateCell(value);
                }
            });
        }
    }

    /** 更新所有元素 */
    updateAll(){
        this.updateCell(this._grids[0][0]);
    }

    /** 指定更新某一个元素 */
    updateRegion(region:AABBRegion):boolean{
        if (region.level < 0 || region.index < 0){
            console.error("remove fail==>level="+region.level+" index="+region.index);
            return false;
        }
        let rect = region.aabb();
        let root = this._grids[0][0];
        let level = region.level;
        //重新计算index
        let cellLength = this._grids[level][0].bounds.width;
        let sideCount = Math.pow(2, level);
        let col = Math.floor((rect.center.x - root.bounds.xMin) / cellLength);
        let row = Math.floor((root.bounds.yMax - rect.center.y) / cellLength);
        let index = row * sideCount + col;
        // console.log(index, region.index, index === region.index);
        if (index != region.index){
            this._grids[region.level][region.index].removeObject(region);
            let cell = this._grids[level][index];
            cell.addObject(region);
        }
        return true;
    }

    insert(region:AABBRegion):boolean{
        if (region.index >= 0 || region.level >= 0){
            console.error("已经分配空间level="+region.level+" index="+region.index);
            return false;
        }
        let rect = region.aabb();
        let maxSide = Math.max(rect.width, rect.height);
        let root = this._grids[0][0];
        let rootSide = root.bounds.width;
        if (maxSide > rootSide){
            console.error("region rect too big, can not insert it");
            return null;
        }
        let level = Math.floor(Math.log2(rootSide/maxSide));
        if (level > this._grids.length - 1){
            level = this._grids.length - 1;
            console.warn('Maybe this item is too small, but we can add it to max level.', rootSide, maxSide, level, this._grids.length, region.node.name);
        }

        let cellLength = this._grids[level][0].bounds.width;
        let sideCount = Math.pow(2, level);
        let col = Math.floor((rect.center.x - root.bounds.xMin) / cellLength);
        let row = Math.floor((root.bounds.yMax - rect.center.y) / cellLength);
        let index = row * sideCount + col;
        // console.log("level="+level+" index="+index);
        let cell = this._grids[level][index];
        cell.addObject(region);
        // this._graphic.rect(rect.xMin, rect.yMin, rect.width, rect.height);
        // this._graphic.stroke();
        return true;
    }

    remove(region:AABBRegion):boolean{
        if (region.level < 0 || region.index < 0){
            console.error("remove fail==>level="+region.level+" index="+region.index);
            return false;
        }
        this._grids[region.level][region.index].removeObject(region);
        return true;
    }


    retrieve(rect:cc.Rect, out:Array<AABBRegion>){
        LooseQuadTree.retrieveCount = 0;
        this._grids[0][0].retrieve(rect, out);
        // console.log("LooseQuadTree==>", LooseQuadTree.retrieveCount, out);
    }


    _graphic:cc.Graphics = null;

    static retrieveCount = 0;
    test(rect:cc.Rect){
        let graphic = this._graphic;
        graphic.clear();

        let arr = [];
        this.retrieve(rect, arr);

        arr.forEach(value => {
            let aabb = value.aabb();
            graphic.rect(aabb.xMin, aabb.yMin, aabb.width, aabb.height);
        });
        graphic.stroke();
    }



    onLoad(){
        this.init();
        // console.log(this._grids);
        let node = new cc.Node();
        this.node.addChild(node);
        let graphic = node.addComponent(cc.Graphics);
        graphic.strokeColor = cc.Color.RED;
        graphic.lineWidth = 20;
        // this._grids.forEach(value => {
        //     value.forEach(value1 => {
        //         graphic.rect(value1.looseBounds.xMin, value1.looseBounds.yMin, value1.looseBounds.width, value1.looseBounds.height);
        //     });
        // });
        // graphic.stroke();

        // graphic.fill();
        node.zIndex = 100;
        this._graphic = graphic;
    }
}
