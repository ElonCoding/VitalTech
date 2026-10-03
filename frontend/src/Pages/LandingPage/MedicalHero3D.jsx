import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './MedicalHero3D.css';

export default function MedicalHero3D() {
    const mountRef = useRef(null);
    const [webGLSupported, setWebGLSupported] = useState(true);
    const [activeScan, setActiveScan] = useState('Neural MRI');

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        // Check WebGL support
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

        const width = container.clientWidth || 480;
        const height = container.clientHeight || 520;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 24;

        const isMobile = window.innerWidth < 768;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.75));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00f0ff, 3, 50);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x10b981, 2.5, 50);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        const mainGroup = new THREE.Group();
        scene.add(mainGroup);

        // 1. Double Helix (DNA)
        const helixGroup = new THREE.Group();
        const helixPointsCount = 50;
        const helixRadius = 3.6;
        const helixHeight = 12;

        const strand1Geo = new THREE.BufferGeometry();
        const strand2Geo = new THREE.BufferGeometry();
        const strand1Positions = [];
        const strand2Positions = [];

        const sphereGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const matCyan = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            roughness: 0.2,
            metalness: 0.8
        });
        const matEmerald = new THREE.MeshStandardMaterial({
            color: 0x34d399,
            emissive: 0x059669,
            roughness: 0.2,
            metalness: 0.8
        });

        const rungsGroup = new THREE.Group();
        const rungCylGeo = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
        const rungMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.5 });

        for (let i = 0; i < helixPointsCount; i++) {
            const t = (i / helixPointsCount) * Math.PI * 4;
            const y = (i / helixPointsCount - 0.5) * helixHeight;

            const x1 = Math.cos(t) * helixRadius;
            const z1 = Math.sin(t) * helixRadius;
            strand1Positions.push(x1, y, z1);

            const s1 = new THREE.Mesh(sphereGeo, matCyan);
            s1.position.set(x1, y, z1);
            helixGroup.add(s1);

            const x2 = Math.cos(t + Math.PI) * helixRadius;
            const z2 = Math.sin(t + Math.PI) * helixRadius;
            strand2Positions.push(x2, y, z2);

            const s2 = new THREE.Mesh(sphereGeo, matEmerald);
            s2.position.set(x2, y, z2);
            helixGroup.add(s2);

            // Rungs every 2 steps
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

        // 2. Central Pulsing Bio-Core (Icosahedron)
        const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.85,
            emissive: 0x0891b2
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        mainGroup.add(coreMesh);

        // Inner glowing vital sphere
        const innerGeo = new THREE.SphereGeometry(1.3, 24, 24);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        const innerCore = new THREE.Mesh(innerGeo, innerMat);
        mainGroup.add(innerCore);

        // 3. Orbital Gyroscopic Tech Rings
        const ring1Geo = new THREE.TorusGeometry(5.4, 0.05, 12, 80);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
        const ring1 = new THREE.Mesh(ring1Geo, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        mainGroup.add(ring1);

        const ring2Geo = new THREE.TorusGeometry(6.6, 0.04, 12, 90);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
        const ring2 = new THREE.Mesh(ring2Geo, ringMat2);
        ring2.rotation.y = Math.PI / 4;
        ring2.rotation.x = -Math.PI / 6;
        mainGroup.add(ring2);

        // 4. Floating Data Particles
        const particleCount = 280;
        const particleGeo = new THREE.BufferGeometry();
        const pCoords = new Float32Array(particleCount * 3);
        const pColors = new Float32Array(particleCount * 3);
        const colorCyan = new THREE.Color(0x38bdf8);
        const colorGreen = new THREE.Color(0x34d399);

        for (let i = 0; i < particleCount; i++) {
            const rad = 5.5 + Math.random() * 6;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            pCoords[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
            pCoords[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
            pCoords[i * 3 + 2] = rad * Math.cos(phi);

            const c = Math.random() > 0.5 ? colorCyan : colorGreen;
            pColors[i * 3] = c.r;
            pColors[i * 3 + 1] = c.g;
            pColors[i * 3 + 2] = c.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(pCoords, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.22,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        mainGroup.add(particles);

        // Mouse Drag / Parallax Interaction
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
        };

        const onPointerMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            targetTiltX = y * 0.4;
            targetTiltY = x * 0.5;

            if (isDragging) {
                const deltaX = e.clientX - prevMouseX;
                const deltaY = e.clientY - prevMouseY;
                rotSpeedY = deltaX * 0.005;
                rotSpeedX = deltaY * 0.005;
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
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Constant elegant rotation
            helixGroup.rotation.y = elapsed * 0.35;
            mainGroup.rotation.y += 0.004 + rotSpeedY;
            mainGroup.rotation.x += rotSpeedX;

            // Inertia decay
            rotSpeedX *= 0.92;
            rotSpeedY *= 0.92;

            // Parallax tilt smoothing
            mainGroup.rotation.x += (targetTiltX - mainGroup.rotation.x * 0.5) * 0.03;
            mainGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.06;

            // Central core pulse (Heartbeat rhythm)
            const pulse = 1 + Math.sin(elapsed * 3.5) * 0.08 + (Math.sin(elapsed * 7) > 0.7 ? 0.05 : 0);
            coreMesh.scale.set(pulse, pulse, pulse);
            coreMesh.rotation.x = elapsed * 0.2;
            coreMesh.rotation.y = elapsed * 0.25;

            innerCore.scale.set(pulse * 0.9, pulse * 0.9, pulse * 0.9);

            // Orbit rings
            ring1.rotation.z = elapsed * 0.3;
            ring2.rotation.z = -elapsed * 0.25;

            // Wave particles
            particles.rotation.y = -elapsed * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // Responsive resize
        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth;
            const h = container.clientHeight || 520;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        // Cycle through diagnostic modes for interactive feedback
        const interval = setInterval(() => {
            const scans = ['Neural MRI (99.4%)', 'Lung CT Scan (98.9%)', 'Cardiac Vitals (Synced)', 'Dermal Biomarkers'];
            setActiveScan((prev) => {
                const nextIdx = (scans.indexOf(prev) + 1) % scans.length;
                return scans[nextIdx];
            });
        }, 3200);

        return () => {
            clearInterval(interval);
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

            {/* Futuristic Holographic UI Chips */}
            <div className="hologram-chip chip-top-right">
                <span className="chip-indicator pulse-green"></span>
                <span className="chip-label">AI Diagnostic Core</span>
                <span className="chip-badge">{activeScan}</span>
            </div>

            <div className="hologram-chip chip-bottom-left">
                <span className="chip-indicator pulse-cyan"></span>
                <span className="chip-text">
                    <strong>Holographic Bio-Twin</strong>
                    <small>Interactive 3D • Drag to Inspect</small>
                </span>
            </div>

            <div className="hologram-chip chip-bottom-right">
                <span className="chip-icon">⚡</span>
                <span className="chip-stat">60 FPS WebGL</span>
            </div>
        </div>
    );
}
