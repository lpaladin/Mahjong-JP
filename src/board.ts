/// <reference path="tile.ts" />

// 手牌（以及最新摸到的一张牌）
class Deck extends THREE.Group {
    public static readonly GAP = 0.1;
    public static readonly DRAWN_TILE_GAP = Tile.WIDTH / 2;

    public readonly handTiles: Tile[] = [];
    public drawnTile: Tile;

    public set open(to: boolean) {
        for (const t of [...this.handTiles, this.drawnTile])
            if (t) {
                t.open = to;
            }
    }

    public get fullLength() {
        return (
            this.handTiles.length * Tile.WIDTH +
            (this.handTiles.length - 1) * Deck.GAP
        );
    }

    public getTilePosition(idx: number) {
        return idx < 0
            ? this.fullLength + Deck.DRAWN_TILE_GAP
            : idx * (Tile.WIDTH + Deck.GAP);
    }

    public constructor(public readonly player: Player) {
        super();
        for (let i = 0; i < 13; i++) {
            const t = new Tile(Util.RandInArray(Mahjong.TileIDs), i);
            t.position.x = this.getTilePosition(i);
            t.visible = true;
            this.handTiles.push(t);
            this.add(t);
        }
    }

    public sort() {
        const tl = new TimelineMax();
        if (this.drawnTile) {
            this.handTiles.push(this.drawnTile);
            this.drawnTile = null;
        }
        Mahjong.sortTiles(this.handTiles, t => t.tileID).forEach((t, i) => {
            tl.fromTo(
                t.position,
                0.2,
                { x: t.position.x },
                { x: this.getTilePosition(i), immediateRender: false },
                0
            );
            t.idx = i;
        });
        return tl;
    }

    public drawTile(tileID: Mahjong.TileID) {
        const t = new Tile(tileID, -1);
        t.position.x = this.getTilePosition(-1);
        t.open = this.open;
        this.drawnTile = t;
        this.add(t);
        const tl = new TimelineMax();
        tl.add(Util.MeshOpacityFromTo(t, 0.2, 0, 1));
        tl.add(
            Util.BiDirectionConstantSet(
                game.centerScreen,
                "tileLeft",
                --Tile.tileLeft
            )
        );
        if (!game.playerMe || game.playerMe.board.deck == this) {
            tl.call(
                () =>
                    Util.Log`${game.playerMe.info}摸到了一张${Mahjong.tileInfo[tileID].chnName}`
            );
        } else {
            tl.call(() => Util.Log`${game.playerMe.info}摸了一张牌`);
        }
        return tl;
    }

    public removeTile(tile: Tile) {
        if (tile == this.drawnTile) this.drawnTile = null;
        else this.handTiles.splice(this.handTiles.findIndex(t => t == tile), 1);
        const tl = this.sort();
        tl.add(Util.BiDirectionConstantSet(tile, "visible", false), 0);
        return tl;
    }
}

class River extends THREE.Group {
    public static readonly GAP = 0.1;
    public static readonly BEGIN_HEIGHT = 8;
    public static readonly LINE_SIZE = 6;

    public readonly riverTiles: Tile[] = [];

    public static readonly BEGIN_X =
        (-(River.LINE_SIZE - 1) / 2) * (Tile.WIDTH + River.GAP);
    private nextXOffset = 0;

    public constructor(public readonly player: Player) {
        super();
    }

    public getLatestTileTargetPos() {
        return {
            x: this.nextXOffset + River.BEGIN_X,
            y: -(Tile.HEIGHT - Tile.DEPTH) / 2,
            z:
                Math.floor((this.riverTiles.length - 1) / River.LINE_SIZE) *
                (Tile.HEIGHT + River.GAP)
        };
    }

    public addTile(tile: Tile) {
        const tl = new TimelineMax();
        Util.Assert`牌来自手牌：${tile.parent instanceof Deck}`;
        tl.add((tile.parent as Deck).removeTile(tile), 0);
        const newTile = new Tile(tile.tileID, this.riverTiles.length);
        newTile.open = true;
        this.add(newTile);
        this.riverTiles.push(newTile);
        const targetPos = this.getLatestTileTargetPos();
        tl.add(Util.MeshOpacityFromTo(newTile, 0.2, 0, 1));
        targetPos.y += Tile.DEPTH;
        tl.fromTo(
            newTile.position,
            0.2,
            {
                x: targetPos.x,
                y: Tile.DEPTH * 4,
                z: targetPos.z + Tile.HEIGHT
            },
            { ...targetPos, immediateRender: false },
            "-=0.2"
        );
        tl.fromTo(
            newTile.rotation,
            0.2,
            { x: 0 },
            { x: -Util.RAD90, immediateRender: false },
            "-=0.2"
        );
        tl.add(Util.BiDirectionConstantSet(newTile, "shaking", true));
        return tl;
    }

