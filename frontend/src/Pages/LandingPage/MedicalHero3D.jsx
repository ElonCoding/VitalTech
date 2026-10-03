import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './MedicalHero3D.css';

// Preset color themes for different AI scan modes
const SCAN_MODES = {
    neural: {
        id: 'neural',
        name: 'Neural MRI',
        label: '🧠 Neural Scan',
        color1: 0x00f0ff,
        color2: 0x38bdf8,
        glow: 'rgba(0, 240, 255, 0.4)',
        accuracy: '99.4%',
        target: 'Cerebral Cortex',
        status: 'Deep Inferences Online'
    },
    pulmonary: {
        id: 'pulmonary',
        name: 'Pulmonary CT',
        label: '🫁 Pulmonary CT',
        color1: 0x10b981,
        color2: 0x34d399,
        glow: 'rgba(16, 185, 129, 0.4)',
        accuracy: '99.1%',
        target: 'Bronchial Nodules',
        status: 'Zero Infiltrates Detected'
    },
    cardiac: {
        id: 'cardiac',
        name: 'Cardiac Vitals',
        label: '🫀 Heart Vitals',
        color1: 0xf43f5e,
        color2: 0xfb7185,
        glow: 'rgba(244, 63, 94, 0.4)',
        accuracy: '99.7%',
        target: 'Myocardial Rhythm',
        status: 'Sinus Rhythm Normal'
    },
    dermal: {
        id: 'dermal',
        name: 'Dermal AI',
        label: '🔬 Dermal AI',
        color1: 0xa855f7,
        color2: 0xc084fc,
        glow: 'rgba(168, 85, 247, 0.4)',
        accuracy: '98.9%',
        target: 'Melanocyte Layer',
        status: 'Cellular Analysis Complete'
    }
};

