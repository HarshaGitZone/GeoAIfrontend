// import { useEffect, useRef, useCallback } from 'react';
// import { Howl } from 'howler';

// // 🎵 LOCAL AUDIO SOURCES ONLY
// const getAudioSources = (biome) => {
//   const sounds = {
//     ocean: ['/sounds/ocean.mp3'],
//     forest: ['/sounds/forest.mp3'],
//     mountain: ['/sounds/mountain.webm'],
//     urban: ['/sounds/urban.mp3'],
//     traffic: ['/sounds/traffic.mp3'],
//     flood: ['/sounds/flood.mp3'],
//     ambient: ['/sounds/ambient.mp3'],
//     success: ['/sounds/success.mp3'],
//     river: ['/sounds/river.mp3'],
//     rural: ['/sounds/rural.mp3']
//   };
//   return sounds[biome] || sounds.ambient;
// };

// const AudioLandscape = ({ 
//   activeFactors, 
//   isEnabled, 
//   isLoading, 
//   resultLabel, 
//   compareFactors, 
//   compareResultLabel, 
//   analysisComplete,
//   siteAPlaying = true,
//   siteBPlaying = true 
// }) => {
//   // 🎵 AUDIO REFERENCES
//   const siteASoundRef = useRef(null);
//   const siteBSoundRef = useRef(null);
//   const hasUserInteracted = useRef(false);
//   const lastAnalysisComplete = useRef(false);

//   // 🔍 DEBUG: Log prop changes
//   useEffect(() => {
//     console.log("🔍 AudioLandscape Props Changed:");
//     console.log(`  - siteAPlaying: ${siteAPlaying}`);
//     console.log(`  - siteBPlaying: ${siteBPlaying}`);
//     console.log(`  - compareFactors: ${!!compareFactors}`);
//     console.log(`  - compareResultLabel: "${compareResultLabel}"`);
//   }, [siteAPlaying, siteBPlaying, compareFactors, compareResultLabel]);

//   // 🎯 DETECT BIOME FROM FACTORS
//   const detectBiomeFromFactors = useCallback((factors, label) => {
//     if (!factors && !label) return 'ambient';
    
//     const textLabel = label?.toLowerCase() || '';
    
//     // Text-based detection
//     if (textLabel.includes('ocean') || textLabel.includes('sea') || textLabel.includes('water body')) return 'ocean';
//     if (textLabel.includes('forest')) return 'forest';
//     if (textLabel.includes('mountain')) return 'mountain';
//     if (textLabel.includes('urban') || textLabel.includes('city')) return 'urban';
//     if (textLabel.includes('flood')) return 'flood';
//     if (textLabel.includes('river')) return 'river';
//     if (textLabel.includes('rural')) return 'rural';
    
//     // Factor-based detection
//     if (factors) {
//       const { elevation, climate, vegetation, water_proximity, land_use } = factors;
      
//       if (water_proximity > 0.7) return 'ocean';
//       if (vegetation > 0.8 && climate > 0.6) return 'forest';
//       if (elevation > 0.7) return 'mountain';
//       if (land_use > 0.8) return 'urban';
//       if (water_proximity > 0.5 && water_proximity <= 0.7) return 'river';
//     }
    
//     return 'ambient';
//   }, []);

//   // 🎯 PLAY SUCCESS SOUND
//   const playSuccessSound = useCallback(() => {
//     console.log("🎉 Playing success sound...");
//     const successSound = new Howl({
//       src: getAudioSources('success'),
//       volume: 0.3,
//       onplay: () => console.log("🎉 Success sound playing"),
//       onplayerror: (id, err) => console.warn("⚠️ Success sound blocked:", err)
//     });
    
//     if (hasUserInteracted.current) {
//       successSound.play();
//     } else {
//       // Wait for user interaction
//       const waitForInteraction = () => {
//         if (hasUserInteracted.current) {
//           successSound.play();
//           document.removeEventListener('click', waitForInteraction);
//         }
//       };
//       document.addEventListener('click', waitForInteraction, { once: true });
//     }
//   }, []);

//   // 🎵 STOP SITE A AUDIO
//   const stopSiteAAudio = useCallback(() => {
//     if (siteASoundRef.current) {
//       console.log("🔇 Stopping Site A audio");
//       try {
//         // Force stop with multiple methods
//         siteASoundRef.current.stop();
//         siteASoundRef.current.pause();
//         siteASoundRef.current.unload();
//         siteASoundRef.current = null;
//       } catch (e) {
//         console.warn("Error stopping Site A audio:", e);
//         // Ensure reference is cleared even if stop fails
//         siteASoundRef.current = null;
//       }
//     }
//   }, []);

//   // 🎵 STOP SITE B AUDIO
//   const stopSiteBAudio = useCallback(() => {
//     if (siteBSoundRef.current) {
//       console.log("🔇 Stopping Site B audio");
//       try {
//         // Force stop with multiple methods
//         siteBSoundRef.current.stop();
//         siteBSoundRef.current.pause();
//         siteBSoundRef.current.unload();
//         siteBSoundRef.current = null;
//       } catch (e) {
//         console.warn("Error stopping Site B audio:", e);
//         // Ensure reference is cleared even if stop fails
//         siteBSoundRef.current = null;
//       }
//     }
//   }, []);

//   // 🎵 GLOBAL AUDIO STOP - Force stop all audio
//   const stopAllAudio = useCallback(() => {
//     console.log("🔇 STOPPING ALL AUDIO - Force termination");
//     stopSiteAAudio();
//     stopSiteBAudio();
    
//     // Additional cleanup - stop any other audio instances
//     try {
//       // Stop any global Howl instances
//       if (typeof Howl !== 'undefined') {
//         Howl.stop();
//       }
//     } catch (e) {
//       console.warn("Error stopping global audio:", e);
//     }
//   }, [stopSiteAAudio, stopSiteBAudio]);

//   // 🎵 START SITE A AUDIO
//   const startSiteAAudio = useCallback((biome) => {
//     // Always stop existing audio first
//     if (siteASoundRef.current) {
//       stopSiteAAudio();
//     }
    
//     // Check if audio should be playing
//     if (!isEnabled || !siteAPlaying) {
//       console.log("🔇 Site A audio disabled or muted - not starting");
//       return;
//     }

//     console.log("🎵 Starting Site A audio for biome:", biome);
//     const sound = new Howl({
//       src: getAudioSources(biome),
//       loop: true,
//       volume: 0.25,
//       html5: true,
//       onplay: () => console.log(`🎵 Site A playing: ${biome}`),
//       onplayerror: (id, err) => console.warn(`⚠️ Site A audio blocked: ${biome}`, err),
//       onloaderror: (id, err) => console.error(`❌ Site A load failed: ${biome}`, err)
//     });

//     if (hasUserInteracted.current) {
//       sound.play();
//     } else {
//       console.log("👆 Site A audio waiting for user interaction...");
//       const waitForInteraction = () => {
//         if (hasUserInteracted.current) {
//           sound.play();
//           document.removeEventListener('click', waitForInteraction);
//         }
//       };
//       document.addEventListener('click', waitForInteraction, { once: true });
//     }

//     siteASoundRef.current = sound;
//   }, [isEnabled, siteAPlaying, stopSiteAAudio]);

