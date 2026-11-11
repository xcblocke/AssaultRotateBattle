// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Collider.prototype.onLoad = function () {
    // console.log("cc.Collider.onLoad");
    cc.director.getCollisionManager().initCollider(this);
};

cc.Collider.prototype.onDisable = function () {
    // console.log("cc.Collider.onDisable");
};

cc.Collider.prototype.onEnable = function () {
    // console.log("cc.Collider.onEnable");
};