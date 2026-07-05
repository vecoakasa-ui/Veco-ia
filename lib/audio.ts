// lib/audio.ts

/**
 * Joue un bip doux et agréable (notification standard)
 * Utilisé pour : ajout de bien, paiement de loyer, nouvel incident, etc.
 */
export const playNotificationBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 2 oscillators for a pleasant bell-like sound
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc2.frequency.setValueAtTime(1108.73, audioCtx.currentTime); // C#6

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Envelope for a soft chime
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc1.start(audioCtx.currentTime);
    osc2.start(audioCtx.currentTime);
    
    osc1.stop(audioCtx.currentTime + 0.5);
    osc2.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio playback failed (usually requires user interaction first)", e);
  }
};

/**
 * Joue un bip grave et répétitif (alerte sécurité)
 * Utilisé pour : tentative de connexion forcée (hack).
 */
export const playAlertBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a harsh sawtooth sound for alert
    const playSingleAlert = (startTime: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, startTime); 
      osc.frequency.linearRampToValueAtTime(150, startTime + 0.3); // Drop pitch

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    // Play 3 quick buzzes
    playSingleAlert(audioCtx.currentTime);
    playSingleAlert(audioCtx.currentTime + 0.4);
    playSingleAlert(audioCtx.currentTime + 0.8);

  } catch (e) {
    console.warn("Audio playback failed (usually requires user interaction first)", e);
  }
};
