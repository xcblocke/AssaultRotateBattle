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
 * 使用TableView注意事项:
 * 1.设置mask 设置锚点(0, 1)  添加widget并设置top bottom left right都为0
 * 2.设置content 设置锚点(0, 1)  添加widget并设置top left right都为0
 * 3.设置itemNode  设置大小(w,h)　设置锚点(0, 0.5)
 * **/

import AbstractTableItem from "./AbstractTableItem";

const {ccclass, property,menu, requireComponent, disallowMultiple, executionOrder} = cc._decorator;

@ccclass
@menu("自定义/TableViewMediator")
@requireComponent(cc.ScrollView)
@disallowMultiple
@executionOrder(-10)
export default class TableViewMediator extends cc.Component {

    scrollView:cc.ScrollView = null;

    @property(AbstractTableItem)
    template:AbstractTableItem = null;

    @property({type:cc.Integer})
    marginTop = 0;

    @property({type:cc.Integer})
    marginBottom = 0;

    @property({type:cc.Integer})
    margin = 0;

    @property
    testNum = 0;

    @property
    itemAction:boolean = false;


    private itemHeight = 0;

    list:Array<cc.Node> = [];

    private firstIndex = 0;

    private firstIndexMax = 0;

    private _datas = [];
    // LIFE-CYCLE CALLBACKS:

    private createNodesFinish = false;

    private createNodesListener(listener:()=>void){
        if (this.createNodesFinish){
            listener();
        }else {
            this.node.on("CreateNodesSuccess", ()=>{
                listener();
            });
        }
    }

    get datas(): any[] {
        return this._datas;
    }

    set datas(value: any[]) {
        /** 计算最大firstIndexMax */
        this.createNodesListener(()=>{
            let num = Math.ceil((this.scrollView.node.getContentSize().height - this.marginTop - this.marginBottom + this.margin) / (this.itemHeight+this.margin));
            this.firstIndexMax = value.length - num - 1;
            // console.log(this.firstIndexMax,datas.length, this.list.length, num, "wxSub this.firstIndexMax************");

            this._datas = value.slice(0);
            // this.datas = [1,2,3,4,5,6,7,8,9];
            this.scrollView.content.height = this.marginTop + this.marginBottom + this.itemHeight * this._datas.length + this.margin * (this._datas.length - 1);
            this.firstIndex = 0;
            this.scrollView.scrollToTop();
            this.list.forEach((value1, index) => {
                value1.y = -this.marginTop - value1.height/2 - index * (value1.height + this.margin);
                if (index >= this._datas.length){
                    value1.active = false;
                }
            });
            this.updateData();
            if (this.itemAction){
                this.showAction();
            }
        });
    }

    private createNode(){
        let node = cc.instantiate(this.template.node);
        node.active = false;
        this.itemHeight = node.getContentSize().height;
        node.x = 0;
        node.setParent(this.scrollView.content);
        this.list.push(node);
        return node;
    }

