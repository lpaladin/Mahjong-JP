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

    export interface ActionBase extends Base {
        player: number;
        tile: Mahjong.TileID;
        tileCnt: number;
    }

    export interface Draw extends ActionBase {
        action: "DRAW";
    }

    export interface Play extends ActionBase {
        action: "PLAY";
    }

    export interface Chi extends ActionBase {
        action: "CHI";
        tileCHI: string;
    }

    export interface Peng extends ActionBase {
        action: "PENG";
        tilePENG: string;
    }

    export interface Gang extends ActionBase {
        action: "GANG";
    }

    export interface AnGang extends ActionBase {
        action: "ANGANG";
    }

    export interface BuGang extends ActionBase {
        action: "BUGANG";
    }

    export interface Lizhi extends ActionBase {
        action: "LIZHI";
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
        hiddenDoraIndicators?: string;
        action: "HU";
    }

    export interface DrawGameResult extends GameResultBase {
        action: "HUANG";
        details: ForEachPlayer<"TING" | "NOTING"> | ForEachPlayer<"LIUMAN" | "NOLIUMAN">;
    }

    export interface FourGangDrawGameResult extends GameResultBase {
        action: "SAN";
    }

    export type ErrorAction = "TLE" | "WA" | "MLE" | "RE" | "ERR";

    export type GameEndingLog = HuGameResult | DrawGameResult | FourGangDrawGameResult | ErrorGameResult;

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
    | DisplayLog.AnGang
    | DisplayLog.BuGang
    | DisplayLog.Lizhi
    | DisplayLog.HuGameResult
    | DisplayLog.DrawGameResult
    | DisplayLog.FourGangDrawGameResult
    | DisplayLog.ErrorGameResult;

interface RequestLog {
    state: string;
    validact: string | null;
}
