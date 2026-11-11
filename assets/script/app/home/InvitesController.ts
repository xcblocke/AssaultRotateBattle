// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import TableViewMediator from "../../../framework/tableview/TableViewMediator";
import {NetworkConfig} from "../config/NetworkConfig";
import Network from "../network/Network";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InvitesController extends cc.Component {

    @property(TableViewMediator)
    tableviewMediator:TableViewMediator = null;


    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        if (NetworkConfig.connectServer){
            Network.getShareList("share1").then(list=>{
                console.log(list, "share1===>");
                this.tableviewMediator.datas = list;
            });
        }
    }

}