export default function MedicalHero3D() {
    const mountRef = useRef(null);
    const [currentMode, setCurrentMode] = useState('neural');
    const [webGLSupported, setWebGLSupported] = useState(true);
    const [bpm, setBpm] = useState(74);
    const [scanProgress, setScanProgress] = useState(99.4);

    const activeConfigRef = useRef(SCAN_MODES.neural);
    const targetColorsRef = useRef({
        c1: new THREE.Color(SCAN_MODES.neural.color1),
        c2: new THREE.Color(SCAN_MODES.neural.color2)
    });
    const triggerShockwaveRef = useRef(null);

    // Heartbeat simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setBpm(Math.floor(72 + Math.random() * 5));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Mode switch handler
    const handleModeChange = (modeKey) => {
        setCurrentMode(modeKey);
        const mode = SCAN_MODES[modeKey];
        activeConfigRef.current = mode;
        targetColorsRef.current.c1.setHex(mode.color1);
        targetColorsRef.current.c2.setHex(mode.color2);
        setScanProgress(parseFloat(mode.accuracy));
        if (triggerShockwaveRef.current) {
            triggerShockwaveRef.current();
        }
    };

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // WebGL Detection
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                setWebGLSupported(false);
                return;
            }
        } catch {
            setWebGLSupported(false);
            return;
        }

        const width = container.clientWidth || 540;
        const height = container.clientHeight || 560;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 24);

        const isMobile = window.innerWidth < 768;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.75));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;

        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const light1 = new THREE.PointLight(0x00f0ff, 4, 60);
        light1.position.set(12, 12, 12);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x10b981, 3.5, 60);
        light2.position.set(-12, -12, 12);
        scene.add(light2);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. Holographic DNA Double Helix
        const helixGroup = new THREE.Group();
        const helixSteps = 56;
        const helixRadius = 3.8;
        const helixHeight = 13;

        const sphereGeo = new THREE.SphereGeometry(0.19, 14, 14);
        const mat1 = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x0088cc,
            roughness: 0.15,
            metalness: 0.85
        });
        const mat2 = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            roughness: 0.15,
            metalness: 0.85
        });

        const rungCylGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);
        const rungMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.55 });
        const rungsGroup = new THREE.Group();

        for (let i = 0; i < helixSteps; i++) {
            const t = (i / helixSteps) * Math.PI * 4;
            const y = (i / helixSteps - 0.5) * helixHeight;

            const x1 = Math.cos(t) * helixRadius;
            const z1 = Math.sin(t) * helixRadius;
            const s1 = new THREE.Mesh(sphereGeo, mat1);
            s1.position.set(x1, y, z1);
            helixGroup.add(s1);

            const x2 = Math.cos(t + Math.PI) * helixRadius;
            const z2 = Math.sin(t + Math.PI) * helixRadius;
            const s2 = new THREE.Mesh(sphereGeo, mat2);
            s2.position.set(x2, y, z2);
            helixGroup.add(s2);

            if (i % 2 === 0) {
                const rung = new THREE.Mesh(rungCylGeo, rungMat);
                const p1 = new THREE.Vector3(x1, y, z1);
                const p2 = new THREE.Vector3(x2, y, z2);
                rung.position.copy(p1).add(p2).multiplyScalar(0.5);
                rung.scale.set(1, p1.distanceTo(p2), 1);
                rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
                rungsGroup.add(rung);
            }
        }
        helixGroup.add(rungsGroup);
        mainGroup.add(helixGroup);

        // 2. Quantum Holographic Core (Wireframe Geo-Sphere)
        const coreGeo = new THREE.IcosahedronGeometry(2.3, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
            emissive: 0x00b4d8
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        mainGroup.add(coreMesh);

        // Inner glowing vital heart
        const innerGeo = new THREE.SphereGeometry(1.35, 24, 24);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const innerCore = new THREE.Mesh(innerGeo, innerMat);
        mainGroup.add(innerCore);

        // 3. CRAZY FEATURE: Dynamic Scanning Laser Ring (MRI Laser Plane)
        const laserRingGeo = new THREE.TorusGeometry(4.6, 0.07, 12, 80);
        const laserRingMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.95
        });
        const laserRing = new THREE.Mesh(laserRingGeo, laserRingMat);
        laserRing.rotation.x = Math.PI / 2;
        mainGroup.add(laserRing);

        // Translucent holographic scanner disc
        const scanDiscGeo = new THREE.CircleGeometry(4.5, 48);
        const scanDiscMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        });
        const scanDisc = new THREE.Mesh(scanDiscGeo, scanDiscMat);
        scanDisc.rotation.x = Math.PI / 2;
        mainGroup.add(scanDisc);

        // 4. Gyro Orbit Rings
        const ring1Geo = new THREE.TorusGeometry(5.8, 0.04, 12, 90);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
        const ring1 = new THREE.Mesh(ring1Geo, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        mainGroup.add(ring1);

        const ring2Geo = new THREE.TorusGeometry(7.0, 0.035, 12, 100);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
        const ring2 = new THREE.Mesh(ring2Geo, ringMat2);
        ring2.rotation.y = Math.PI / 4;
        ring2.rotation.x = -Math.PI / 6;
        mainGroup.add(ring2);

        // 5. Bio-Photon Constellation (320 floating data particles)
        const particleCount = 320;
        const particleGeo = new THREE.BufferGeometry();
        const pCoords = new Float32Array(particleCount * 3);
        const pColors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const rad = 5.2 + Math.random() * 6.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            pCoords[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            pCoords[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
            pCoords[i * 3 + 2] = rad * Math.cos(phi);

            pColors[i * 3] = 0.2;
            pColors[i * 3 + 1] = 0.8;
            pColors[i * 3 + 2] = 1.0;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.24,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        mainGroup.add(particles);

        // 6. CRAZY FEATURE: Shockwave Ring on Click / Mode Change
        const shockwaveGeo = new THREE.RingGeometry(0.1, 0.4, 48);
        const shockwaveMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
        mainGroup.add(shockwave);

        let shockwaveActive = false;
        let shockwaveScale = 1;

        triggerShockwaveRef.current = () => {
            shockwaveActive = true;
            shockwaveScale = 0.5;
            shockwaveMat.opacity = 1;
        };

        // Interactive Mouse Drag & Parallax
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;
        let rotSpeedX = 0;
        let rotSpeedY = 0;
        let targetTiltX = 0;
        let targetTiltY = 0;

        const onPointerDown = (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            triggerShockwaveRef.current();
        };

        const onPointerMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            targetTiltX = y * 0.45;
            targetTiltY = x * 0.55;

            if (isDragging) {
                const deltaX = e.clientX - prevMouseX;
                const deltaY = e.clientY - prevMouseY;
                rotSpeedY = deltaX * 0.006;
                rotSpeedX = deltaY * 0.006;
                prevMouseX = e.clientX;
                prevMouseY = e.clientY;
            }
        };

        const onPointerUp = () => {
            isDragging = false;
        };

        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        // Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Smooth color lerp to active mode color
            const c1 = targetColorsRef.current.c1;
            const c2 = targetColorsRef.current.c2;

            mat1.color.lerp(c1, 0.05);
            mat1.emissive.lerp(c1, 0.05);
            mat2.color.lerp(c2, 0.05);
            mat2.emissive.lerp(c2, 0.05);
            coreMat.color.lerp(c1, 0.05);
            coreMat.emissive.lerp(c1, 0.05);
            laserRingMat.color.lerp(c1, 0.05);
            scanDiscMat.color.lerp(c1, 0.05);
            shockwaveMat.color.lerp(c1, 0.05);
            light1.color.lerp(c1, 0.05);
            light2.color.lerp(c2, 0.05);

            // Rotations
            helixGroup.rotation.y = elapsed * 0.4;
            mainGroup.rotation.y += 0.005 + rotSpeedY;
            mainGroup.rotation.x += rotSpeedX;

            rotSpeedX *= 0.92;
            rotSpeedY *= 0.92;

            // Parallax tilt
            mainGroup.rotation.x += (targetTiltX - mainGroup.rotation.x * 0.4) * 0.035;
            mainGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.07;

            // Heartbeat pulse rhythm
            const beat = Math.sin(elapsed * 3.8);
            const doubleBeat = Math.sin(elapsed * 7.6) > 0.6 ? 0.07 : 0;
            const pulse = 1 + beat * 0.07 + doubleBeat;
            coreMesh.scale.set(pulse, pulse, pulse);
            coreMesh.rotation.x = elapsed * 0.25;
            coreMesh.rotation.y = elapsed * 0.3;
            innerCore.scale.set(pulse * 0.92, pulse * 0.92, pulse * 0.92);

            // Laser scanner up-and-down slicing motion
            const scanY = Math.sin(elapsed * 1.8) * 5.8;
            laserRing.position.y = scanY;
            scanDisc.position.y = scanY;
            laserRing.rotation.z = elapsed * 1.2;

            // Gyro rings
            ring1.rotation.z = elapsed * 0.35;
            ring2.rotation.z = -elapsed * 0.28;

            // Particle wave drift
            particles.rotation.y = -elapsed * 0.06;

            // Shockwave expansion
            if (shockwaveActive) {
                shockwaveScale += 0.4;
                shockwave.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
                shockwaveMat.opacity = Math.max(0, 1 - shockwaveScale / 12);
                if (shockwaveScale > 12) {
                    shockwaveActive = false;
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // Responsive Resize
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight || 560;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    const activeModeData = SCAN_MODES[currentMode];

    return (
        <div className="medical-3d-wrapper">
            {/* Interactive 3D Canvas */}
            <div className="medical-3d-canvas-container" ref={mountRef}>
                {!webGLSupported && (
                    <div className="medical-3d-fallback">
                        <div className="fallback-pulse-ring"></div>
                        <div className="fallback-dna-icon">🧬</div>
                        <p>VitalCheck 3D Neural Engine Active</p>
                    </div>
                )}
            </div>

            {/* Futuristic Holographic Reticle Crosshairs */}
            <div className="hologram-reticle">
                <div className="reticle-corner corner-tl"></div>
                <div className="reticle-corner corner-tr"></div>
                <div className="reticle-corner corner-bl"></div>
                <div className="reticle-corner corner-br"></div>
            </div>

            {/* Top-Right HUD Badge */}
            <div className="hologram-chip chip-top-right">
                <span className="chip-indicator pulse-cyan"></span>
                <span className="chip-label">Target: {activeModeData.target}</span>
                <span className="chip-badge">{scanProgress}% Accurate</span>
            </div>

            {/* Bottom-Left Real-time Vital Telemetry */}
            <div className="hologram-chip chip-bottom-left">
                <div className="ecg-mini-monitor">
                    <svg className="ecg-trace" viewBox="0 0 100 24">
                        <path d="M0,12 L20,12 L25,4 L30,20 L35,8 L40,16 L45,12 L100,12" fill="none" stroke="#00f0ff" strokeWidth="2" />
                    </svg>
                    <span className="bpm-badge">{bpm} BPM</span>
                </div>
                <div className="chip-text">
                    <strong>Holographic Bio-Scanner</strong>
                    <small>Laser Slicing • Click / Drag to Morph</small>
                </div>
            </div>

            {/* Bottom Interactive Mode Switcher Bar */}
            <div className="hologram-mode-bar">
                {Object.keys(SCAN_MODES).map((key) => {
                    const mode = SCAN_MODES[key];
                    const isActive = currentMode === key;
                    return (
                        <button
                            key={key}
                            className={`mode-btn ${isActive ? 'active' : ''}`}
                            onClick={() => handleModeChange(key)}
                            type="button"
                        >
                            {mode.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
