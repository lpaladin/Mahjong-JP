/// <reference path="../node_modules/three/src/Three.d.ts" />
/// <reference path="./three-examples.d.ts" />

declare const TweenMax: typeof gsap.TweenMax;
declare const TimelineMax: typeof gsap.TimelineMax;
declare type TweenMax = gsap.TweenMax;
declare type TimelineMax = gsap.TimelineMax;
declare const Ease: typeof gsap.Ease;
declare const Expo: typeof gsap.Expo;
declare const Linear: typeof gsap.Linear;
declare const Back: typeof gsap.Back;
declare const Quad: typeof gsap.Quad;
declare const Circ: typeof gsap.Circ;
declare const Cubic: typeof gsap.Cubic;
declare const Power2: typeof gsap.Power2;
declare const Power4: typeof gsap.Power4;
interface Window {
    TweenMax?: typeof gsap.TweenMax;
    TimelineMax?: typeof gsap.TimelineMax;
    Ease?: typeof gsap.Ease;
    Expo?: typeof gsap.Expo;
    Linear?: typeof gsap.Linear;
    Back?: typeof gsap.Back;
    Quad?: typeof gsap.Quad;
}

declare const POSTPROCESSING: any;

interface Effect {
    selection: Set<THREE.Object3D>;
    colorEdgesMaterial: any;
}
