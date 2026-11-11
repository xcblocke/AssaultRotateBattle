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
export default class FirstAidController extends cc.Component {

    /*@property(cc.SpriteFrame)
    gunSpriteFrames:[cc.SpriteFrame] = [];

    @property(cc.Sprite)
    gunSprite:cc.Sprite = null;

    @property(cc.Label)
    bulletLabel:cc.Label = null;

    @property(cc.ProgressBar)
    progressBar:cc.ProgressBar = null;

    @property(cc.Button)
    button:cc.Button = null;

    @property(BannerComponent)
    bannerComp:BannerComponent = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private maxClick = 7;

    private clickNum = 0;


    private _curTime = 80;

    get curTime(): number {
        return this._curTime;
    }

    set curTime(value: number) {
        if (value >= this.maxTime){
            value = this.maxTime;
            this.showBanner();
        }else if (value < 0){
            value = 0;
        }
        this._curTime = value;
        this.updateProgress();
    }

    private maxTime = 100;

    private updateProgress(){
        this.progressBar.progress = this._curTime / this.maxTime;
    }

    onEnable () {
        this.bannerComp.enabled = false;
        GameProxy.pauseGame = true;
        this.node.stopAllActions();
        let weaponConfig = ExcelConfig.getExcelTable(ExcelTableNames.Weapon).filter(value => value['id'] != 1).sort(((a, b) => b['unlock'] - a['unlock']));
        for (let item of weaponConfig){
            if (GameProxy.level >= item['unlock']){
                this.gunSprite.spriteFrame = this.gunSpriteFrames[item['id'] - 1];
                this.bulletLabel.string = `子弹 ${World.My.armory.payloadAddOf(item['id']) * 3}x3`;
                break;
            }
        }
        this.updateProgress();
    }

    onClickButton(event, data){
        if (!this.bannerComp.enabled){
            this.clickNum++;
            this.curTime += 10;
            if (this.clickNum == this.maxClick){
                this.showBanner();
            }
        }else {
            this.node.active = false;
            GameProxy.pauseGame = false;
            GameProxy.emit(GameProxy.Event.ReliveGame);
            GameProxy.firstAidFlag = false;
        }
    }

    showBanner(){
        this.progressBar.node.active = false;
        this.button.node.y += 250;
        this.bannerComp.enabled = true;
    }

    update(dt:number){
        if (this.progressBar.node.active){
            this.curTime -= 0.3;
        }
    }*/
}
