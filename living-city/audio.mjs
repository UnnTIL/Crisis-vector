/* Original, optional presentation audio. It consumes events and never writes to the simulation. */
export class LivingAudio {
  constructor({volume=.35,muted=true,maxVoices=6,onStatus=()=>{}}={}) {
    this.volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.35;
    this.muted=muted!==false;
    this.maxVoices=Number.isInteger(maxVoices)?Math.max(1,Math.min(12,maxVoices)):6;
    this.onStatus=typeof onStatus==='function'?onStatus:()=>{};
    this.context=null;
    this.master=null;
    this.noiseBuffer=null;
    this.voices=new Set();
    this.consumed=new Set();
    this.played=0;
    this.suppressed=0;
    this.lastError=null;
    this.disposed=false;
  }

  getStatus() {
    const available=typeof (globalThis.AudioContext||globalThis.webkitAudioContext)==='function';
    return {available,muted:this.muted,volume:this.volume,state:this.context?.state||(available?'locked':'unavailable'),
      activeVoices:this.voices.size,played:this.played,suppressed:this.suppressed,lastError:this.lastError};
  }

  _notify() {
    // A status callback cannot turn audio failure into a simulation failure.
    try {this.onStatus(this.getStatus());} catch {}
  }

  async unlock() {
    if(this.disposed)return false;
    try {
      if(!this.context) {
        const AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext;
        if(typeof AudioContextClass!=='function')throw new Error('Web Audio indisponível neste navegador.');
        this.context=new AudioContextClass({latencyHint:'interactive'});
        this.master=this.context.createGain();
        this.master.gain.value=0;
        this.master.connect(this.context.destination);
        // One reusable deterministic noise buffer: no samples, assets or domain RNG.
        const sampleCount=Math.ceil(this.context.sampleRate*.14);
        this.noiseBuffer=this.context.createBuffer(1,sampleCount,this.context.sampleRate);
        const samples=this.noiseBuffer.getChannelData(0);
        let noiseSeed=0x16a27;
        for(let i=0;i<sampleCount;i++) {
          noiseSeed=(Math.imul(noiseSeed,1664525)+1013904223)>>>0;
          samples[i]=(noiseSeed/2147483648-1)*Math.exp(-i/sampleCount*7);
        }
      }
      if(this.context.state!=='running')await this.context.resume();
      if(this.context.state!=='running')throw new Error('O navegador ainda não autorizou o áudio. Volta a ativar o som.');
      this.lastError=null;
      this._notify();
      return true;
    } catch(error) {
      this.muted=true;
      this.lastError=error instanceof Error?error.message:'Não foi possível iniciar o áudio.';
      this._notify();
      return false;
    }
  }

  async setMuted(muted) {
    if(typeof muted!=='boolean'||this.disposed)return false;
    if(!muted&&!(await this.unlock()))return false;
    this.muted=muted;
    if(this.master&&this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(muted?0:this.volume,this.context.currentTime,.015);
    }
    if(muted)this._stopVoices();
    this._notify();
    return true;
  }

  setVolume(volume) {
    if(!Number.isFinite(volume)||volume<0||volume>1||this.disposed)return false;
    this.volume=volume;
    if(this.master&&this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(this.muted?0:volume,this.context.currentTime,.015);
    }
    this._notify();
    return true;
  }

  consume(events,listener={x:0,z:0}) {
    if(!Array.isArray(events)||this.disposed)return;
    let startedThisBatch=0;
    const listenerX=Number.isFinite(listener?.x)?listener.x:0;
    const listenerZ=Number.isFinite(listener?.z)?listener.z:0;
    for(const event of events) {
      if(!event||event.type!=='ShotFired'||!['number','string'].includes(typeof event.eventId))continue;
      const eventKey=String(event.eventId);
      if(this.consumed.has(eventKey))continue;
      this.consumed.add(eventKey);
      // Muted or old events are consumed, not queued for a burst after enabling sound.
      if(this.muted||this.volume===0||this.context?.state!=='running')continue;
      const x=event.position?.x,z=event.position?.z;
      if(!Number.isFinite(x)||!Number.isFinite(z))continue;
      const distance=Math.hypot(x-listenerX,z-listenerZ);
      const attenuation=1/(1+(distance/42)**2);
      if(distance>260||attenuation<.025||startedThisBatch>=2||this.voices.size>=this.maxVoices) {
        this.suppressed++;
        continue;
      }
      try {
        this._shot(attenuation,(x-listenerX)/100,eventKey);
        startedThisBatch++;
        this.played++;
      } catch(error) {
        this.lastError=error instanceof Error?error.message:'É impossível reproduzir o efeito de áudio.';
        this._notify();
      }
    }
  }

  _shot(attenuation,pan,eventKey) {
    const ctx=this.context,now=ctx.currentTime;
    let hash=0;
    for(let i=0;i<eventKey.length;i++)hash=(Math.imul(hash,31)+eventKey.charCodeAt(i))>>>0;
    // Tiny deterministic timbre variation is presentation-only and consumes no PRNG.
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    const tone=ctx.createOscillator(),toneGain=ctx.createGain();
    const panner=typeof ctx.createStereoPanner==='function'?ctx.createStereoPanner():null;
    source.buffer=this.noiseBuffer;
    source.playbackRate.value=.93+(hash%13)/100;
    filter.type='highpass';
    filter.frequency.value=650+hash%500;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(.23*attenuation,now+.0015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.11);
    tone.type='sine';
    tone.frequency.setValueAtTime(150+hash%38,now);
    tone.frequency.exponentialRampToValueAtTime(65,now+.045);
    toneGain.gain.setValueAtTime(.1*attenuation,now);
    toneGain.gain.exponentialRampToValueAtTime(.0001,now+.065);
    source.connect(filter);
    filter.connect(gain);
    tone.connect(toneGain);
    if(panner) {
      panner.pan.value=Math.max(-.8,Math.min(.8,pan));
      gain.connect(panner);toneGain.connect(panner);panner.connect(this.master);
    } else {gain.connect(this.master);toneGain.connect(this.master);}
    const voice={source,tone,nodes:[source,tone,filter,gain,toneGain,panner].filter(Boolean)};
    this.voices.add(voice);
    source.onended=()=>{
      this.voices.delete(voice);
      for(const node of voice.nodes)try{node.disconnect();}catch{}
    };
    source.start(now);source.stop(now+.14);
    tone.start(now);tone.stop(now+.08);
  }

  _stopVoices() {
    for(const voice of this.voices) {
      try{voice.source.stop();}catch{}
      try{voice.tone.stop();}catch{}
      for(const node of voice.nodes)try{node.disconnect();}catch{}
    }
    this.voices.clear();
  }

  reset() {
    this._stopVoices();
    this.consumed.clear();
    this.played=0;
    this.suppressed=0;
    this._notify();
  }

  async dispose() {
    this.disposed=true;
    this._stopVoices();
    this.consumed.clear();
    try{await this.context?.close();}catch{}
    this.context=null;this.master=null;this.noiseBuffer=null;
  }
}
