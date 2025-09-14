// phát âm ngắn khi tick ✓
let audio: HTMLAudioElement | null = null

export function playTick() {
    // lazy init
    if (!audio) {
        audio = new Audio('/tick.mp3')   // public/tick.mp3
        audio.volume = 0.35               // nhẹ nhàng
        audio.preload = 'auto'
    }
    try {
        audio.currentTime = 0
        void audio.play()
    } catch { /* ignore policy errors */ }
}