//   // 🎵 START SITE B AUDIO
//   const startSiteBAudio = useCallback((biome) => {
//     // Always stop existing audio first
//     if (siteBSoundRef.current) {
//       stopSiteBAudio();
//     }
    
//     // Check if audio should be playing
//     if (!isEnabled || !siteBPlaying) {
//       console.log("🔇 Site B audio disabled or muted - not starting");
//       return;
//     }

//     console.log("🎵 Starting Site B audio for biome:", biome);
//     const sound = new Howl({
//       src: getAudioSources(biome),
//       loop: true,
//       volume: 0.25,
//       html5: true,
//       onplay: () => console.log(`🎵 Site B playing: ${biome}`),
//       onplayerror: (id, err) => console.warn(`⚠️ Site B audio blocked: ${biome}`, err),
//       onloaderror: (id, err) => console.error(`❌ Site B load failed: ${biome}`, err)
//     });

//     if (hasUserInteracted.current) {
//       sound.play();
//     } else {
//       console.log("👆 Site B audio waiting for user interaction...");
//       const waitForInteraction = () => {
//         if (hasUserInteracted.current) {
//           sound.play();
//           document.removeEventListener('click', waitForInteraction);
//         }
//       };
//       document.addEventListener('click', waitForInteraction, { once: true });
//     }

//     siteBSoundRef.current = sound;
//   }, [isEnabled, siteBPlaying, stopSiteBAudio]);

//   // 👆 USER INTERACTION DETECTION
//   useEffect(() => {
//     const handleUserInteraction = () => {
//       if (!hasUserInteracted.current) {
//         hasUserInteracted.current = true;
//         console.log("👆 User interaction detected - audio enabled");
//       }
//     };

//     const events = ['click', 'keydown', 'touchstart'];
//     events.forEach(event => {
//       document.addEventListener(event, handleUserInteraction, { once: true });
//     });

//     return () => {
//       events.forEach(event => {
//         document.removeEventListener(event, handleUserInteraction);
//       });
//     };
//   }, []);

//   // 🎯 MAIN AUDIO CONTROLLER
//   useEffect(() => {
//     console.log("🎵 Audio Controller Activated");
//     console.log(`🔊 Enabled: ${isEnabled}`);
//     console.log(`📍 Site A Playing: ${siteAPlaying}`);
//     console.log(`📍 Site B Playing: ${siteBPlaying}`);
//     console.log(`⏳ Loading: ${isLoading}`);
//     console.log(`✅ Analysis Complete: ${analysisComplete}`);

//     // 🎉 PLAY SUCCESS SOUND ON ANALYSIS COMPLETION
//     if (analysisComplete && !lastAnalysisComplete.current) {
//       playSuccessSound();
//       lastAnalysisComplete.current = true;
//     } else if (!analysisComplete) {
//       lastAnalysisComplete.current = false;
//     }

//     // 🎵 SITE A AUDIO CONTROL
//     if (activeFactors || resultLabel) {
//       const siteABiome = detectBiomeFromFactors(activeFactors, resultLabel);
      
//       if (siteAPlaying && isEnabled) {
//         startSiteAAudio(siteABiome);
//       } else {
//         stopSiteAAudio();
//       }
//     } else {
//       // No analysis data - stop Site A audio
//       stopSiteAAudio();
//     }

//     // 🎵 SITE B AUDIO CONTROL (A/B Analysis)
//     console.log("🔍 Site B Audio Check:");
//     console.log(`  - compareFactors: ${!!compareFactors}`);
//     console.log(`  - compareResultLabel: "${compareResultLabel}"`);
//     console.log(`  - siteBPlaying: ${siteBPlaying}`);
//     console.log(`  - isEnabled: ${isEnabled}`);
    
//     if (compareFactors || compareResultLabel) {
//       const siteBBiome = detectBiomeFromFactors(compareFactors, compareResultLabel);
//       console.log(`  - Site B Biome: ${siteBBiome}`);
      
//       if (siteBPlaying && isEnabled) {
//         console.log("🎵 Starting Site B audio...");
//         startSiteBAudio(siteBBiome);
//       } else {
//         console.log("🔇 Site B audio disabled or muted - stopping");
//         stopSiteBAudio();
//       }
//     } else {
//       console.log("🔇 No compare data - stopping Site B audio");
//       stopSiteBAudio();
//     }

//     // 🎵 FORCE STOP ALL AUDIO IF BOTH SITES ARE MUTED
//     if (!siteAPlaying && !siteBPlaying) {
//       console.log("🔇 Both sites muted - forcing complete audio stop");
//       stopAllAudio();
//     }

//   }, [
//     activeFactors, 
//     compareFactors, 
//     isEnabled, 
//     isLoading, 
//     resultLabel, 
//     compareResultLabel, 
//     analysisComplete,
//     siteAPlaying,
//     siteBPlaying,
//     detectBiomeFromFactors,
//     playSuccessSound,
//     startSiteAAudio,
//     startSiteBAudio,
//     stopSiteAAudio,
//     stopSiteBAudio,
//     stopAllAudio
//   ]);

//   // 🧹 CLEANUP ON UNMOUNT
//   useEffect(() => {
//     return () => {
//       // Copy refs to local variables to avoid stale closure warnings
//       const siteASound = siteASoundRef.current;
//       const siteBSound = siteBSoundRef.current;
      
//       if (siteASound) {
//         try {
//           siteASound.stop();
//           siteASound.unload();
//         } catch (e) {
//           console.warn("Error stopping Site A audio during cleanup:", e);
//         }
//       }
      
//       if (siteBSound) {
//         try {
//           siteBSound.stop();
//           siteBSound.unload();
//         } catch (e) {
//           console.warn("Error stopping Site B audio during cleanup:", e);
//         }
//       }
//     };
//   }, []);

//   return null;
// };

// export default AudioLandscape;

// import { useEffect, useRef, useCallback } from 'react';
// import { Howl, Howler } from 'howler';

// const getAudioSources = (biome) => {
//   const sounds = {
//     ocean: ['/sounds/ocean.mp3'],
//     forest: ['/sounds/forest.mp3'],
//     mountain: ['/sounds/mountain.webm'],
//     urban: ['/sounds/urban.mp3'],
//     traffic: ['/sounds/traffic.mp3'],
//     flood: ['/sounds/flood.mp3'],
//     ambient: ['/sounds/ambient.mp3'],
//     success: ['/sounds/success.mp3'],
//     river: ['/sounds/river.mp3'],
//     rural: ['/sounds/rural.mp3']
//   };
//   return sounds[biome] || sounds.ambient;
// };

// const AudioLandscape = ({ 
//   activeFactors, 
//   isEnabled, 
//   resultLabel, 
//   compareFactors, 
//   compareResultLabel, 
//   siteAPlaying = true,
//   siteBPlaying = true 
// }) => {
//   const siteASoundRef = useRef(null);
//   const siteBSoundRef = useRef(null);
//   const hasUserInteracted = useRef(false);

//   // 🛠️ SURGICAL KILL FUNCTION
//   const killSound = (ref, siteName) => {
//     if (ref.current) {
//       console.log(`%c🛑 [AUDIO ENGINE] KILLING ${siteName} STREAM`, 'color: #ff4444; font-weight: bold;');
//       ref.current.stop();
//       ref.current.unload(); // This wipes it from browser memory
//       ref.current = null;
//     }
//   };

