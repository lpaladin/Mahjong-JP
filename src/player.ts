class Player implements Tickable {
    public readonly info = infoProvider.getPlayerNames()[this.playerID];
    public readonly ui = new PlayerUI(this);
    public readonly board = new PlayerArea(this);
    public readonly shout = new PlayerShout(this);

    public partialSpecialAction: Mahjong.Action;
    public puttingLizhiTile = false;

    private _interactable = false;
    public get interactable() {
        return this._interactable;
    }
    public set interactable(to: boolean) {
        if (to != this._interactable) {
            this._interactable = to;
            if (to) tickableManager.add(this);
            else tickableManager.delete(this);
        }
    }

    constructor(public readonly playerID: number) {}

    public playTile(tile: Tile | number) {
        this.ui.onButtonClicked();
        if (typeof tile === "number") {
            tile = this.board.deck.handTiles[tile];
        }
        if (tile == this.board.hoveredTile) {
            this.board.hoveredTile.hovered = false;
            this.board.hoveredTile = null;
        }
        return this.board.river.addTile(tile);
    }

    public doAction(action: Mahjong.Action) {
        const tl = new TimelineMax();
        if (action.type !== "DRAW" && action.type !== "PLAY" && action.type !== "NOTING") {
            tl.call(this.shout.shout, [Mahjong.actionInfo[action.type].chnName], this.shout);
        }
        if ("tile" in action) {
            const tileId = action.tile instanceof Tile ? action.tile.tileID : action.tile;
            if ("from" in action) {
                tl.call(
                    () =>
                        Util.Log`${this.info}${Mahjong.actionInfo[action.type].chnName}了${game.players[action.from].info}的${Mahjong.tileInfo[tileId].chnName}`,
                    null,
                    null,
                    1
                );
                if (action.type !== "HU") {
                    tl.add(game.players[action.from].board.river.removeLatestTile(), 1);
                }
            } else {
                if (action.type !== "DRAW") {
                    if (action.type === "LIZHI") {
                        tl.call(
                            () => Util.Log`${this.info}${"立直"}并打出了一张${Mahjong.tileInfo[tileId].chnName}`,
                            null,
                            null,
                            1
                        );
                    } else {
                        tl.call(
                            () =>
                                Util.Log`${this.info}${Mahjong.actionInfo[action.type].chnName}了一张${Mahjong.tileInfo[tileId].chnName}`,
                            null,
                            null,
                            1
                        );
                    }
                }
            }
        } else {
            tl.call(() => Util.Log`${this.info}${Mahjong.actionInfo[action.type].chnName}了`, null, null, 1);
        }
        if ("existing" in action)
            action.existing.forEach(t => {
                t.shaking = false;
                tl.fromTo(
                    t.position,
                    0.2,
                    { y: 0, z: 0 },
                    {
                        y: (Tile.DEPTH - Tile.HEIGHT) / 2,
                        z: -(Tile.DEPTH + Tile.HEIGHT) / 2,
                        ease: Expo.easeIn,
                        immediateRender: false
                    },
                    1
                );
                tl.fromTo(
                    t.rotation,
                    0.2,
                    { x: 0 },
                    {
                        x: -Util.RAD90,
                        ease: Expo.easeIn,
                        immediateRender: false
                    },
                    1
                );
                tl.add(Util.MeshOpacityFromTo(t, 0.1, 1, 0), 1.4);
                tl.add(this.board.deck.removeTile(t), 1.5);
            });
        switch (action.type) {
            case "DRAW":
                tl.add(this.board.deck.drawTile(action.tile));
                break;
            case "PLAY":
            case "LIZHI":
                if (action.type === "LIZHI") {
                    this.puttingLizhiTile = true;
                }
                tl.add(this.playTile(action.tile));
                break;
            case "CHI":
            case "PENG":
            case "DAMINGGANG":
                tl.add(
                    this.board.openTiles.addStack(
                        action.type,
                        action.existing.map(t => t.tileID),
                        action.tile,
                        Util.GetRelativePlayerPosition(this.playerID, action.from)
                    )
                );
                break;
            case "ANGANG":
                tl.add(this.board.openTiles.addStack(action.type, action.existing.map(t => t.tileID)));
                break;
            case "BUGANG":
                tl.add(this.board.openTiles.addGang(action.existing[0].tileID));
                break;
            case "ZIMO":
            case "HU":
                let tile: Tile;
                if (action.type === "ZIMO") {
                    tile = this.board.deck.drawnTile;
                } else {
                    tile = game.players[action.from].board.river.latestTile;
                }
                tl.add(Util.BiDirectionConstantSet(tile, "shaking", true));
                tl.call(game.focusAndWave, [tile], game);
                tl.add(Util.BiDirectionConstantSet(this.board, "openDeck", true), "+=2.5");
                break;
            case "TING":
                tl.add(Util.BiDirectionConstantSet(this.board, "openDeck", true));
                break;
            case "NOTING":
                tl.add(Util.BiDirectionConstantSet(this.board, "closeDeck", true));
                break;
        }
        return tl;
    }

    public onTick() {
        this.board.onTick();
    }
}
