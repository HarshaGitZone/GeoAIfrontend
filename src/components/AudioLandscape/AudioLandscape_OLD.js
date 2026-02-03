import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

/**
 * 🎵 PROFESSIONAL ACOUSTIC LANDSCAPE SYSTEM
 * 
 * Sound Escape - Top-Tier Environmental Audio Experience
 * 
 * Features:
 * - 14-Factor Intelligence Analysis
 * - Trusted Source Priority → Local File Backup
 * - Professional Biome Detection
 * - Cinematic Audio Transitions
 * - Analysis Completion Notifications
 * - Factor-Responsive Audio Selection
 * 
 * Audio Priority:
 * 1. Trusted Source (Premium Audio API)
 * 2. Local Files (/sounds/[biome].mp3)
 * 3. Emergency Fallback
 */

// 🎯 RELIABLE WORKING AUDIO SOURCES (Priority 1)
const TRUSTED_AUDIO_SOURCES = {
  ocean: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
  forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
  mountain: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-the-trees-loop-1199.mp3',
  urban: 'https://assets.mixkit.co/sfx/preview/mixkit-city-traffic-hum-2720.mp3',
  industrial: 'https://assets.mixkit.co/sfx/preview/mixkit-factory-hum-2334.mp3',
  storm: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-loop-2390.mp3',
  river: 'https://assets.mixkit.co/sfx/preview/mixkit-river-flowing-loop-1193.mp3',
  rural: 'https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-2141.mp3',
  coastal: 'https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1191.mp3',
  wetland: 'https://assets.mixkit.co/sfx/preview/mixkit-swamp-ambience-1201.mp3',
  agricultural: 'https://assets.mixkit.co/sfx/preview/mixkit-farm-ambience-1195.mp3',
  suburban: 'https://assets.mixkit.co/sfx/preview/mixkit-suburban-ambience-1194.mp3',
  flood: 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-rain-loop-2401.mp3',
  drought: 'https://assets.mixkit.co/sfx/preview/mixkit-desert-wind-ambience-1221.mp3',
  ambient: 'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-loop-1185.mp3',
  success: 'https://www.soundjay.com/buttons/sounds/button-37a.mp3'
};

// 🏠 LOCAL BACKUP AUDIO SOURCES (Priority 2)
const LOCAL_AUDIO_SOURCES = {
  ocean: '/sounds/ocean.mp3',
  forest: '/sounds/forest.mp3',
  mountain: '/sounds/mountain.mp3',
  urban: '/sounds/urban.mp3',
  industrial: '/sounds/industrial.mp3',
  storm: '/sounds/storm.mp3',
  river: '/sounds/river.mp3',
  rural: '/sounds/rural.mp3',
  coastal: '/sounds/coastal.mp3',
  wetland: '/sounds/wetland.mp3',
  agricultural: '/sounds/agricultural.mp3',
  suburban: '/sounds/suburban.mp3',
  flood: '/sounds/flood.mp3',
  drought: '/sounds/drought.mp3',
  ambient: '/sounds/ambient.mp3',
  success: '/sounds/success.mp3'
};

// 🎯 EMERGENCY FALLBACK SOURCES (Priority 3)
const EMERGENCY_FALLBACK_SOURCES = {
  ocean: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3',
  forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
  mountain: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-the-trees-loop-1199.mp3',
  urban: 'https://assets.mixkit.co/sfx/preview/mixkit-city-traffic-hum-2720.mp3',
  industrial: 'https://assets.mixkit.co/sfx/preview/mixkit-factory-hum-2334.mp3',
  storm: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-and-thunder-loop-2390.mp3',
  river: 'https://assets.mixkit.co/sfx/preview/mixkit-river-flowing-loop-1193.mp3',
  rural: 'https://assets.mixkit.co/sfx/preview/mixkit-crickets-and-insects-in-the-wild-2141.mp3',
  coastal: 'https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-loop-1191.mp3',
  wetland: 'https://assets.mixkit.co/sfx/preview/mixkit-swamp-ambience-1201.mp3',
  agricultural: 'https://assets.mixkit.co/sfx/preview/mixkit-farm-ambience-1195.mp3',
  suburban: 'https://assets.mixkit.co/sfx/preview/mixkit-suburban-ambience-1194.mp3',
  flood: 'https://assets.mixkit.co/sfx/preview/mixkit-heavy-rain-loop-2401.mp3',
  drought: 'https://assets.mixkit.co/sfx/preview/mixkit-desert-wind-ambience-1221.mp3',
  ambient: 'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-loop-1185.mp3',
  success: 'https://www.soundjay.com/buttons/sounds/button-37a.mp3'
};