//   const detectBiome = useCallback((factors, label) => {
//     if (!factors && !label) return 'ambient';
//     const textLabel = label?.toLowerCase() || '';
//     if (textLabel.includes('ocean') || textLabel.includes('sea') || textLabel.includes('water body')) return 'ocean';
//     if (textLabel.includes('forest')) return 'forest';
//     if (textLabel.includes('mountain')) return 'mountain';
//     if (textLabel.includes('urban') || textLabel.includes('city')) return 'urban';
//     if (textLabel.includes('flood')) return 'flood';
//     if (textLabel.includes('river')) return 'river';
//     if (textLabel.includes('rural')) return 'rural';
//     return 'ambient';
//   }, []);

//   // 👆 Handle Browser Autoplay Policy
//   useEffect(() => {
//     const unlock = () => {
//       hasUserInteracted.current = true;
//       if (Howler.ctx && Howler.ctx.state === 'suspended') {
//         Howler.ctx.resume().then(() => console.log("🔊 AudioContext Resumed"));
//       }
//     };
//     window.addEventListener('click', unlock, { once: true });
//     return () => window.removeEventListener('click', unlock);
//   }, []);

//   // 🛰️ INDEPENDENT SITE A CONTROLLER
//   useEffect(() => {
//     console.log(`%c🔍 [STATE CHECK] Site A -> Data: ${!!activeFactors} | Playing: ${siteAPlaying} | Global: ${isEnabled}`, 'color: #3b82f6');
    
//     if (isEnabled && activeFactors && siteAPlaying) {
//       const biomeA = detectBiome(activeFactors, resultLabel);
//       const source = getAudioSources(biomeA)[0];

//       // Only start if nothing is playing OR if the biome changed
//       if (!siteASoundRef.current || siteASoundRef.current._src !== source) {
//         killSound(siteASoundRef, "SITE A");
//         console.log(`%c🎵 [AUDIO ENGINE] STARTING SITE A: ${biomeA}`, 'color: #10b981; font-weight: bold;');
        
//         siteASoundRef.current = new Howl({
//           src: [source],
//           loop: true,
//           volume: 0.25,
//           html5: false // Use WebAudio for surgical control
//         });
//         siteASoundRef.current.play();
//       }
//     } else {
//       killSound(siteASoundRef, "SITE A");
//     }
//   }, [isEnabled, activeFactors, resultLabel, siteAPlaying, detectBiome]);

//   // 🛰️ INDEPENDENT SITE B CONTROLLER
//   useEffect(() => {
//     console.log(`%c🔍 [STATE CHECK] Site B -> Data: ${!!compareFactors} | Playing: ${siteBPlaying} | Global: ${isEnabled}`, 'color: #a855f7');

//     // Logic: If compareFactors is null, this WILL trigger and run killSound
//     if (isEnabled && compareFactors && siteBPlaying) {
//       const biomeB = detectBiome(compareFactors, compareResultLabel);
//       const source = getAudioSources(biomeB)[0];

//       if (!siteBSoundRef.current || siteBSoundRef.current._src !== source) {
//         killSound(siteBSoundRef, "SITE B");
//         console.log(`%c🎵 [AUDIO ENGINE] STARTING SITE B: ${biomeB}`, 'color: #10b981; font-weight: bold;');

//         siteBSoundRef.current = new Howl({
//           src: [source],
//           loop: true,
//           volume: 0.25,
//           html5: false
//         });
//         siteBSoundRef.current.play();
//       }
//     } else {
//       killSound(siteBSoundRef, "SITE B");
//     }
//   }, [isEnabled, compareFactors, compareResultLabel, siteBPlaying, detectBiome]);

//   // 🧹 COMPONENT UNMOUNT
//   useEffect(() => {
//     return () => {
//       console.log("%c🧹 [AUDIO ENGINE] FINAL CLEANUP - UNMOUNTING", 'color: orange');
//       killSound(siteASoundRef, "SITE A");
//       killSound(siteBSoundRef, "SITE B");
//     };
//   }, []);

//   return null;
// };

// export default AudioLandscape;




// import { useEffect, useRef, useCallback } from "react";
// import { Howl, Howler } from "howler";

// const getAudioSources = (biome) => {
//   const sounds = {
//     ocean: ["/sounds/ocean.mp3"],
//     forest: ["/sounds/forest.mp3"],
//     mountain: ["/sounds/mountain.webm"],
//     urban: ["/sounds/urban.mp3"],
//     traffic: ["/sounds/traffic.mp3"],
//     flood: ["/sounds/flood.mp3"],
//     ambient: ["/sounds/ambient.mp3"],
//     success: ["/sounds/success.mp3"],
//     river: ["/sounds/river.mp3"],
//     rural: ["/sounds/rural.mp3"],
//   };
//   return sounds[biome] || sounds.ambient;
// };

// const AudioLandscape = ({
//   activeFactors,
//   isEnabled,
//   resultLabel,

//   compareFactors,
//   compareResultLabel,

//   siteAPlaying = true,
//   siteBPlaying = true,

//   // ✅ IMPORTANT: You MUST accept this prop
//   analysisComplete = false,
// }) => {
//   const siteASoundRef = useRef(null);
//   const siteBSoundRef = useRef(null);
//   const hasUserInteracted = useRef(false);

//   // ============================================================
//   // ✅ SUCCESS SOUND (ONCE PER COMPLETION)
//   // ============================================================
//   const lastAnalysisComplete = useRef(false);

//   const playSuccessSound = useCallback(() => {
//     if (!isEnabled) return;

//     const sound = new Howl({
//       src: getAudioSources("success"),
//       volume: 0.35,
//       html5: false,
//     });

//     sound.play();
//   }, [isEnabled]);

//   useEffect(() => {
//     if (analysisComplete && !lastAnalysisComplete.current) {
//       playSuccessSound();
//       lastAnalysisComplete.current = true;
//     }

//     if (!analysisComplete) {
//       lastAnalysisComplete.current = false;
//     }
//   }, [analysisComplete, playSuccessSound]);

//   // ============================================================
//   // 🔥 HARD KILL SOUND (absolute stop)
//   // ============================================================
//   const killSound = useCallback((ref, siteName) => {
//     if (!ref.current) return;

//     try {
//       console.log(
//         `%c🛑 [AUDIO] KILL ${siteName}`,
//         "color:#ef4444;font-weight:bold;"
//       );
//       ref.current.stop();
//       ref.current.unload();
//     } catch (e) {
//       console.warn(`⚠️ Kill error (${siteName}):`, e);
//     } finally {
//       ref.current = null;
//     }
//   }, []);

//   const killAll = useCallback(() => {
//     killSound(siteASoundRef, "SITE A");
//     killSound(siteBSoundRef, "SITE B");

//     // extra safety
//     try {
//       Howler.stop();
//     } catch (e) {}
//   }, [killSound]);

//   // ============================================================
//   // 🎯 BIOME DETECTION
//   // ============================================================
//   const detectBiome = useCallback((factors, label) => {
//     if (!factors && !label) return "ambient";

