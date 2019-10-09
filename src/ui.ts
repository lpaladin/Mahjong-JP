const UI = {
    cssRenderOverlay: null as HTMLDivElement,
    mainCanvas: null as HTMLCanvasElement,
    background: null as HTMLDivElement,
    logs: null as HTMLDivElement
};

for (const id of Object.keys(UI)) UI[id] = document.getElementById(id);

class CenterInfo {
    public static readonly CONTAINER_CLASSNAME = "center-info";
    public static readonly ROUNDWIND_CLASSNAME = "round-wind";
    public static readonly TILELEFT_CLASSNAME = "tile-left";
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
    public static readonly SHOUT_CONTAINER_CLASSNAME = "shout-container";
    public static readonly SHOUT_CLASSNAME = "shout";
    private container: HTMLDivElement;
    private content: HTMLDivElement;
    constructor(public readonly player: Player) {
        this.container = document.createElement("div");
        this.container.className = PlayerShout.SHOUT_CONTAINER_CLASSNAME;
        this.content = document.createElement("div");
        this.content.className = PlayerShout.SHOUT_CLASSNAME;
        this.container.appendChild(this.content);
        document.body.appendChild(this.container);
    }

    public shout(content: string) {
        const absolutePos = new THREE.Vector3();
        absolutePos.setFromMatrixPosition(
            this.player.board.shoutBeginAnchor.matrixWorld
        );
        const beginPos = game.projectTo2D(absolutePos);
        absolutePos.setFromMatrixPosition(
            this.player.board.shoutEndAnchor.matrixWorld
        );
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
        tl.add(
            Util.BiDirectionConstantSet(this.content, "textContent", content),
            0
        );
        tl.add(
            Util.BiDirectionConstantSet(
                this.container.style,
                "display",
                "block"
            ),
            0
        );
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
        tl.add(
            Util.BiDirectionConstantSet(this.container.style, "display", "none")
        );
        return tl;
    }
}

class PlayerUI implements Tickable {
    public static readonly PLAYERUI_ANCHOR_POSY = Tile.HEIGHT * 2;
    public static readonly CONTAINER_CLASSNAME = "player";
    public static readonly PLAYERINFO_CLASSNAME = "info";
    public static readonly AVATAR_CLASSNAME = "avatar";
    public static readonly POSITION_CLASSNAME = "position";
    public static readonly NAME_CLASSNAME = "name";
    public static readonly ACTIONBAR_CLASSNAME = "actions";
    public static readonly ACTIONBUTTON_CLASSNAME = "action";
    private container: HTMLDivElement;
    private actionBar: HTMLDivElement;
    private actionButtons: HTMLButtonElement[] = [];

    constructor(public readonly player: Player) {
        this.container = document.createElement("div");
        this.container.className = `${PlayerUI.CONTAINER_CLASSNAME} ${PlayerUI.CONTAINER_CLASSNAME}-${player.playerID}`;
        this.container.innerHTML = `
			<div class="${PlayerUI.PLAYERINFO_CLASSNAME}">
				<div class="${PlayerUI.POSITION_CLASSNAME}">
					${Util.POSITIONS[player.playerID]}
				</div>
				<img class="${PlayerUI.AVATAR_CLASSNAME}" src="${player.info.imgid}" />
				<div class="${PlayerUI.NAME_CLASSNAME}">${player.info.name}</div>
			</div><div class="${PlayerUI.ACTIONBAR_CLASSNAME}"></div>
		`;
        this.actionBar = this.container.querySelector(
            "." + PlayerUI.ACTIONBAR_CLASSNAME
        );

        document.body.appendChild(this.container);

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
        TweenMax.staggerFrom(
            this.actionButtons,
            0.2,
            { opacity: 0, scale: 0, ease: Back.easeIn },
            0.1
        );
    }

    public onButtonClicked(action?: Mahjong.Action) {
        if (this.actionButtons.length == 0) return;
        if (action) this.player.doAction(action);
        this.actionButtons.forEach(b => b.remove());
        this.actionButtons = [];
    }

    public onTick() {
        const absolutePos = new THREE.Vector3();
        absolutePos.setFromMatrixPosition(
            this.player.board.playerUIAnchor.matrixWorld
        );
        const pos = game.projectTo2D(absolutePos);
        this.container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
}
