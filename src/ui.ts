const UI = {
    game: null as HTMLDivElement,
    cssRenderOverlay: null as HTMLDivElement,
    mainCanvas: null as HTMLCanvasElement,
    background: null as HTMLDivElement,
    logs: null as HTMLDivElement,
    doraIndicators: null as HTMLDivElement,
    gameResultBackground: null as HTMLDivElement,
    audienceToolbar: null as HTMLDivElement
};

for (const id of Object.keys(UI)) UI[id] = document.getElementById(id);

class CenterInfo {
    private static readonly CONTAINER_CLASSNAME = "center-info";
    private static readonly ROUNDWIND_CLASSNAME = "round-wind";
    private static readonly TILELEFT_CLASSNAME = "tile-left";
    public readonly container: HTMLDivElement;
    private _roundWind: HTMLDivElement;
    private _tileLeft: HTMLDivElement;

    public get roundWind() {
        return this._roundWind.textContent;
    }
    public set roundWind(to: string) {
        this._roundWind.textContent = to;
    }

    public get tileLeft() {
        return this._tileLeft.textContent;
    }
    public set tileLeft(to: string) {
        this._tileLeft.textContent = to;
    }

    constructor() {
        this.container = document.createElement("div");
        this.container.className = CenterInfo.CONTAINER_CLASSNAME;
        this._roundWind = document.createElement("div");
        this._roundWind.className = CenterInfo.ROUNDWIND_CLASSNAME;
        this._tileLeft = document.createElement("div");
        this._tileLeft.className = CenterInfo.TILELEFT_CLASSNAME;
        this.container.appendChild(this._roundWind);
        this.container.appendChild(document.createElement("hr"));
        this.container.appendChild(this._tileLeft);
    }
}

class PlayerShout {
    public static readonly ANCHOR_BEGIN_POSZ = Tile.HEIGHT;
    public static readonly ANCHOR_END_POSZ = -Tile.HEIGHT;
    private static readonly SHOUT_CONTAINER_CLASSNAME = "shout-container";
    private static readonly SHOUT_CLASSNAME = "shout";
    private container: HTMLDivElement;
    private content: HTMLDivElement;
    constructor(public readonly player: Player) {
        this.container = document.createElement("div");
        this.container.className = PlayerShout.SHOUT_CONTAINER_CLASSNAME;
        this.content = document.createElement("div");
        this.content.className = PlayerShout.SHOUT_CLASSNAME;
        this.container.appendChild(this.content);
        UI.game.appendChild(this.container);
    }

    public shout(content: string) {
        const absolutePos = new THREE.Vector3();
        absolutePos.setFromMatrixPosition(this.player.board.shoutBeginAnchor.matrixWorld);
        const beginPos = game.projectTo2D(absolutePos);
        absolutePos.setFromMatrixPosition(this.player.board.shoutEndAnchor.matrixWorld);
        const endPos = game.projectTo2D(absolutePos);
        const oneThirdPos = {
            x: (endPos.x - beginPos.x) / 3 + beginPos.x,
            y: (endPos.y - beginPos.y) / 3 + beginPos.y
        };
        const twoThirdPos = {
            x: ((endPos.x - beginPos.x) * 2) / 3 + beginPos.x,
            y: ((endPos.y - beginPos.y) * 2) / 3 + beginPos.y
        };
        const tl = new TimelineMax();
        tl.add(Util.BiDirectionConstantSet(this.content, "textContent", content), 0);
        tl.add(Util.BiDirectionConstantSet(this.container.style, "display", "block"), 0);
        tl.fromTo(
            this.container,
            0.1,
            {
                scale: 0.8,
                opacity: 0,
                ...beginPos
            },
            {
                scale: 1,
                opacity: 1,
                ...oneThirdPos
            },
            0
        );
        tl.to(this.container, 0.3, {
            scale: 1.2,
            ...twoThirdPos
        });
        tl.to(this.container, 0.1, {
            scale: 3,
            opacity: 0,
            ...endPos
        });
        tl.add(Util.BiDirectionConstantSet(this.container.style, "display", "none"));
        return tl;
    }
}

class PlayerUI implements Tickable {
    public static readonly PLAYERUI_ANCHOR_POSY = Tile.HEIGHT * 2;
    private static readonly CONTAINER_CLASSNAME = "player";
    private static readonly INFO_CLASSNAME = "info";
    private static readonly INFO_ACTIVE_CLASSNAME = "info active";
    private static readonly ACTIONBAR_CLASSNAME = "actions";
    private static readonly ACTIONBUTTON_CLASSNAME = "action";
    private container: HTMLDivElement;
    private info: HTMLDivElement;

