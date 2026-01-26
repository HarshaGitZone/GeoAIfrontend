// import { useEffect, useRef } from 'react';
// import { Howl } from 'howler';

// /** * CINEMATIC SOUND MAPPING 
//  * Priority: Local Folder (/sounds/) -> Cloud Fallback (Mixkit/SoundJay)
//  */
// const soundsPath = process.env.PUBLIC_URL + '/sounds';

// const SOUND_SOURCES = {
//   ocean: [`${soundsPath}/ocean.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3'],
//   river: [`${soundsPath}/river.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-river-flowing-loop-1193.mp3'],
//   urban: [`${soundsPath}/urban.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-city-traffic-hum-2720.mp3'],
//   forest: [`${soundsPath}/forest.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3'],
//   industrial: [`${soundsPath}/traffic.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-factory-hum-2334.mp3'],
//   storm: [`${soundsPath}/flood.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-loop-2390.mp3'],
//   rural: [`${soundsPath}/rural.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-2141.mp3'],
//   ambient: [`${soundsPath}/ambient.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-loop-1185.mp3'],
//   success: [`${soundsPath}/success.mp3`, 'https://www.soundjay.com/buttons/sounds/button-37a.mp3']
// };

// const AudioLandscape = ({ activeFactors, isEnabled, isLoading, resultLabel }) => {
//   const soundRef = useRef(null);
//   const currentBiome = useRef(null);
//   const loadingPingRef = useRef(false);

//   const getBiome = (f, label) => {
//     // const textLabel = label?.toLowerCase() || "";

//     // // 1. CRITICAL TERRAIN OVERRIDES (Checks Labels for 0-score scenarios)
//     // if (textLabel.includes("waterbody") || textLabel.includes("ocean") || textLabel.includes("sea")) {
//     //   const isRiver = textLabel.includes("river") || textLabel.includes("stream") || textLabel.includes("canal");
//     //   return isRiver ? 'river' : 'ocean';
//     // }
//     // if (textLabel.includes("forest") || textLabel.includes("protected") || textLabel.includes("nature")) {
//     //   return 'forest';
//     // }
//     if (!f && !label) return null; 

//   const textLabel = label?.toLowerCase() || "";

//   // 1. CRITICAL TERRAIN OVERRIDES
//   if (textLabel.includes("waterbody") || textLabel.includes("ocean")) {
//     const isRiver = textLabel.includes("river") || textLabel.includes("stream");
//     return isRiver ? 'river' : 'ocean';
//   }

//     // 2. HAZARD & EXCEPTION LOGIC (Based on low scores)
//     if (f) {
//       if (f.pollution < 35) return 'industrial';
//       if (f.flood < 35 || f.rainfall < 25) return 'storm';

//       // Standard Numeric Triggers
//       if (f.water > 80) return 'ocean';
//       if (f.proximity > 70 && f.landuse < 40) return 'urban';
//       if (f.landuse > 60) return 'forest';
//       if (f.soil > 60) return 'rural';
//     }
    
//     return 'ambient';
//   };

//   useEffect(() => {
//     // A. HANDLE SYSTEM OFF / MUTE
//     if (!isEnabled) {
//       if (currentBiome.current !== "MUTED_STATE") {
//         console.log("🔈 Audio System: Muted.");
//         currentBiome.current = "MUTED_STATE";
//       }
//       if (soundRef.current) {
//         soundRef.current.fade(soundRef.current.volume(), 0, 1000);
//         setTimeout(() => {
//           soundRef.current?.stop();
//           soundRef.current = null;
//         }, 1000);
//       }
//       return;
//     }

//     // B. CINEMATIC DUCKING (Lower volume while analysis is running)
//     if (isLoading && soundRef.current) {
//       // Duck volume to 5% with a smooth 800ms fade for focus
//       soundRef.current.fade(soundRef.current.volume(), 0.05, 800);
//       loadingPingRef.current = true; 
//       return;
//     }

//     // C. ANALYSIS SUCCESS NOTIFICATION
//     if (!isLoading && loadingPingRef.current && activeFactors) {
//       const ping = new Howl({ 
//         src: SOUND_SOURCES.success, 
//         volume: 0.15 
//       });
//       ping.play();
//       loadingPingRef.current = false;
//       // Cinematic swell: Fade the environment back up gracefully
//       if (soundRef.current) soundRef.current.fade(0.05, 0.25, 1200);
//     }

//     const nextBiome = getBiome(activeFactors, resultLabel);

//     // D. CINEMATIC CROSS-FADE LOGIC
//     if (nextBiome !== currentBiome.current) {
//       console.log(`🌍 Biome Detected: ${nextBiome.toUpperCase()} (${resultLabel || 'Standard Analysis'})`);
      
//       // Stop old sound with a cinematic 2-second linear fade-out
//       if (soundRef.current) {
//         const oldSound = soundRef.current;
//         oldSound.fade(oldSound.volume(), 0, 2000);
//         setTimeout(() => oldSound.stop(), 2000);
//       }

//       // Initialize and fade-in new local/backup biome sound
//       const newSound = new Howl({
//         src: SOUND_SOURCES[nextBiome],
//         loop: true,
//         volume: 0,
//         html5: true, // Better performance for streaming loops
//         onloaderror: (id, err) => {
//             console.warn(`⚠️ Local '${nextBiome}.mp3' failed. Shifting to cloud backup...`, err);
//         }
//       });