const AudioLandscape = ({ activeFactors, isEnabled, isLoading, resultLabel, compareFactors, compareResultLabel, analysisComplete, siteAPlaying = true, siteBPlaying = true }) => {
  const soundRef = useRef(null);
  const currentBiome = useRef(null);
  const loadingPingRef = useRef(false);
  const wasInCompareMode = useRef(false);
  const hasUserInteracted = useRef(false);
  const audioReadyToPlay = useRef(false);

  // 🎯 USER INTERACTION DETECTION
  useEffect(() => {
    const handleUserInteraction = () => {
      hasUserInteracted.current = true;
      console.log("👆 User interaction detected - audio can now play");
      
      // If audio is ready to play, start it now
      if (audioReadyToPlay.current && soundRef.current) {
        const isCompareMode = !!(compareFactors || compareResultLabel);
        const shouldPlayAudio = isCompareMode ? siteBPlaying : siteAPlaying;
        
        if (shouldPlayAudio) {
          console.log("🎵 Starting audio after user interaction...");
          soundRef.current.play();
        }
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'keydown', 'touchstart', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [compareFactors, compareResultLabel, siteAPlaying, siteBPlaying]);

  // 🧠 INTELLIGENT BIOME DETECTION BASED ON 14 FACTORS
  const detectBiomeFromFactors = useCallback((factors, label) => {
    console.log(`🎵 Sound Escape Analysis Started:`);
    console.log(`📍 Location Label: "${label}"`);
    console.log(`📊 Raw Factors:`, factors);
    console.log(`🔍 Factors Type:`, typeof factors);
    console.log(`🔍 Factors Keys:`, factors ? Object.keys(factors) : 'No factors');

    // Stay silent until we have data
    if (!factors && !label) return null;

    const textLabel = label?.toLowerCase() || "";
    console.log(`🔍 Processing Text Label: "${textLabel}"`);

    // 🌊 PRIORITY 1: TEXT-BASED ENVIRONMENT DETECTION
    if (textLabel.includes("waterbody") || textLabel.includes("water body") || textLabel.includes("ocean") || textLabel.includes("sea")) {
      const isRiver = textLabel.includes("river") || textLabel.includes("stream");
      console.log(`🌊 Water Body Detected: ${isRiver ? 'RIVER' : 'OCEAN'} from text: "${textLabel}"`);
      return isRiver ? 'river' : 'ocean';
    }
    
    if (textLabel.includes("mountain") || textLabel.includes("hill") || textLabel.includes("elevation")) {
      console.log(`⛰️ Mountain Terrain Detected: MOUNTAIN`);
      return 'mountain';
    }
    
    if (textLabel.includes("wetland") || textLabel.includes("marsh") || textLabel.includes("swamp")) {
      console.log(`🐸 Wetland Ecosystem Detected: WETLAND`);
      return 'wetland';
    }
    
    if (textLabel.includes("coastal") || textLabel.includes("beach")) {
      console.log(`🏖️ Coastal Zone Detected: COASTAL`);
      return 'coastal';
    }

    // 🧮 PRIORITY 2: 14-FACTOR INTELLIGENT ANALYSIS
    if (factors) {
      console.log(`🔍 Analyzing factor structure...`);
      
      // Handle nested factor structure
      let flatFactors;
      
      if (factors.climatic || factors.environmental || factors.hydrology || factors.physical || factors.socio_econ) {
        console.log(`📊 Extracting factors from nested structure...`);
        console.log(`🔍 Climatic:`, factors.climatic);
        console.log(`🔍 Environmental:`, factors.environmental);
        console.log(`🔍 Hydrology:`, factors.hydrology);
        console.log(`🔍 Physical:`, factors.physical);
        console.log(`🔍 Socio-Econ:`, factors.socio_econ);
        
        flatFactors = {
          slope: factors.physical?.slope || 50,
          elevation: factors.physical?.elevation || 50,
          flood: factors.hydrology?.flood || 50,
          water: factors.hydrology?.water || 50,
          drainage: factors.hydrology?.drainage || 50,
          vegetation: factors.environmental?.vegetation || 50,
          pollution: factors.environmental?.pollution || 50,
          soil: factors.environmental?.soil || 50,
          rainfall: factors.climatic?.rainfall || 50,
          thermal: factors.climatic?.thermal || 50,
          intensity: factors.climatic?.intensity || 50,
          landuse: factors.socio_econ?.landuse || 50,
          infrastructure: factors.socio_econ?.infrastructure || 50,
          population: factors.socio_econ?.population || 50
        };
        console.log(`📈 Extracted flat factors:`, flatFactors);
      } else {
        flatFactors = factors;
      }

      const {
        slope, elevation, flood, water, drainage,
        vegetation, pollution, soil, rainfall, thermal, intensity,
        landuse, infrastructure, population
      } = flatFactors;

      console.log(`📈 Extracted Factor Values:`, {
        slope, elevation, flood, water, drainage,
        vegetation, pollution, soil, rainfall, thermal, intensity,
        landuse, infrastructure, population
      });

      // Calculate environmental scores
      const naturalScore = (vegetation + soil + water + drainage) / 4;
      const urbanScore = (infrastructure + population + landuse) / 3;
      const waterScore = (water + rainfall + drainage) / 3;
      const pollutionScore = 100 - pollution;
      const climateScore = (rainfall + thermal + intensity) / 3;

      console.log(`🎯 Environmental Scores:`, {
        natural: naturalScore.toFixed(1),
        urban: urbanScore.toFixed(1),
        water: waterScore.toFixed(1),
        pollution: pollutionScore.toFixed(1),
        climate: climateScore.toFixed(1)
      });

      // 🌊 EXTREME WATER CONDITIONS
      if (water > 85 && elevation < 50) {
        console.log(`🌊 Oceanfront Paradise: OCEAN (Water: ${water}, Elevation: ${elevation})`);
        return 'ocean';
      }
      
      if (water > 75 && elevation > 100) {
        console.log(`⛰️ Mountain Lake: MOUNTAIN (Water: ${water}, Elevation: ${elevation})`);
        return 'mountain';
      }

      // 🌲 PRISTINE NATURAL ENVIRONMENTS
      if (naturalScore > 80 && pollutionScore > 75 && urbanScore < 30) {
        console.log(`🌲 Pristine Wilderness: FOREST (Natural: ${naturalScore.toFixed(1)}, Clean: ${pollutionScore.toFixed(1)})`);
        return 'forest';
      }

      if (naturalScore > 75 && waterScore > 70 && urbanScore < 40) {
        console.log(`🐸 Healthy Wetland: WETLAND (Natural: ${naturalScore.toFixed(1)}, Water: ${waterScore.toFixed(1)})`);
        return 'wetland';
      }

      // 🏙️ URBAN ENVIRONMENTS
      if (urbanScore > 75) {
        if (pollution < 30) {
          console.log(`🏭 Heavy Industrial Zone: INDUSTRIAL (Urban: ${urbanScore.toFixed(1)}, Pollution: ${pollution})`);
          return 'industrial';
        }
        if (population > 80) {
          console.log(`🏙️ Dense Urban Center: URBAN (Population: ${population}, Urban: ${urbanScore.toFixed(1)})`);
          return 'urban';
        }
        console.log(`🏘️ Suburban Area: SUBURBAN (Urban: ${urbanScore.toFixed(1)})`);
        return 'suburban';
      }

      // ⛈️ EXTREME WEATHER CONDITIONS
      if (flood < 25 || rainfall < 25) {
        console.log(`⛈️ Extreme Weather Alert: STORM (Flood Risk: ${flood}, Rainfall: ${rainfall})`);
        return 'storm';
      }

      if (flood > 85) {
        console.log(`🌊 Flood Warning: FLOOD (Flood Level: ${flood})`);
        return 'flood';
      }

      if (rainfall < 20 && thermal > 80) {
        console.log(`🏜️ Drought Conditions: DROUGHT (Rainfall: ${rainfall}, Temperature: ${thermal})`);
        return 'drought';
      }

      // 🌾 AGRICULTURAL AREAS
      if (soil > 70 && rainfall > 40 && rainfall < 80 && landuse > 30 && landuse < 80) {
        console.log(`🌾 Agricultural Zone: AGRICULTURAL (Soil: ${soil}, Rainfall: ${rainfall}, Land Use: ${landuse})`);
        return 'agricultural';
      }

      // 🏔️ MOUNTAINOUS TERRAIN
      if (elevation > 200 || slope > 60) {
        console.log(`🏔️ Mountainous Terrain: MOUNTAIN (Elevation: ${elevation}m, Slope: ${slope})`);
        return 'mountain';
      }

      // 🌊 COASTAL AREAS
      if (water > 60 && elevation < 100) {
        console.log(`🏖️ Coastal Area: COASTAL (Water: ${water}, Elevation: ${elevation})`);
        return 'coastal';
      }

      // 🌾 RURAL COUNTRYSIDE
      if (naturalScore > 60 && urbanScore < 50) {
        console.log(`🌾 Rural Countryside: RURAL (Natural: ${naturalScore.toFixed(1)}, Urban: ${urbanScore.toFixed(1)})`);
        return 'rural';
      }

      // 🌊 WATER-RICH ENVIRONMENTS
      if (waterScore > 70) {
        const isFlowing = water > 80;
        console.log(`💧 Water-Rich Environment: ${isFlowing ? 'RIVER' : 'WETLAND'} (Water Score: ${waterScore.toFixed(1)})`);
        return isFlowing ? 'river' : 'wetland';
      }

      // 🎯 INTELLIGENT DEFAULT BASED ON DOMINANT FACTOR
      const scores = {
        natural: naturalScore,
        urban: urbanScore,
        water: waterScore,
        pollution: pollutionScore,
        climate: climateScore
      };

      const dominantFactor = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
      console.log(`🎭 Dominant Environmental Factor: ${dominantFactor} (${scores[dominantFactor].toFixed(1)})`);

      switch (dominantFactor) {
        case 'natural':
          console.log(`🌲 Nature-Dominant: FOREST`);
          return 'forest';
        case 'urban':
          console.log(`🏙️ Urban-Dominant: URBAN`);
          return 'urban';
        case 'water':
          console.log(`💧 Water-Dominant: RIVER`);
          return 'river';
        case 'pollution':
          console.log(`🏭 Pollution-Dominant: INDUSTRIAL`);
          return 'industrial';
        case 'climate':
          console.log(`🌤️ Climate-Dominant: AMBIENT`);
          return 'ambient';
        default:
          console.log(`🔇 Default: AMBIENT`);
          return 'ambient';
      }
    }

    console.log(`🔇 No specific factors detected: AMBIENT`);
    return 'ambient';
  }, []);

  // 🔄 COMPARISON MODE - SELECT BEST LOCATION
  const getComparisonBiome = useCallback((factorsA, factorsB, labelA, labelB) => {
    console.log(`🔄 Comparison Mode Analysis:`);
    console.log(`📍 Location A: ${labelA}`);
    console.log(`📍 Location B: ${labelB}`);

    if (!factorsA && !factorsB) return null;
    if (!factorsB) return detectBiomeFromFactors(factorsA, labelA);
    if (!factorsA) return detectBiomeFromFactors(factorsB, labelB);

    // Calculate environmental quality scores
    const calculateScore = (factors) => {
      if (!factors) return 0;

      let flatFactors;
      if (factors.climatic || factors.environmental || factors.hydrology || factors.physical || factors.socio_econ) {
        flatFactors = {
          vegetation: factors.environmental?.vegetation || 50,
          pollution: factors.environmental?.pollution || 50,
          water: factors.hydrology?.water || 50,
          infrastructure: factors.socio_econ?.infrastructure || 50,
          population: factors.socio_econ?.population || 50,
          landuse: factors.socio_econ?.landuse || 50
        };
      } else {
        flatFactors = factors;
      }

      const naturalScore = (flatFactors.vegetation + flatFactors.water + 100) / 3;
      const urbanScore = (flatFactors.infrastructure + flatFactors.population + flatFactors.landuse) / 3;
      const cleanlinessScore = 100 - flatFactors.pollution;

      return (naturalScore + urbanScore + cleanlinessScore) / 3;
    };

    const scoreA = calculateScore(factorsA);
    const scoreB = calculateScore(factorsB);

    console.log(`📊 Location A Quality Score: ${scoreA.toFixed(1)}`);
    console.log(`📊 Location B Quality Score: ${scoreB.toFixed(1)}`);

    if (scoreA > scoreB) {
      console.log(`🏆 Location A Wins: ${labelA}`);
      return detectBiomeFromFactors(factorsA, labelA);
    } else {
      console.log(`🏆 Location B Wins: ${labelB}`);
      return detectBiomeFromFactors(factorsB, labelB);
    }
  }, [detectBiomeFromFactors]);

  // 🎵 PROFESSIONAL AUDIO SOURCE MANAGEMENT
  const getAudioSources = (biome) => {
    console.log(`🎵 Getting Audio Sources for: ${biome.toUpperCase()}`);
    
    const sources = [];
    
    // Priority 1: Local Files (MUST WORK)
    if (LOCAL_AUDIO_SOURCES[biome]) {
      sources.push(LOCAL_AUDIO_SOURCES[biome]);
      console.log(`🏠 Local File (Priority 1): ${LOCAL_AUDIO_SOURCES[biome]}`);
    }
    
    // Priority 2: Trusted Source (Backup)
    if (TRUSTED_AUDIO_SOURCES[biome]) {
      sources.push(TRUSTED_AUDIO_SOURCES[biome]);
      console.log(`✅ Trusted Source (Priority 2): ${TRUSTED_AUDIO_SOURCES[biome]}`);
    }
    
    // Priority 3: Emergency Fallback (Last Resort)
    if (EMERGENCY_FALLBACK_SOURCES[biome]) {
      sources.push(EMERGENCY_FALLBACK_SOURCES[biome]);
      console.log(`🆘 Emergency Fallback (Priority 3): ${EMERGENCY_FALLBACK_SOURCES[biome]}`);
    }
    
    console.log(`🎵 Final Audio Sources:`, sources);
    return sources.length > 0 ? sources : [LOCAL_AUDIO_SOURCES.ambient];
  };

  // 🎯 MAIN AUDIO CONTROLLER
  useEffect(() => {
    console.log(`🎵 Sound Escape Controller Activated:`);
    console.log(`🔊 Enabled: ${isEnabled}`);
    console.log(`📍 Site A Playing: ${siteAPlaying}`);
    console.log(`📍 Site B Playing: ${siteBPlaying}`);
    console.log(`⏳ Loading: ${isLoading}`);
    console.log(`✅ Analysis Complete: ${analysisComplete}`);
    console.log(`🎯 Current Biome: ${currentBiome.current}`);

    // 🔇 DETERMINE IF AUDIO SHOULD PLAY
    const isCompareMode = !!(compareFactors || compareResultLabel);
    const shouldPlayAudio = isCompareMode ? siteBPlaying : siteAPlaying;
    
    console.log(`🎵 Audio Control Check: isCompareMode=${isCompareMode}, shouldPlayAudio=${shouldPlayAudio}, siteAPlaying=${siteAPlaying}, siteBPlaying=${siteBPlaying}`);
    console.log(`🎵 Data Check: compareFactors=${!!compareFactors}, compareResultLabel=${!!compareResultLabel}`);
    
    if (!shouldPlayAudio) {
      if (currentBiome.current !== "MUTED") {
        console.log("🔇 Sound Escape: Muted");
        currentBiome.current = "MUTED";
      }
      if (soundRef.current) {
        console.log("🔇 Stopping current audio immediately...");
        try {
          soundRef.current.stop();
          soundRef.current.unload();
        } catch (e) {
          console.warn("Error stopping audio:", e);
        }
        soundRef.current = null;
      }
      return;
    }

    // 🎉 ANALYSIS COMPLETION CELEBRATION
    if (!isLoading && loadingPingRef.current && analysisComplete) {
      console.log("🎉 Analysis Complete! Playing success sound...");
      const celebrationSound = new Howl({ 
        src: getAudioSources('success'), 
        volume: 0.25 
      });
      celebrationSound.play();
      loadingPingRef.current = false;
      
      // Restore main audio after celebration
      setTimeout(() => {
        if (soundRef.current) soundRef.current.fade(0.05, 0.3, 1200);
      }, 500);
      return;
    }

    // 🧠 DETERMINE OPTIMAL BIOME
    let nextBiome;
    if (compareFactors || compareResultLabel) {
      console.log("🔄 Comparison Mode Active");
      console.log("📊 Compare Factors:", compareFactors);
      console.log("📍 Compare Result Label:", compareResultLabel);
      nextBiome = getComparisonBiome(activeFactors, compareFactors, resultLabel, compareResultLabel);
    } else {
      console.log("📍 Single Location Analysis");
      console.log("📊 Active Factors:", activeFactors);
      console.log("📍 Result Label:", resultLabel);
      nextBiome = detectBiomeFromFactors(activeFactors, resultLabel);
    }

    console.log(`🎯 Determined Biome: ${nextBiome}`);

    // 🎵 CINEMATIC AUDIO TRANSITION
    if (nextBiome !== currentBiome.current) {
      if (nextBiome) {
        console.log(`🌍 Biome Change: ${currentBiome.current} → ${nextBiome.toUpperCase()}`);
        console.log(`📍 Location: ${resultLabel || compareResultLabel || 'Analysis Active'}`);
      }

      // Cross-fade old audio
      if (soundRef.current) {
        console.log(`🔄 Cross-fading out previous audio...`);
        const oldSound = soundRef.current;
        oldSound.fade(oldSound.volume(), 0, 2000);
        setTimeout(() => oldSound.stop(), 2000);
      }

      // Start new audio
      if (nextBiome) {
        const audioSources = getAudioSources(nextBiome);
        console.log(`🎵 Creating professional audio instance for ${nextBiome.toUpperCase()}`);
        
        const newSound = new Howl({
          src: audioSources,
          loop: true,
          volume: 0,
          html5: true,
          preload: true,
          autoplay: false, // Never autoplay - let user interaction trigger
          onload: () => {
            console.log(`✅ Audio loaded successfully: ${nextBiome.toUpperCase()}`);
          },
          onloaderror: (id, err) => {
            console.error(`❌ Load failed for ${nextBiome.toUpperCase()}:`, err);
            console.warn(`🔄 Trying next audio source...`);
          },
          onplayerror: (id, err) => {
            console.error(`❌ Playback error for ${nextBiome.toUpperCase()}:`, err);
            console.warn(`⚠️ Audio may be blocked by browser policy - requires user interaction`);
          },
          onplay: () => {
            console.log(`🎵 Now playing: ${nextBiome.toUpperCase()}`);
          },
          onend: () => {
            console.log(`🔄 Audio loop completed: ${nextBiome.toUpperCase()}`);
          }
        });

        console.log(`🎵 Starting cinematic fade-in...`);
        
        // Mark audio as ready to play
        audioReadyToPlay.current = true;
        
        // Only play if user has interacted and audio should play
        const isCompareMode = !!(compareFactors || compareResultLabel);
        const shouldPlayAudio = isCompareMode ? siteBPlaying : siteAPlaying;
        
        if (hasUserInteracted.current && shouldPlayAudio) {
          console.log("🎵 Playing audio immediately (user has interacted)...");
          newSound.play();
        } else {
          console.log("🎵 Audio loaded but waiting for user interaction...");
        }
        newSound.fade(0, 0.35, 3000); // Professional volume with smooth fade-in
        soundRef.current = newSound;
      } else {
        console.log(`🔇 No biome detected - silence`);
        soundRef.current = null;
      }
      
      currentBiome.current = nextBiome;
    } else {
      console.log(`🔄 Maintaining current biome: ${currentBiome.current}`);
    }

    // 🎚️ LOADING DUCKING
    if (isLoading && soundRef.current) {
      console.log("🔇 Ducking audio during analysis...");
      soundRef.current.fade(soundRef.current.volume(), 0.05, 800);
      loadingPingRef.current = true;
    }

  }, [activeFactors, compareFactors, isEnabled, isLoading, resultLabel, compareResultLabel, analysisComplete, siteAPlaying, siteBPlaying, detectBiomeFromFactors, getComparisonBiome]);

  // 🎛️ IMMEDIATE AUDIO CONTROL - Separate effect for fast response
  useEffect(() => {
    // Check if we have compare data - this indicates we're in compare mode
    const isCompareMode = !!(compareFactors || compareResultLabel);
    const shouldPlayAudio = isCompareMode ? siteBPlaying : siteAPlaying;
    
    console.log(`🎛️ Immediate Audio Control: isCompareMode=${isCompareMode}, shouldPlayAudio=${shouldPlayAudio}, siteAPlaying=${siteAPlaying}, siteBPlaying=${siteBPlaying}`);
    console.log(`🎛️ Data Check: compareFactors=${!!compareFactors}, compareResultLabel=${!!compareResultLabel}`);
    
    if (!shouldPlayAudio) {
      console.log("🔇 Audio should be muted - stopping immediately...");
      if (soundRef.current) {
        // Force stop immediately
        try {
          soundRef.current.stop();
          soundRef.current.unload();
        } catch (e) {
          console.warn("Error stopping audio:", e);
        }
        soundRef.current = null;
      }
      currentBiome.current = "MUTED";
      return;
    }
  }, [siteAPlaying, siteBPlaying, compareFactors, compareResultLabel]);

  // 🔄 COMPARE MODE EXIT HANDLER - Stop audio when compare mode is closed
  useEffect(() => {
    const currentCompareMode = !!(compareFactors || compareResultLabel);
    
    // If we were in compare mode and now we're not, stop the audio
    if (wasInCompareMode.current && !currentCompareMode) {
      console.log("🔄 Compare mode exited - stopping all audio immediately...");
      if (soundRef.current) {
        try {
          soundRef.current.stop();
          soundRef.current.unload();
        } catch (e) {
          console.warn("Error stopping audio on compare exit:", e);
        }
        soundRef.current = null;
      }
      currentBiome.current = "MUTED";
      audioReadyToPlay.current = false; // Reset audio ready state
    }
    
    wasInCompareMode.current = currentCompareMode;
  }, [compareFactors, compareResultLabel]);

  return null;
};

export default AudioLandscape;
