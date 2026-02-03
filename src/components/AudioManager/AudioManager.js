import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl } from 'howler';

/**
 * 🎵 GLOBAL AUDIO MANAGER SYSTEM
 * 
 * Features:
 * - Global mute/unmute control
 * - Analysis completion notifications
 * - A/B analysis dual audio controls
 * - Local file priority system
 * - Factor-based audio mapping
 * - Professional audio management
 */

// 🏠 LOCAL AUDIO FILES (Priority 1)
const LOCAL_AUDIO_SOURCES = {
  // Environmental Biomes
  ocean: '/sounds/ocean.mp3',
  forest: '/sounds/forest.mp3',
  mountain: '/sounds/mountain.webm', // Note: webm format
  river: '/sounds/river.mp3',
  coastal: '/sounds/ocean.mp3', // Fallback to ocean
  wetland: '/sounds/river.mp3', // Fallback to river
  rural: '/sounds/rural.mp3',
  agricultural: '/sounds/rural.mp3', // Fallback to rural
  suburban: '/sounds/urban.mp3', // Fallback to urban
  
  // Urban/Industrial
  urban: '/sounds/urban.mp3',
  industrial: '/sounds/traffic.mp3', // Using traffic as industrial
  
  // Weather/Climate
  storm: '/sounds/flood.mp3', // Fallback to flood
  flood: '/sounds/flood.mp3',
  drought: '/sounds/ambient.mp3', // Fallback to ambient
  
  // Default/Ambient
  ambient: '/sounds/ambient.mp3',
  
  // System Sounds
  success: '/sounds/success.mp3',
  notification: '/sounds/success.mp3', // Fallback to success
  analysis_complete: '/sounds/success.mp3' // Fallback to success
};