    public removeLatestTile() {
        const tl = new TimelineMax();
        const latestTile = this.riverTiles.pop();
        tl.add(Util.BiDirectionConstantSet(latestTile, "shaking", false));
        tl.add(Util.MeshOpacityFromTo(latestTile, 0.1, 1, 0));
        return tl;
    }

    public finalizeLatestTile() {
        const tl = new TimelineMax();
        const latestTile = this.riverTiles[this.riverTiles.length - 1];
        const targetPos = this.getLatestTileTargetPos();
        tl.add(Util.BiDirectionConstantSet(latestTile, "shaking", false));
        if (this.player.puttingLizhiTile) {
            this.player.puttingLizhiTile = false;
            tl.fromTo(
                latestTile.rotation,
                0.45,
                { z: 0 },
                { z: Util.RAD90 * 5 }
            );
            tl.fromTo(
                latestTile.position,
                0.15,
                { y: targetPos.y + Tile.DEPTH },
                {
                    y: targetPos.y + Tile.DEPTH * 4,
                    immediateRender: false,
                    ease: Expo.easeOut
                },
                "-=0.45"
            );
            tl.fromTo(
                latestTile.position,
                0.3,
                { y: targetPos.y + Tile.DEPTH * 4 },
                {
                    y: targetPos.y,
                    x: targetPos.x + (Tile.HEIGHT - Tile.WIDTH) / 2,
                    immediateRender: false,
                    ease: Expo.easeIn
                }
            );
            tl.call(game.cameraShake, [0.5, 6, 0.2], game);
            tl.add(game.centerScreen.putLizhiStick(this.player.playerID));
            this.nextXOffset =
                this.riverTiles.length % River.LINE_SIZE
                    ? this.nextXOffset + Tile.HEIGHT
                    : 0;
        } else {
            tl.fromTo(
                latestTile.position,
                0.1,
                { y: targetPos.y + Tile.DEPTH },
                { y: targetPos.y, immediateRender: false }
            );
            this.nextXOffset =
                this.riverTiles.length % River.LINE_SIZE
                    ? this.nextXOffset + Tile.WIDTH
                    : 0;
        }
        return tl;
    }
}

type OpenTileType = "CHI" | "PENG" | "ANGANG" | "DAMINGGANG";

interface OpenTileStack {
    tiles: Tile[];
    type: OpenTileType | "BUGANG";
    newTile: Tile;
}

class OpenTiles extends THREE.Group {
    public static readonly GAP = 0.1;

    public readonly openStacks: OpenTileStack[] = [];
    private leftBound = 0;

    public addGang(newTileID: Mahjong.TileID) {
        for (const s of this.openStacks) {
            if (s.type == "PENG" && s.newTile.tileID == newTileID) {
                const tl = new TimelineMax();
                const newTile = new Tile(newTileID, -1);
                newTile.position.x = s.newTile.position.x;
                newTile.position.y = s.newTile.position.y;
                newTile.rotation.copy(s.newTile.rotation);
                this.add(newTile);
                const z = s.newTile.position.z - Tile.WIDTH;
                tl.fromTo(
                    newTile.position,
                    0.2,
                    { z: z - Tile.WIDTH },
                    { z, immediateRender: false },
                    0
                );
                tl.add(Util.MeshOpacityFromTo(newTile, 0.2, 0, 1), 0);
                s.tiles.push(s.newTile);
                s.newTile = newTile;
                s.type = "BUGANG";
                return;
            }
        }
        Util.Assert`找不到可以补杠的牌(${false})`;
    }

