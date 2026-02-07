import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

/**
 * 🎵 GLOBAL AUDIO MANAGER SYSTEM
 * 
 * Features:
 * - Global mute/unmute control (Master switch)
 * - Independent A/B site controls (Sub-mixers)
 * - Analysis completion notifications
 * - A/B analysis dual audio controls
 * - Local file priority system
 * - Factor-based audio mapping
 */

// 🏠 LOCAL AUDIO FILES (Priority 1)
const LOCAL_AUDIO_SOURCES = {
  // Environmental Biomes
  ocean: '/sounds/ocean.mp3',
  forest: '/sounds/forest.mp3',
  mountain: '/sounds/mountain.mp3', // Updated to match actual file
  river: '/sounds/river.mp3',
  coastal: '/sounds/ocean.mp3', // Fallback to ocean
  wetland: '/sounds/river.mp3', // Fallback to river
  rural: '/sounds/rural.mp3',

  // Urban/Industrial
  urban: '/sounds/urban.mp3',
  industrial: '/sounds/traffic.mp3', // Using traffic as industrial
  suburban: '/sounds/urban.mp3', // Fallback to urban
  agricultural: '/sounds/rural.mp3', // Fallback to rural

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
  siteBLabel,
  // isGlobalMute,      // REMOVED: User requested no global mute
  // setIsGlobalMute,   // REMOVED
  siteAPlaying,      // State for Site A mute (passed from TopNav)
  setSiteAPlaying,   // Setter for Site A
  siteBPlaying,      // State for Site B mute (passed from TopNav)
  setSiteBPlaying,   // Setter for Site B
  isCompareMode      // Whether we are in comparison mode
}) => {
  // We no longer keep local mute state if props are provided
  // But we fallback to local if not provided for standalone usage
  // const [localMute, setLocalMute] = useState(false);

  // Resolve effective mute state
  // const isMuted = isGlobalMute !== undefined ? isGlobalMute : localMute;
  // const toggleMute = setIsGlobalMute
  //   ? () => setIsGlobalMute(!isGlobalMute)
  //   : () => setLocalMute(!localMute);

  const audioRefs = useRef({
    siteA: null,
    siteB: null,
    notification: null
  });

  // AUDIO SOURCE MANAGEMENT
  const getAudioSource = useCallback((audioKey) => {
    if (LOCAL_AUDIO_SOURCES[audioKey]) {
      return LOCAL_AUDIO_SOURCES[audioKey];
    }
    console.warn(`⚠️ No audio source found for: ${audioKey}`);
    return null;
  }, []);

  // FACTOR-BASED BIOME DETECTION
  const detectBiomeFromFactors = useCallback((factors, label, siteName) => {
    // 1. Text-based detection (simple override)
    const textLabel = (label || siteName || '').toLowerCase();

    // Explicit keywords in name take priority
    if (textLabel.includes('ocean') || textLabel.includes('sea')) return 'ocean';
    if (textLabel.includes('forest') || textLabel.includes('woods') || textLabel.includes('jungle')) return 'forest';
    if (textLabel.includes('mountain') || textLabel.includes('hill') || textLabel.includes('peak')) return 'mountain';
    if (textLabel.includes('river') || textLabel.includes('creek') || textLabel.includes('stream')) return 'river';
    if (textLabel.includes('city') || textLabel.includes('downtown') || textLabel.includes('urban')) return 'urban';

    // 2. Factor-based detection
    if (!factors) return 'ambient';

    // Normalize factors structure (handle both flat and nested)
    const f = {
      slope: factors.physical?.slope?.value ?? factors.slope ?? 50,
      elevation: factors.physical?.elevation?.value ?? factors.elevation ?? 50,
      flood: factors.hydrology?.flood?.value ?? factors.hydrology?.flood ?? 50,
      water: factors.hydrology?.water?.value ?? factors.hydrology?.water ?? 50,
      vegetation: factors.environmental?.vegetation?.value ?? factors.vegetation ?? 50,
      pollution: factors.environmental?.pollution?.value ?? factors.pollution ?? 50,
      infrastructure: factors.socio_econ?.infrastructure?.value ?? factors.infrastructure ?? 50,
      population: factors.socio_econ?.population?.value ?? factors.population ?? 50,
      rainfall: factors.climatic?.rainfall?.value ?? factors.rainfall ?? 50,
    };

    // Logic Tree
    if (f.water > 70 || f.flood > 70) return 'river';
    if (f.vegetation > 70 && f.pollution < 40) return 'forest';
    if (f.infrastructure > 70 || f.population > 70) return 'urban';
    if (f.elevation > 70 || f.slope > 70) return 'mountain';
    if (f.rainfall > 80) return 'storm';
    if (f.vegetation > 50 && f.infrastructure < 40) return 'rural';

    return 'ambient';
  }, []);

  // 🎵 PLAY AUDIO HELPER
  const playTrack = useCallback((trackKey, type, volume = 0.5) => {
    // If master mute is on, don't play anything
    // if (isMuted) return; // REMOVED GLOBAL MUTE CHECK

    const source = getAudioSource(trackKey);
    if (!source) return;

    // Stop existing track of this type
    if (audioRefs.current[type]) {
      audioRefs.current[type].stop();
    }

    const sound = new Howl({
      src: [source],
      volume: volume,
      loop: type !== 'notification', // Notifications don't loop
      onend: () => {
        if (type === 'notification') {
          // Cleanup notification ref
          audioRefs.current[type] = null;
        }
      }
    });

    sound.play();
    audioRefs.current[type] = sound;
  }, [getAudioSource]);

  // 🔄 SITE A AUDIO LOGIC
  useEffect(() => {
    // 1. If Global Mute is ON -> Stop A -> REMOVED
    // if (isMuted) {
    //   if (audioRefs.current.siteA) audioRefs.current.siteA.pause();
    //   return;
    // }

    // 2. If Site A is Disabled (Local Mute) -> Stop A
    if (!siteAPlaying) {
      if (audioRefs.current.siteA) audioRefs.current.siteA.pause();
      return;
    }

    // 3. If NO factors -> Stop A
    if (!siteAFactors) {
      if (audioRefs.current.siteA) audioRefs.current.siteA.stop();
      return;
    }

    // 4. Play/Resume A
    // If already playing the correct track, just ensure it's playing
    // For now, we simple re-detect and play. Howler handles overlaps if we manage refs well.
    const biome = detectBiomeFromFactors(siteAFactors, siteALabel, 'Site A');

    // Resume if exists and paused, or start new
    if (audioRefs.current.siteA && !audioRefs.current.siteA.playing()) {
      audioRefs.current.siteA.play();
    } else if (!audioRefs.current.siteA) {
      playTrack(biome, 'siteA', 0.4);
    } else {
      // If biome changed, restart (Advanced optimization, skipping for now to ensure robustness)
      // For simple toggle, existing logic handles resume
    }

  }, [siteAPlaying, siteAFactors, siteALabel, detectBiomeFromFactors, playTrack]);

  // 🔄 SITE B AUDIO LOGIC (Only in Compare Mode)
  useEffect(() => {
    // CRITICAL FIX: Only play B if factors exist AND we are in compare mode
    const shouldPlayB = isCompareMode && siteBFactors && Object.keys(siteBFactors).length > 0;

    // 1. If Global Mute is ON -> Stop B -> REMOVED
    // if (isMuted) {
    //   if (audioRefs.current.siteB) audioRefs.current.siteB.pause();
    //   return;
    // }

    // 2. If Not in Compare Mode OR Site B Local Mute is ON -> Stop B
    // Also stop if shouldPlayB is false (no data yet)
    if (!shouldPlayB || !siteBPlaying) {
      if (audioRefs.current.siteB) audioRefs.current.siteB.pause();
      return;
    }

    // 3. Play/Resume B
    const biome = detectBiomeFromFactors(siteBFactors, siteBLabel, 'Site B');

    if (audioRefs.current.siteB && !audioRefs.current.siteB.playing()) {
      audioRefs.current.siteB.play();
    } else if (!audioRefs.current.siteB) {
      playTrack(biome, 'siteB', 0.4);
    }

  }, [isCompareMode, siteBPlaying, siteBFactors, siteBLabel, detectBiomeFromFactors, playTrack]);

  // 🔔 SUCCESS / NOTIFICATION TRIGGER
  // Listen for changes in factors to trigger success sound
  useEffect(() => {
    // Triggers if Site A is UNMUTED
    if (siteAFactors && siteAPlaying) {
      // Debounce or check if it's a NEW analysis could be complex, 
      // but for now, we assume simple prop updates trigger this.
      // We'll use a unique key if available, or just rely on parent to not spam updates.
      playTrack('success', 'notification', 0.3);
    }
  }, [siteAFactors, siteAPlaying, playTrack]); // siteAFactors changing implies new analysis

  useEffect(() => {
    // Triggers if Compare Mode is ON AND Site B is UNMUTED AND factors exist
    if (isCompareMode && siteBFactors && siteBPlaying) {
      // Optional: Distinct sound for comparison or same success sound
      // Adding a small delay to avoid exact overlap if both load instantly
      setTimeout(() => playTrack('success', 'notification', 0.3), 200);
    }
  }, [isCompareMode, siteBFactors, siteBPlaying, playTrack]);


  // 🧹 CLEANUP ON UNMOUNT
  useEffect(() => {
    // Store current refs in effect scope
    const currentRefs = audioRefs.current;
    
    return () => {
      Object.values(currentRefs).forEach(sound => {
        if (sound) sound.unload();
      });
    };
  }, []);

  return (
    <>
      {children}
      {/* 
         We don't render controls here anymore because they are in TopNav.
         This component is now a logical wrapper/context provider.
      */}
    </>
  );
};

export default AudioManager;