//     const textLabel = (label || "").toLowerCase();
//     // ✅ Text-based
//   if (
//     textLabel.includes("ocean") ||
//     textLabel.includes("sea") ||
//     textLabel.includes("water body") ||
//     textLabel.includes("coastal") ||
//     textLabel.includes("beach")
//   ) return "ocean";
//     if (textLabel.includes("ocean") || textLabel.includes("sea")) return "ocean";
//     if (textLabel.includes("forest")) return "forest";
//     if (textLabel.includes("mountain")) return "mountain";
//     if (textLabel.includes("urban") || textLabel.includes("city")) return "urban";
//     if (textLabel.includes("flood")) return "flood";
//     if (textLabel.includes("river")) return "river";
//     if (textLabel.includes("rural")) return "rural";

//     return "ambient";
//   }, []);

//   // ============================================================
//   // 👆 AUTOPLAY UNLOCK
//   // ============================================================
//   useEffect(() => {
//     const unlock = () => {
//       hasUserInteracted.current = true;

//       if (Howler.ctx && Howler.ctx.state === "suspended") {
//         Howler.ctx.resume().then(() => console.log("🔊 AudioContext resumed"));
//       }
//     };

//     window.addEventListener("click", unlock, { once: true });
//     window.addEventListener("keydown", unlock, { once: true });
//     window.addEventListener("touchstart", unlock, { once: true });

//     return () => {
//       window.removeEventListener("click", unlock);
//       window.removeEventListener("keydown", unlock);
//       window.removeEventListener("touchstart", unlock);
//     };
//   }, []);

//   // ============================================================
//   // 🧠 NORMALIZE "HAS DATA" CHECKS
//   // ============================================================
//   const hasSiteAData =
//     !!resultLabel ||
//     (activeFactors &&
//       typeof activeFactors === "object" &&
//       Object.keys(activeFactors).length > 0);

//   const hasSiteBData =
//     !!compareResultLabel ||
//     (compareFactors &&
//       typeof compareFactors === "object" &&
//       Object.keys(compareFactors).length > 0);

//   // ============================================================
//   // 🔇 MASTER SILENCE MODE
//   // ============================================================
//   useEffect(() => {
//     if (!isEnabled) {
//       console.log(
//         "%c🔇 MASTER AUDIO OFF -> SILENCE",
//         "color:#f59e0b;font-weight:bold;"
//       );
//       killAll();
//     }
//   }, [isEnabled, killAll]);

//   // ============================================================
//   // 🎵 SITE A CONTROLLER
//   // ============================================================
//   useEffect(() => {
//     // if audio off, no data, or muted => stop
//     if (!isEnabled || !hasSiteAData || !siteAPlaying) {
//       killSound(siteASoundRef, "SITE A");
//       return;
//     }

//     const biomeA = detectBiome(activeFactors, resultLabel);
//     const sourceA = getAudioSources(biomeA)[0];

//     // If already playing same source, do nothing
//     if (siteASoundRef.current && siteASoundRef.current._src === sourceA) return;

//     // restart
//     killSound(siteASoundRef, "SITE A");

//     console.log(
//       `%c🎵 START SITE A: ${biomeA}`,
//       "color:#10b981;font-weight:bold;"
//     );

//     const sound = new Howl({
//       src: [sourceA],
//       loop: true,
//       volume: 0.25,
//       html5: false,
//     });

//     siteASoundRef.current = sound;

//     if (hasUserInteracted.current) sound.play();
//   }, [
//     isEnabled,
//     hasSiteAData,
//     siteAPlaying,
//     activeFactors,
//     resultLabel,
//     detectBiome,
//     killSound,
//   ]);

//   // ============================================================
//   // 🎵 SITE B CONTROLLER (COMPARE)
//   // ============================================================
//   useEffect(() => {
//     // if compare removed => stop
//     if (!isEnabled || !hasSiteBData || !siteBPlaying) {
//       killSound(siteBSoundRef, "SITE B");
//       return;
//     }

//     const biomeB = detectBiome(compareFactors, compareResultLabel);
//     const sourceB = getAudioSources(biomeB)[0];

//     if (siteBSoundRef.current && siteBSoundRef.current._src === sourceB) return;

//     killSound(siteBSoundRef, "SITE B");

//     console.log(
//       `%c🎵 START SITE B: ${biomeB}`,
//       "color:#10b981;font-weight:bold;"
//     );

//     const sound = new Howl({
//       src: [sourceB],
//       loop: true,
//       volume: 0.25,
//       html5: false,
//     });

//     siteBSoundRef.current = sound;

//     if (hasUserInteracted.current) sound.play();
//   }, [
//     isEnabled,
//     hasSiteBData,
//     siteBPlaying,
//     compareFactors,
//     compareResultLabel,
//     detectBiome,
//     killSound,
//   ]);

//   // ============================================================
//   // 🔇 ABSOLUTE SILENCE WHEN BOTH MUTED
//   // ============================================================
//   useEffect(() => {
//     if (!siteAPlaying && !siteBPlaying) {
//       console.log(
//         "%c🔇 BOTH SITES MUTED -> FULL SILENCE",
//         "color:#ef4444;font-weight:bold;"
//       );
//       killAll();
//     }
//   }, [siteAPlaying, siteBPlaying, killAll]);

//   // ============================================================
//   // 🧹 UNMOUNT CLEANUP
//   // ============================================================
//   useEffect(() => {
//     return () => {
//       console.log(
//         "%c🧹 AUDIO UNMOUNT CLEANUP",
//         "color:orange;font-weight:bold;"
//       );
//       killAll();
//     };
//   }, [killAll]);

//   return null;
// };

// export default AudioLandscape;


// import { useEffect, useRef, useCallback } from "react";
// import { Howl, Howler } from "howler";

// // ============================================================
// // AUDIO SOURCES (add files in /public/sounds)
// // ============================================================
// const getAudioSources = (biome) => {
//   const sounds = {
//     // Water
//     ocean: ["/sounds/ocean.mp3"],
//     river: ["/sounds/river.mp3"],
//     flood: ["/sounds/flood.mp3"],

//     // Nature
//     forest: ["/sounds/forest.mp3"],
//     mountain: ["/sounds/mountain.webm"],
//     rural: ["/sounds/rural.mp3"],

//     // Human / City
//     urban: ["/sounds/urban.mp3"],
//     traffic: ["/sounds/traffic.mp3"],
//     industrial: ["/sounds/industrial.mp3"],

//     // Environment risk
//     pollution: ["/sounds/pollution.mp3"],
//     heat: ["/sounds/heat.mp3"],
//     hazard: ["/sounds/hazard.mp3"],

//     // Default + events
//     ambient: ["/sounds/ambient.mp3"],
//     success: ["/sounds/success.mp3"],
//   };

//   return sounds[biome] || sounds.ambient;
// };

// // ============================================================
// // HELPER: safe nested factor score extraction (0-100)
// // ============================================================
// const getFactorScore = (factors, category, key) => {
//   try {
//     const obj = factors?.[category]?.[key];
//     if (obj == null) return null;

//     // Your factor objects usually have:
//     // { value, scaled_score, evidence, ... }
//     const v =
//       obj?.scaled_score ??
//       obj?.scaledScore ??
//       obj?.score ??
//       obj?.value ??
//       null;

//     if (v == null) return null;

//     const n = Number(v);
//     if (Number.isNaN(n)) return null;

