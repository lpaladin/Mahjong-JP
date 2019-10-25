interface ForEachPlayer<T> {
    [playerId: number]: T;
}

declare namespace DisplayLog {
    export interface Base {
        canHu: ForEachPlayer<number>;
        doraIndicators: string;
        prompt: null | ForEachPlayer<{ validact: string }>;
    }

    export interface Init {
        action: "INIT";
        quan: number;
    }

    export interface Deal {
        action: "DEAL";
        tileCnt: number;
        hand: ForEachPlayer<Mahjong.TileID[]>;
    }

    export interface Draw {
        action: "DRAW";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Play {
        action: "PLAY";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Chi {
        action: "CHI";
        player: number;
        tile: Mahjong.TileID;
        tileCHI: string;
        tileCnt: number;
    }

    export interface Peng {
        action: "PENG";
        player: number;
        tile: Mahjong.TileID;
        tilePENG: string;
        tileCnt: number;
    }

    export interface Gang {
        action: "GANG";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Lizhi {
        action: "LIZHI";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface PlayerResult {
        ScoreCnt: number;
        fan: {
            name: string;
            value: number;
        }[];
        fanCnt: number;
        fuCnt: number;
        isYaKuMan: boolean;
        player: number;
    }

    export interface HuGameResult extends ForEachPlayer<PlayerResult | null> {
        action: "HU";
        score: [number, number, number, number];
    }

    export interface HuangGameResult {
        action: "HUANG";
        score: [number, number, number, number];
    }
}

type DisplayLog =
    | DisplayLog.Init
    | (
          | DisplayLog.Deal
          | DisplayLog.Draw
          | DisplayLog.Play
          | DisplayLog.Chi
          | DisplayLog.Peng
          | DisplayLog.Gang
          | DisplayLog.Lizhi
          | DisplayLog.HuGameResult
          | DisplayLog.HuangGameResult) &
          DisplayLog.Base;
