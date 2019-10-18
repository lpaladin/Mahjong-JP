/// <reference path="logic.ts" />

namespace Assets {
    const loader = new THREE.ImageLoader();
    export const loadedImages: { [name: string]: HTMLImageElement } = {};

    export function GetToonGradientMap() {
        const canvas = document.createElement("canvas");
        canvas.width = 3;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = Colors.toHexString(Colors.DarkGray);
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = Colors.toHexString(Colors.DarkGray);
        ctx.fillRect(1, 0, 1, 1);
        ctx.fillStyle = Colors.toHexString(Colors.DarkGray);
        ctx.fillRect(2, 0, 1, 1);
        return new THREE.CanvasTexture(canvas);
    }

    export const LoadAllTiles: Initializable = addProgress => ({
        description: "载入牌面资源",
        totalProgress: Mahjong.TileIDs.length,
        finishPromise: Promise.all(
            Mahjong.TileIDs.map(
                id =>
                    new Promise<HTMLImageElement>(ac =>
                        loader.load(`Mahjong-JP/tiles/${Mahjong.tileInfo[id].imgName}`, img => {
                            loadedImages[id] = img;
                            const canvas = document.createElement("canvas");
                            const h = (canvas.height = img.height);
                            const w = img.width;
                            canvas.width = h;
                            /*
                             * w : h = 3 : 4
                             *  .  w   .  .
                             * .+------+--+
                             *  | o  o |  |
                             *  | o  o |  | <- 白色
                             * h| o  o |__| . 有色部分所占比例为 SIDE_COLOR_PERCENTAGE
                             *  | o  o |//| <- 背部颜色
                             * .+------+--+
                             *      ^ 牌面
                             */
                            const backColorHeight = h * Tile.SIDE_COLOR_PERCENTAGE;
                            const ctx = canvas.getContext("2d");
                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, h, h);
                            ctx.fillStyle = Colors.toHexString(Colors.TileBackColor);
                            ctx.fillRect(w, h - backColorHeight, h / 2, backColorHeight);
                            ctx.drawImage(
                                img,
                                (Tile.PADDING_PERCENTAGE_W * w) / 2,
                                (Tile.PADDING_PERCENTAGE_H * h) / 2,
                                w * (1 - Tile.PADDING_PERCENTAGE_W),
                                h * (1 - Tile.PADDING_PERCENTAGE_H)
                            );
                            Tile.TEXTURES[id] = new THREE.CanvasTexture(
                                canvas,
                                THREE.UVMapping,
                                THREE.MirroredRepeatWrapping,
                                THREE.MirroredRepeatWrapping
                                // THREE.NearestFilter,
                                // THREE.NearestFilter
                            );
                            addProgress();
                            ac(img);
                        })
                    )
            )
        )
    });

    let roundEdgedTileGeometry: THREE.BufferGeometry;
    export function GetRoundEdgedTileGeometry() {
        if (!roundEdgedTileGeometry) {
            const shape = new THREE.Shape();
            const eps = 0.00001;
            const r = Tile.CORNER_RADIUS - eps;
            const w = Tile.WIDTH;
            const h = Tile.HEIGHT;
            const d = Tile.DEPTH;
            const xSplit = w / h;

            shape.absarc(eps, eps, eps, -Util.RAD90, -Math.PI, true);
            shape.absarc(eps, h - r * 2, eps, Math.PI, Util.RAD90, true);
            shape.absarc(w - r * 2, h - r * 2, eps, Util.RAD90, 0, true);
            shape.absarc(w - r * 2, eps, eps, 0, -Util.RAD90, true);

            roundEdgedTileGeometry = new THREE.ExtrudeBufferGeometry(shape, {
                depth: d - Tile.CORNER_RADIUS * 2,
                bevelEnabled: true,
                bevelSegments: 20,
                steps: 1,
                bevelSize: r,
                bevelThickness: Tile.CORNER_RADIUS,
                curveSegments: 10,
                UVGenerator: {
                    generateTopUV: (
                        geometry: THREE.ExtrudeBufferGeometry,
                        vertices: number[],
                        indexA: number,
                        indexB: number,
                        indexC: number
                    ) =>
                        [indexA, indexB, indexC].map(i => {
                            const x = vertices[i * 3];
                            const y = vertices[i * 3 + 1];
                            const z = vertices[i * 3 + 2];
                            return z > 0 ? new THREE.Vector2(((x + r) / w) * xSplit, (y + r) / h) : new THREE.Vector2(1, 0);
                        }),
                    generateSideWallUV: (
                        geometry: THREE.ExtrudeBufferGeometry,
                        vertices: number[],
                        indexA: number,
                        indexB: number,
                        indexC: number,
                        indexD: number
                    ) =>
                        [indexA, indexB, indexC, indexD].map(i => {
                            const x = vertices[i * 3];
                            const y = vertices[i * 3 + 1];
                            const z = vertices[i * 3 + 2];
                            return new THREE.Vector2(1, (z + r) / d);
                        })
                }
            });

            roundEdgedTileGeometry.center();
        }
        return roundEdgedTileGeometry;
    }

    let tileGeometry: THREE.BufferGeometry;
    export function GetTileGeometry() {
        if (!tileGeometry) {
            const geometry = new THREE.Geometry();
            const w = Tile.WIDTH;
            const h = Tile.HEIGHT;
            const d = Tile.DEPTH;
            geometry.vertices = [
                new THREE.Vector3(-w / 2, -h / 2, d / 2),
                new THREE.Vector3(w / 2, -h / 2, d / 2),
                new THREE.Vector3(w / 2, -h / 2, -d / 2),
                new THREE.Vector3(-w / 2, -h / 2, -d / 2),
                new THREE.Vector3(-w / 2, h / 2, d / 2),
                new THREE.Vector3(w / 2, h / 2, d / 2),
                new THREE.Vector3(w / 2, h / 2, -d / 2),
                new THREE.Vector3(-w / 2, h / 2, -d / 2)
            ];
            const xSplit = w / h;
            const front = {
                0: new THREE.Vector2(0, 0),
                1: new THREE.Vector2(xSplit, 0),
                5: new THREE.Vector2(xSplit, 1),
                4: new THREE.Vector2(0, 1)
            };
            const side = {
                // 靠近后侧
                7: new THREE.Vector2(1, 0),
                6: new THREE.Vector2(xSplit, 0),
                3: new THREE.Vector2(xSplit, 0),
                2: new THREE.Vector2(1, 0),
                // 靠近前面
                4: new THREE.Vector2(xSplit, 1),
                5: new THREE.Vector2(1, 1),
                1: new THREE.Vector2(xSplit, 1),
                0: new THREE.Vector2(1, 1)
            };
            const back = {
                7: new THREE.Vector2(1, 0),
                6: new THREE.Vector2(1, 0),
                3: new THREE.Vector2(1, 0),
                2: new THREE.Vector2(1, 0)
            };
            geometry.faces = [
                new THREE.Face3(0, 1, 4),
                new THREE.Face3(5, 4, 1),
                new THREE.Face3(0, 3, 1),
                new THREE.Face3(3, 2, 1),
                new THREE.Face3(1, 2, 5),
                new THREE.Face3(6, 5, 2),
                new THREE.Face3(4, 3, 0),
                new THREE.Face3(3, 4, 7),
                new THREE.Face3(4, 5, 7),
                new THREE.Face3(5, 6, 7),
                new THREE.Face3(2, 3, 7),
                new THREE.Face3(7, 6, 2)
            ];
            geometry.faceVertexUvs = [
                geometry.faces.map(({ a, b, c }, i) => {
                    if (i < 2) return [front[a], front[b], front[c]];
                    if (i >= 10) return [back[a], back[b], back[c]];
                    return [side[a], side[b], side[c]];
                })
            ];
            geometry.computeFaceNormals();
            tileGeometry = new THREE.BufferGeometry();
            tileGeometry.fromGeometry(geometry);
        }
        return tileGeometry;
    }

    let boardGeometry: THREE.BufferGeometry;
    export function GetBoardGeometry() {
        if (!boardGeometry) {
            const geometry = new THREE.Geometry();
            const h = PlayerArea.HEIGHT,
                g = Tile.DEPTH;
            geometry.vertices = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(-h - g, 0, h + g),
                new THREE.Vector3(h + g, 0, h + g)
            ];
            geometry.faces = [new THREE.Face3(0, 1, 2)];
            geometry.computeFaceNormals();
            boardGeometry = new THREE.BufferGeometry();
            boardGeometry.fromGeometry(geometry);
        }
        return boardGeometry;
    }

    export let smaaEffect: Effect;
    export let bloomEffect: Effect;
    export let outlineEffect: Effect;

    export const InitializeSMAA: Initializable = addProgress => {
        return {
            description: "载入 SMAA 所需纹理",
            totalProgress: 2,
            finishPromise: (async () => {
                const searchImage = new Image();
                const areaImage = new Image();

                const loadedPromise = Promise.all([
                    new Promise(ac =>
                        searchImage.addEventListener("load", () => {
                            addProgress();
                            ac();
                        })
                    ),
                    new Promise(ac =>
                        areaImage.addEventListener("load", () => {
                            addProgress();
                            ac();
                        })
                    )
                ]);

                searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
                areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;

                await loadedPromise;
                smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage, POSTPROCESSING.SMAAPreset.MEDIUM);
                smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);
            })()
        };
    };

    export function InitializeEffects(scene: THREE.Scene, camera: THREE.Camera) {
        outlineEffect = new POSTPROCESSING.OutlineEffect(scene, camera, {
            blendFunction: POSTPROCESSING.BlendFunction.ADD,
            pulseSpeed: 0.25,
            visibleEdgeColor: Colors.White,
            hiddenEdgeColor: Colors.White
        });
    }
}

namespace Colors {
    export const White = 0xffffff;
    export const TileBackColor = 0x0c8f5d;
    export const TileBackColorDark = 0x08613f;
    export const Highlight = 0x191a11;
    export const DarkGray = 0x404040;
    export const LightGray = 0x808080;

    export function toHexString(color: number) {
        return "#" + ("00000" + color.toString(16)).substr(-6);
    }
}