//     // clamp
//     return Math.max(0, Math.min(100, n));
//   } catch (e) {
//     return null;
//   }
// };

// const AudioLandscape = ({
//   activeFactors,
//   isEnabled,
//   resultLabel,

//   compareFactors,
//   compareResultLabel,

//   siteAPlaying = true,
//   siteBPlaying = true,

//   // IMPORTANT: must be passed from LandSuitabilityChecker
//   analysisComplete = false,
// }) => {
//   const siteASoundRef = useRef(null);
//   const siteBSoundRef = useRef(null);
//   const hasUserInteracted = useRef(false);

//   // ============================================================
//   // SUCCESS SOUND (ONCE PER COMPLETION)
//   // ============================================================
//   const lastAnalysisComplete = useRef(false);

//   const playSuccessSound = useCallback(() => {
//     if (!isEnabled) return;

//     const sound = new Howl({
//       src: getAudioSources("success"),
//       volume: 0.75, // 🔊 boosted
//       html5: false,
//     });

//     sound.play();
//   }, [isEnabled]);

//   useEffect(() => {
//     if (analysisComplete && !lastAnalysisComplete.current) {
//       playSuccessSound();
//       lastAnalysisComplete.current = true;
//     }

//     if (!analysisComplete) {
//       lastAnalysisComplete.current = false;
//     }
//   }, [analysisComplete, playSuccessSound]);

//   // ============================================================
//   // HARD KILL SOUND (absolute stop)
//   // ============================================================
//   const killSound = useCallback((ref, siteName) => {
//     if (!ref.current) return;

//     try {
//       console.log(
//         `%c🛑 [AUDIO] KILL ${siteName}`,
//         "color:#ef4444;font-weight:bold;"
//       );
//       ref.current.stop();
//       ref.current.unload();
//     } catch (e) {
//       console.warn(`⚠️ Kill error (${siteName}):`, e);
//     } finally {
//       ref.current = null;
//     }
//   }, []);

//   const killAll = useCallback(() => {
//     killSound(siteASoundRef, "SITE A");
//     killSound(siteBSoundRef, "SITE B");

//     // extra safety
//     try {
//       Howler.stop();
//     } catch (e) {}
//   }, [killSound]);

//   // ============================================================
//   // BIOME DETECTION (FACTOR-DRIVEN + TEXT FALLBACK)
//   // ============================================================
//   const detectBiome = useCallback((factors, label) => {
//     if (!factors && !label) return "ambient";

//     const textLabel = (label || "").toLowerCase();

//     // ------------------------------------------------------------
//     // 1) Strong text overrides (rare but useful)
//     // ------------------------------------------------------------
//     if (
//       textLabel.includes("ocean") ||
//       textLabel.includes("sea") ||
//       textLabel.includes("water body") ||
//       textLabel.includes("coastal") ||
//       textLabel.includes("beach")
//     )
//       return "ocean";

//     if (textLabel.includes("forest")) return "forest";
//     if (textLabel.includes("mountain") || textLabel.includes("hills"))
//       return "mountain";
//     if (textLabel.includes("urban") || textLabel.includes("city")) return "urban";
//     if (textLabel.includes("traffic")) return "traffic";
//     if (textLabel.includes("pollution") || textLabel.includes("smog"))
//       return "pollution";
//     if (textLabel.includes("flood")) return "flood";
//     if (textLabel.includes("river")) return "river";
//     if (textLabel.includes("rural") || textLabel.includes("village"))
//       return "rural";

//     // ------------------------------------------------------------
//     // 2) Factor-driven detection (this is the REAL logic)
//     // Your factors are nested:
//     // physical, hydrology, environmental, climatic, socio_econ, risk_resilience
//     // ------------------------------------------------------------

//     // HYDROLOGY
//     const flood = getFactorScore(factors, "hydrology", "flood");
//     const water = getFactorScore(factors, "hydrology", "water");
//     const drainage = getFactorScore(factors, "hydrology", "drainage");
//     const groundwater = getFactorScore(factors, "hydrology", "groundwater");

//     // ENVIRONMENTAL
//     const pollution = getFactorScore(factors, "environmental", "pollution");
//     const vegetation = getFactorScore(factors, "environmental", "vegetation");
//     const biodiversity = getFactorScore(factors, "environmental", "biodiversity");
//     const heatIsland = getFactorScore(factors, "environmental", "heat_island");

//     // CLIMATIC
//     const rainfall = getFactorScore(factors, "climatic", "rainfall");
//     // const thermal = getFactorScore(factors, "climatic", "thermal");
//     const heatStress = getFactorScore(factors, "climatic", "intensity");

//     // PHYSICAL
//     const elevation = getFactorScore(factors, "physical", "elevation");
//     const ruggedness = getFactorScore(factors, "physical", "ruggedness");
//     const slope = getFactorScore(factors, "physical", "slope");

//     // SOCIO ECON
//     const infrastructure = getFactorScore(factors, "socio_econ", "infrastructure");
//     const landuse = getFactorScore(factors, "socio_econ", "landuse");
//     const population = getFactorScore(factors, "socio_econ", "population");

//     // RISK
//     const multiHazard = getFactorScore(factors, "risk_resilience", "multi_hazard");
//     // const habitability = getFactorScore(factors, "risk_resilience", "habitability");
//     // const climateChange = getFactorScore(factors, "risk_resilience", "climate_change");

//     // ------------------------------------------------------------
//     // 3) PRIORITY RULES (most dominant sound first)
//     // ------------------------------------------------------------

//     // 🚨 Multi hazard / disaster zone
//     if (multiHazard !== null && multiHazard >= 70) return "hazard";

//     // 🌊 Flood event / severe flood risk
//     if (flood !== null && flood >= 70) return "flood";

//     // 🌫️ Pollution heavy
//     // (Your pollution factor: high score usually means GOOD air.
//     // If in your system higher means WORSE, tell me and I’ll flip it.)
//     // For now: assume higher = worse pollution.
//     if (pollution !== null && pollution >= 70) return "pollution";

//     // 🔥 Heat stress / heat island
//     if ((heatStress !== null && heatStress >= 70) || (heatIsland !== null && heatIsland >= 70))
//       return "heat";

//     // 🌊 Strong water proximity
//     if (water !== null && water >= 70) return "ocean";

//     // 🏞️ River-like: medium water + good drainage / groundwater
//     if (
//       water !== null &&
//       water >= 50 &&
//       water < 70 &&
//       (groundwater !== null || drainage !== null)
//     )
//       return "river";

//     // 🌲 Forest: vegetation + rainfall + biodiversity
//     if (
//       vegetation !== null &&
//       vegetation >= 65 &&
//       rainfall !== null &&
//       rainfall >= 55
//     )
//       return "forest";

//     if (biodiversity !== null && biodiversity >= 70 && vegetation !== null && vegetation >= 55)
//       return "forest";

//     // 🏔️ Mountain: elevation + ruggedness + slope
//     if (
//       (elevation !== null && elevation >= 70) ||
//       (ruggedness !== null && ruggedness >= 70) ||
//       (slope !== null && slope >= 70)
//     )
//       return "mountain";

//     // 🏙️ Urban: infrastructure + population + landuse
//     if (
//       (infrastructure !== null && infrastructure >= 65) &&
//       (population !== null && population >= 60)
//     )
//       return "urban";

