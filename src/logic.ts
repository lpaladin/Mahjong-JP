namespace Mahjong {
	export const tileInfo = {
		"M1": { id: "M1", relativeRank: 0, imgName: "Man1.png", chnName: "一万", availableCount: 4 } as TileInfo,
		"M2": { id: "M2", relativeRank: 1, imgName: "Man2.png", chnName: "二万", availableCount: 4 } as TileInfo,
		"M3": { id: "M3", relativeRank: 2, imgName: "Man3.png", chnName: "三万", availableCount: 4 } as TileInfo,
		"M4": { id: "M4", relativeRank: 3, imgName: "Man4.png", chnName: "四万", availableCount: 4 } as TileInfo,
		"M5": { id: "M5", relativeRank: 4, imgName: "Man5.png", chnName: "五万", availableCount: 3 } as TileInfo,
		"M6": { id: "M6", relativeRank: 5, imgName: "Man6.png", chnName: "六万", availableCount: 4 } as TileInfo,
		"M7": { id: "M7", relativeRank: 6, imgName: "Man7.png", chnName: "七万", availableCount: 4 } as TileInfo,
		"M8": { id: "M8", relativeRank: 7, imgName: "Man8.png", chnName: "八万", availableCount: 4 } as TileInfo,
		"M9": { id: "M9", relativeRank: 8, imgName: "Man9.png", chnName: "九万", availableCount: 4 } as TileInfo,
		"M0": { id: "M0", relativeRank: 3.9, imgName: "Man5-Dora.png", chnName: "红五万", availableCount: 1 } as TileInfo,
		"S1": { id: "S1", relativeRank: 9, imgName: "Sou1.png", chnName: "一条", availableCount: 4 } as TileInfo,
		"S2": { id: "S2", relativeRank: 10, imgName: "Sou2.png", chnName: "二条", availableCount: 4 } as TileInfo,
		"S3": { id: "S3", relativeRank: 11, imgName: "Sou3.png", chnName: "三条", availableCount: 4 } as TileInfo,
		"S4": { id: "S4", relativeRank: 12, imgName: "Sou4.png", chnName: "四条", availableCount: 4 } as TileInfo,
		"S5": { id: "S5", relativeRank: 13, imgName: "Sou5.png", chnName: "五条", availableCount: 3 } as TileInfo,
		"S6": { id: "S6", relativeRank: 14, imgName: "Sou6.png", chnName: "六条", availableCount: 4 } as TileInfo,
		"S7": { id: "S7", relativeRank: 15, imgName: "Sou7.png", chnName: "七条", availableCount: 4 } as TileInfo,
		"S8": { id: "S8", relativeRank: 16, imgName: "Sou8.png", chnName: "八条", availableCount: 4 } as TileInfo,
		"S9": { id: "S9", relativeRank: 17, imgName: "Sou9.png", chnName: "九条", availableCount: 4 } as TileInfo,
		"S0": { id: "S0", relativeRank: 12.9, imgName: "Sou5-Dora.png", chnName: "红五条", availableCount: 1 } as TileInfo,
		"P1": { id: "P1", relativeRank: 18, imgName: "Pin1.png", chnName: "一筒", availableCount: 4 } as TileInfo,
		"P2": { id: "P2", relativeRank: 19, imgName: "Pin2.png", chnName: "二筒", availableCount: 4 } as TileInfo,
		"P3": { id: "P3", relativeRank: 20, imgName: "Pin3.png", chnName: "三筒", availableCount: 4 } as TileInfo,
		"P4": { id: "P4", relativeRank: 21, imgName: "Pin4.png", chnName: "四筒", availableCount: 4 } as TileInfo,
		"P5": { id: "P5", relativeRank: 22, imgName: "Pin5.png", chnName: "五筒", availableCount: 3 } as TileInfo,
		"P6": { id: "P6", relativeRank: 23, imgName: "Pin6.png", chnName: "六筒", availableCount: 4 } as TileInfo,
		"P7": { id: "P7", relativeRank: 24, imgName: "Pin7.png", chnName: "七筒", availableCount: 4 } as TileInfo,
		"P8": { id: "P8", relativeRank: 25, imgName: "Pin8.png", chnName: "八筒", availableCount: 4 } as TileInfo,
		"P9": { id: "P9", relativeRank: 26, imgName: "Pin9.png", chnName: "九筒", availableCount: 4 } as TileInfo,
		"P0": { id: "P0", relativeRank: 21.9, imgName: "Pin5-Dora.png", chnName: "红五筒", availableCount: 1 } as TileInfo,
		"Z1": { id: "Z1", relativeRank: 27, imgName: "Ton.png", chnName: "东", availableCount: 4 } as TileInfo,
		"Z2": { id: "Z2", relativeRank: 28, imgName: "Nan.png", chnName: "南", availableCount: 4 } as TileInfo,
		"Z3": { id: "Z3", relativeRank: 29, imgName: "Shaa.png", chnName: "西", availableCount: 4 } as TileInfo,
		"Z4": { id: "Z4", relativeRank: 30, imgName: "Pei.png", chnName: "北", availableCount: 4 } as TileInfo,
		"Z5": { id: "Z5", relativeRank: 31, imgName: "Haku.png", chnName: "白", availableCount: 4 } as TileInfo,
		"Z6": { id: "Z6", relativeRank: 32, imgName: "Hatsu.png", chnName: "发", availableCount: 4 } as TileInfo,
		"Z7": { id: "Z7", relativeRank: 33, imgName: "Chun.png", chnName: "中", availableCount: 4 } as TileInfo
	} as const;

	export const canCHIFamily = {
		"M": true,
		"S": true,
		"P": true,
		"Z": false
	};

	export type TileID = keyof typeof tileInfo;
	export const TileIDs = Object.keys(tileInfo) as TileID[];

	export function sortTiles<T>(array: T[], mapper: (t: T) => TileID): T[] {
		array.sort((a, b) => tileInfo[mapper(a)].relativeRank - tileInfo[mapper(b)].relativeRank);
		return array;
	}

	export const actionInfo = {
		"CHI": { id: "CHI", chnName: "吃" },
		"PENG": { id: "PENG", chnName: "碰" },
		"DAMINGGANG": { id: "DAMINGGANG", chnName: "大明杠" },
		"ANGANG": { id: "ANGANG", chnName: "暗杠" },
		"BUGANG": { id: "ANGANG", chnName: "补杠" },
		"LIZHI": { id: "LIZHI", chnName: "立直" },
		"HU": { id: "HU", chnName: "胡" },
		"ZIMO": { id: "ZIMO", chnName: "自摸" },
		"PASS": { id: "PASS", chnName: "过" },
	}
	export type ActionType = keyof typeof actionInfo;
	export const ActionTypes = Object.keys(actionInfo) as ActionType[];
	export type Action = {
		type: "CHI" | "PENG";
		from: number;
		existing: [Tile, Tile]; // 自己手里的牌
		newTile: TileID; // 其他玩家提供的牌
	} | {
		type: "DAMINGGANG";
		from: number;
		existing: [Tile, Tile, Tile];
		newTile: TileID;
	} | {
		type: "ANGANG";
		existing: [Tile, Tile, Tile, Tile];
	} | {
		type: "BUGANG";
		existing: [Tile];
	} | {
		type: "LIZHI";
		playTile: Tile;
	} | {
		type: "HU";
		from: number;
		newTile: TileID;
	} | {
		type: "ZIMO";
	} | {
		type: "PASS";
		from: number;
	};

	export function testAvailableActions(
		player: Player, newTile?: TileID, from = -1
	): Action[] {
		const results: Action[] = [];
		const deck = player.board.deck.handTiles;
		if (!newTile) {
			Util.Assert`没有新牌的时候一定是自己摸的牌：${from == -1}`;
			const drawnTile = player.board.deck.drawnTile;
			const drawnRank = tileInfo[drawnTile.tileID].relativeRank;
			const pengs = player.board.openTiles.openStacks.filter(s => s.type == "PENG");
			for (const p of pengs) {
				if (drawnRank == Math.round(tileInfo[p.newTile.tileID].relativeRank))
					results.push({
						type: 'BUGANG',
						existing: [drawnTile]
					});
			}
			for (let i = 0; i < deck.length; i++) {
				const curr = Math.round(tileInfo[deck[i].tileID].relativeRank);
				for (const p of pengs) {
					if (curr == Math.round(tileInfo[p.newTile.tileID].relativeRank))
						results.push({
							type: 'BUGANG',
							existing: [deck[i]]
						});
				}
				if (i > 1) {
					const llast = Math.round(tileInfo[deck[i - 2].tileID].relativeRank);
					const last = Math.round(tileInfo[deck[i - 1].tileID].relativeRank);
					if (curr == last && curr == llast && curr == drawnRank)
						results.push({
							type: 'ANGANG',
							existing: [deck[i - 2], deck[i - 1], deck[i], drawnTile]
						});
					if (i > 2) {
						const lllast = Math.round(tileInfo[deck[i - 3].tileID].relativeRank);
						if (curr == last && curr == llast && curr == lllast)
							results.push({
								type: 'ANGANG',
								existing: [deck[i - 3], deck[i - 2], deck[i - 1], deck[i]]
							});
					}
				}
			}
		} else {
			const newRank = tileInfo[newTile].relativeRank;
			for (let i = 0; i < deck.length; i++) {
				if (i > 0) {
					const lastID = deck[i - 1].tileID;
					const currID = deck[i].tileID;
					const last = Math.round(tileInfo[lastID].relativeRank);
					const curr = Math.round(tileInfo[currID].relativeRank);
					if ((player.playerID + 4 - from) % 4 == 1 && // 只能吃上家
						currID[0] == lastID[0] && currID[0] == newTile[0] && canCHIFamily[currID[0]] &&
						(
							(curr - last == 1 && (newRank - curr == 1 || last - newRank == 1)) ||
							(curr - newRank == 1 && newRank - last == 1)
						)
					)
						results.push({
							type: 'CHI', existing: [deck[i - 1], deck[i]], newTile, from
						});
					if (curr == last && curr == newRank)
						results.push({
							type: 'PENG', existing: [deck[i - 1], deck[i]], newTile, from
						});
					if (i > 1) {
						const llast = Math.round(tileInfo[deck[i - 2].tileID].relativeRank);
						if (curr == last && curr == llast && curr == newRank)
							results.push({
								type: 'DAMINGGANG',
								existing: [deck[i - 2], deck[i - 1], deck[i]],
								newTile, from
							});
					}
				}
			}
		}
		return results;
	}

	interface TileInfo {
		id: string;
		imgName: string;
		chnName: string;
		availableCount: number;
		relativeRank: number;
	}
}