    public addStack(
        type: OpenTileType,
        existingTilesID: Mahjong.TileID[],
        newTileID: Mahjong.TileID = null,
        fromPlayerRelative = 0
    ) {
        const tl = new TimelineMax();
        let tiles = existingTilesID.map(t => new Tile(t, -1));
        if (type == "ANGANG") {
            Util.Assert`暗杠需要4张牌，且无新牌：${existingTilesID.length ==
                4 && !newTileID}`;
            for (let i = tiles.length - 1; i >= 0; i--) {
                const x = this.leftBound - Tile.WIDTH / 2;
                tl.fromTo(
                    tiles[i].position,
                    0.2,
                    { x: x - 1 },
                    { x, immediateRender: false },
                    0
                );
                tl.add(Util.MeshOpacityFromTo(tiles[i], 0.2, 0, 1), 0);
                this.leftBound -= Tile.WIDTH;
                tiles[i].rotation.x =
                    i == 3 || i == 0 ? Util.RAD90 : -Util.RAD90;
            }
            this.openStacks.push({ type, tiles, newTile: null });
            this.add(...tiles);
        } else {
            const newTile = new Tile(newTileID, -1);
            const targetTilePos =
                type == "DAMINGGANG" && fromPlayerRelative == 1
                    ? 3
                    : fromPlayerRelative + 1;
            tiles.splice(targetTilePos, 0, newTile);
            for (let i = tiles.length - 1; i >= 0; i--) {
                let x: number;
                if (i == targetTilePos) {
                    // 是要横过来的牌
                    x = this.leftBound - Tile.HEIGHT / 2;
                    tiles[i].position.z = (Tile.HEIGHT - Tile.WIDTH) / 2;
                    this.leftBound -= Tile.HEIGHT;
                    tiles[i].rotation.set(-Util.RAD90, 0, Util.RAD90);
                } else {
                    x = this.leftBound - Tile.WIDTH / 2;
                    this.leftBound -= Tile.WIDTH;
                    tiles[i].rotation.x = -Util.RAD90;
                }
                tl.fromTo(
                    tiles[i].position,
                    0.2,
                    { x: x - 1 },
                    { x, immediateRender: false },
                    0
                );
                tl.add(Util.MeshOpacityFromTo(tiles[i], 0.2, 0, 1), 0);
            }
            this.openStacks.push({
                type,
                tiles,
                newTile
            });
            this.add(...tiles, newTile);
        }
        this.leftBound -= Tile.WIDTH / 4;
        return tl;
    }
}

class PlayerArea extends THREE.Group {
    public static readonly HEIGHT = 28;
    public static readonly BOARD_GAP = 0.5;
    public hoveredTile: Tile;
    public readonly deck = new Deck(this.player);
    public readonly background = new THREE.Mesh(
        Assets.GetBoardGeometry(),
        new THREE.MeshLambertMaterial({ color: Colors.TileBackColor })
    );
    public readonly river = new River(this.player);
    public readonly openTiles = new OpenTiles();
    public readonly playerUIAnchor = new THREE.Object3D();
    public readonly shoutBeginAnchor = new THREE.Object3D();
    public readonly shoutEndAnchor = new THREE.Object3D();

    private _openDeck = false;

    public get openDeck() {
        return this._openDeck;
    }

    public set openDeck(to: boolean) {
        if (this._openDeck != to) {
            this._openDeck = to;
            this.deck.open = to;
            TweenMax.to(this.deck.position, 0.1, {
                z:
                    PlayerArea.HEIGHT +
                    PlayerArea.BOARD_GAP -
                    (to ? Tile.HEIGHT - Tile.DEPTH : 0),
                y: to ? -(Tile.HEIGHT - Tile.DEPTH) / 2 : 0
            });
        }
    }

    public constructor(public readonly player: Player) {
        super();
        this.background.position.set(0, -Tile.HEIGHT / 2, PlayerArea.BOARD_GAP);
        this.background.receiveShadow = true;
        this.add(this.background);
        this.deck.position.set(
            -this.deck.fullLength / 2 - Tile.WIDTH,
            0,
            PlayerArea.HEIGHT + PlayerArea.BOARD_GAP
        );
        this.add(this.deck);
        this.river.position.set(
            0,
            0,
            River.BEGIN_HEIGHT + Tile.HEIGHT / 2 + PlayerArea.BOARD_GAP
        );
        this.add(this.river);
        this.openTiles.position.set(
            PlayerArea.HEIGHT + Tile.WIDTH,
            (Tile.DEPTH - Tile.HEIGHT) / 2,
            PlayerArea.HEIGHT + PlayerArea.BOARD_GAP
        );
        this.add(this.openTiles);
        this.playerUIAnchor.position.set(
            0,
            PlayerUI.PLAYERUI_ANCHOR_POSY,
            PlayerArea.HEIGHT + PlayerArea.BOARD_GAP
        );
        this.add(this.playerUIAnchor);
        this.shoutBeginAnchor.position.set(
            0,
            PlayerUI.PLAYERUI_ANCHOR_POSY,
            PlayerArea.HEIGHT +
                PlayerArea.BOARD_GAP +
                PlayerShout.ANCHOR_BEGIN_POSZ
        );
        this.add(this.shoutBeginAnchor);
        this.shoutEndAnchor.position.set(
            0,
            PlayerUI.PLAYERUI_ANCHOR_POSY,
            PlayerArea.HEIGHT +
                PlayerArea.BOARD_GAP +
                PlayerShout.ANCHOR_END_POSZ
        );
        this.add(this.shoutEndAnchor);
        const l = new THREE.DirectionalLight(Colors.White, 0.5);
        l.position.set(
            0,
            0,
            PlayerArea.HEIGHT + Tile.DEPTH * 2 + PlayerArea.BOARD_GAP
        );
        this.add(l);
        this.rotateY(player.playerID * Util.RAD90);
    }

