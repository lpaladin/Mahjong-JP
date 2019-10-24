/*

 ^y
 |
 |
 |
 你(z)----->x

*/

interface Tickable {
    onTick(): void;
}

class TickableManager extends Set<Tickable> implements Tickable {
    constructor() {
        super();
        infoProvider.v2.setRenderTickCallback(() => this.onTick());
    }
    public onTick() {
        for (const t of this) t.onTick();
    }
}

class Game implements Tickable {
    public readonly scene = new THREE.Scene();
    public readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    private readonly clock = new THREE.Clock();
    private readonly renderer = new THREE.WebGLRenderer({
        canvas: UI.mainCanvas,
        alpha: true
        //antialias: true
    });

    public readonly uiScene = new THREE.Scene();
    private readonly uiRenderer = new THREEx.CSS3DRenderer();

    private readonly composer = new POSTPROCESSING.EffectComposer(this.renderer);
    public readonly doraIndicators = new DoraIndicators();
    public readonly players = [0, 1, 2, 3].map(i => new Player(i));
    public readonly centerScreen = new CenterScreen();
    public readonly gameResultView = new GameResultView();
    public readonly spectatorControl = new SpectatorControl();
    public readonly mouseCoord = new THREE.Vector2();
    public readonly raycaster = new THREE.Raycaster();
    public pause = false;

    private lastPlayedPlayer = -1;
    private lastLizhiPlayer = -1;
    private lastPlayedTile: Mahjong.TileID;
    private w = 0;
    private h = 0;
    private cameraPositionBase = new THREE.Vector3();
    private mouseRightButtonDown = false;
    private light: THREE.DirectionalLight;
    private currPlayerID = -1;
    private _viewPoint = -1;
    private cameraKeepFocusing = false;
    private cameraUncontrolled = false;
    private _activePlayerId = -1;
    public get activePlayerId() {
        return this._activePlayerId;
    }

    public set activePlayerId(to: number) {
        if (this._activePlayerId === to) {
            return;
        }
        if (this._activePlayerId !== -1) {
            this.players[this._activePlayerId].ui.active = false;
        }
        if (to !== -1) {
            this.players[to].ui.active = true;
        }
        this._activePlayerId = to;
    }

    public get currPlayer() {
        return this.players[this.currPlayerID];
    }
    public get playerMe() {
        return this.players[infoProvider.getPlayerID()];
    }

    public get viewPoint() {
        return this._viewPoint;
    }

    public set viewPoint(to: number) {
        if (this._viewPoint === to) {
            return;
        }
        this._viewPoint = to;
        this.cameraKeepFocusing = this.cameraUncontrolled = true;
        this.cameraPositionBase.set(Util.DIR_X[to] * 70, 35, Util.DIR_Z[to] * 70);
        this.centerScreen.viewPoint = to;
        const tl = new TimelineMax();
        tl.to(this.camera.position, 0.3, {
            x: this.cameraPositionBase.x,
            ease: to % 2 ? Sine.easeOut : Sine.easeIn
        });
        tl.to(
            this.camera.position,
            0.3,
            {
                z: this.cameraPositionBase.z,
                ease: to % 2 ? Sine.easeIn : Sine.easeOut
            },
            0
        );
        tl.set(this.camera.position, { y: this.cameraPositionBase.y });
        tl.call(() => {
            this.camera.lookAt(Util.ZERO3);
            this.cameraKeepFocusing = this.cameraUncontrolled = false;
        });
        this.doraIndicators.updateAllDoras();
    }

    private setupPostProcessing() {
        Assets.InitializeEffects(this.scene, this.camera);
        const renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera);
        renderPass.renderToScreen = false;
        this.composer.addPass(renderPass);

