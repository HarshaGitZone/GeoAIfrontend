import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

// 🎵 LOCAL AUDIO SOURCES ONLY
const getAudioSources = (biome) => {
  const sounds = {
    ocean: ['/sounds/ocean.mp3'],
    forest: ['/sounds/forest.mp3'],
    mountain: ['/sounds/mountain.webm'],
    urban: ['/sounds/urban.mp3'],
    traffic: ['/sounds/traffic.mp3'],
    flood: ['/sounds/flood.mp3'],
    ambient: ['/sounds/ambient.mp3'],
    success: ['/sounds/success.mp3'],
    river: ['/sounds/river.mp3'],
    rural: ['/sounds/rural.mp3']
  };
  return sounds[biome] || sounds.ambient;
};

const AudioLandscape = ({ 
  activeFactors, 
  isEnabled, 
  isLoading, 
  resultLabel, 
  compareFactors, 
  compareResultLabel, 
  analysisComplete,
  siteAPlaying = true,
  siteBPlaying = true 
}) => {
  // 🎵 AUDIO REFERENCES
  const siteASoundRef = useRef(null);
  const siteBSoundRef = useRef(null);
  const hasUserInteracted = useRef(false);
  const lastAnalysisComplete = useRef(false);

  // 🔍 DEBUG: Log prop changes
  useEffect(() => {
    console.log("🔍 AudioLandscape Props Changed:");
    console.log(`  - siteAPlaying: ${siteAPlaying}`);
    console.log(`  - siteBPlaying: ${siteBPlaying}`);
    console.log(`  - compareFactors: ${!!compareFactors}`);
    console.log(`  - compareResultLabel: "${compareResultLabel}"`);
  }, [siteAPlaying, siteBPlaying, compareFactors, compareResultLabel]);

  // 🎯 DETECT BIOME FROM FACTORS
  const detectBiomeFromFactors = useCallback((factors, label) => {
    if (!factors && !label) return 'ambient';
    
    const textLabel = label?.toLowerCase() || '';
    
    // Text-based detection
    if (textLabel.includes('ocean') || textLabel.includes('sea') || textLabel.includes('water body')) return 'ocean';
    if (textLabel.includes('forest')) return 'forest';
    if (textLabel.includes('mountain')) return 'mountain';
    if (textLabel.includes('urban') || textLabel.includes('city')) return 'urban';
    if (textLabel.includes('flood')) return 'flood';
    if (textLabel.includes('river')) return 'river';
    if (textLabel.includes('rural')) return 'rural';
    
    // Factor-based detection
    if (factors) {
      const { elevation, climate, vegetation, water_proximity, land_use } = factors;
      
      if (water_proximity > 0.7) return 'ocean';
      if (vegetation > 0.8 && climate > 0.6) return 'forest';
      if (elevation > 0.7) return 'mountain';
      if (land_use > 0.8) return 'urban';
      if (water_proximity > 0.5 && water_proximity <= 0.7) return 'river';
    }
    
    return 'ambient';
  }, []);

  // 🎯 PLAY SUCCESS SOUND
  const playSuccessSound = useCallback(() => {
    console.log("🎉 Playing success sound...");
    const successSound = new Howl({
      src: getAudioSources('success'),
      volume: 0.3,
      onplay: () => console.log("🎉 Success sound playing"),
      onplayerror: (id, err) => console.warn("⚠️ Success sound blocked:", err)
    });
    
    if (hasUserInteracted.current) {
      successSound.play();
    } else {
      // Wait for user interaction
      const waitForInteraction = () => {
        if (hasUserInteracted.current) {
          successSound.play();
          document.removeEventListener('click', waitForInteraction);
        }
      };
      document.addEventListener('click', waitForInteraction, { once: true });
    }
  }, []);

  // 🎵 STOP SITE A AUDIO
  const stopSiteAAudio = useCallback(() => {
    if (siteASoundRef.current) {
      console.log("🔇 Stopping Site A audio");
      try {
        // Force stop with multiple methods
        siteASoundRef.current.stop();
        siteASoundRef.current.pause();
        siteASoundRef.current.unload();
        siteASoundRef.current = null;
      } catch (e) {
        console.warn("Error stopping Site A audio:", e);
        // Ensure reference is cleared even if stop fails
        siteASoundRef.current = null;
      }
    }
  }, []);

  // 🎵 STOP SITE B AUDIO
  const stopSiteBAudio = useCallback(() => {
    if (siteBSoundRef.current) {
      console.log("🔇 Stopping Site B audio");
      try {
        // Force stop with multiple methods
        siteBSoundRef.current.stop();
        siteBSoundRef.current.pause();
        siteBSoundRef.current.unload();
        siteBSoundRef.current = null;
      } catch (e) {
        console.warn("Error stopping Site B audio:", e);
        // Ensure reference is cleared even if stop fails
        siteBSoundRef.current = null;
      }
    }
  }, []);

  // 🎵 GLOBAL AUDIO STOP - Force stop all audio
  const stopAllAudio = useCallback(() => {
    console.log("🔇 STOPPING ALL AUDIO - Force termination");
    stopSiteAAudio();
    stopSiteBAudio();
    
    // Additional cleanup - stop any other audio instances
    try {
      // Stop any global Howl instances
      if (typeof Howl !== 'undefined') {
        Howl.stop();
      }
    } catch (e) {
      console.warn("Error stopping global audio:", e);
    }
  }, [stopSiteAAudio, stopSiteBAudio]);

  // 🎵 START SITE A AUDIO
  const startSiteAAudio = useCallback((biome) => {
    // Always stop existing audio first
    if (siteASoundRef.current) {
      stopSiteAAudio();
    }
    
    // Check if audio should be playing
    if (!isEnabled || !siteAPlaying) {
      console.log("🔇 Site A audio disabled or muted - not starting");
      return;
    }

    console.log("🎵 Starting Site A audio for biome:", biome);
    const sound = new Howl({
      src: getAudioSources(biome),
      loop: true,
      volume: 0.25,
      html5: true,
      onplay: () => console.log(`🎵 Site A playing: ${biome}`),
      onplayerror: (id, err) => console.warn(`⚠️ Site A audio blocked: ${biome}`, err),
      onloaderror: (id, err) => console.error(`❌ Site A load failed: ${biome}`, err)
    });

    if (hasUserInteracted.current) {
      sound.play();
    } else {
      console.log("👆 Site A audio waiting for user interaction...");
      const waitForInteraction = () => {
        if (hasUserInteracted.current) {
          sound.play();
          document.removeEventListener('click', waitForInteraction);
        }
      };
      document.addEventListener('click', waitForInteraction, { once: true });
    }

    siteASoundRef.current = sound;
  }, [isEnabled, siteAPlaying, stopSiteAAudio]);

  // 🎵 START SITE B AUDIO
  const startSiteBAudio = useCallback((biome) => {
    // Always stop existing audio first
    if (siteBSoundRef.current) {
      stopSiteBAudio();
    }
    
    // Check if audio should be playing
    if (!isEnabled || !siteBPlaying) {
      console.log("🔇 Site B audio disabled or muted - not starting");
      return;
    }

    console.log("🎵 Starting Site B audio for biome:", biome);
    const sound = new Howl({
      src: getAudioSources(biome),
      loop: true,
      volume: 0.25,
      html5: true,
      onplay: () => console.log(`🎵 Site B playing: ${biome}`),
      onplayerror: (id, err) => console.warn(`⚠️ Site B audio blocked: ${biome}`, err),
      onloaderror: (id, err) => console.error(`❌ Site B load failed: ${biome}`, err)
    });

    if (hasUserInteracted.current) {
      sound.play();
    } else {
      console.log("👆 Site B audio waiting for user interaction...");
      const waitForInteraction = () => {
        if (hasUserInteracted.current) {
          sound.play();
          document.removeEventListener('click', waitForInteraction);
        }
      };
      document.addEventListener('click', waitForInteraction, { once: true });
    }

    siteBSoundRef.current = sound;
  }, [isEnabled, siteBPlaying, stopSiteBAudio]);

  // 👆 USER INTERACTION DETECTION
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted.current) {
        hasUserInteracted.current = true;
        console.log("👆 User interaction detected - audio enabled");
      }
    };

    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // 🎯 MAIN AUDIO CONTROLLER
  useEffect(() => {
    console.log("🎵 Audio Controller Activated");
    console.log(`🔊 Enabled: ${isEnabled}`);
    console.log(`📍 Site A Playing: ${siteAPlaying}`);
    console.log(`📍 Site B Playing: ${siteBPlaying}`);
    console.log(`⏳ Loading: ${isLoading}`);
    console.log(`✅ Analysis Complete: ${analysisComplete}`);

    // 🎉 PLAY SUCCESS SOUND ON ANALYSIS COMPLETION
    if (analysisComplete && !lastAnalysisComplete.current) {
      playSuccessSound();
      lastAnalysisComplete.current = true;
    } else if (!analysisComplete) {
      lastAnalysisComplete.current = false;
    }

    // 🎵 SITE A AUDIO CONTROL
    if (activeFactors || resultLabel) {
      const siteABiome = detectBiomeFromFactors(activeFactors, resultLabel);
      
      if (siteAPlaying && isEnabled) {
        startSiteAAudio(siteABiome);
      } else {
        stopSiteAAudio();
      }
    } else {
      // No analysis data - stop Site A audio
      stopSiteAAudio();
    }

    // 🎵 SITE B AUDIO CONTROL (A/B Analysis)
    console.log("🔍 Site B Audio Check:");
    console.log(`  - compareFactors: ${!!compareFactors}`);
    console.log(`  - compareResultLabel: "${compareResultLabel}"`);
    console.log(`  - siteBPlaying: ${siteBPlaying}`);
    console.log(`  - isEnabled: ${isEnabled}`);
    
    if (compareFactors || compareResultLabel) {
      const siteBBiome = detectBiomeFromFactors(compareFactors, compareResultLabel);
      console.log(`  - Site B Biome: ${siteBBiome}`);
      
      if (siteBPlaying && isEnabled) {
        console.log("🎵 Starting Site B audio...");
        startSiteBAudio(siteBBiome);
      } else {
        console.log("🔇 Site B audio disabled or muted - stopping");
        stopSiteBAudio();
      }
    } else {
      console.log("🔇 No compare data - stopping Site B audio");
      stopSiteBAudio();
    }

    // 🎵 FORCE STOP ALL AUDIO IF BOTH SITES ARE MUTED
    if (!siteAPlaying && !siteBPlaying) {
      console.log("🔇 Both sites muted - forcing complete audio stop");
      stopAllAudio();
    }

  }, [
    activeFactors, 
    compareFactors, 
    isEnabled, 
    isLoading, 
    resultLabel, 
    compareResultLabel, 
    analysisComplete,
    siteAPlaying,
    siteBPlaying,
    detectBiomeFromFactors,
    playSuccessSound,
    startSiteAAudio,
    startSiteBAudio,
    stopSiteAAudio,
    stopSiteBAudio,
    stopAllAudio
  ]);

  // 🧹 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  return null;
};

export default AudioLandscape;
