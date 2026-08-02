let audioContext: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        const Context =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContext = new Context();
    }
    if (audioContext.state === "suspended") void audioContext.resume();
    return audioContext;
}

function getClickBuffer(context: AudioContext): AudioBuffer {
    if (clickBuffer?.sampleRate === context.sampleRate) return clickBuffer;
    const length = Math.floor(context.sampleRate * 0.006);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < length; index++) {
        const time = index / length;
        const sine = Math.sin(2 * Math.PI * 3400 * time);
        const noise = Math.random() * 2 - 1;
        channel[index] = (sine * 0.6 + noise * 0.4) * (1 - time) ** 3;
    }
    clickBuffer = buffer;
    return buffer;
}

export function playThemeToggleClick(lastPlayed: { current: number }): void {
    const now = performance.now();
    if (now - lastPlayed.current < 80) return;
    lastPlayed.current = now;
    try {
        const context = getAudioContext();
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = getClickBuffer(context);
        gain.gain.value = 0.08;
        source.connect(gain);
        gain.connect(context.destination);
        source.start();
    } catch {
        // Audio feedback is optional and can be blocked by browser policies.
    }
}