const AudioManager = ({ 
  children, 
  onAnalysisComplete, 
  onABAnalysisComplete,
  siteAFactors,
  siteBFactors,
  siteALabel,
  siteBLabel 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isABMode, setIsABMode] = useState(false);
  const [siteAPlaying, setSiteAPlaying] = useState(false);
  const [siteBPlaying, setSiteBPlaying] = useState(false);
  
  const audioRefs = useRef({
    global: null,
    siteA: null,
    siteB: null,
    notification: null
  });

  // AUDIO SOURCE MANAGEMENT - LOCAL FILES ONLY
  const getAudioSource = useCallback((audioKey) => {
    // Priority 1: Local files only
    if (LOCAL_AUDIO_SOURCES[audioKey]) {
      console.log(` Using local audio: ${audioKey}`);
      return LOCAL_AUDIO_SOURCES[audioKey];
    }
    
    console.log(` No local audio source found for: ${audioKey}`);
    return null;
  }, []);

  // FACTOR-BASED BIOME DETECTION
  const detectBiomeFromFactors = useCallback((factors, label) => {
    if (!factors && !label) return 'ambient';
    
    const textLabel = label?.toLowerCase() || '';
    
    // Text-based detection
    if (textLabel.includes('ocean') || textLabel.includes('sea')) return 'ocean';
    if (textLabel.includes('forest') || textLabel.includes('woods')) return 'forest';
    if (textLabel.includes('mountain') || textLabel.includes('hill')) return 'mountain';
    if (textLabel.includes('river') || textLabel.includes('stream')) return 'river';
    if (textLabel.includes('urban') || textLabel.includes('city')) return 'urban';
    if (textLabel.includes('industrial') || textLabel.includes('factory')) return 'industrial';
    if (textLabel.includes('storm') || textLabel.includes('thunder')) return 'storm';
    if (textLabel.includes('flood') || textLabel.includes('wet')) return 'flood';
    if (textLabel.includes('drought') || textLabel.includes('dry')) return 'drought';
    if (textLabel.includes('rural') || textLabel.includes('countryside')) return 'rural';
    if (textLabel.includes('agricultural') || textLabel.includes('farm')) return 'agricultural';
    if (textLabel.includes('suburban') || textLabel.includes('residential')) return 'suburban';
    
    // Factor-based detection
    if (factors) {
      let flatFactors = factors;
      
      // Handle nested structure
      if (factors.climatic || factors.environmental || factors.hydrology || factors.physical || factors.socio_econ) {
        flatFactors = {
          slope: factors.physical?.slope || 50,
          elevation: factors.physical?.elevation || 50,
          flood: factors.hydrology?.flood || 50,
          water: factors.hydrology?.water || 50,
          drainage: factors.hydrology?.drainage || 50,
          vegetation: factors.environmental?.vegetation || 50,
          pollution: factors.environmental?.pollution || 50,
          rainfall: factors.climatic?.rainfall || 50,
          intensity: factors.climatic?.intensity || 50,
          drought: factors.climatic?.drought || 50,
          storm: factors.climatic?.storm || 50,
          landuse: factors.socio_econ?.landuse || 50,
          infrastructure: factors.socio_eon?.infrastructure || 50,
          population: factors.socio_econ?.population || 50
        };
      }
      
      const {
        slope, elevation, flood, water, drainage,
        vegetation, pollution, rainfall, intensity,
        drought, storm, landuse, infrastructure, population
      } = flatFactors;
      
      // Water-based biomes
      if (water > 70 || flood > 70) return flood > 80 ? 'flood' : 'river';
      if (water > 50) return 'coastal';
      
      // Forest-based biomes
      if (vegetation > 70 && pollution < 30) return 'forest';
      if (vegetation > 50 && pollution < 50) return 'rural';
      
      // Urban-based biomes
      if (infrastructure > 70 || population > 70) return 'urban';
      if (infrastructure > 50 || population > 50) return 'suburban';
      if (infrastructure > 70 && pollution > 50) return 'industrial';
      
      // Mountain-based biomes
      if (elevation > 70 || slope > 70) return 'mountain';
      
      // Climate-based biomes
      if (rainfall < 20 || drought > 70) return 'drought';
      if (storm > 70 || intensity > 80) return 'storm';
      
      // Agricultural
      if (landuse > 60 && vegetation > 40) return 'agricultural';
      
      // Wetland
      if (water > 40 && vegetation > 50 && drainage < 40) return 'wetland';
    }
    
    return 'ambient';
  }, []);

  // 🎵 PLAY AUDIO WITH MUTE RESPECT
  const playAudio = useCallback((audioKey, options = {}) => {
    if (isMuted) {
      console.log(`🔇 Audio muted: ${audioKey}`);
      return;
    }
    
    const audioSource = getAudioSource(audioKey);
    if (!audioSource) return;
    
    console.log(`🎵 Playing audio: ${audioKey}`);
    
    const sound = new Howl({
      src: [audioSource],
      volume: options.volume || 0.5,
      loop: options.loop || false,
      onload: () => console.log(`✅ Audio loaded: ${audioKey}`),
      onloaderror: (id, error) => console.log(`❌ Audio load error: ${audioKey}`, error),
      onplay: () => console.log(`🎬 Audio playing: ${audioKey}`),
      onend: () => options.onEnd && options.onEnd()
    });
    
    sound.play();
    return sound;
  }, [isMuted, getAudioSource]);

  // 🔔 ANALYSIS COMPLETE NOTIFICATION
  const notifyAnalysisComplete = useCallback(() => {
    if (!isMuted) {
      playAudio('analysis_complete', { volume: 0.3 });
    }
  }, [isMuted, playAudio]);

  // 🔄 A/B ANALYSIS SETUP
  const setupABAnalysis = useCallback(() => {
    setIsABMode(true);
    
    // Stop any existing audio
    if (audioRefs.current.siteA) {
      audioRefs.current.siteA.stop();
      audioRefs.current.siteA = null;
    }
    if (audioRefs.current.siteB) {
      audioRefs.current.siteB.stop();
      audioRefs.current.siteB = null;
    }
    
    // Setup site A audio
    if (siteAFactors || siteALabel) {
      const biomeA = detectBiomeFromFactors(siteAFactors, siteALabel);
      const audioA = playAudio(biomeA, { 
        loop: true, 
        volume: 0.4,
        onEnd: () => setSiteAPlaying(false)
      });
      audioRefs.current.siteA = audioA;
      setSiteAPlaying(true);
    }
    
    // Setup site B audio
    if (siteBFactors || siteBLabel) {
      const biomeB = detectBiomeFromFactors(siteBFactors, siteBLabel);
      const audioB = playAudio(biomeB, { 
        loop: true, 
        volume: 0.4,
        onEnd: () => setSiteBPlaying(false)
      });
      audioRefs.current.siteB = audioB;
      setSiteBPlaying(true);
    }
    
    // Play notification
    if (!isMuted) {
      setTimeout(() => {
        playAudio('notification', { volume: 0.3 });
      }, 500);
    }
  }, [isMuted, playAudio, detectBiomeFromFactors, siteAFactors, siteALabel, siteBFactors, siteBLabel]);

  // 🎛️ TOGGLE SITE AUDIO
  const toggleSiteAudio = useCallback((site) => {
    if (site === 'A') {
      if (audioRefs.current.siteA) {
        if (siteAPlaying) {
          audioRefs.current.siteA.pause();
          setSiteAPlaying(false);
        } else {
          audioRefs.current.siteA.play();
          setSiteAPlaying(true);
        }
      }
    } else if (site === 'B') {
      if (audioRefs.current.siteB) {
        if (siteBPlaying) {
          audioRefs.current.siteB.pause();
          setSiteBPlaying(false);
        } else {
          audioRefs.current.siteB.play();
          setSiteBPlaying(true);
        }
      }
    }
  }, [siteAPlaying, siteBPlaying]);

  // 🔇 TOGGLE GLOBAL MUTE
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuteState = !prev;
      
      // Handle existing audio
      if (audioRefs.current.siteA) {
        if (newMuteState) {
          audioRefs.current.siteA.pause();
          setSiteAPlaying(false);
        } else if (isABMode) {
          audioRefs.current.siteA.play();
          setSiteAPlaying(true);
        }
      }
      
      if (audioRefs.current.siteB) {
        if (newMuteState) {
          audioRefs.current.siteB.pause();
          setSiteBPlaying(false);
        } else if (isABMode) {
          audioRefs.current.siteB.play();
          setSiteBPlaying(true);
        }
      }
      
      console.log(newMuteState ? '🔇 Audio muted' : '🔊 Audio unmuted');
      return newMuteState;
    });
  }, [isABMode]);

  // 🎯 EFFECTS
  useEffect(() => {
    if (onAnalysisComplete) {
      notifyAnalysisComplete();
    }
  }, [onAnalysisComplete, notifyAnalysisComplete]);

  useEffect(() => {
    if (onABAnalysisComplete) {
      setupABAnalysis();
    }
  }, [onABAnalysisComplete, setupABAnalysis]);

  // 🧹 CLEANUP
  useEffect(() => {
    const currentAudioRefs = audioRefs.current;
    return () => {
      Object.values(currentAudioRefs).forEach(audio => {
        if (audio) {
          audio.stop();
          audio.unload();
        }
      });
    };
  }, []);

  return (
    <div className="audio-manager">
      {children}
      
      {/* 🎛️ Global Audio Controls */}
      <div className="audio-controls-fixed">
        <button 
          className={`audio-control-btn ${isMuted ? 'muted' : 'unmuted'}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        {/* A/B Analysis Controls */}
        {isABMode && (
          <div className="ab-audio-controls">
            <button 
              className={`ab-audio-btn site-a ${siteAPlaying ? 'playing' : 'paused'}`}
              onClick={() => toggleSiteAudio('A')}
              title={`Site A Audio - ${siteALabel || 'Location A'}`}
            >
              📍 A
            </button>
            <button 
              className={`ab-audio-btn site-b ${siteBPlaying ? 'playing' : 'paused'}`}
              onClick={() => toggleSiteAudio('B')}
              title={`Site B Audio - ${siteBLabel || 'Location B'}`}
            >
              📍 B
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioManager;