//     // 🚗 Traffic: urban + pollution medium-high
//     if (
//       (infrastructure !== null && infrastructure >= 70) &&
//       (pollution !== null && pollution >= 55)
//     )
//       return "traffic";

//     // 🏭 Industrial: infrastructure + landuse
//     if (
//       (infrastructure !== null && infrastructure >= 75) &&
//       (landuse !== null && landuse >= 60)
//     )
//       return "industrial";

//     // 🌾 Rural: low infra + low population + vegetation moderate
//     if (
//       (infrastructure !== null && infrastructure <= 35) &&
//       (population !== null && population <= 40) &&
//       (vegetation !== null && vegetation >= 45)
//     )
//       return "rural";

//     // ------------------------------------------------------------
//     // 4) Fallback
//     // ------------------------------------------------------------
//     return "ambient";
//   }, []);

//   // ============================================================
//   // AUTOPLAY UNLOCK
//   // ============================================================
//   useEffect(() => {
//     const unlock = () => {
//       hasUserInteracted.current = true;

//       if (Howler.ctx && Howler.ctx.state === "suspended") {
//         Howler.ctx.resume().then(() => console.log("🔊 AudioContext resumed"));
//       }
//     };

//     window.addEventListener("click", unlock, { once: true });
//     window.addEventListener("keydown", unlock, { once: true });
//     window.addEventListener("touchstart", unlock, { once: true });

//     return () => {
//       window.removeEventListener("click", unlock);
//       window.removeEventListener("keydown", unlock);
//       window.removeEventListener("touchstart", unlock);
//     };
//   }, []);

//   // ============================================================
//   // NORMALIZE "HAS DATA" CHECKS
//   // ============================================================
//   const hasSiteAData =
//     !!resultLabel ||
//     (activeFactors &&
//       typeof activeFactors === "object" &&
//       Object.keys(activeFactors).length > 0);

//   const hasSiteBData =
//     !!compareResultLabel ||
//     (compareFactors &&
//       typeof compareFactors === "object" &&
//       Object.keys(compareFactors).length > 0);

//   // ============================================================
//   // MASTER SILENCE MODE
//   // ============================================================
//   useEffect(() => {
//     if (!isEnabled) {
//       console.log(
//         "%c🔇 MASTER AUDIO OFF -> SILENCE",
//         "color:#f59e0b;font-weight:bold;"
//       );
//       killAll();
//     }
//   }, [isEnabled, killAll]);

//   // ============================================================
//   // SITE A CONTROLLER
//   // ============================================================
//   useEffect(() => {
//     if (!isEnabled || !hasSiteAData || !siteAPlaying) {
//       killSound(siteASoundRef, "SITE A");
//       return;
//     }

//     const biomeA = detectBiome(activeFactors, resultLabel);
//     const sourceA = getAudioSources(biomeA)[0];

//     if (siteASoundRef.current && siteASoundRef.current._src === sourceA) return;

//     killSound(siteASoundRef, "SITE A");

//     console.log(
//       `%c🎵 START SITE A: ${biomeA}`,
//       "color:#10b981;font-weight:bold;"
//     );

//     const sound = new Howl({
//       src: [sourceA],
//       loop: true,
//       volume: 0.55, // 🔊 boosted
//       html5: false,
//     });

//     siteASoundRef.current = sound;

//     if (hasUserInteracted.current) sound.play();
//   }, [
//     isEnabled,
//     hasSiteAData,
//     siteAPlaying,
//     activeFactors,
//     resultLabel,
//     detectBiome,
//     killSound,
//   ]);

//   // ============================================================
//   // SITE B CONTROLLER
//   // ============================================================
//   useEffect(() => {
//     if (!isEnabled || !hasSiteBData || !siteBPlaying) {
//       killSound(siteBSoundRef, "SITE B");
//       return;
//     }

//     const biomeB = detectBiome(compareFactors, compareResultLabel);
//     const sourceB = getAudioSources(biomeB)[0];

//     if (siteBSoundRef.current && siteBSoundRef.current._src === sourceB) return;

//     killSound(siteBSoundRef, "SITE B");

//     console.log(
//       `%c🎵 START SITE B: ${biomeB}`,
//       "color:#10b981;font-weight:bold;"
//     );

//     const sound = new Howl({
//       src: [sourceB],
//       loop: true,
//       volume: 0.55, // 🔊 boosted
//       html5: false,
//     });

//     siteBSoundRef.current = sound;

//     if (hasUserInteracted.current) sound.play();
//   }, [
//     isEnabled,
//     hasSiteBData,
//     siteBPlaying,
//     compareFactors,
//     compareResultLabel,
//     detectBiome,
//     killSound,
//   ]);

//   // ============================================================
//   // ABSOLUTE SILENCE WHEN BOTH MUTED
//   // ============================================================
//   useEffect(() => {
//     if (!siteAPlaying && !siteBPlaying) {
//       console.log(
//         "%c🔇 BOTH SITES MUTED -> FULL SILENCE",
//         "color:#ef4444;font-weight:bold;"
//       );
//       killAll();
//     }
//   }, [siteAPlaying, siteBPlaying, killAll]);

//   // ============================================================
//   // UNMOUNT CLEANUP
//   // ============================================================
//   useEffect(() => {
//     return () => {
//       console.log(
//         "%c🧹 AUDIO UNMOUNT CLEANUP",
//         "color:orange;font-weight:bold;"
//       );
//       killAll();
//     };
//   }, [killAll]);

//   return null;
// };

// export default AudioLandscape;



import { useEffect, useRef, useCallback } from "react";
import { Howl, Howler } from "howler";

// ============================================================
// AUDIO SOURCES (add files in /public/sounds)
// ============================================================
const getAudioSources = (biome) => {
  const sounds = {
    // Water
    ocean: ["/sounds/ocean.mp3"],
    river: ["/sounds/river.mp3"],
    flood: ["/sounds/flood.mp3"],

    // Nature
    forest: ["/sounds/forest.mp3"],
    mountain: ["/sounds/mountain.webm"],
    rural: ["/sounds/rural.mp3"],

    // Human / City
    urban: ["/sounds/urban.mp3"],
    traffic: ["/sounds/traffic.mp3"],
    industrial: ["/sounds/industrial.mp3"],

    // Environment risk
    pollution: ["/sounds/pollution.mp3"],
    heat: ["/sounds/heat.mp3"],
    hazard: ["/sounds/hazard.mp3"],

    // Default + events
    ambient: ["/sounds/ambient.mp3"],
    success: ["/sounds/success.mp3"],
  };

  return sounds[biome] || sounds.ambient;
};

// ============================================================
// HELPER: safe nested factor score extraction (0-100)
// ============================================================
const getFactorScore = (factors, category, key) => {
  try {
    const obj = factors?.[category]?.[key];
    if (obj == null) return null;

    // Your factor objects usually have:
    // { value, scaled_score, evidence, ... }
    const v =
      obj?.scaled_score ??
      obj?.scaledScore ??
      obj?.score ??
      obj?.value ??
      null;

    if (v == null) return null;

    const n = Number(v);
    if (Number.isNaN(n)) return null;

    // clamp
    return Math.max(0, Math.min(100, n));
  } catch (e) {
    return null;
  }
};