//       newSound.play();
//       // Swell volume to 25% background level over 2.5 seconds for atmospheric effect
//       newSound.fade(0, 0.25, 2500); 

//       soundRef.current = newSound;
//       currentBiome.current = nextBiome;
//     }
//   }, [activeFactors, isEnabled, isLoading, resultLabel]);

//   return null;
// };

// export default AudioLandscape;



import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

/** * CINEMATIC SOUND MAPPING 
 * Priority: Local Folder (/sounds/) -> Cloud Fallback (Mixkit/SoundJay)
 */
const soundsPath = process.env.PUBLIC_URL + '/sounds';

const SOUND_SOURCES = {
  ocean: [`${soundsPath}/ocean.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3'],
  river: [`${soundsPath}/river.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-river-flowing-loop-1193.mp3'],
  urban: [`${soundsPath}/urban.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-city-traffic-hum-2720.mp3'],
  forest: [`${soundsPath}/forest.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3'],
  industrial: [`${soundsPath}/traffic.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-factory-hum-2334.mp3'],
  storm: [`${soundsPath}/flood.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-loop-2390.mp3'],
  rural: [`${soundsPath}/rural.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-2141.mp3'],
  ambient: [`${soundsPath}/ambient.mp3`, 'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-loop-1185.mp3'],
  success: [`${soundsPath}/success.mp3`, 'https://www.soundjay.com/buttons/sounds/button-37a.mp3']
};

const AudioLandscape = ({ activeFactors, isEnabled, isLoading, resultLabel }) => {
  const soundRef = useRef(null);
  const currentBiome = useRef(null);
  const loadingPingRef = useRef(false);

  const getBiome = (f, label) => {
    // SILENT START: If no factors and no label, return null for complete silence
    if (!f && !label) return null; 

    const textLabel = label?.toLowerCase() || "";

    // 1. CRITICAL TERRAIN OVERRIDES
    if (textLabel.includes("waterbody") || textLabel.includes("ocean")) {
      const isRiver = textLabel.includes("river") || textLabel.includes("stream");
      return isRiver ? 'river' : 'ocean';
    }
    
    if (textLabel.includes("forest") || textLabel.includes("protected") || textLabel.includes("nature")) {
      return 'forest';
    }

    // 2. HAZARD & EXCEPTION LOGIC (Based on low scores)
    if (f) {
      if (f.pollution < 35) return 'industrial';
      if (f.flood < 35 || f.rainfall < 25) return 'storm';

      // Standard Numeric Triggers
      if (f.water > 80) return 'ocean';
      if (f.proximity > 70 && f.landuse < 40) return 'urban';
      if (f.landuse > 60) return 'forest';
      if (f.soil > 60) return 'rural';
    }
    
    return 'ambient';
  };

  useEffect(() => {
    // A. HANDLE SYSTEM OFF / MUTE
    if (!isEnabled) {
      if (currentBiome.current !== "MUTED_STATE") {
        console.log("🔈 Audio System: Muted.");
        currentBiome.current = "MUTED_STATE";
      }
      if (soundRef.current) {
        soundRef.current.fade(soundRef.current.volume(), 0, 1000);
        setTimeout(() => {
          soundRef.current?.stop();
          soundRef.current = null;
        }, 1000);
      }
      return;
    }

    // B. CINEMATIC DUCKING (Lower volume while analysis is running)
    if (isLoading && soundRef.current) {
      soundRef.current.fade(soundRef.current.volume(), 0.05, 800);
      loadingPingRef.current = true; 
      return;
    }

    // C. SUCCESS NOTIFICATION
    if (!isLoading && loadingPingRef.current && activeFactors) {
      const ping = new Howl({ 
        src: SOUND_SOURCES.success, 
        volume: 0.15 
      });
      ping.play();
      loadingPingRef.current = false;
      if (soundRef.current) soundRef.current.fade(0.05, 0.25, 1200);
    }

    const nextBiome = getBiome(activeFactors, resultLabel);

    // D. CINEMATIC CROSS-FADE LOGIC
    if (nextBiome !== currentBiome.current) {
      // FIX: Added optional chaining and null check to prevent .toUpperCase() errors
      if (nextBiome) {
        console.log(`🌍 Biome Detected: ${nextBiome?.toUpperCase()} (${resultLabel || 'Standard Analysis'})`);
      } else {
        console.log("🔈 Audio System: Waiting for analysis...");
      }
      
      if (soundRef.current) {
        const oldSound = soundRef.current;
        oldSound.fade(oldSound.volume(), 0, 2000);
        setTimeout(() => oldSound.stop(), 2000);
      }

      // Only attempt to play if we have a valid biome
      if (nextBiome) {
        const newSound = new Howl({
          src: SOUND_SOURCES[nextBiome],
          loop: true,
          volume: 0,
          html5: true,
          onloaderror: (id, err) => {
              console.warn(`⚠️ Local '${nextBiome}.mp3' failed. Shifting to cloud backup...`, err);
          }
        });

        newSound.play();
        newSound.fade(0, 0.25, 2500); 
        soundRef.current = newSound;
      } else {
        soundRef.current = null;
      }
      
      currentBiome.current = nextBiome;
    }
  }, [activeFactors, isEnabled, isLoading, resultLabel]);

  return null;
};

export default AudioLandscape;