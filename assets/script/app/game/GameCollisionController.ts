// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html


import LooseQuadTree from "../../quad-tree/LooseQuadTree";
import AABBRegion from "../../quad-tree/AABBRegion";
import EnemyAABB from "../entities/enemy/EnemyAABB";
import {GameProxy} from "./GameProxy";
import BulletOfEnemy from "../entities/bullet/BulletOfEnemy";
import PropBase from "../entities/prop/PropBase";

const {ccclass, property} = cc._decorator;

const math = cc.math;

let _vec2 = cc.v2();

function obbApplyMatrix (rect, mat4, out_bl, out_tl, out_tr, out_br) {
    var x = rect.x;
    var y = rect.y;
    var width = rect.width;
    var height = rect.height;

    var m00 = mat4.m0, m01 = mat4.m1, m04 = mat4.m4, m05 = mat4.m5;
    var m12 = mat4.m12, m13 = mat4.m13;

    var tx = m00 * x + m04 * y + m12;
    var ty = m01 * x + m05 * y + m13;
    var xa = m00 * width;
    var xb = m01 * width;
    var yc = m04 * height;
    var yd = m05 * height;

    out_tl.x = tx;
    out_tl.y = ty;
    out_tr.x = xa + tx;
    out_tr.y = xb + ty;
    out_bl.x = yc + tx;
    out_bl.y = yd + ty;
    out_br.x = xa + yc + tx;
    out_br.y = xb + yd + ty;
};

@ccclass
export default class GameCollisionController extends cc.Component {
    @property(cc.Node)
    enemyBulletLayer:cc.Node = null;

    @property(LooseQuadTree)
    looseQuadTree:LooseQuadTree = null;



    onLoad(){
        window['GameCollisionController'] = this;
    }

    static updateCollider (collider) {
        let offset = collider.offset;
        let world = collider.world;
        let aabb = world.aabb;

        let m = world.matrix;
        collider.node.getLocalMatrix(m);

        let preAabb = world.preAabb;
        preAabb.x = aabb.x;
        preAabb.y = aabb.y;
        preAabb.width = aabb.width;
        preAabb.height = aabb.height;

        if (collider instanceof cc.BoxCollider) {
            let size = collider.size;

            aabb.x = offset.x - size.width/2;
            aabb.y = offset.y - size.height/2;
            aabb.width = size.width;
            aabb.height = size.height;

            let wps = world.points;
            let wp0 = wps[0], wp1 = wps[1],
                wp2 = wps[2], wp3 = wps[3];
            obbApplyMatrix(aabb, m, wp0, wp1, wp2, wp3);

            let minx = Math.min(wp0.x, wp1.x, wp2.x, wp3.x);
            let miny = Math.min(wp0.y, wp1.y, wp2.y, wp3.y);
            let maxx = Math.max(wp0.x, wp1.x, wp2.x, wp3.x);
            let maxy = Math.max(wp0.y, wp1.y, wp2.y, wp3.y);

            aabb.x = minx;
            aabb.y = miny;
            aabb.width = maxx - minx;
            aabb.height = maxy - miny;
        }
        else if (collider instanceof cc.CircleCollider) {
            // calculate world position
            math.Vec2.transformMat4(_vec2, collider.offset, m);

            world.position.x = _vec2.x;
            world.position.y = _vec2.y;

            // calculate world radius
            let tempx = m.m12, tempy = m.m13;
            m.m12 = m.m13 = 0;

            _vec2.x = collider.radius;
            _vec2.y = 0;

            math.Vec2.transformMat4(_vec2, _vec2, m);
            let d = Math.sqrt(_vec2.x * _vec2.x + _vec2.y * _vec2.y);

            world.radius = d;

            aabb.x = world.position.x - d;
            aabb.y = world.position.y - d;
            aabb.width = d * 2;
            aabb.height = d * 2;

            m.m12 = tempx;
            m.m13 = tempy;
        }
        else if (collider instanceof cc.PolygonCollider) {
            let points = collider.points;
            let worldPoints = world.points;

            worldPoints.length = points.length;

            let minx = 1e6, miny = 1e6, maxx = -1e6, maxy = -1e6;
            for (let i = 0, l = points.length; i < l; i++) {
                if (!worldPoints[i]) {
                    worldPoints[i] = cc.v2();
                }

                _vec2.x = points[i].x + offset.x;
                _vec2.y = points[i].y + offset.y;

                math.Vec2.transformMat4(_vec2, _vec2, m);

                let x = _vec2.x;
                let y = _vec2.y;

                worldPoints[i].x = x;
                worldPoints[i].y = y;

                if (x > maxx) maxx = x;
                if (x < minx) minx = x;
                if (y > maxy) maxy = y;
                if (y < miny) miny = y;
            }

            aabb.x = minx;
            aabb.y = miny;
            aabb.width = maxx - minx;
            aabb.height = maxy - miny;
        }
    }

    private _updateColliders:Array<AABBRegion> = [];