    private addNode(height:number){
        if (height <= this.scrollView.node.getContentSize().height){
            this.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
                let node = this.createNode();
                node.y = -height - this.itemHeight/2;
                height += this.itemHeight + this.margin;
                this.addNode(height);
            })));
        }else {
            let node = this.createNode();
            node.y = -height - this.itemHeight/2;
            let eventHandler = new cc.Component.EventHandler();
            eventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
            eventHandler.component = "TableViewMediator";
            eventHandler.handler = "onScrollEvent";
            eventHandler.customEventData = "";
            this.scrollView.scrollEvents.push(eventHandler);
            if (!this.createNodesFinish){
                this.createNodesFinish = true;
                this.node.emit("CreateNodesSuccess");
            }
        }
    }

    onLoad(){
        this.scrollView = this.node.getComponent(cc.ScrollView);
        // let eventHandler = new cc.Component.EventHandler();
        // eventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
        // eventHandler.component = "TableViewMediator";
        // eventHandler.handler = "onScrollEvent";
        // eventHandler.customEventData = "";
        // this.scrollView.scrollEvents.push(eventHandler);
        // let itemNode = cc.instantiate(this.template.node);
        // itemNode.active = false;
        // this.itemHeight = itemNode.getContentSize().height;
        // let itemHeightHalf = this.itemHeight/2;
        // /** 计算出view能装下多少个item */
        // let viewSize = this.scrollView.node.getContentSize();
        // let content = this.scrollView.content;
        //
        // let height = this.marginTop;
        // while (true){
        //     if (height > viewSize.height){
        //         break;
        //     }
        //
        //     let node = cc.instantiate(itemNode);
        //     node.x = 0;
        //     node.y = -height - itemHeightHalf;
        //     node.setParent(content);
        //     this.list.push(node);
        //     height += this.itemHeight + this.margin;
        //     // console.log("wx sub===>node.y", node.y);
        // }
        //
        // itemNode.x = 0;
        // itemNode.y = -height - itemHeightHalf;
        // itemNode.setParent(content);
        // this.list.push(itemNode);
        this.addNode(this.marginTop);

        /** 延迟判断 */
        // let self = this;
        // this.scheduleOnce(function () {
        //     self._adjustList();
        // }, 0.1);
        if (this.testNum > 0){
            let test = [];
            for (let i=0; i<this.testNum; i++){
                test.push(i+1);
            }
            this.datas = test;
        }
    }

    _adjustList(){
        let viewSize = this.scrollView.node.getContentSize();
        let content = this.scrollView.content;
        let itemHeightHalf = this.itemHeight/2;
        let height = this.marginTop + (this.itemHeight + this.margin) * this.list.length  - this.margin;
        while (height < viewSize.height + this.itemHeight){
            let node = cc.instantiate(this.template.node);
            node.active = false;
            node.x = 0;
            node.y = -height - itemHeightHalf;
            node.setParent(content);
            this.list.push(node);
            height += this.itemHeight + this.margin;
            if (this._datas.length >= this.list.length){
                let index = this.list.length-1;
                let value =this.list[index];
                value.active = true;
                this.updateItem(value, index);
            }
        }
        if (this._datas.length > 0){
            let num = Math.ceil((viewSize.height - this.marginTop - this.marginBottom + this.margin) / (this.itemHeight+this.margin));
            this.firstIndexMax = this._datas.length - num - 1;
        }
    }

    updateData(){
        let arr = this.list.slice(0, Math.min(this._datas.length, this.list.length));
        this.updateItems(arr, 0);
    }

    showAction(){
        this.list.slice(0, Math.min(this._datas.length, this.list.length)).forEach((value, index) => {
            value.scaleX = 0;
            if (value.active){
                value.runAction(cc.scaleTo(0.3+(0.08*index), 1).easing(cc.easeCubicActionInOut()));
            } else {
                let comp = value.addComponent(cc.Component);
                comp['onEnable'] = ()=>{
                    value.runAction(cc.scaleTo(0.3+(0.08*index), 1).easing(cc.easeCubicActionInOut()));
                };
                comp['onDisable'] = ()=>{
                    comp.destroy();
                };
            }
        });
    }

    private updateItems(arr:Array<cc.Node>, index:number){
        if (index < arr.length){
            this.node.runAction(cc.sequence(cc.delayTime(0), cc.callFunc(()=>{
                let node = arr[index];
                node.active = true;
                this.updateItem(node, this.firstIndex+index);
                this.updateItems(arr, index+1);
            })));
        }
    }

    updateItem(node:cc.Node, index:number){
        let value = this._datas[index];
        let itemMediator = node.getComponent(AbstractTableItem);
        itemMediator.upadteItem(value, index);
    }

    private onScrollEvent(event){
        // console.log(event, "event");
        let content = this.scrollView.content;
        // let contentHeight = content.getContentSize().height;
        let viewHeight = this.scrollView.node.getContentSize().height;
        /*if ((!this.scrollView.isAutoScrolling() && !this.scrollView.isScrolling()) || content.y < 0 || content.y >= contentHeight - viewHeight){
            return;
        }*/
        let contentY = content.y;
        // console.log(contentY, "contentY");
        /** 判断第1个元素 和 倒数第1个元素的位置 */
        /** 上边界 */
        let itemHeightHalf = this.itemHeight/2;

        /** 头插入 */
        while(this.firstIndex > 0 && this.list[0].y + this.marginTop + itemHeightHalf < -contentY){
            let last = this.list.pop();
            last.y = this.list[0].y + this.itemHeight + this.margin;
            this.list.unshift(last);
            this.firstIndex--;
            // console.log("===========>尾移头");
            this.updateItem(last, this.firstIndex);
        }

        /** 尾插入 */
        while(this.firstIndex < this.firstIndexMax && this.list[this.list.length-1].y - itemHeightHalf - this.marginBottom > -contentY - viewHeight){
            let first = this.list.shift();
            first.y = this.list[this.list.length-1].y - this.itemHeight - this.margin;
            this.list.push(first);
            this.firstIndex++;
            // console.log("===========>头移尾", this.list[this.list.length-1].y);
            this.updateItem(first, this.firstIndex+this.list.length-1);
        }
    }
}