    public onTick() {
        if (this.player.interactable) {
            let intersections = game.raycaster.intersectObjects(
                this.deck.handTiles,
                false
            );
            let tile =
                intersections.length > 0 &&
                intersections[0].object instanceof Tile &&
                intersections[0].object;
            if (!tile && this.deck.drawnTile) {
                intersections = game.raycaster.intersectObject(
                    this.deck.drawnTile,
                    false
                );
                tile =
                    intersections.length > 0 &&
                    intersections[0].object instanceof Tile &&
                    intersections[0].object;
            }
            if (this.hoveredTile && this.hoveredTile != tile)
                this.hoveredTile.hovered = false;
            this.hoveredTile = tile;
            if (tile) tile.hovered = true;
        }
    }

    public onClick() {
        if (this.hoveredTile && this.player.interactable) {
            this.player.interactable = false;
            const tl = new TimelineMax();
            this.player.puttingLizhiTile = Math.random() > 0.5;
            tl.add(this.player.playTile(this.hoveredTile));
            tl.add(this.river.finalizeLatestTile(), "+=0.2");
            return tl;
        }
    }
}

class CenterScreen extends THREE.Mesh {
    public static readonly SIZE =
        (River.LINE_SIZE - 1) * (Tile.WIDTH + River.GAP);
    public static readonly LIZHI_STICK_RADIUS = 0.25;
    public static readonly LIZHI_STICK_LENGTH = CenterScreen.SIZE * 0.8;
    public static readonly LIZHI_STICK_MARGIN = 0.5;
    public static readonly THICKNESS = 1;

    private readonly textUIAnchor = new THREE.Object3D();
    private readonly textUI = new CenterInfo();
    public readonly textCSSObj = new THREEx.CSS3DObject(this.textUI.container);
    private lizhiSticks: THREE.Mesh[] = [];

    private _roundWind = 0;
    private _tileLeft = 0;
    private _viewPoint = 0;

    public get roundWind() {
        return this._roundWind;
    }
    public set roundWind(to: number) {
        if (this._roundWind !== to) {
            this._roundWind = to;
            this.updateText();
        }
    }

    public get tileLeft() {
        return this._tileLeft;
    }
    public set tileLeft(to: number) {
        if (this._tileLeft !== to) {
            this._tileLeft = to;
            this.updateText();
        }
    }

    public get viewPoint() {
        return this._viewPoint;
    }

    public set viewPoint(to: number) {
        if (this._viewPoint === to) {
            return;
        }
        this._viewPoint = to;
        TweenMax.to(this.textCSSObj.rotation, 0.3, {
            z: Util.RAD90 * to
        });
    }

    public updateText() {
        this.textUI.roundWind = Util.POSITIONS[this.roundWind];
        this.textUI.tileLeft = this.tileLeft.toString();
    }

    public putLizhiStick(playerID: number) {
        const tl = new TimelineMax();
        const stick = this.lizhiSticks[playerID];
        tl.fromTo(
            stick.position,
            0.3,
            { y: Tile.HEIGHT },
            { y: CenterScreen.THICKNESS, immediateRender: false }
        );
        tl.add(Util.MeshOpacityFromTo(stick, 0.3, 0, 1), 0);
        Assets.outlineEffect.selection.add(stick);
        return tl;
    }

    constructor() {
        super(
            new THREE.BoxBufferGeometry(
                CenterScreen.SIZE,
                CenterScreen.THICKNESS,
                CenterScreen.SIZE
            ),
            new THREE.MeshBasicMaterial({
                transparent: true,
                color: Colors.White,
                opacity: 0.5
            })
        );
        this.textCSSObj.rotation.x = -Util.RAD90;
        //this.textUIAnchor.position.set(0, CenterScreen.THICKNESS, 0);
        this.add(this.textUIAnchor);
        this.textUIAnchor.add(this.textCSSObj);
        for (let i = 0; i < 4; i++) {
            const stick = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    CenterScreen.LIZHI_STICK_RADIUS,
                    CenterScreen.LIZHI_STICK_RADIUS,
                    CenterScreen.LIZHI_STICK_LENGTH
                ),
                new THREE.MeshBasicMaterial({ color: Colors.TileBackColor })
            );
            stick.position.set(
                Util.DIR_X[i] *
                    (CenterScreen.SIZE / 2 - CenterScreen.LIZHI_STICK_MARGIN),
                CenterScreen.THICKNESS,
                Util.DIR_Z[i] *
                    (CenterScreen.SIZE / 2 - CenterScreen.LIZHI_STICK_MARGIN)
            );
            stick.rotation.x = Util.RAD90;
            stick.rotateZ(Util.RAD90 * (i - 1));
            stick.visible = false;
            this.lizhiSticks.push(stick);
            this.add(stick);
        }
    }
}
