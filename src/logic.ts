namespace Mahjong {
    export const tileInfo = {
        W1: { id: "W1", relativeRank: 0, imgName: "Man1.png", chnName: "一万", availableCount: 4 } as TileInfo,
        W2: { id: "W2", relativeRank: 1, imgName: "Man2.png", chnName: "二万", availableCount: 4 } as TileInfo,
        W3: { id: "W3", relativeRank: 2, imgName: "Man3.png", chnName: "三万", availableCount: 4 } as TileInfo,
        W4: { id: "W4", relativeRank: 3, imgName: "Man4.png", chnName: "四万", availableCount: 4 } as TileInfo,
        W5: { id: "W5", relativeRank: 4, imgName: "Man5.png", chnName: "五万", availableCount: 3 } as TileInfo,
        W6: { id: "W6", relativeRank: 5, imgName: "Man6.png", chnName: "六万", availableCount: 4 } as TileInfo,
        W7: { id: "W7", relativeRank: 6, imgName: "Man7.png", chnName: "七万", availableCount: 4 } as TileInfo,
        W8: { id: "W8", relativeRank: 7, imgName: "Man8.png", chnName: "八万", availableCount: 4 } as TileInfo,
        W9: { id: "W9", relativeRank: 8, imgName: "Man9.png", chnName: "九万", availableCount: 4 } as TileInfo,
        W0: { id: "W0", relativeRank: 3.9, imgName: "Man5-Dora.png", chnName: "红五万", availableCount: 1 } as TileInfo,
        T1: { id: "T1", relativeRank: 9, imgName: "Sou1.png", chnName: "一条", availableCount: 4 } as TileInfo,
        T2: { id: "T2", relativeRank: 10, imgName: "Sou2.png", chnName: "二条", availableCount: 4 } as TileInfo,
        T3: { id: "T3", relativeRank: 11, imgName: "Sou3.png", chnName: "三条", availableCount: 4 } as TileInfo,
        T4: { id: "T4", relativeRank: 12, imgName: "Sou4.png", chnName: "四条", availableCount: 4 } as TileInfo,
        T5: { id: "T5", relativeRank: 13, imgName: "Sou5.png", chnName: "五条", availableCount: 3 } as TileInfo,
        T6: { id: "T6", relativeRank: 14, imgName: "Sou6.png", chnName: "六条", availableCount: 4 } as TileInfo,
        T7: { id: "T7", relativeRank: 15, imgName: "Sou7.png", chnName: "七条", availableCount: 4 } as TileInfo,
        T8: { id: "T8", relativeRank: 16, imgName: "Sou8.png", chnName: "八条", availableCount: 4 } as TileInfo,
        T9: { id: "T9", relativeRank: 17, imgName: "Sou9.png", chnName: "九条", availableCount: 4 } as TileInfo,
        T0: { id: "T0", relativeRank: 12.9, imgName: "Sou5-Dora.png", chnName: "红五条", availableCount: 1 } as TileInfo,
        B1: { id: "B1", relativeRank: 18, imgName: "Pin1.png", chnName: "一筒", availableCount: 4 } as TileInfo,
        B2: { id: "B2", relativeRank: 19, imgName: "Pin2.png", chnName: "二筒", availableCount: 4 } as TileInfo,
        B3: { id: "B3", relativeRank: 20, imgName: "Pin3.png", chnName: "三筒", availableCount: 4 } as TileInfo,
        B4: { id: "B4", relativeRank: 21, imgName: "Pin4.png", chnName: "四筒", availableCount: 4 } as TileInfo,
        B5: { id: "B5", relativeRank: 22, imgName: "Pin5.png", chnName: "五筒", availableCount: 3 } as TileInfo,
        B6: { id: "B6", relativeRank: 23, imgName: "Pin6.png", chnName: "六筒", availableCount: 4 } as TileInfo,
        B7: { id: "B7", relativeRank: 24, imgName: "Pin7.png", chnName: "七筒", availableCount: 4 } as TileInfo,
        B8: { id: "B8", relativeRank: 25, imgName: "Pin8.png", chnName: "八筒", availableCount: 4 } as TileInfo,
        B9: { id: "B9", relativeRank: 26, imgName: "Pin9.png", chnName: "九筒", availableCount: 4 } as TileInfo,
        B0: { id: "B0", relativeRank: 21.9, imgName: "Pin5-Dora.png", chnName: "红五筒", availableCount: 1 } as TileInfo,
        Z1: { id: "Z1", relativeRank: 27, imgName: "Ton.png", chnName: "东", availableCount: 4 } as TileInfo,
        Z2: { id: "Z2", relativeRank: 28, imgName: "Nan.png", chnName: "南", availableCount: 4 } as TileInfo,
        Z3: { id: "Z3", relativeRank: 29, imgName: "Shaa.png", chnName: "西", availableCount: 4 } as TileInfo,
        Z4: { id: "Z4", relativeRank: 30, imgName: "Pei.png", chnName: "北", availableCount: 4 } as TileInfo,
        Z5: { id: "Z5", relativeRank: 31, imgName: "Haku.png", chnName: "白", availableCount: 4 } as TileInfo,
        Z6: { id: "Z6", relativeRank: 32, imgName: "Hatsu.png", chnName: "发", availableCount: 4 } as TileInfo,
        Z7: { id: "Z7", relativeRank: 33, imgName: "Chun.png", chnName: "中", availableCount: 4 } as TileInfo
    } as const;

    // export const canCHIFamily = {
    //     M: true,
    //     S: true,
    //     P: true,
    //     Z: false
    // };

    export type TileID = keyof typeof tileInfo;
    export const tileIDs = Object.keys(tileInfo) as TileID[];

    export const actionInfo = {
        DRAW: { id: "DRAW", chnName: "摸" },
        PLAY: { id: "PLAY", chnName: "打出" },
        CHI: { id: "CHI", chnName: "吃" },
        PENG: { id: "PENG", chnName: "碰" },
        DAMINGGANG: { id: "DAMINGGANG", chnName: "大明杠" },
        ANGANG: { id: "ANGANG", chnName: "暗杠" },
        BUGANG: { id: "ANGANG", chnName: "补杠" },
        LIZHI: { id: "LIZHI", chnName: "立直" },
        HU: { id: "HU", chnName: "胡" },
        ZIMO: { id: "ZIMO", chnName: "自摸" },
        PASS: { id: "PASS", chnName: "过" },
        TING: { id: "TING", chnName: "听牌" },
        NOTING: { id: "NOTING", chnName: "未听牌" }
    };
    export type ActionType = keyof typeof actionInfo;
    export const actionTypes = Object.keys(actionInfo) as ActionType[];
    export interface PartialAction {
        type: "CHI" | "PENG";
        from: number;
        existing: [Tile, Tile]; // 自己手里的牌
        tile: TileID; // 其他玩家提供的牌
    }
    export type Action =
        | {
              type: "DRAW";
              tile: TileID;
          }
        | {
              type: "PLAY";
              tile: Tile;
          }
        | PartialAction
        | {
              type: "DAMINGGANG";
              from: number;
              existing: [Tile, Tile, Tile];
              tile: TileID;
          }
        | {
              type: "ANGANG";
              existing: [Tile, Tile, Tile, Tile];
          }
        | {
              type: "BUGANG";
              existing: [Tile];
          }
        | {
              type: "LIZHI";
              tile: Tile;
          }
        | {
              type: "HU";
              from: number;
              tile: Tile;
          }
        | {
              type: "ZIMO";
          }
        | {
              type: "PASS";
          }
        | {
              type: "TING";
          }
        | {
              type: "NOTING";
          };

    export type LiteralID = Exclude<TileID, "W0" | "T0" | "B0">;

    export function getLiteralID(id: TileID): LiteralID {
        if (id === "W0") return "W5";
        if (id === "T0") return "T5";
        if (id === "B0") return "B5";
        return id;
    }

    export function eq(a: TileID, b: TileID) {
        return getLiteralID(a) === getLiteralID(b);
    }

    export function lt1(a: TileID, b: TileID) {
        a = getLiteralID(a);
        b = getLiteralID(b);
        return a[0] === b[0] && b.charCodeAt(1) - a.charCodeAt(1) === 1;
    }

    export function lt2(a: TileID, b: TileID) {
        a = getLiteralID(a);
        b = getLiteralID(b);
        return a[0] === b[0] && b.charCodeAt(1) - a.charCodeAt(1) === 2;
    }

    export function getIndicatedDoraID(indicatorID: TileID): LiteralID {
        indicatorID = getLiteralID(indicatorID);
        if (indicatorID[0] === "W" || indicatorID[0] === "T" || indicatorID[0] === "B") {
            return (indicatorID[0] + ((parseInt(indicatorID[1]) % 9) + 1)) as LiteralID;
        }
        if (indicatorID[1] < "5") {
            return (indicatorID[0] + ((parseInt(indicatorID[1]) % 4) + 1)) as LiteralID;
        }
        return (indicatorID[0] + (((parseInt(indicatorID[1]) - 4) % 3) + 5)) as LiteralID;
    }

    export function getValidActions(
        player: Player,
        lastPlayedPlayer: number,
        lastPlayedTile: Mahjong.TileID,
        validact: string
    ): Mahjong.Action[] {
        const actions: Mahjong.Action[] = [];
        for (const act of validact.split(",")) {
            const [action, ...args] = act.split(" ");
            switch (action) {
                case "CHI":
                    [
                        ...player.board.deck.getCombinationsInHand([t => lt2(t, lastPlayedTile), t => lt1(t, lastPlayedTile)]),
                        ...player.board.deck.getCombinationsInHand([t => lt1(t, lastPlayedTile), t => lt1(lastPlayedTile, t)]),
                        ...player.board.deck.getCombinationsInHand([t => lt1(lastPlayedTile, t), t => lt2(lastPlayedTile, t)])
                    ].forEach(tiles =>
                        actions.push({
                            type: "CHI",
                            from: lastPlayedPlayer,
                            existing: tiles as [Tile, Tile],
                            tile: lastPlayedTile
                        })
                    );
                    break;
                case "PENG":
                    player.board.deck.getCombinationsInHand([t => eq(t, lastPlayedTile), t => eq(t, lastPlayedTile)]).forEach(tiles =>
                        actions.push({
                            type: "PENG",
                            from: lastPlayedPlayer,
                            existing: tiles as [Tile, Tile],
                            tile: lastPlayedTile
                        })
                    );
                    break;
                case "GANG":
                    player.board.deck
                        .getCombinationsInHand([t => eq(t, lastPlayedTile), t => eq(t, lastPlayedTile), t => eq(t, lastPlayedTile)])
                        .forEach(tiles =>
                            actions.push({
                                type: "DAMINGGANG",
                                from: lastPlayedPlayer,
                                existing: tiles as [Tile, Tile, Tile],
                                tile: lastPlayedTile
                            })
                        );
                    break;
                case "ANGANG":
                    player.board.deck
                        .getCombinationsInHand(
                            [
                                t => eq(t, lastPlayedTile),
                                t => eq(t, lastPlayedTile),
                                t => eq(t, lastPlayedTile),
                                t => eq(t, lastPlayedTile)
                            ],
                            true
                        )
                        .forEach(tiles =>
                            actions.push({
                                type: "ANGANG",
                                existing: tiles as [Tile, Tile, Tile, Tile]
                            })
                        );
                    break;
                case "BUGANG":
                    player.board.openTiles.openStacks.forEach(stack => {
                        if (stack.type === "PENG") {
                            player.board.deck.getCombinationsInHand([t => eq(t, stack.newTile.tileID)], true).forEach(combination =>
                                actions.push({
                                    type: "BUGANG",
                                    existing: combination as [Tile]
                                })
                            );
                        }
                    });
                    break;
                case "LIZHI":
                    new Set(args).forEach(arg =>
                        player.board.deck.getCombinationsInHand([t => eq(t, arg as TileID)], true).forEach(([tile]) =>
                            actions.push({
                                type: "LIZHI",
                                tile
                            })
                        )
                    );
                    break;
                case "RONG":
                    actions.push({
                        type: "HU",
                        from: lastPlayedPlayer,
                        tile: game.players[lastPlayedPlayer].board.river.latestTile
                    });
                    break;
                case "TSUMO":
                    actions.push({
                        type: "ZIMO"
                    });
                    break;
            }
        }
        return actions;
    }

    interface TileInfo {
        id: string;
        imgName: string;
        chnName: string;
        availableCount: number;
        relativeRank: number;
    }

    export const errorAction2Chn: { [action in DisplayLog.ErrorAction]: string } = {
        TLE: "超时",
        WA: "非法动作",
        MLE: "内存爆炸",
        RE: "程序崩溃",
        ERR: "奇妙的错误，请联系管理员"
    };

    export function isErrorLog(log: DisplayLog): log is DisplayLog.ErrorGameResult {
        return log.action in errorAction2Chn;
    }

    export function isGameEndingLog(log: DisplayLog): log is DisplayLog.GameEndingLog {
        return isErrorLog(log) || log.action === "HU" || log.action === "HUANG";
    }
}