    private actionBar: HTMLDivElement;
    private actionButtons: HTMLButtonElement[] = [];

    public set active(to: boolean) {
        this.info.className = to ? PlayerUI.INFO_ACTIVE_CLASSNAME : PlayerUI.INFO_CLASSNAME;
    }

    constructor(public readonly player: Player) {
        this.container = document.createElement("div");
        this.container.className = `${PlayerUI.CONTAINER_CLASSNAME} ${PlayerUI.CONTAINER_CLASSNAME}-${player.playerID}`;
        this.info = document.createElement("div");
        this.info.className = PlayerUI.INFO_CLASSNAME;
        this.info.innerHTML = `
            <div class="position">
                ${Util.POSITIONS[player.playerID]}
            </div>
            <img class="avatar" src="${player.info.imgid}" />
            <div class="name">${player.info.name}</div>
        `;
        this.actionBar = document.createElement("div");
        this.actionBar.className = PlayerUI.ACTIONBAR_CLASSNAME;

        this.container.appendChild(this.info);
        this.container.appendChild(this.actionBar);

        UI.game.appendChild(this.container);

        tickableManager.add(this);
    }

    public setActionButtons(actions: Mahjong.Action[]) {
        this.actionBar.innerHTML = "";
        this.actionButtons = [];
        for (const a of actions) {
            const button = document.createElement("button");
            button.className = `${PlayerUI.ACTIONBUTTON_CLASSNAME} ${PlayerUI.ACTIONBUTTON_CLASSNAME}-${a.type}`;
            button.textContent = Mahjong.actionInfo[a.type].chnName;
            button.addEventListener("click", () => this.onButtonClicked(a));
            button.addEventListener("mouseenter", () => {
                if ("existing" in a)
                    for (const t of a.existing) {
                        t.shaking = true;
                    }
            });
            button.addEventListener("mouseleave", () => {
                if ("existing" in a)
                    for (const t of a.existing) {
                        t.shaking = false;
                    }
            });
            this.actionBar.appendChild(button);
            this.actionButtons.push(button);
        }
        TweenMax.staggerFrom(this.actionButtons, 0.2, { opacity: 0, scale: 0, ease: Back.easeIn }, 0.1);
    }

    public onButtonClicked(action?: Mahjong.Action) {
        if (this.actionButtons.length == 0) return;
        if (action) this.player.doAction(action);
        this.actionButtons.forEach(b => b.remove());
        this.actionButtons = [];
    }

    public onTick() {
        const absolutePos = new THREE.Vector3();
        absolutePos.setFromMatrixPosition(this.player.board.playerUIAnchor.matrixWorld);
        const pos = game.projectTo2D(absolutePos);
        this.container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
}

class DoraIndicators {
    public static readonly DORA_COUNT = 5;
    private static readonly TILE_CLASSNAME = "tile";
    public static readonly OPEN_TILE_CLASSNAME = "tile open";
    private tiles: HTMLDivElement[] = [];
    public readonly tileIDs: Mahjong.TileID[] = [];
    private _currentTileIDs: Mahjong.TileID[] = [];
    public get currentTileIDs() {
        return this._currentTileIDs;
    }
    public set currentTileIDs(to: Mahjong.TileID[]) {
        if (this._currentTileIDs === to) {
            return;
        }
        const oldIDs = this._currentTileIDs;
        this._currentTileIDs = to;
        for (const old of oldIDs) {
            Tile.updateDoras(Mahjong.getNextID(old));
        }
        for (const id of to) {
            Tile.updateDoras(Mahjong.getNextID(id));
        }
    }

    public updateAllDoras() {
        for (const id of this.currentTileIDs) {
            Tile.updateDoras(Mahjong.getNextID(id));
        }
    }

    constructor() {
        for (let i = 0; i < DoraIndicators.DORA_COUNT; i++) {
            const tile = document.createElement("div");
            tile.className = DoraIndicators.TILE_CLASSNAME;
            UI.doraIndicators.appendChild(tile);
            this.tiles.push(tile);
        }
    }

