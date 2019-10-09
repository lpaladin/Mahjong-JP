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

    private readonly composer = new POSTPROCESSING.EffectComposer(
        this.renderer
    );
    public readonly players = [0, 1, 2, 3].map(i => new Player(i));
    public readonly centerScreen = new CenterScreen();
    public readonly mouseCoord = new THREE.Vector2();
    public readonly raycaster = new THREE.Raycaster();
    private w = 0;
    private h = 0;
    private cameraPositionBase = new THREE.Vector3();
    private mouseRightButtonDown = false;
    private light: THREE.DirectionalLight;
    private round = 0;
    private currPlayerID = -1;
    private _viewPoint = -1;
    private cameraKeepFocusing = false;
    private cameraUncontrolled = false;

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
        this.cameraPositionBase.set(
            Util.DIR_X[to] * 70,
            35,
            Util.DIR_Z[to] * 70
        );
        this.centerScreen.viewPoint = to;
        TweenMax.to(this.camera.position, 0.3, {
            ...Util.ToPlain(this.cameraPositionBase),
            onComplete: () => {
                this.camera.lookAt(Util.ZERO3);
                this.cameraKeepFocusing = this.cameraUncontrolled = false;
            }
        });
    }

    private setupPostProcessing() {
        Assets.InitializeEffects(this.scene, this.camera);
        const renderPass = new POSTPROCESSING.RenderPass(
            this.scene,
            this.camera
        );
        renderPass.renderToScreen = false;
        this.composer.addPass(renderPass);

        const effectPass = new POSTPROCESSING.EffectPass(
            this.camera,
            Assets.outlineEffect
        );
        const smaaPass = new POSTPROCESSING.EffectPass(
            this.camera,
            Assets.smaaEffect
        );
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
            this.mouseCoord.set(
                (e.clientX / this.w) * 2 - 1,
                -(e.clientY / this.h) * 2 + 1
            )
        );
        window.addEventListener("mousedown", e => {
            if (e.button == 2) {
                if (!this.mouseRightButtonDown) {
                    this.mouseRightButtonDown = true;
                    for (const p of this.players) p.board.openDeck = true;
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
                    for (const p of this.players) p.board.openDeck = false;
                    const activeTile = this.playerMe.board.hoveredTile;
                    activeTile && this.focusAndWave(activeTile);
                    // this.viewPoint = (this.viewPoint + 1) % 4;
                }
            }
        });
        UI.mainCanvas.addEventListener("click", () => {
            const activePlayer = this.players.find(x => x.interactable);
            if (activePlayer) {
                const tl = activePlayer.board.onClick();
                if (tl) tl.add(this.nextPlayer());
            }
        });

        tickableManager.add(this);

        for (const p of this.players) {
            this.scene.add(p.board);
        }
        this.centerScreen.position.y -=
            (Tile.HEIGHT - CenterScreen.THICKNESS) / 2;
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

        const tl = new TimelineMax();
        this.players.forEach(p => tl.add(p.board.deck.sort()));

        this.initRenderer();
        //new THREE['OrbitControls'](this.camera, UI.mainCanvas);

        Util.Log`初始化完成`;
    }

    public nextPlayer(setTo = -1) {
        if (setTo != -1) this.currPlayerID = setTo;
        else if (++this.currPlayerID == 4) {
            this.round++;
            this.currPlayerID = 0;
        }
        const player = this.currPlayer;
        const tl = new TimelineMax();
        tl.call((r, n) => Util.PrimaryLog`当前是第${r}巡，${n}的回合`, [
            this.round,
            this.players[this.currPlayerID].info
        ]);
        if (setTo == -1)
            tl.add(
                player.board.deck.drawTile(Util.RandInArray(Mahjong.TileIDs))
            );
        if (this.currPlayerID == infoProvider.getPlayerID()) {
            player.interactable = true;
            if (setTo == -1)
                player.ui.setActionButtons(
                    Mahjong.testAvailableActions(player)
                );
        } else {
            const newTile = Util.RandInArray(player.board.deck.handTiles);
            tl.add(player.playTile(newTile), "+=1");
            const myActions = Mahjong.testAvailableActions(
                this.playerMe,
                newTile.tileID,
                this.currPlayerID
            );
            myActions.push({ type: "PASS", from: this.currPlayerID });
            if (myActions.length > 1)
                this.playerMe.ui.setActionButtons(myActions);
            else tl.add(this.playerMe.doAction(myActions[0]));
        }
        return tl;
    }

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
        const sw = new POSTPROCESSING.ShockWaveEffect(
            this.camera,
            targetAbsolutePos,
            {
                maxRadius: 10,
                waveSize: 1,
                amplitude: 0.25
            }
        );
        const swPass = new POSTPROCESSING.EffectPass(this.camera, sw);
        this.composer.addPass(swPass, 2);
        this.initRenderer();

        tl.fromTo(
            subTL,
            2,
            { progress: 0 },
            { progress: 1, ease: Power4.easeOut, immediateRender: false }
        );
        tl.call(
            () => {
                sw.explode();
            },
            null,
            null,
            0.8
        );
        tl.fromTo(
            subTL,
            0.4,
            { progress: 1 },
            { progress: 0, ease: Power4.easeIn, immediateRender: false }
        );
        tl.call(() => {
            this.cameraUncontrolled = false;
            this.composer.removePass(swPass);
        });
        return; // DO NOT return tl
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
        return; // DO NOT return tl
    }

    private get cameraPosition() {
        return new THREE.Vector3(
            this.cameraPositionBase.x + this.mouseCoord.x * 0.3,
            this.cameraPositionBase.y + this.mouseCoord.y * 0.3,
            this.cameraPositionBase.z
        );
    }

    public onTick() {
        if (!this.cameraUncontrolled) {
            this.camera.position.copy(this.cameraPosition);
        }
        if (this.cameraKeepFocusing) {
            this.camera.lookAt(Util.ZERO3);
        }
        UI.background.style.transform = `translate(${-2 *
            this.mouseCoord.x}vw, ${2 * this.mouseCoord.y}vh)`;
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

Loader.onFinish(() => {
    tickableManager = new TickableManager();
    game = new Game();
    game.nextPlayer();
});
