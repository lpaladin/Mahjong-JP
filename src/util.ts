namespace Util {
    export const RAD90 = Math.PI / 2;
    export const ZERO3 = new THREE.Vector3();
    export const ZERO2 = new THREE.Vector2();
    export const DIR_X = [0, 1, 0, -1];
    export const DIR_Z = [1, 0, -1, 0];
    export const POSITIONS = "东南西北";
    export function IDENTITY<T>(x: T) {
        return x;
    }

    const dummy = document.createElement("span");
    export function neutralize(str: string | number) {
        dummy.textContent = str.toString();
        return dummy.innerHTML;
    }

    export function RandInArray<T>(array: T[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    export function ToPlain(v: THREE.Vector3 | THREE.Euler) {
        return {
            x: v.x,
            y: v.y,
            z: v.z
        };
    }

    export function GetRelativePlayerPosition(me: number, other: number) {
        return ((me + 4 - other) % 4) - 2;
    }

    export function MeshOpacityFromTo(
        m: THREE.Mesh,
        duration: number,
        from: number,
        to: number
    ) {
        if (!Array.isArray(m.material)) {
            const t = TweenMax.fromTo(
                m.material,
                duration,
                { opacity: from },
                { opacity: to, ease: Linear.easeNone, immediateRender: false }
            );
            if (
                (from == 0 || from == 1) &&
                to + from == 1 &&
                !m.material.transparent
            ) {
                const tl = new TimelineMax();
                if (to) {
                    tl.add(BiDirectionConstantSet(m, "visible", true));
                    tl.add(
                        BiDirectionConstantSet(m.material, "transparent", true)
                    );
                    tl.add(t);
                    tl.add(
                        BiDirectionConstantSet(m.material, "transparent", false)
                    );
                } else {
                    tl.add(
                        BiDirectionConstantSet(m.material, "transparent", true)
                    );
                    tl.add(t);
                    tl.add(
                        BiDirectionConstantSet(m.material, "transparent", false)
                    );
                    tl.add(BiDirectionConstantSet(m, "visible", false));
                }
                return tl;
            }
            return t;
        }
    }

    export function BiDirectionConstantSet<T>(
        obj: T | T[],
        propName: keyof T,
        to: any
    ) {
        let initial: any;
        if (Array.isArray(obj))
            return TweenMax.to({}, 0.001, {
                immediateRender: false,
                onComplete: function() {
                    initial = obj[0] && obj[0][propName];
                    if (to instanceof Function) to = to();
                    obj.forEach(function(o) {
                        return (o[propName] = to);
                    });
                },
                onReverseComplete: function() {
                    return obj.forEach(function(o) {
                        return (o[propName] = initial);
                    });
                }
            });
        else
            return TweenMax.to({}, 0.001, {
                immediateRender: false,
                onComplete: function() {
                    initial = obj[propName];
                    if (to instanceof Function) obj[propName] = to();
                    else obj[propName] = to;
                },
                onReverseComplete: function() {
                    return (obj[propName] = initial);
                }
            });
    }

    function logComposeHTML(
        parts: TemplateStringsArray,
        args: Array<number | string | PlayerInfo>
    ) {
        return parts.reduce((prev, curr, i) => {
            const arg = args[i - 1];
            if (typeof arg === "object") {
                return `${prev}<img src="${arg.imgid}" /><span>${neutralize(
                    arg.name
                )}</span>${curr}`;
            }
            return `${prev}<span>${neutralize(arg)}</span>${curr}`;
        });
    }

    export function Log(
        parts: TemplateStringsArray,
        ...args: Array<number | string | PlayerInfo>
    ) {
        const newChild = document.createElement("div");
        newChild.innerHTML = logComposeHTML(parts, args);
        UI.logs.appendChild(newChild);
        const tl = new TimelineMax();
        tl.from(newChild, 0.1, { opacity: 0 });
        tl.to(
            newChild,
            0.1,
            {
                height: 0,
                onComplete: () => UI.logs.removeChild(newChild)
            },
            2
        );
    }

    export function PrimaryLog(
        parts: TemplateStringsArray,
        ...args: Array<number | string | PlayerInfo>
    ) {
        const newChild = document.createElement("div");
        newChild.className = "primary";
        newChild.innerHTML = logComposeHTML(parts, args);
        for (const c of UI.logs.querySelectorAll(".primary"))
            TweenMax.to(c, 0.1, {
                height: 0,
                onComplete: () => UI.logs.removeChild(c)
            });
        UI.logs.appendChild(newChild);
        TweenMax.from(newChild, 0.1, { opacity: 0 });
    }

    export function Assert(
        parts: TemplateStringsArray,
        ...args: Array<boolean>
    ) {
        if (args.some(v => !v)) {
            const newChild = document.createElement("div");
            newChild.className = "error";
            newChild.innerHTML =
                "断言失败 - " +
                parts.reduce((prev, curr, i) => {
                    return `${prev}<span>${args[i - 1]}</span>${curr}`;
                });
            UI.logs.appendChild(newChild);
            TweenMax.from(newChild, 0.1, { opacity: 0 });
            throw new Error(newChild.textContent);
        }
    }
}
