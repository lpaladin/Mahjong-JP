interface ForEachPlayer<T> {
    [playerId: number]: T;
}

declare namespace DisplayLog {
    export interface Init {
        action: "INIT";
        quan: number;
    }

    export interface Deal extends ForEachPlayer<string> {
        action: "DEAL";
        tileCnt: number;
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
        tileCnt: 79;
    }

    export interface Chi {
        action: "CHI";
        player: number;
        tile: Mahjong.TileID;
        tileCHI: string;
        tileCnt: 79;
    }

    export interface Lizhi {
        action: "LIZHI";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface PlayerResult {
        ScoreCnt: number;
        // action: "HU" | "ZIMO";
        fan: {
            name: string;
            value: number;
        }[];
        fanCnt: number;
        fuCnt: number;
        isYaKuMan: boolean;
        player: number;
    }

    export interface GameResult extends ForEachPlayer<PlayerResult | null> {
        canHu: [number, number, number, number];
        score: [number, number, number, number];
    }
}

type DisplayLog =
    | DisplayLog.Init
    | DisplayLog.Deal
    | DisplayLog.Draw
    | DisplayLog.Play
    | DisplayLog.Chi
    | DisplayLog.Lizhi
    | DisplayLog.GameResult;