    update(dt:number){
        if (GameProxy.pauseGame)return;
        this.looseQuadTree.updateAll();
        this._updateColliders.forEach(value => value.bUpdateCollider = false);
        this._updateColliders.length = 0;
        let gameBulletsController = window['GameBulletsController'];
        /** 与敌人的碰撞 */
        /** 子弹和其他爆炸物 */
        let enemyContacts = gameBulletsController.roleBullets;
        for (let enemyContact of enemyContacts){
            if (enemyContact.collider.enabled){
                GameCollisionController.updateCollider(enemyContact.collider);
                /** 获取可能发生碰撞的敌人 */
                let arr = [];
                this.looseQuadTree.retrieve(enemyContact.collider.world.aabb, arr);
                for (let aabbRegion of arr){
                    let enemy = (<EnemyAABB>aabbRegion).enemy;
                    if (!aabbRegion.bUpdateCollider){
                        GameCollisionController.updateCollider(enemy.spaceCircleCollider);
                        GameCollisionController.updateCollider(enemy.defenceBoxCollider);
                        aabbRegion.bUpdateCollider = true;
                        this._updateColliders.push(aabbRegion);
                    }
                    let bContact = false;
                    if (enemyContact.collider instanceof cc.CircleCollider){
                        bContact = cc.Intersection.polygonCircle(enemy.defenceBoxCollider.world.points, enemyContact.collider.world);
                    }else {
                        bContact = cc.Intersection.polygonPolygon(enemy.defenceBoxCollider.world.points, enemyContact.collider.world.points);
                    }
                    if (bContact){
                        // console.log("========>产生了碰撞..");
                        if (!enemyContact.contacts.includes(enemy)){
                            // console.log("=======>onCollisionEnter");
                            enemyContact.contacts.push(enemy);
                            enemyContact.onCollisionEnter(enemy.defenceBoxCollider, enemyContact.collider);
                            if(!enemyContact.bThrought)break;
                        }else {
                            // console.log("========>onCollisionStay");
                            enemyContact.onCollisionStay(enemy.defenceBoxCollider, enemyContact.collider);
                        }
                    }else {
                        let index = enemyContact.contacts.indexOf(enemy);
                        if (index >= 0){
                            enemyContact.contacts.splice(index, 1);
                            enemyContact.onCollisionExit(enemy.defenceBoxCollider, enemyContact.collider);
                        }
                    }
                }
            }
        }

        let gameRoleController = window['GameRoleController'];

        /** 与角色的碰撞 */
        let bRoleUpdateCollider = false;
        /** 敌人的子弹 */
        gameBulletsController.enemyBullets.forEach(bullet => {
            /** 先过滤掉一些比较远的 */
            if (bullet.node.position.sub(gameRoleController.role.node.position).mag() < Math.max(bullet.node.width, bullet.node.height) + gameRoleController.role.spaceCircleCollider.radius){
                /** 精密判断 */
                GameCollisionController.updateCollider(bullet.collider);
                if (!bRoleUpdateCollider){
                    GameCollisionController.updateCollider(gameRoleController.role.spaceCircleCollider);
                }
                /** 判断圆形与多边形的碰撞 */
                let bContact = false;
                if (bullet.collider instanceof cc.CircleCollider){
                    bContact = cc.Intersection.circleCircle(bullet.collider.world, gameRoleController.role.spaceCircleCollider.world);
                }else {
                    bContact = cc.Intersection.polygonCircle(bullet.collider.world.points, gameRoleController.role.spaceCircleCollider.world);
                }
                if (bContact){
                    // console.log("========>产生了碰撞..");
                    if (!bullet.contacts.includes(gameRoleController.role)){
                        // console.log("=======>onCollisionEnter");
                        bullet.contacts.push(gameRoleController.role);
                        bullet.onCollisionEnter(gameRoleController.role.spaceCircleCollider, bullet.collider);
                    }else {
                        // console.log("========>onCollisionStay");
                        bullet.onCollisionStay(gameRoleController.role.spaceCircleCollider, bullet.collider);
                    }
                }else {
                    let index = bullet.contacts.indexOf(gameRoleController.role);
                    if (index >= 0){
                        bullet.contacts.splice(index, 1);
                        bullet.onCollisionExit(gameRoleController.role.spaceCircleCollider, bullet.collider);
                    }
                }
            }
        });

        /** 道具 */
        window['GameEnemysController'].gameProps.forEach(prop => {
            if (!prop.on_off){
                let distance = prop.node.position.sub(gameRoleController.role.node.position).mag();
                if (GameProxy.magnetic && !prop.magnetic){
                    if (distance < 100){
                        prop.magnetic = true;
                    }
                }
                if (distance < Math.max(prop.node.width, prop.node.height) + gameRoleController.role.spaceCircleCollider.radius){
                    /** 精密判断 */
                    GameCollisionController.updateCollider(prop.collider);
                    if (!bRoleUpdateCollider){
                        GameCollisionController.updateCollider(gameRoleController.role.spaceCircleCollider);
                    }

                    /** 判断圆形与多边形的碰撞 */
                    let bContact = false;
                    if (prop.collider instanceof cc.CircleCollider){
                        bContact = cc.Intersection.circleCircle(prop.collider.world, gameRoleController.role.spaceCircleCollider.world);
                    }else {
                        bContact = cc.Intersection.polygonCircle(prop.collider.world.points, gameRoleController.role.spaceCircleCollider.world);
                    }
                    if (bContact){
                        // console.log("========>产生了碰撞..");
                        prop.trigger();
                    }
                }
            }
        });
    }

}
