interface PlainVector3 {
    x?: number;
    y?: number;
    z?: number;
}

class OverridableEuler {
    private static all: OverridableEuler[] = [];
    private static _overridingEuler: PlainVector3 = {};
    public static get overridingEuler() {
        return this._overridingEuler;
    }
    public static set overridingEuler(to: PlainVector3) {
        this._overridingEuler = to;
        for (const euler of this.all) {
            euler.update();
        }
    }

    private _x: number;
    private _y: number;
    private _z: number;

    constructor(private original: THREE.Euler) {
        this._x = original.x;
        this._y = original.x;
        this._z = original.x;
        OverridableEuler.all.push(this);
        this.update();
    }

    private update() {
        this.original.x = "x" in OverridableEuler._overridingEuler ? OverridableEuler._overridingEuler.x : this.x;
        this.original.y = "y" in OverridableEuler._overridingEuler ? OverridableEuler._overridingEuler.y : this.y;
        this.original.z = "z" in OverridableEuler._overridingEuler ? OverridableEuler._overridingEuler.z : this.z;
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public get z() {
        return this._z;
    }

    public set x(to: number) {
        this._x = to;
        if (!("x" in OverridableEuler._overridingEuler)) {
            this.original.x = to;
        }
    }

    public set y(to: number) {
        this._y = to;
        if (!("y" in OverridableEuler._overridingEuler)) {
            this.original.y = to;
        }
    }

    public set z(to: number) {
        this._z = to;
        if (!("z" in OverridableEuler._overridingEuler)) {
            this.original.z = to;
        }
    }

    public set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public copy(other: this) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }
}

class Tile extends THREE.Mesh implements Tickable {
    public static readonly PADDING_PERCENTAGE_W = 0.1;
    public static readonly PADDING_PERCENTAGE_H = 0.2;
    public static readonly SIDE_COLOR_PERCENTAGE = 0.2;
    public static readonly CORNER_RADIUS = 0.2;
    public static readonly DEPTH = 2;
    public static readonly WIDTH = 3;
    public static readonly HEIGHT = 4;
    public static readonly TEXTURES: {
        [id in Mahjong.TileID]: THREE.Texture;
    } = {} as any;

    private static readonly buckets: {
        [tileID in Mahjong.LiteralID]: Set<Tile>;
    } = Mahjong.tileIDs.reduce(
        (prev, curr) => {
            prev[Mahjong.getLiteralID(curr)] = new Set();
            return prev;
        },
        {} as typeof Tile.buckets
    );

    private static _highlightingTileID?: Mahjong.TileID;
    public static get highlightingTileID() {
        return Tile._highlightingTileID;
    }
    public static set highlightingTileID(to: Mahjong.TileID | undefined) {
        if (Tile._highlightingTileID === to) {
            return;
        }
        if (Tile._highlightingTileID)
            for (const x of Tile.buckets[Mahjong.getLiteralID(Tile._highlightingTileID)]) {
                x.highlighted = false;
            }
        Tile._highlightingTileID = to;
        if (to)
            for (const x of Tile.buckets[Mahjong.getLiteralID(to)]) {
                x.highlighted = x.isVisibleToPlayer(game.viewPoint);
            }
    }

    private static allocatedTileCount = 0;

    public readonly uniqueRank: number;

    private _outlined = undefined;
    public get outlined() {
        return this._outlined;
    }
    public set outlined(to: boolean) {
        if (this._outlined === to) {
            return;
        }
        if (to) {
            Assets.outlineEffect.selection.add(this);
        } else {
            Assets.outlineEffect.selection.delete(this);
        }
        this._outlined = to;
    }

    public updateDora() {
        this.outlined =
            (this.tileID[1] === "0" || game.doraIndicators.currentTileIDs.some(id => Mahjong.getIndicatedDoraID(id) === this.tileID)) &&
            this.isVisibleToPlayer(game.viewPoint);
    }

    public static updateDoras(tileID: Mahjong.TileID) {
        for (const tile of Tile.buckets[tileID]) {
            tile.updateDora();
        }
    }

    private _highlighted = false;
    public get highlighted() {
        return this._highlighted;
    }
    public set highlighted(to: boolean) {
        if (this._highlighted === to) {
            return;
        }
        (this.material as THREE.MeshLambertMaterial).emissive = new THREE.Color(to ? Colors.Highlight : 0);
        this._highlighted = to;
    }

    private _close = false;
    public get close() {
        return this._close;
    }
    public set close(to: boolean) {
        if (this._close === to) {
            return;
        }
        TweenMax.to(this.exposedRotation, 0.1, {
            x: to ? Util.RAD90 : 0
        });
        this._close = to;
    }

    private _open = undefined;
    public get open() {
        return !!this._open;
    }
    public set open(to: boolean) {
        if (this._open === to) {
            return;
        }
        if (this._open !== undefined && this.parent instanceof Deck) {
            TweenMax.to(this.exposedRotation, 0.1, {
                x: to ? -Util.RAD90 : 0
            });
        }
        this._open = to;
        this.updateDora();
    }

    public isVisibleToPlayer(playerID = -1) {
        return this.open || (playerID !== -1 && this.parent === game.players[playerID].board.deck);
    }

    private _shaking = false;
    public get shaking() {
        return this._shaking;
    }
    public set shaking(to: boolean) {
        if (this._shaking != to) {
            this._shaking = to;
            if (!to) {
                this.position.set(this.basePosition.x, this.basePosition.y, this.basePosition.z);
                tickableManager.delete(this);
            } else {
                this.basePosition.set(this.position.x, this.position.y, this.position.z);
                tickableManager.add(this);
            }
        }
    }

    private _hovered = false;

    // 仅用于 Deck 内
    public get hovered() {
        return this._hovered;
    }
    public set hovered(to: boolean) {
        if (this._hovered == to) return;
        if (to) {
            Tile.highlightingTileID = this.tileID;
        } else {
            Tile.highlightingTileID = undefined;
        }
        this._hovered = to;
        TweenMax.to(this.position, 0.1, { y: to ? 0.5 : 0 });
    }

    private tickCD = 5;
    public onTick() {
        if (--this.tickCD) return;
        this.tickCD = 5;
        if (this.shaking) {
            this.position.set(
                this.basePosition.x + (Math.random() - 0.5) / 5,
                this.basePosition.y + (Math.random() - 0.5) / 5,
                this.basePosition.z + (Math.random() - 0.5) / 5
            );
        }
    }

    private basePosition = new THREE.Vector3();

    public exposedRotation: OverridableEuler;

    public constructor(public readonly tileID: Mahjong.TileID, public idx: number) {
        super(
            Assets.GetRoundEdgedTileGeometry(),
            new THREE.MeshLambertMaterial({
                color: Colors.White,
                map: Tile.TEXTURES[tileID]
            })
            // new THREE.MeshBasicMaterial({
            // 	wireframe: true
            // })
        );
        this.exposedRotation = new OverridableEuler(this.rotation);
        this.uniqueRank = Mahjong.tileInfo[tileID].relativeRank + Tile.allocatedTileCount++ / 10000;
        Tile.buckets[Mahjong.getLiteralID(this.tileID)].add(this);
        this.updateDora();
        this.visible = false;
        this.castShadow = true;
    }
}
