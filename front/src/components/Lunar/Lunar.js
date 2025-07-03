import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './Lunar.css';
import { createViperRover, createEnhancedLunarSurface, createViperPath, createStars } from './scene.js';
import { MissionHeader, MissionControls, MissionStatus } from './UI.js';

// This utility uses a raycaster to find the exact point on the moon's
// bumpy surface, so the rover sits perfectly on the ground.
const getSurfacePosition = (angle, moon) => {
    if (!moon || !moon.geometry) return new THREE.Vector3();
    const moonRadius = 2.5;
    const basePosition = new THREE.Vector3(Math.cos(angle) * moonRadius, 0, Math.sin(angle) * moonRadius);
    const raycaster = new THREE.Raycaster(basePosition.clone().setY(5), new THREE.Vector3(0, -1, 0));
    const intersects = raycaster.intersectObject(moon);
    return intersects.length > 0 ? intersects[0].point : basePosition;
};

// A manual OrbitControls implementation to avoid external dependencies.
const createOrbitControls = (camera, domElement) => {
    const controls = {
        object: camera, domElement: domElement, enabled: true, target: new THREE.Vector3(),
        minDistance: 3, maxDistance: 15, minPolarAngle: 0, maxPolarAngle: Math.PI,
        enableDamping: true, dampingFactor: 0.05, enableZoom: true, zoomSpeed: 1.0,
        enableRotate: true, rotateSpeed: 1.0, enablePan: true,
        spherical: new THREE.Spherical(), sphericalDelta: new THREE.Spherical(), scale: 1,
        panOffset: new THREE.Vector3(), zoomChanged: false,
        rotateStart: new THREE.Vector2(), rotateEnd: new THREE.Vector2(), rotateDelta: new THREE.Vector2(),
        onMouseDown: function(event) { if (!this.enabled) return; event.preventDefault(); this.rotateStart.set(event.clientX, event.clientY); this.domElement.addEventListener('mousemove', this.onMouseMove); this.domElement.addEventListener('mouseup', this.onMouseUp); },
        onMouseMove: function(event) { if (!this.enabled) return; event.preventDefault(); this.rotateEnd.set(event.clientX, event.clientY); this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed); this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight); this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight); this.rotateStart.copy(this.rotateEnd); this.update(); },
        onMouseUp: function() { this.domElement.removeEventListener('mousemove', this.onMouseMove); this.domElement.removeEventListener('mouseup', this.onMouseUp); },
        onMouseWheel: function(event) { if (!this.enabled || !this.enableZoom) return; event.preventDefault(); event.deltaY < 0 ? this.dollyIn(0.95) : this.dollyOut(0.95); this.update(); },
        rotateLeft: function(angle) { this.sphericalDelta.theta -= angle; },
        rotateUp: function(angle) { this.sphericalDelta.phi -= angle; },
        dollyIn: function(dollyScale) { this.scale /= dollyScale; },
        dollyOut: function(dollyScale) { this.scale *= dollyScale; },
        update: function() { const offset = new THREE.Vector3(); const quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0)); const quatInverse = quat.clone().invert(); const position = this.object.position; offset.copy(position).sub(this.target); offset.applyQuaternion(quat); this.spherical.setFromVector3(offset); if (this.enableDamping) { this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor; this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor; } else { this.spherical.theta += this.sphericalDelta.theta; this.spherical.phi += this.sphericalDelta.phi; } this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi)); this.spherical.makeSafe(); this.spherical.radius *= this.scale; this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius)); offset.setFromSpherical(this.spherical); offset.applyQuaternion(quatInverse); position.copy(this.target).add(offset); this.object.lookAt(this.target); if (this.enableDamping) { this.sphericalDelta.theta *= (1 - this.dampingFactor); this.sphericalDelta.phi *= (1 - this.dampingFactor); } else { this.sphericalDelta.set(0, 0, 0); } this.scale = 1; return true; },
        dispose: function() { this.domElement.removeEventListener('mousedown', this.onMouseDown); this.domElement.removeEventListener('wheel', this.onMouseWheel); }
    };
    controls.onMouseDown = controls.onMouseDown.bind(controls); controls.onMouseMove = controls.onMouseMove.bind(controls); controls.onMouseUp = controls.onMouseUp.bind(controls); controls.onMouseWheel = controls.onMouseWheel.bind(controls);
    domElement.addEventListener('mousedown', controls.onMouseDown); domElement.addEventListener('wheel', controls.onMouseWheel);
    controls.update(); return controls;
};

