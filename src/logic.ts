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
    export const TileIDs = Object.keys(tileInfo) as TileID[];

    export function sortTiles<T>(array: T[], mapper: (t: T) => TileID): T[] {
        array.sort((a, b) => tileInfo[mapper(a)].relativeRank - tileInfo[mapper(b)].relativeRank);
        return array;
    }

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
        ZIMO: { id: "ZIMO", chnName: "自摸" }
    };
    export type ActionType = keyof typeof actionInfo;
    export const ActionTypes = Object.keys(actionInfo) as ActionType[];
    export type Action =
        | {
              type: "DRAW";
              tile: TileID;
          }
        | {
              type: "PLAY";
              tile: Tile;
          }
        | {
              type: "CHI" | "PENG";
              from: number;
              existing: [Tile, Tile]; // 自己手里的牌
              tile: TileID; // 其他玩家提供的牌
          }
        | {
              type: "DAMINGGANG";
              from: number;
              existing: [Tile, Tile, Tile];
              tile: TileID;
              drawnTile: TileID;
          }
        | {
              type: "ANGANG";
              existing: [Tile, Tile, Tile, Tile];
              drawnTile: TileID;
          }
        | {
              type: "BUGANG";
              existing: [Tile];
              drawnTile: TileID;
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
          };

    // export function testAvailableActions(player: Player, newTile?: TileID, from = -1): Action[] {
    //     const results: Action[] = [];
    //     const deck = player.board.deck.handTiles;
    //     if (!newTile) {
    //         Util.Assert`没有新牌的时候一定是自己摸的牌：${from == -1}`;
    //         const drawnTile = player.board.deck.drawnTile;
    //         const drawnRank = tileInfo[drawnTile.tileID].relativeRank;
    //         const pengs = player.board.openTiles.openStacks.filter(s => s.type == "PENG");
    //         for (const p of pengs) {
    //             if (drawnRank == Math.round(tileInfo[p.newTile.tileID].relativeRank))
    //                 results.push({
    //                     type: "BUGANG",
    //                     existing: [drawnTile]
    //                 });
    //         }
    //         for (let i = 0; i < deck.length; i++) {
    //             const curr = Math.round(tileInfo[deck[i].tileID].relativeRank);
    //             for (const p of pengs) {
    //                 if (curr == Math.round(tileInfo[p.newTile.tileID].relativeRank))
    //                     results.push({
    //                         type: "BUGANG",
    //                         existing: [deck[i]]
    //                     });
    //             }
    //             if (i > 1) {
    //                 const llast = Math.round(tileInfo[deck[i - 2].tileID].relativeRank);
    //                 const last = Math.round(tileInfo[deck[i - 1].tileID].relativeRank);
    //                 if (curr == last && curr == llast && curr == drawnRank)
    //                     results.push({
    //                         type: "ANGANG",
    //                         existing: [deck[i - 2], deck[i - 1], deck[i], drawnTile]
    //                     });
    //                 if (i > 2) {
    //                     const lllast = Math.round(tileInfo[deck[i - 3].tileID].relativeRank);
    //                     if (curr == last && curr == llast && curr == lllast)
    //                         results.push({
    //                             type: "ANGANG",
    //                             existing: [deck[i - 3], deck[i - 2], deck[i - 1], deck[i]]
    //                         });
    //                 }
    //             }
    //         }
    //         if (Math.random() < 0.3) {
    //             results.push({
    //                 type: "ZIMO"
    //             });
    //         }
    //     } else {
    //         const newRank = tileInfo[newTile].relativeRank;
    //         for (let i = 0; i < deck.length; i++) {
    //             if (i > 0) {
    //                 const lastID = deck[i - 1].tileID;
    //                 const currID = deck[i].tileID;
    //                 const last = Math.round(tileInfo[lastID].relativeRank);
    //                 const curr = Math.round(tileInfo[currID].relativeRank);
    //                 if (
    //                     (player.playerID + 4 - from) % 4 == 1 && // 只能吃上家
    //                     currID[0] == lastID[0] &&
    //                     currID[0] == newTile[0] &&
    //                     canCHIFamily[currID[0]] &&
    //                     ((curr - last == 1 && (newRank - curr == 1 || last - newRank == 1)) ||
    //                         (curr - newRank == 1 && newRank - last == 1))
    //                 )
    //                     results.push({
    //                         type: "CHI",
    //                         existing: [deck[i - 1], deck[i]],
    //                         newTile,
    //                         from
    //                     });
    //                 if (curr == last && curr == newRank)
    //                     results.push({
    //                         type: "PENG",
    //                         existing: [deck[i - 1], deck[i]],
    //                         newTile,
    //                         from
    //                     });
    //                 if (i > 1) {
    //                     const llast = Math.round(tileInfo[deck[i - 2].tileID].relativeRank);
    //                     if (curr == last && curr == llast && curr == newRank)
    //                         results.push({
    //                             type: "DAMINGGANG",
    //                             existing: [deck[i - 2], deck[i - 1], deck[i]],
    //                             newTile,
    //                             from
    //                         });
    //                 }
    //             }
    //         }
    //         if (Math.random() < 0.3) {
    //             results.push({
    //                 type: "HU",
    //                 from,
    //                 newTile
    //             });
    //         }
    //     }
    //     return results;
    // }

    export function getLiteralID(id: TileID): Exclude<TileID, "W0" | "T0" | "B0"> {
        if (id === "W0") return "W5";
        if (id === "T0") return "T5";
        if (id === "B0") return "B5";
        return id;
    }

    export function getNextID(id: TileID): TileID {
        if (id[0] === "W" || id[0] === "T" || id[0] === "B") {
            return (id[0] + ((parseInt(id[1]) % 9) + 1)) as TileID;
        }
        if (id[1] < "5") {
            return (id[0] + ((parseInt(id[1]) % 4) + 1)) as TileID;
        }
        if (id[1] < "5") {
            return (id[0] + ((parseInt(id[1]) % 4) + 1)) as TileID;
        }
        return (id[0] + (((parseInt(id[1]) - 4) % 3) + 5)) as TileID;
    }

    interface TileInfo {
        id: string;
        imgName: string;
        chnName: string;
        availableCount: number;
        relativeRank: number;
    }
}
