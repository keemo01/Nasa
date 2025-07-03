import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Lunar.css';

const Lunar = () => {
    // I'm using refs to persist Three.js objects across renders.
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);
    const animationFrameId = useRef(null);
    const resizeAnimationFrameId = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) {
            console.error("Mount reference is null in Lunar component.");
            return;
        }

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        // I'm setting the initial camera position for a zoomed-out view.
        camera.position.set(0, 0, 6);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // I'm setting up OrbitControls for camera interaction.
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 2.5;
        controls.maxDistance = 8; // I'm allowing more zoom out.
        controls.maxPolarAngle = Math.PI / 2;
        controlsRef.current = controls;

        // I'm adding various lights to the scene.
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        directionalLight.castShadow = false;
        scene.add(directionalLight);

        const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
        rimLight.position.set(-5, 2, -5);
        scene.add(rimLight);

        // I'm creating the moon geometry and a dynamic canvas texture for craters.
        const geometry = new THREE.SphereGeometry(1.8, 64, 64);

        const moonCanvas = document.createElement('canvas');
        moonCanvas.width = 1024;
        moonCanvas.height = 512;
        const ctx = moonCanvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, moonCanvas.width, moonCanvas.height);
        gradient.addColorStop(0, '#C0C0C0');
        gradient.addColorStop(0.5, '#A9A9A9');
        gradient.addColorStop(1, '#888888');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, moonCanvas.width, moonCanvas.height);

        // I'm drawing craters on the moon texture.
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * moonCanvas.width;
            const y = Math.random() * moonCanvas.height;
            const radius = Math.random() * 25 + 5;
            const darkness = Math.random() * 0.4 + 0.3;

            const craterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            craterGradient.addColorStop(0, `rgba(60, 60, 60, ${darkness})`);
            craterGradient.addColorStop(0.7, `rgba(80, 80, 80, ${darkness * 0.7})`);
            craterGradient.addColorStop(1, `rgba(100, 100, 100, 0)`);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = craterGradient;
            ctx.fill();
        }

        // I'm drawing small bright spots (rocks/highlights) on the moon.
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * moonCanvas.width;
            const y = Math.random() * moonCanvas.height;
            const radius = Math.random() * 3 + 1;
            const brightness = Math.random() * 0.3 + 0.1;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 150, 150, ${brightness})`;
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(moonCanvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 5,
            transparent: false
        });
        const moon = new THREE.Mesh(geometry, material);
        scene.add(moon);

        // I'm adding a red ring to represent the South Pole.
        const southPoleRingGeometry = new THREE.TorusGeometry(1.7, 0.03, 16, 100);
        const southPoleRingMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        const southPoleRing = new THREE.Mesh(southPoleRingGeometry, southPoleRingMaterial);
        southPoleRing.rotation.x = Math.PI / 2;
        southPoleRing.position.y = -1.8 * Math.sin(Math.PI / 180 * 85);
        scene.add(southPoleRing);

        // I'm defining the animation loop.
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);

            controls.update();

            moon.rotation.y += 0.002; // I'm rotating the moon.

            // I'm making the South Pole ring pulse.
            southPoleRing.material.opacity = 0.6 + 0.2 * Math.sin(Date.now() * 0.003);

            renderer.render(scene, camera);
        };

        // I'm handling responsive resizing of the renderer.
        const resizeRendererToDisplaySize = () => {
            if (resizeAnimationFrameId.current) {
                cancelAnimationFrame(resizeAnimationFrameId.current);
            }
            resizeAnimationFrameId.current = requestAnimationFrame(() => {
                if (!renderer || !camera || !currentMount) return;

                const width = currentMount.clientWidth;
                const height = currentMount.clientHeight;

                if (width === 0 || height === 0) {
                    resizeAnimationFrameId.current = null;
                    return;
                }

                const canvas = renderer.domElement;
                const needResize = canvas.width !== width || canvas.height !== height;

                if (needResize) {
                    renderer.setSize(width, height, false);
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                }
                resizeAnimationFrameId.current = null;
            });
        };

        // I'm using ResizeObserver to detect container size changes.
        const resizeObserver = new ResizeObserver(() => {
            resizeRendererToDisplaySize();
        });

        resizeObserver.observe(currentMount);
        resizeRendererToDisplaySize();
        animate(); // I'm starting the animation.

        // I'm defining the cleanup function for when the component unmounts.
        return () => {
            resizeObserver.disconnect();

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (resizeAnimationFrameId.current) {
                cancelAnimationFrame(resizeAnimationFrameId.current);
            }

            if (controls) {
                controls.dispose();
            }

            if (currentMount && renderer && currentMount.contains(renderer.domElement)) {
                currentMount.removeChild(renderer.domElement);
            }

            if (renderer) {
                renderer.dispose();
            }

            // I'm disposing of all Three.js objects to prevent memory leaks.
            if (scene) {
                scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(mat => {
                                    if (mat.map) mat.map.dispose();
                                    mat.dispose();
                                });
                            } else {
                                if (object.material.map) object.material.map.dispose();
                                object.material.dispose();
                            }
                        }
                    }
                });
                scene.clear();
            }
        };
    }, []); 

    return (
        <div className="lunar-surface-3d-wrapper custom-scrollbar">
            <h2 className="lunar-surface-title">Moon Surface & VIPER Path</h2>
            <div ref={mountRef} className="lunar-canvas-container" />
            <div className="viper-overlay">
                <p className="viper-position">
                    <span>Simulated VIPER Position:</span> Lat: -85.0°, Lon: 10.0°
                </p>
                <p className="viper-terrain">
                    <span>Current Terrain:</span> Shadowed Crater Rim
                </p>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{width: '60%'}}></div>
                </div>
                <p className="progress-text">60% Mission Progress</p>
            </div>
        </div>
    );
};

export default Lunar;