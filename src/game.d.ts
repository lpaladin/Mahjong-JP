interface ForEachPlayer<T> {
    [playerId: number]: T;
}

declare namespace DisplayLog {
    export interface Base {
        doraIndicators: string;
        prompt: null | ForEachPlayer<{ validact: string }>;
    }

    export interface Init {
        action: "INIT";
        quan: number;
    }

    export interface Deal extends Base {
        action: "DEAL";
        tileCnt: number;
        hand: ForEachPlayer<Mahjong.TileID[]>;
    }

    export interface Draw extends Base {
        action: "DRAW";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Play extends Base {
        action: "PLAY";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Chi extends Base {
        action: "CHI";
        player: number;
        tile: Mahjong.TileID;
        tileCHI: string;
        tileCnt: number;
    }

    export interface Peng extends Base {
        action: "PENG";
        player: number;
        tile: Mahjong.TileID;
        tilePENG: string;
        tileCnt: number;
    }

    export interface Gang extends Base {
        action: "GANG";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface BuGang extends Base {
        action: "BUGANG";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Lizhi extends Base {
        action: "LIZHI";
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface PlayerResult {
        action: "HU";
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

    interface GameResultBase extends Base {
        score: [number, number, number, number];
    }

    export interface HuGameResult extends ForEachPlayer<PlayerResult | null>, GameResultBase {
        action: "HU";
    }

    export interface DrawGameResult extends GameResultBase {
        action: "HUANG";
    }

    export type ErrorAction = "TLE" | "WA" | "MLE" | "RE" | "ERR";

    export type GameEndingLog = HuGameResult | DrawGameResult | ErrorGameResult;

    export interface ErrorGameResult extends GameResultBase {
        action: ErrorAction;
        player: number;
    }
}

type DisplayLog =
    | DisplayLog.Init
    | DisplayLog.Deal
    | DisplayLog.Draw
    | DisplayLog.Play
    | DisplayLog.Chi
    | DisplayLog.Peng
    | DisplayLog.Gang
    | DisplayLog.BuGang
    | DisplayLog.Lizhi
    | DisplayLog.HuGameResult
    | DisplayLog.DrawGameResult
    | DisplayLog.ErrorGameResult;

interface RequestLog {
    state: string;
    validact: string | null;
}
