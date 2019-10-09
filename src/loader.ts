namespace Loader {
    let nextPromise: Promise<any> = Promise.resolve();

    function BotzoneInit(): Promise<void> {
        window["THREEx"] = window["THREE"] as any;
        if (typeof infoProvider !== "undefined") {
            // 生产模式，需要使用 Botzone 提供的 TweenMax
            window.TweenMax = infoProvider.v2.TweenMax;
            window.TimelineMax = infoProvider.v2.TimelineMax;
            window.Ease = parent.Ease;
            window.Expo = parent.Expo;
            window.Linear = parent.Linear;
            window.Back = parent.Back;
            window.Quad = parent.Quad;
            return Promise.resolve();
        } else {
            // 调试模式
            return new Promise((ac, rej) => {
                const gsapScript = document.createElement("script");
                gsapScript.src =
                    "node_modules/gsap/src/minified/TweenMax.min.js";
                gsapScript.addEventListener("load", () => ac());
                gsapScript.addEventListener("error", rej);
                document.body.appendChild(gsapScript);
                window["infoProvider"] = <any>{
                    dbgMode: true,
                    getPlayerID: () => 0,
                    getPlayerNames: () => [
                        { name: "青龙", imgid: "default.png" },
                        { name: "白虎", imgid: "default.png" },
                        { name: "朱雀", imgid: "default.png" },
                        { name: "玄武", imgid: "default.png" }
                    ],
                    v2: {
                        setRenderTickCallback: (cb: Function) =>
                            TweenMax.ticker.addEventListener("tick", cb)
                    }
                };
            });
        }
    }

    export function addPromise(...promises: Promise<any>[]) {
        nextPromise = nextPromise.then(() => Promise.all(promises));
    }

    export function onFinish(cb: () => void) {
        nextPromise = nextPromise.then(cb);
    }

    addPromise(BotzoneInit(), Assets.LoadAllTiles(), Assets.InitializeSMAA());
}