const AudioLandscape = ({
  activeFactors,
  isEnabled,
  resultLabel,

  compareFactors,
  compareResultLabel,

  siteAPlaying = true,
  siteBPlaying = true,

  // IMPORTANT: must be passed from LandSuitabilityChecker
  analysisComplete = false,
}) => {
  const siteASoundRef = useRef(null);
  const siteBSoundRef = useRef(null);
  const hasUserInteracted = useRef(false);

  // ============================================================
  // SUCCESS SOUND (ONCE PER COMPLETION)
  // ============================================================
  const lastAnalysisComplete = useRef(false);

  const playSuccessSound = useCallback(() => {
    if (!isEnabled) return;

    const sound = new Howl({
      src: getAudioSources("success"),
      volume: 0.8, // 🔊 boosted
      html5: false,
    });

    sound.play();
  }, [isEnabled]);

  useEffect(() => {
    if (analysisComplete && !lastAnalysisComplete.current) {
      playSuccessSound();
      lastAnalysisComplete.current = true;
    }

    if (!analysisComplete) {
      lastAnalysisComplete.current = false;
    }
  }, [analysisComplete, playSuccessSound]);

  // ============================================================
  // HARD KILL SOUND (absolute stop)
  // ============================================================
  const killSound = useCallback((ref, siteName) => {
    if (!ref.current) return;

    try {
      console.log(
        `%c🛑 [AUDIO] KILL ${siteName}`,
        "color:#ef4444;font-weight:bold;"
      );
      ref.current.stop();
      ref.current.unload();
    } catch (e) {
      console.warn(`⚠️ Kill error (${siteName}):`, e);
    } finally {
      ref.current = null;
    }
  }, []);

  const killAll = useCallback(() => {
    killSound(siteASoundRef, "SITE A");
    killSound(siteBSoundRef, "SITE B");

    // extra safety
    try {
      Howler.stop();
    } catch (e) {}
  }, [killSound]);

  // ============================================================
  // BIOME DETECTION
  // IMPORTANT: in your system higher score = safer/better
  // So RISK SOUNDS must trigger on LOW scores
  // ============================================================
  // const detectBiome = useCallback((factors, label) => {
  //   if (!factors && !label) return "ambient";

  //   const textLabel = (label || "").toLowerCase();

  //   // ------------------------------------------------------------
  //   // 1) Text overrides (rare but useful)
  //   // ------------------------------------------------------------
  //   if (
  //     textLabel.includes("ocean") ||
  //     textLabel.includes("sea") ||
  //     textLabel.includes("water body") ||
  //     textLabel.includes("coastal") ||
  //     textLabel.includes("beach")
  //   )
  //     return "ocean";

  //   if (textLabel.includes("forest")) return "forest";
  //   if (textLabel.includes("mountain") || textLabel.includes("hills"))
  //     return "mountain";
  //   if (textLabel.includes("urban") || textLabel.includes("city")) return "urban";
  //   if (textLabel.includes("traffic")) return "traffic";
  //   if (textLabel.includes("river")) return "river";
  //   if (textLabel.includes("rural") || textLabel.includes("village"))
  //     return "rural";

  //   // ------------------------------------------------------------
  //   // 2) Extract your 23 factor scores (0-100)
  //   // ------------------------------------------------------------

  //   // HYDROLOGY
  //   const flood = getFactorScore(factors, "hydrology", "flood");
  //   const water = getFactorScore(factors, "hydrology", "water");
  //   const drainage = getFactorScore(factors, "hydrology", "drainage");
  //   const groundwater = getFactorScore(factors, "hydrology", "groundwater");

  //   // ENVIRONMENTAL
  //   const pollution = getFactorScore(factors, "environmental", "pollution");
  //   const vegetation = getFactorScore(factors, "environmental", "vegetation");
  //   const biodiversity = getFactorScore(factors, "environmental", "biodiversity");
  //   const heatIsland = getFactorScore(factors, "environmental", "heat_island");

  //   // CLIMATIC
  //   const rainfall = getFactorScore(factors, "climatic", "rainfall");
  //   const heatStress = getFactorScore(factors, "climatic", "intensity");

  //   // PHYSICAL
  //   const elevation = getFactorScore(factors, "physical", "elevation");
  //   const ruggedness = getFactorScore(factors, "physical", "ruggedness");
  //   const slope = getFactorScore(factors, "physical", "slope");

  //   // SOCIO ECON
  //   const infrastructure = getFactorScore(factors, "socio_econ", "infrastructure");
  //   const landuse = getFactorScore(factors, "socio_econ", "landuse");
  //   const population = getFactorScore(factors, "socio_econ", "population");

  //   // RISK
  //   const multiHazard = getFactorScore(factors, "risk_resilience", "multi_hazard");

  //   // ------------------------------------------------------------
  //   // 3) PRIORITY RULES
  //   // NOTE: LOW SCORE = BAD = danger sound
  //   // ------------------------------------------------------------

  //   // 🛑 Multi-hazard danger zone (LOW score = high hazard)
  //   if (multiHazard !== null && multiHazard <= 35) return "hazard";

  //   // 🌊 Flood danger (LOW score = flood risk high)
  //   if (flood !== null && flood <= 35) return "flood";

  //   // 🌫️ Pollution danger (LOW score = bad air)
  //   if (pollution !== null && pollution <= 35) return "pollution";

  //   // 🔥 Heat danger (LOW score = uncomfortable / risky)
  //   if (
  //     (heatStress !== null && heatStress <= 35) ||
  //     (heatIsland !== null && heatIsland <= 35)
  //   )
  //     return "heat";

  //   // ------------------------------------------------------------
  //   // 4) POSITIVE BIOME / LANDSCAPE SOUNDS (HIGH score = good)
  //   // ------------------------------------------------------------

  //   // 🌊 Strong water presence (good)
  //   if (water !== null && water >= 75) return "ocean";

  //   // 🏞️ River-like: moderate water + decent groundwater/drainage
  //   if (
  //     water !== null &&
  //     water >= 55 &&
  //     water < 75 &&
  //     ((groundwater !== null && groundwater >= 55) ||
  //       (drainage !== null && drainage >= 55))
  //   )
  //     return "river";

  //   // 🌲 Forest: vegetation + rainfall + biodiversity
  //   if (
  //     vegetation !== null &&
  //     vegetation >= 60 &&
  //     rainfall !== null &&
  //     rainfall >= 55
  //   )
  //     return "forest";

  //   if (
  //     biodiversity !== null &&
  //     biodiversity >= 70 &&
  //     vegetation !== null &&
  //     vegetation >= 50
  //   )
  //     return "forest";

  //   // 🏔️ Mountain: elevation + ruggedness + slope
  //   if (
  //     (elevation !== null && elevation >= 75) ||
  //     (ruggedness !== null && ruggedness >= 70) ||
  //     (slope !== null && slope >= 75)
  //   )
  //     return "mountain";

  //   // 🏙️ Urban: infra + population + landuse
  //   if (
  //     infrastructure !== null &&
  //     infrastructure >= 70 &&
  //     population !== null &&
  //     population >= 60 &&
  //     landuse !== null &&
  //     landuse >= 55
  //   )
  //     return "urban";

  //   // 🚗 Traffic: urban + slightly weak pollution score
  //   if (
  //     infrastructure !== null &&
  //     infrastructure >= 75 &&
  //     pollution !== null &&
  //     pollution <= 55 &&
  //     pollution > 35
  //   )
  //     return "traffic";

  //   // 🏭 Industrial: infra + landuse strong but pollution not great
  //   if (
  //     infrastructure !== null &&
  //     infrastructure >= 80 &&
  //     landuse !== null &&
  //     landuse >= 70 &&
  //     pollution !== null &&
  //     pollution <= 50
  //   )
  //     return "industrial";

  //   // 🌾 Rural: low infra + low population + vegetation moderate
  //   if (
  //     infrastructure !== null &&
  //     infrastructure <= 40 &&
  //     population !== null &&
  //     population <= 45 &&
  //     vegetation !== null &&
  //     vegetation >= 45
  //   )
  //     return "rural";

  //   // ------------------------------------------------------------
  //   // 5) Fallback
  //   // ------------------------------------------------------------
  //   return "ambient";
  // }, []);
  const detectBiome = useCallback((factors, label) => {
    if (!factors && !label) return "ambient";

    const textLabel = (label || "").toLowerCase();

    // 1) PHYSICAL OVERRIDES (Strict detection for Water/Forest)
    // If suitability is near 0 for these, we are ACTUALLY in them
    const waterSuitability = getFactorScore(factors, "hydrology", "water");
    const vegetationSuitability = getFactorScore(factors, "environmental", "vegetation");

    if (waterSuitability !== null && waterSuitability <= 10) return "ocean";
    if (vegetationSuitability !== null && vegetationSuitability <= 10) return "forest";

    // 2) Text overrides
    if (textLabel.includes("ocean") || textLabel.includes("sea")) return "ocean";
    if (textLabel.includes("urban") || textLabel.includes("strategic hub")) return "urban";

    // 3) Extract Factor Scores
    const flood = getFactorScore(factors, "hydrology", "flood");
    const infrastructure = getFactorScore(factors, "socio_econ", "infrastructure");
    // const population = getFactorScore(factors, "socio_econ", "population");
    const pollution = getFactorScore(factors, "environmental", "pollution");

    // ------------------------------------------------------------
    // 4) DANGER PRIORITY (Low Score = High Danger)
    // ------------------------------------------------------------
    if (flood !== null && flood <= 30) return "flood";
    if (pollution !== null && pollution <= 30) return "pollution";

    // ------------------------------------------------------------
    // 5) LANDSCAPE LOGIC (Based on your specific data)
    // ------------------------------------------------------------

    // 🏙️ URBAN (Matches your current site: Hub 100, Pop 70)
    if (infrastructure !== null && infrastructure >= 85) return "urban";
    
    // 🚗 TRAFFIC (Urban but high pollution)
    if (infrastructure >= 70 && pollution <= 50) return "traffic";

    // 🌊 WATER BODIES (Only if close! distance < 0.5km)
    // We check if proximity is GOOD but score is low (meaning it's a burden)
    if (textLabel.includes("water body") && waterSuitability < 40) return "river";

    // 🏔️ MOUNTAIN / HILLS
    const elevation = getFactorScore(factors, "physical", "elevation");
    const slope = getFactorScore(factors, "physical", "slope");
    if (elevation >= 80 && slope <= 40) return "mountain";

    // 🌲 NATURE / RURAL Fallback
    if (vegetationSuitability >= 60) return "forest";
    if (infrastructure <= 40) return "rural";

    return "ambient";
  }, []);

  // ============================================================
  // AUTOPLAY UNLOCK
  // ============================================================
  useEffect(() => {
    const unlock = () => {
      hasUserInteracted.current = true;

      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume().then(() => console.log("🔊 AudioContext resumed"));
      }
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // ============================================================
  // NORMALIZE "HAS DATA" CHECKS
  // ============================================================
  const hasSiteAData =
    !!resultLabel ||
    (activeFactors &&
      typeof activeFactors === "object" &&
      Object.keys(activeFactors).length > 0);

  const hasSiteBData =
    !!compareResultLabel ||
    (compareFactors &&
      typeof compareFactors === "object" &&
      Object.keys(compareFactors).length > 0);

  // ============================================================
  // MASTER SILENCE MODE
  // ============================================================
  useEffect(() => {
    if (!isEnabled) {
      console.log(
        "%c🔇 MASTER AUDIO OFF -> SILENCE",
        "color:#f59e0b;font-weight:bold;"
      );
      killAll();
    }
  }, [isEnabled, killAll]);

  // ============================================================
  // SITE A CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!isEnabled || !hasSiteAData || !siteAPlaying) {
      killSound(siteASoundRef, "SITE A");
      return;
    }

    const biomeA = detectBiome(activeFactors, resultLabel);
    const sourceA = getAudioSources(biomeA)[0];

    if (siteASoundRef.current && siteASoundRef.current._src === sourceA) return;

    killSound(siteASoundRef, "SITE A");

    console.log(
      `%c🎵 START SITE A: ${biomeA}`,
      "color:#10b981;font-weight:bold;"
    );

    const sound = new Howl({
      src: [sourceA],
      loop: true,
      volume: 0.6, // 🔊 boosted
      html5: false,
    });

    siteASoundRef.current = sound;

    if (hasUserInteracted.current) sound.play();
  }, [
    isEnabled,
    hasSiteAData,
    siteAPlaying,
    activeFactors,
    resultLabel,
    detectBiome,
    killSound,
  ]);

  // ============================================================
  // SITE B CONTROLLER
  // ============================================================
  useEffect(() => {
    if (!isEnabled || !hasSiteBData || !siteBPlaying) {
      killSound(siteBSoundRef, "SITE B");
      return;
    }

    const biomeB = detectBiome(compareFactors, compareResultLabel);
    const sourceB = getAudioSources(biomeB)[0];

    if (siteBSoundRef.current && siteBSoundRef.current._src === sourceB) return;

    killSound(siteBSoundRef, "SITE B");

    console.log(
      `%c🎵 START SITE B: ${biomeB}`,
      "color:#10b981;font-weight:bold;"
    );

    const sound = new Howl({
      src: [sourceB],
      loop: true,
      volume: 0.6, // 🔊 boosted
      html5: false,
    });

    siteBSoundRef.current = sound;

    if (hasUserInteracted.current) sound.play();
  }, [
    isEnabled,
    hasSiteBData,
    siteBPlaying,
    compareFactors,
    compareResultLabel,
    detectBiome,
    killSound,
  ]);

  // ============================================================
  // ABSOLUTE SILENCE WHEN BOTH MUTED
  // ============================================================
  useEffect(() => {
    if (!siteAPlaying && !siteBPlaying) {
      console.log(
        "%c🔇 BOTH SITES MUTED -> FULL SILENCE",
        "color:#ef4444;font-weight:bold;"
      );
      killAll();
    }
  }, [siteAPlaying, siteBPlaying, killAll]);

  // ============================================================
  // UNMOUNT CLEANUP
  // ============================================================
  useEffect(() => {
    return () => {
      console.log(
        "%c🧹 AUDIO UNMOUNT CLEANUP",
        "color:orange;font-weight:bold;"
      );
      killAll();
    };
  }, [killAll]);

  return null;
};

export default AudioLandscape;
