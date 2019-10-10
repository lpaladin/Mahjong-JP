class Player implements Tickable {
    public readonly info = infoProvider.getPlayerNames()[this.playerID];
    public readonly ui = new PlayerUI(this);
    public readonly board = new PlayerArea(this);
    public readonly shout = new PlayerShout(this);

    public playDrawnTileOnly = false;
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
        const tl = this.board.river.addTile(tile);
        tl.call(tid => Util.Log`${this.info}打出一张${Mahjong.tileInfo[tid].chnName}`, [tile.tileID], null, 0);
        return tl;
    }

    public doAction(action: Mahjong.Action) {
        const tl = new TimelineMax();
        if (action.type == "PASS") {
            tl.add(game.players[action.from].board.river.finalizeLatestTile(), 0.5);
            tl.add(game.nextPlayer());
            return tl;
        }
        tl.add(this.shout.shout(Mahjong.actionInfo[action.type].chnName));
        if ("newTile" in action) {
            tl.call(
                () =>
                    Util.Log`${this.info}${Mahjong.actionInfo[action.type].chnName}了${game.players[action.from].info}的${Mahjong.tileInfo[action.newTile].chnName}`
            );
            if (action.type !== "HU") tl.add(game.players[action.from].board.river.removeLatestTile(), 1);
        } else tl.call(() => Util.Log`${this.info}${Mahjong.actionInfo[action.type].chnName}了`);
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
            case "CHI":
            case "PENG":
            case "DAMINGGANG":
                tl.add(
                    this.board.openTiles.addStack(
                        action.type,
                        action.existing.map(t => t.tileID),
                        action.newTile,
                        Util.GetRelativePlayerPosition(this.playerID, action.from)
                    )
                );
                if (action.type == "DAMINGGANG") tl.add(this.board.deck.drawTile(Util.RandInArray(Mahjong.TileIDs)));
                game.nextPlayer(this.playerID);
                break;
            case "ANGANG":
                tl.add(this.board.openTiles.addStack(action.type, action.existing.map(t => t.tileID)));
                tl.add(this.board.deck.drawTile(Util.RandInArray(Mahjong.TileIDs)));
                break;
            case "BUGANG":
                tl.add(this.board.openTiles.addGang(action.existing[0].tileID));
                tl.add(this.board.deck.drawTile(Util.RandInArray(Mahjong.TileIDs)));
                break;
            case "ZIMO":
            case "HU":
                let tile: Tile;
                if (action.type === "ZIMO") {
                    tile = this.board.deck.drawnTile;
                } else {
                    const fromRiver = game.players[action.from].board.river;
                    tile = fromRiver.riverTiles[fromRiver.riverTiles.length - 1];
                }
                tl.add(Util.BiDirectionConstantSet(tile, "shaking", true));
                tl.call(game.focusAndWave, [tile], game);
                tl.add(Util.BiDirectionConstantSet(this.board, "openDeck", true), "+=2.5");
                tl.add(
                    game.gameFinish(
                        Util.RandInArray([
                            [
                                {
                                    huer: this,
                                    newTile: tile,
                                    from: action.type === 'HU' ? action.from : this.playerID,
                                    type: action.type,
                                    fan: ["断幺九", "平和", "清一色", "断幺九", "平和", "清一色"],
                                    score: 18000
                                }
                            ],
                            [
                                {
                                    huer: this,
                                    newTile: tile,
                                    from: action.type === 'HU' ? action.from : this.playerID,
                                    type: action.type,
                                    fan: ["断幺九", "平和", "清一色", "断幺九", "平和", "清一色"],
                                    score: 18000
                                },
                                {
                                    huer: game.players[2],
                                    newTile: tile,
                                    from: action.type === 'HU' ? action.from : this.playerID,
                                    type: action.type,
                                    fan: ["断幺九", "平和", "清一色", "断幺九", "平和", "清一色"],
                                    score: 18000
                                }
                            ],
                            game.players.map(p => ({
                                huer: p,
                                type: "DRAW",
                                reason: "荒牌流局",
                                score: 18000
                            }))
                        ])
                    ),
                    "+=0.5"
                );
        }
        return tl;
    }

    public onTick() {
        this.board.onTick();
    }
}
