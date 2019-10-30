interface Initializable {
    (addProgress: () => void): {
        totalProgress: number;
        description: string;
        finishPromise: Promise<any>;
    };
}

declare namespace Loader {
    export function addInitializable(initializable: Initializable);
    export let globalTL: TimelineMax;
}

(function() {
    const BotzoneInit: Initializable = addProgress => ({
        totalProgress: 1,
        description: "播放器与 Botzone 对接",
        finishPromise: (async () => {
            window["THREEx"] = window["THREE"] as any;
            if (window.parent !== window) {
                // 生产模式，需要使用 Botzone 提供的 TweenMax
                window.TweenMax = infoProvider.v2.TweenMax;
                window.TimelineMax = infoProvider.v2.TimelineMax;
                window.Ease = parent.Ease;
                window.Expo = parent.Expo;
                window.Linear = parent.Linear;
                window.Back = parent.Back;
                window.Quad = parent.Quad;
                window.Sine = parent.Sine;
                window.Circ = parent.Circ;
                window.Cubic = parent.Cubic;
                window.Power2 = parent.Power2;
                window.Power4 = parent.Power4;

                Loader.globalTL = new TimelineMax();
            } else {
                // 调试模式
                const fullLog = await (await fetch("altin.json")).json();
                let displayCB: Function;
                window["infoProvider"] = <any>{
                    dbgMode: true,
                    getPlayerID: () => -1,
                    getPlayerNames: () => [
                        { name: "青龙", imgid: "default.png" },
                        { name: "白虎", imgid: "default.png" },
                        { name: "朱雀", imgid: "default.png" },
                        { name: "玄武", imgid: "default.png" }
                    ],
                    v2: {
                        setRenderTickCallback: (cb: Function) => TweenMax.ticker.addEventListener("tick", cb),
                        setDisplayCallback: (cb: Function) => (displayCB = cb),
                        setRequestCallback: Util.IDENTITY,
                        setGameOverCallback: Util.IDENTITY,
                        notifyInitComplete: (tl: TimelineMax) => {
                            Loader.globalTL = tl = tl || new TimelineMax();
                            for (const l of fullLog.log) {
                                if ("output" in l && "display" in l.output) {
                                    tl.add(displayCB(l.output.display));
                                }
                            }
                        }
                    }
                };
            }
            addProgress();
        })()
    });

    Loader.addInitializable(BotzoneInit);
    Loader.addInitializable(Assets.LoadAllTiles);
    Loader.addInitializable(Assets.InitializeSMAA);
})();
