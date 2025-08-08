import { useEffect, useRef, useState } from "react";

export default function useAnimatedPlaceholder(placeholders, delayAfter = 1000) {
    const [placeholder, setPlaceholder] = useState(placeholders[0] || "");
    const stopRef = useRef(false);

    useEffect(() => {
        stopRef.current = false;
        let localStop = false;

        const getRandomDelayBetween = (min, max) =>
            Math.floor(Math.random() * (max - min + 1) + min);

        const animateLetters = (letters, rest, onEnd) => {
            if (stopRef.current || localStop) return;
            if (!rest.length) {
                if (typeof onEnd === "function") onEnd(letters.join(""));
                return;
            }
            letters.push(rest.shift());
            setTimeout(() => {
                setPlaceholder(letters.join(""));
                animateLetters(letters, rest, onEnd);
            }, getRandomDelayBetween(40, 90));
        };

        // Animation loop
        let prev = placeholders[0];
        const animate = () => {
            // Pick random, different from prev
            let idx, next;
            do {
                idx = Math.floor(Math.random() * placeholders.length);
                next = placeholders[idx];
            } while (next === prev && placeholders.length > 1);
            prev = next;
            animateLetters([], next.split(""), () => {
                setTimeout(() => {
                    animate();
                }, delayAfter);
            });
        };

        // Start animation with the first
        animateLetters([], prev.split(""), () => {
            setTimeout(() => {
                animate();
            }, delayAfter);
        });

        // Cleanup on unmount
        return () => {
            localStop = true;
            stopRef.current = true;
        };
        // eslint-disable-next-line
    }, [JSON.stringify(placeholders), delayAfter]);

    return placeholder;
}
