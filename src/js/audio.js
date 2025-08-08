export class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.dataArray = null;
        this.initialized = false;
    }

    async setup(file) {
        if (this.initialized) return;
        if (!file) return;

        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.loop = true;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        this.audioSource = this.audioContext.createMediaElementSource(audio);
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        try {
            await audio.play();
            this.initialized = true;
            return true;
        } catch (e) {
            console.error("Audio playback failed:", e);
            return false;
        }
    }

    getAudioValue() {
        if (!this.initialized) return 0.0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length / 4; i++) {
            sum += this.dataArray[i];
        }
        return (sum / (this.dataArray.length / 4)) / 255.0;
    }
}