        const effectPass = new POSTPROCESSING.EffectPass(this.camera, Assets.outlineEffect);
        const smaaPass = new POSTPROCESSING.EffectPass(this.camera, Assets.smaaEffect);
        smaaPass.renderToScreen = true;
        this.composer.addPass(effectPass);
        this.composer.addPass(smaaPass);
    }

    constructor() {
        Util.Log`资源就绪，开始初始化`;

        this.uiScene.scale.setScalar(1 / 16);
        UI.cssRenderOverlay.appendChild(this.uiRenderer.domElement);

        this.setupPostProcessing();

        window.addEventListener("resize", () => this.initRenderer());
        window.addEventListener("mousemove", e =>
            this.mouseCoord.set((e.clientX / this.w) * 2 - 1, -(e.clientY / this.h) * 2 + 1)
        );
        window.addEventListener("mousedown", e => {
            if (e.button == 2) {
                if (!this.mouseRightButtonDown) {
                    this.mouseRightButtonDown = true;
                    // for (const p of this.players) p.board.openDeck = true;
                }
            }
        });
        window.addEventListener("contextmenu", e => {
            e.preventDefault();
            return false;
        });
        window.addEventListener("mouseup", e => {
            if (e.button == 2) {
                if (this.mouseRightButtonDown) {
                    this.mouseRightButtonDown = false;
                    document.body.style.cursor = "help"; // ?
                    setTimeout(() => (document.body.style.cursor = ""), 1000);
                    // this.doraIndicators.reveal(Util.RandInArray(Mahjong.TileIDs));
                    // for (const p of this.players) p.board.openDeck = false;
                    // const activeTile = this.playerMe.board.hoveredTile;
                    // activeTile && this.focusAndWave(activeTile);
                    // this.viewPoint = (this.viewPoint + 1) % 4;
                }
            }
        });
        UI.mainCanvas.addEventListener("click", () => {
            if (infoProvider.getPlayerID() !== -1 && this.playerMe.interactable) {
                const playedTile = this.playerMe.board.hoveredTile.tileID;
                const preAction = this.playerMe.partialSpecialAction;
                infoProvider.notifyPlayerMove((preAction ? preAction.type : "PLAY") + " " + playedTile);
                this.playerMe.interactable = false;
                Util.PrimaryLog`你已经选择打出一张${Mahjong.tileInfo[playedTile].chnName}，请等待其他玩家或裁判回应……`;
            }
        });

        tickableManager.add(this);

        for (const p of this.players) {
            this.scene.add(p.board);
        }
        this.centerScreen.position.y -= (Tile.HEIGHT - CenterScreen.THICKNESS) / 2;
        this.scene.add(this.centerScreen);
        this.uiScene.add(this.centerScreen.textCSSObj);
        this.centerScreen.roundWind = 0;
        this.centerScreen.tileLeft = 100;

        const a = (PlayerArea.HEIGHT + Tile.DEPTH + PlayerArea.BOARD_GAP) * 2;
        const table = new THREE.Mesh(
            new THREE.BoxBufferGeometry(a, 1, a),
            new THREE.MeshBasicMaterial({ color: Colors.TileBackColorDark })
        );
        table.position.set(0, -Tile.HEIGHT / 2 - 0.51, 0);
        this.scene.add(table);

        const me = infoProvider.getPlayerID();
        this.viewPoint = me >= 0 ? me : 0;
        this.spectatorControl.visible = me === -1;

        this.scene.add(new THREE.AmbientLight(Colors.White, 0.4));
        this.light = new THREE.DirectionalLight(Colors.White, 0.8);
        this.light.position.set(0, 20, 0);
        this.light.castShadow = true;
        this.light.shadow.camera.near = 10;
        this.light.shadow.camera.far = 30;
        this.light.shadow.camera.top = PlayerArea.HEIGHT * 2;
        this.light.shadow.camera.left = -PlayerArea.HEIGHT * 2;
        this.light.shadow.camera.right = PlayerArea.HEIGHT * 2;
        this.light.shadow.camera.bottom = -PlayerArea.HEIGHT * 2;
        this.scene.add(this.light);

        this.initRenderer();
        //new THREE['OrbitControls'](this.camera, UI.mainCanvas);

        infoProvider.v2.setDisplayCallback(this.handleDisplayLog);
        infoProvider.v2.setRequestCallback(() => {
            this.playerMe.interactable = true;
            Util.PrimaryLog`${"你"}的回合，请选择要打出的牌`; // TODO or action
            const tl = new TimelineMax();
            tl.call(() => (this.activePlayerId = infoProvider.getPlayerID()));
            return tl;
        });

        Util.Log`初始化完成`;
    }

    public handleDisplayLog = (log: DisplayLog): TimelineMax => {
        // console.log(this.players.map(p => p.board.deck.handTiles.map(t => t.tileID).join(" ")).join("\n"));
        // console.log(log);
        const tl = new TimelineMax();
        if (log.action !== "HUANG" && log.action !== "HU") {
            if (this.lastLizhiPlayer !== -1) {
                tl.add(game.centerScreen.putLizhiStick(this.lastLizhiPlayer));
                this.lastLizhiPlayer = -1;
            }
            if ("tileCnt" in log) {
                tl.add(Util.BiDirectionConstantSet(this.centerScreen, "tileLeft", log.tileCnt), "+=0.5");
            }
            if (log.action === "DEAL") {
                for (const p of this.players) {
                    tl.add(p.board.deck.init(log.hand[p.playerID]));
                }
                for (const p of this.players) {
                    tl.add(p.board.deck.sort());
                }
            } else if (log.action === "INIT") {
                // pass
            } else {
                tl.add(Util.BiDirectionConstantSet(this, "activePlayerId", log.player));
                const player = this.players[log.player];
                const newActions: Mahjong.Action[] = [];
                switch (log.action) {
                    case "DRAW":
                        if (this.lastPlayedPlayer != -1) {
                            tl.add(game.players[this.lastPlayedPlayer].board.river.finalizeLatestTile());
                            this.lastPlayedPlayer = -1;
                        }
                        newActions.push({
                            type: "DRAW",
                            tile: log.tile
                        });
                        break;
                    case "CHI":
                    case "PENG":
                    case "PLAY":
                    case "LIZHI":
                        if (log.action === "CHI" || log.action === "PENG") {
                            newActions.push({
                                type: log.action,
                                from: this.lastPlayedPlayer,
                                tile: this.lastPlayedTile,
                                existing: player.board.deck.getTilesByIds(
                                    Util.LessOne(log["tile" + log.action].split(" ") as Mahjong.TileID[], this.lastPlayedTile)
                                ) as [Tile, Tile]
                            });
                        }
                        {
                            const tile = player.board.deck.getTilesByIds([log.tile])[0];
                            Util.Assert`打出的一定是手中的牌：${!!tile}`;
                            newActions.push({
                                type: log.action === "LIZHI" ? "LIZHI" : "PLAY",
                                tile
                            });
                            this.lastPlayedPlayer = log.player;
                            this.lastLizhiPlayer = log.action === "LIZHI" ? log.player : -1;
                            this.lastPlayedTile = log.tile;
                        }
                        break;
                }
                for (const action of newActions) {
                    tl.add(player.doAction(action));
                }
            }
        } else if (log.action === "HU") {
            const results: GameResult[] = [];
            for (const p of this.players) {
                const result: DisplayLog.PlayerResult | null = log[p.playerID];
                const isZimo = this.lastPlayedPlayer === -1;
                if (result) {
                    if (isZimo) {
                        tl.add(
                            p.doAction({
                                type: "ZIMO"
                            }),
                            "+=1"
                        );
                    } else {
                        tl.add(
                            p.doAction({
                                type: "HU",
                                from: this.lastPlayedPlayer,
                                tile: this.players[this.lastPlayedPlayer].board.river.latestTile
                            }),
                            "+=1"
                        );
                    }
                    results.push({
                        type: isZimo ? "ZIMO" : "HU",
                        huer: p,
                        from: isZimo ? p.playerID : this.lastPlayedPlayer,
                        newTile: isZimo ? p.board.deck.drawnTile.tileID : this.lastPlayedTile,
                        fan: result.fan.map(f => `${f.name} - ${f.value}番`),
                        fu: result.fuCnt,
                        score: result.ScoreCnt
                    });
                }
            }
            tl.add(this.gameFinish(results), "+=0.5");
        } else {
            const results: GameResult[] = [];
            tl.add(this.players[this.lastPlayedPlayer].board.river.finalizeLatestTile(), "+=0.5");
            const baseTime = tl.duration();
            for (const p of this.players) {
                tl.add(
                    p.doAction({
                        type: "NOTING"
                    }),
                    baseTime
                );
                results.push({
                    type: "DRAW",
                    huer: p,
                    score: log.score[p.playerID],
                    reason: "荒牌流局"
                });
            }
            tl.add(this.gameFinish(results), "+=0.5");
        }
        return tl;
    };

    // public nextPlayer(setTo = -1) {
    //     if (setTo != -1) this.currPlayerID = setTo;
    //     else if (++this.currPlayerID == 4) {
    //         this.round++;
    //         this.currPlayerID = 0;
    //     }
    //     const player = this.currPlayer;
    //     const tl = new TimelineMax();
    //     tl.call((r, n) => Util.PrimaryLog`当前是第${r + 1}巡，${n}的回合`, [this.round, this.players[this.currPlayerID].info]);
    //     if (setTo == -1) tl.add(player.board.deck.drawTile(Util.RandInArray(Mahjong.TileIDs)));
    //     if (this.currPlayerID == infoProvider.getPlayerID()) {
    //         player.interactable = true;
    //         if (setTo == -1) player.ui.setActionButtons(Mahjong.testAvailableActions(player));
    //     } else {
    //         const newTile = Util.RandInArray(player.board.deck.handTiles);
    //         tl.add(player.playTile(newTile), "+=1");
    //         const myActions = Mahjong.testAvailableActions(this.playerMe, newTile.tileID, this.currPlayerID);
    //         myActions.push({ type: "PASS", from: this.currPlayerID });
    //         if (myActions.length > 1) this.playerMe.ui.setActionButtons(myActions);
    //         else tl.add(this.playerMe.doAction(myActions[0]));
    //     }
    //     return tl;
    // }

    public focusAndWave(target: THREE.Mesh) {
        const lastCameraRotation = Util.ToPlain(this.camera.rotation);
        const lastCameraPosition = Util.ToPlain(this.camera.position);
        target.updateMatrixWorld();
        const targetAbsolutePos = target.getWorldPosition(new THREE.Vector3());
        this.camera.lookAt(targetAbsolutePos);
        const targetCameraRotation = Util.ToPlain(this.camera.rotation);
        const targetCameraPosition = Util.ToPlain(
            targetAbsolutePos.clone().add(
                this.camera.position
                    .clone()
                    .sub(targetAbsolutePos)
                    .multiplyScalar(0.6)
            )
        );
        const subTL = new TimelineMax();
        subTL.pause();
        subTL.fromTo(this.camera.rotation, 1, lastCameraRotation, {
            ...targetCameraRotation,
            ease: Power4.easeOut,
            immediateRender: false
        });
        subTL.fromTo(
            (target.material as THREE.MeshLambertMaterial).emissive,
            0.6,
            { r: 0, g: 0, b: 0 },
            {
                r: 0.5,
                g: 0.5,
                b: 0.5,
                ease: Linear.easeNone,
                immediateRender: false
            },
            0.4
        );
        subTL.fromTo(
            this.camera.position,
            1,
            lastCameraPosition,
            {
                ...targetCameraPosition,
                ease: Linear.easeNone,
                immediateRender: false
            },
            0
        );

        const tl = new TimelineMax();

        this.cameraUncontrolled = true;
        const sw = new POSTPROCESSING.ShockWaveEffect(this.camera, targetAbsolutePos, {
            maxRadius: 10,
            waveSize: 1,
            speed: 4,
            amplitude: 0.25
        });
        const swPass = new POSTPROCESSING.EffectPass(this.camera, sw);
        this.composer.addPass(swPass, 2);
        this.initRenderer();

        tl.fromTo(subTL, 1.3, { progress: 0 }, { progress: 1, ease: Power4.easeOut, immediateRender: false });
        tl.call(
            () => {
                sw.explode();
            },
            null,
            null,
            0.3
        );
        tl.fromTo(subTL, 0.8, { progress: 1 }, { progress: 0, ease: Power4.easeIn, immediateRender: false });
        tl.call(() => {
            this.cameraUncontrolled = false;
            this.composer.removePass(swPass);
        });
        // DO NOT return tl
    }

    public gameFinish(results: GameResult[]) {
        const tl = new TimelineMax();
        if (results.every(r => r.type === "DRAW")) {
            tl.call(() => Util.PrimaryLog`本局游戏结束，流局`);
        } else {
            tl.call(() => Util.PrimaryLog`本局游戏结束，${results.map(r => r.huer.info)}胡了`);
        }
        tl.add(game.gameResultView.setResult(results));
        return tl;
    }

    public cameraShake(amp: number, iter: number, time: number) {
        this.cameraUncontrolled = true;
        const tl = new TimelineMax();
        const timePerIter = time / iter;
        const basePos = this.cameraPosition;
        for (; iter > 0; iter--) {
            tl.to(this.camera.position, timePerIter, {
                x: basePos.x + ((Math.random() - 0.5) * amp) / iter,
                y: basePos.y + ((Math.random() - 0.5) * amp) / iter,
                z: basePos.z + ((Math.random() - 0.5) * amp) / iter,
                repeat: 1,
                yoyo: true
            });
        }
        tl.call(() => (this.cameraUncontrolled = false));
        // DO NOT return tl
    }

    private get cameraPosition() {
        return new THREE.Vector3(
            this.cameraPositionBase.x + Util.DIR_Z[this.viewPoint] * this.mouseCoord.x * 0.3,
            this.cameraPositionBase.y + this.mouseCoord.y * 0.3,
            this.cameraPositionBase.z - Util.DIR_X[this.viewPoint] * this.mouseCoord.x * 0.3
        );
    }

    public onTick() {
        if (this.pause) {
            return;
        }
        if (!this.cameraUncontrolled) {
            this.camera.position.copy(this.cameraPosition);
        }
        if (this.cameraKeepFocusing) {
            this.camera.lookAt(Util.ZERO3);
        }
        UI.background.style.transform = `translate(${-2 * this.mouseCoord.x}vw, ${2 * this.mouseCoord.y}vh)`;
        this.composer.render(this.clock.getDelta());
        this.uiRenderer.render(this.uiScene, this.camera);
        const activePlayer = this.players.find(x => x.interactable);
        if (activePlayer) {
            this.raycaster.setFromCamera(this.mouseCoord, this.camera);
        }
    }

    private initRenderer() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.camera.aspect = this.w / this.h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.w, this.h);
        this.uiRenderer.setSize(this.w, this.h);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.composer.setSize(this.w, this.h);
    }

    public projectTo2D({ x, y, z }: THREE.Vector3) {
        var coord = new THREE.Vector3(x, y, z);
        coord.project(this.camera);
        return {
            x: Math.round(((1 + coord.x) * this.w) / 2),
            y: Math.round(((1 - coord.y) * this.h) / 2)
        };
    }
}

let game: Game;
let tickableManager: TickableManager;

Loader.addInitializable(addProgress => ({
    description: "游戏逻辑初始化",
    totalProgress: 1,
    finishPromise: (async () => {
        tickableManager = new TickableManager();
        game = new Game();

        infoProvider.v2.notifyInitComplete();

        const tl = new TimelineMax();
        tl.to(UI.loadingContainer, 1, { opacity: 0 });
        tl.call(() => UI.loadingContainer.remove());
    })()
}));
