import wave
import struct
import math
import base64

def generate_beep(filename="beep.wav", duration=0.2, freq=600, volume=0.5):
    sample_rate = 44100
    n_samples = int(duration * sample_rate)
    
    with wave.open(filename, 'w') as w:
        w.setnchannels(1) # mono
        w.setsampwidth(2) # 2 bytes per sample
        w.setframerate(sample_rate)
        
        for i in range(n_samples):
            # Apply an envelope to avoid clicks at start/end
            envelope = 1.0
            if i < 400:
                envelope = i / 400.0
            elif i > n_samples - 400:
                envelope = (n_samples - i) / 400.0
                
            value = int(volume * envelope * 32767.0 * math.sin(2.0 * math.pi * freq * i / sample_rate))
            data = struct.pack('<h', value)
            w.writeframesraw(data)

generate_beep()

with open("beep.wav", "rb") as f:
    encoded = base64.b64encode(f.read()).decode('utf-8')
    print("data:audio/wav;base64," + encoded)
