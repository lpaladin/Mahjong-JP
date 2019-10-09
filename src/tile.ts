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

    public static readonly buckets: {
        [rank: number]: Set<Tile>;
    } = Mahjong.TileIDs.reduce(
        (prev, curr) => {
            prev[Mahjong.tileInfo[curr].relativeRank] = new Set();
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
            for (const x of Tile.buckets[
                Mahjong.tileInfo[Tile._highlightingTileID].relativeRank
            ]) {
                x.outlined = false;
            }
        Tile._highlightingTileID = to;
        if (to)
            for (const x of Tile.buckets[Mahjong.tileInfo[to].relativeRank]) {
                x.outlined = x.isVisibleToPlayer(infoProvider.getPlayerID());
            }
    }

    public static tileLeft = 9 * 4 * 3 + 7 * 4;

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

    private _close = false;
    public get close() {
        return this._close;
    }
    public set close(to: boolean) {
        if (this._close === to) {
            return;
        }
        TweenMax.to(this.rotation, 0.1, {
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
            TweenMax.to(this.rotation, 0.1, {
                x: to ? -Util.RAD90 : 0
            });
        }
        this._open = to;
    }

    public isVisibleToPlayer(playerID = -1) {
        return (
            this.open ||
            (playerID !== -1 &&
                this.parent === game.players[playerID].board.deck)
        );
    }

    private _shaking = false;
    public get shaking() {
        return this._shaking;
    }
    public set shaking(to: boolean) {
        if (this._shaking != to) {
            this._shaking = to;
            if (!to) {
                this.position.set(
                    this.basePosition.x,
                    this.basePosition.y,
                    this.basePosition.z
                );
                tickableManager.delete(this);
            } else {
                this.basePosition.set(
                    this.position.x,
                    this.position.y,
                    this.position.z
                );
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

    public constructor(
        public readonly tileID: Mahjong.TileID,
        public idx: number
    ) {
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
        Tile.buckets[Mahjong.tileInfo[this.tileID].relativeRank].add(this);
        this.visible = false;
        this.castShadow = true;
    }
}