const Lunar = () => {
    const mountRef = useRef(null);
    const animationFrameId = useRef(null);
    const clockRef = useRef(new THREE.Clock());

    // State for mission simulation data and UI controls
    const [missionData, setMissionData] = useState({
        position: { lat: 0, lon: 0 }, terrain: 'Polar Region', progress: 0,
        speed: 0.02, battery: 100, temperature: -180, isMoving: false, samples: 0
    });
    const [cameraMode, setCameraMode] = useState('orbit');
    const [showPath, setShowPath] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Main setup effect for the Three.js scene
    useEffect(() => {
        const currentMount = mountRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        const camera = new THREE.PerspectiveCamera(60, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(5, 3, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        // Enable realistic shadows and color grading for better visuals
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.5;
        currentMount.appendChild(renderer.domElement);
        
        const controls = createOrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);

        // Lighting setup
        scene.add(new THREE.AmbientLight(0x404040, 0.4)); // Global ambient light
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0); // Main "sun" light that casts shadows
        sunLight.position.set(8, 8, 4);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096; // High-res shadows
        sunLight.shadow.mapSize.height = 4096;
        scene.add(sunLight);
        
        const earthLight = new THREE.DirectionalLight(0x4a90e2, 0.3); // Blue "earthshine" fill light
        earthLight.position.set(-5, 5, -5);
        scene.add(earthLight);

        const rimLight = new THREE.DirectionalLight(0x8888ff, 0.5); // Rim light to help subjects pop
        rimLight.position.set(-8, 2, -8);
        scene.add(rimLight);

        // Create and add scene objects
        const lunarSurface = createEnhancedLunarSurface();
        const viper = createViperRover();
        const path = createViperPath();
        const stars = createStars();
        scene.add(lunarSurface, viper, path, stars);
        viper.castShadow = true;
        
        // Set initial rover position on the surface
        if (path.userData.points?.length > 0) {
            const surfacePos = getSurfacePosition(0, lunarSurface);
            viper.position.copy(surfacePos).add(new THREE.Vector3(0, 0.05, 0));
        }

        let pathProgress = 0;
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);
            const deltaTime = clockRef.current.getDelta();
            if (controls.enabled) controls.update();
            
            // Animate rover along the path when playing
            if (isPlaying) {
                const pathPoints = path.userData.points;
                const pathLength = pathPoints.length;
                pathProgress += missionData.speed * deltaTime * 60;

                if (pathProgress < pathLength - 1) {
                    const angle = (pathProgress / (pathLength - 1)) * Math.PI * 2;
                    const surfacePos = getSurfacePosition(angle, lunarSurface);
                    viper.position.copy(surfacePos).add(new THREE.Vector3(0, 0.05, 0));
                    
                    // This logic aligns the rover to the terrain. It calculates the 'up' vector from the
                    // surface normal and the 'forward' vector from the path direction, then builds an
                    // orientation matrix to make the rover sit flush on the bumpy ground.
                    const currentIndex = Math.floor(pathProgress);
                    const nextPoint = pathPoints[Math.min(currentIndex + 1, pathLength - 1)];
                    const direction = new THREE.Vector3().subVectors(nextPoint, pathPoints[currentIndex]).normalize();
                    const surfaceNormal = viper.position.clone().normalize();
                    const right = new THREE.Vector3().crossVectors(direction, surfaceNormal).normalize();
                    const forward = new THREE.Vector3().crossVectors(surfaceNormal, right).normalize();
                    
                    viper.matrix.makeBasis(right, surfaceNormal, forward);
                    viper.matrix.setPosition(viper.position);
                    viper.matrixAutoUpdate = false; // Disable auto-updates since im setting the matrix directly

                    viper.userData.wheels.forEach(wheel => { wheel.rotation.x += missionData.speed * deltaTime * 15; });
                    
                    // Update mission data state for the UI
                    const progress = Math.min((pathProgress / pathLength) * 100, 100);
                    const spherical = new THREE.Spherical().setFromVector3(viper.position);
                    setMissionData(prev => ({
                        ...prev, progress: Math.round(progress), 
                        position: { lat: 90 - THREE.MathUtils.radToDeg(spherical.phi), lon: THREE.MathUtils.radToDeg(spherical.theta) },
                        battery: Math.max(0, 100 - (progress * 0.08)),
                        samples: Math.floor(progress / 10)
                    }));
                } else {
                    setIsPlaying(false); // Stop when the end of the path is reached
                }
            }

            // Handle camera modes
            if (cameraMode === 'follow') {
                const offset = new THREE.Vector3(0, 0.3, -0.5);
                viper.getWorldPosition(offset).add(offset);
                camera.position.lerp(offset, 0.1); // Smoothly interpolate camera position
                camera.lookAt(viper.position);
                controls.enabled = false;
            } else if (cameraMode === 'first-person') {
                const offset = new THREE.Vector3(0, 0.1, 0.1);
                const lookAtOffset = new THREE.Vector3(0, 0, 1);
                viper.localToWorld(offset);
                viper.localToWorld(lookAtOffset);
                camera.position.copy(offset);
                camera.lookAt(lookAtOffset);
                controls.enabled = false;
            } else { // 'orbit' mode
                controls.enabled = true;
                controls.target.set(0, 0, 0);
            }
            
            path.visible = showPath;
            renderer.render(scene, camera);
        };

        // Handle window resizing
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);
        animate();

        // Cleanup function runs on component unmount to prevent memory leaks
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId.current);
            controls.dispose();
            if (currentMount && renderer.domElement) {
                 currentMount.removeChild(renderer.domElement);
            }
            // A full cleanup would also dispose of geometries, materials, etc.
        };
    }, [isPlaying, missionData.speed, cameraMode, showPath]);

    return (
        <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
            <div ref={mountRef} className="w-full h-full" />
            <MissionHeader />
            <MissionControls
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                speed={missionData.speed}
                onSpeedChange={(e) => setMissionData(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                cameraMode={cameraMode}
                onCameraChange={(e) => setCameraMode(e.target.value)}
                showPath={showPath}
                onTogglePath={() => setShowPath(!showPath)}
            />
            <MissionStatus missionData={missionData} />
        </div>
    );
};

export default Lunar;