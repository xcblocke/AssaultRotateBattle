// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
import Actions from "../actions/Actions";

let _isLandscape = false;
if (window.innerWidth > window.innerHeight){
    _isLandscape = true;
}

let _isIphoneX = false;
if (window.innerWidth < window.innerHeight){
    _isIphoneX = window.innerWidth/window.innerHeight == 1125/2436;
} else{
    _isIphoneX = window.innerWidth/window.innerHeight == 1125/2436;
}

export module ext{
    export function shuffle(aArr){
        let iLength = aArr.length,
            i = iLength,
            mTemp,
            iRandom;

        while(i--){
            if(i !== (iRandom = Math.floor(Math.random() * iLength))){
                mTemp = aArr[i];
                aArr[i] = aArr[iRandom];
                aArr[iRandom] = mTemp;
            }
        }

        return aArr;
    }

    export function randomElement(aArr:Array) {
        if (aArr.length == 0){
            return null;
        }
        let index = Math.floor(Math.random() * aArr.length);
        return aArr[index];
    }

    export function createObj(name:String, ...args) {
        let obj = cc.js.getClassByName(name);
        if (typeof obj == "undefined"){
            cc.error(`${name} not define @ccclass(${name})`);
        } else if (typeof obj == "function") {
            obj.prototype.constructor.apply(obj, ...args);
            return obj.prototype;
        }
        return null;
    }
    
    export function everyNode(root:cc.Node, f:(node)=>void) {
        f(root);
        root.children.forEach(value => everyNode(value, f));
    }

    export const isLandscape = _isLandscape;
    export const isIphoneX = _isIphoneX;


    export async function wxCreateImageToSprite(sprite,url):Promise{
        return new Promise((resolve, reject) => {
            let node = sprite.node;
            let size = {width:node.width , height:node.height};
            let image = wx.createImage();
            image.onload = function () {
                if (sprite && sprite.node && sprite.node.isValid){
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    sprite.spriteFrame = new cc.SpriteFrame(texture);
                    node.width = size.width;
                    node.height = size.height;
                    resolve();
                }
            };
            image.src = url;
        });
    }

    export function randomInteger(min:number, max:number) {
        let diff = max - min;
        return Math.floor(min + (Math.random()*diff*100)%(diff+1))
    }

    /** 修复引擎的bug，cc.RichText有时候设置了string后会导致不显示的问题 */
    export function showRichText(richText:cc.RichText) {
        richText.node.children.forEach(value => value.active = true);
    }

    /** 并行执行promise */
    export async function concurrentExecute(list:Array<Promise>) {
        for (let promise of list){
            await promise;
        }
    }

    /** 是否同一天 */
    export function isSameDay(date1:Date, date2:Date) {
        return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
    }


    /** 转换数字为k m b t*/
    export function shortFormat(num:number):string {
        let result = "";
        let t = 1000 * 1000 * 1000 * 1000;
        let b = 1000 * 1000 * 1000;
        let m = 1000 * 1000;
        let k = 1000;
        if (num >= t){
            result = Math.floor(num/t*10)/10 + "T";
        } else if (num >= b){
            result = Math.floor((num/b)*10)/10 + "B";
        }else if (num >= m){
            result = Math.floor((num/m)*10)/10 + "M";
        }else if (num >= k){
            result = Math.floor((num/k)*10)/10 + "K";
        }else {
            result = Math.floor(num).toString();
        }
        return result;
    }

    export function moveSkeleton(ske:sp.Skeleton, srcY:number, realY:number, deayTime:number, moveTime:number, boneName:string, boneY:number) {
        let subY = realY - srcY;
        let speed = subY/moveTime;
        // console.log("===>srcY="+srcY, "realY="+realY, "subY="+subY, "speed="+speed, "y="+ske.findBone(boneName).y);
        ske.findBone(boneName).y = boneY;
        ske.node.runAction(cc.sequence(cc.delayTime(deayTime), cc.callFunc(()=>{
            let moveY = 0;
            let action = Actions.update((dt:number)=>{
                let moveLen = dt*speed;
                // console.log("移动骨骼y", moveLen, dt, speed, moveY, subY);
                if (Math.abs(moveY + moveLen) >= Math.abs(subY)){
                    ske.findBone(boneName).y += subY - moveY;
                    ske.node.stopActionByTag(10020)
                }else {
                    ske.findBone(boneName).y += moveLen;
                }
                moveY += moveLen;
            });
            action.setTag(10020);
            ske.node.runAction(action);
        })));
    }
}