    public reveal(tileID: Mahjong.TileID) {
        Util.Assert`翻开的宝牌指示牌不超过5张：${this.tileIDs.length < 5}`;
        const tile = this.tiles[this.tileIDs.length];
        tile.appendChild(Assets.loadedImages[tileID].cloneNode());
        this.tileIDs.push(tileID);
        const tl = new TimelineMax();
        tl.add(Util.BiDirectionConstantSet(tile, "className", DoraIndicators.OPEN_TILE_CLASSNAME));
        tl.add(Util.BiDirectionConstantSet(this, "currentTileIDs", [...this.tileIDs]));
        return tl;
    }
}

type GameResult =
    | {
          huer: Player;
          newTile: Mahjong.TileID;
          from: number;
          type: "ZIMO" | "HU";
          fan: string[];
          score: number;
          fu: number;
      }
    | {
          huer: Player;
          type: "DRAW";
          reason: string;
          score: number;
      };

class GameResultView {
    private static readonly MAIN_CLASSNAME = "game-result";
    private static readonly ACTIVE_CLASSNAME = "active";
    private static readonly BLUR_CLASSNAME = "blur";
    private static getHTMLForResult(result: GameResult) {
        if (result.type === "DRAW") {
            return `
            <div class="result">
                <div class="result-upper">
                    <div class="player">
                        <img class="avatar" src="${result.huer.info.imgid}" />
                        <span class="position">${Util.POSITIONS[result.huer.playerID]}家</span>
                        <span class="name">${result.huer.info.name}</span>
                    </div>
                    <div class="draw">流局</div>
                </div>
                <div class="fan">
                    <label>原因</label>
                    <span>${result.reason}</span>
                    <label>得分</label>
                    <span>${result.score}</span>
                </div>
            </div>
            `;
        }
        return `
        <div class="result">
            <div class="result-upper">
                <div class="player">
                    <img class="avatar" src="${result.huer.info.imgid}" />
                    <span class="position">${Util.POSITIONS[result.huer.playerID]}家</span>
                    <span class="name">${result.huer.info.name}</span>
                </div>
                <div class="hu">
                    <span class="type">${Mahjong.actionInfo[result.type].chnName}</span>
                    ${result.type === "HU" ? `<span class="from">${Util.POSITIONS[result.from]}家点炮</span>` : ""}
                </div>
            </div>
            <div class="deck">
                ${[...result.huer.board.deck.handTiles.map(t => t.tileID), result.newTile]
                    .map(
                        t =>
                            `<div class="${DoraIndicators.OPEN_TILE_CLASSNAME}">
                                <img src="${Assets.loadedImages[t].src}" />
                            </div>`
                    )
                    .join("")}
            </div>
            <div class="fan">
                <label>番型</label>
                ${result.fan.map(f => `<span>${f}</span>`).join("")}
            </div>
            <div class="score">
                <label>得分</label>
                <span>${result.score}</span>
            </div>
        </div>
        `;
    }

    public setResult(results: GameResult[]) {
        const gameResultView = document.createElement("div");
        gameResultView.className = GameResultView.MAIN_CLASSNAME;
        gameResultView.innerHTML =
            "<header><span>本局结果</span><hr /></header>" + results.map(GameResultView.getHTMLForResult).join("");
        UI.gameResultBackground.appendChild(gameResultView);
        const tl = new TimelineMax();
        tl.add(Util.BiDirectionConstantSet(game, "pause", true));
        tl.add(Util.BiDirectionConstantSet(UI.game, "className", GameResultView.BLUR_CLASSNAME));
        tl.add(Util.BiDirectionConstantSet(UI.gameResultBackground, "className", GameResultView.ACTIVE_CLASSNAME));
        tl.set(gameResultView, { display: "block", immediateRender: false }, 1);
        tl.fromTo(gameResultView, 0.5, { y: "50vh" }, { y: 0, immediateRender: false, ease: Back.easeOut });
        return tl;
    }
}

class SpectatorControl {
    public set visible(to: boolean) {
        UI.audienceToolbar.style.display = to ? "block" : "none";
    }
    constructor() {
        const left = document.createElement("button");
        const toggleOpen = document.createElement("button");
        const right = document.createElement("button");
        left.textContent = "上家视角";
        left.addEventListener("click", () => {
            game.viewPoint = (game.viewPoint + 3) % 4;
        });
        toggleOpen.textContent = "亮牌";
        toggleOpen.addEventListener("click", () => {
            const shouldOpen = !game.players[0].board.openDeck;
            for (const p of game.players) p.board.openDeck = shouldOpen;
            toggleOpen.className = shouldOpen ? "active" : "";
        });
        right.textContent = "下家视角";
        right.addEventListener("click", () => {
            game.viewPoint = (game.viewPoint + 1) % 4;
        });
        UI.audienceToolbar.appendChild(left);
        UI.audienceToolbar.appendChild(toggleOpen);
        UI.audienceToolbar.appendChild(right);
    }
}
