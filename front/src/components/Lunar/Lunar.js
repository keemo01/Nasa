import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Lunar.css'; // Import its own CSS

const LunarSurface3D = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.maxPolarAngle = Math.PI / 2;
        controlsRef.current = controls;

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5).normalize();
        scene.add(directionalLight);

        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 30 + 10;
            const color = `rgba(${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 100}, ${Math.floor(Math.random() * 50) + 100}, 0.8)`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.needsUpdate = true;

        const material = new THREE.MeshPhongMaterial({ map: texture });
        const moon = new THREE.Mesh(geometry, material);
        scene.add(moon);

        const southPoleRingGeometry = new THREE.TorusGeometry(1.9, 0.02, 16, 100);
        const southPoleRingMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.7 });
        const southPoleRing = new THREE.Mesh(southPoleRingGeometry, southPoleRingMaterial);
        southPoleRing.rotation.x = Math.PI / 2;
        southPoleRing.position.y = -2 * Math.sin(Math.PI / 180 * 85);
        scene.add(southPoleRing);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            if (currentMount && camera && renderer) {
                camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer) {
                currentMount.removeChild(renderer.domElement);
            }
            if (renderer) {
                renderer.dispose();
            }
            if (scene) {
                scene.traverse((object) => {
                    if (object.isMesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(material => material.dispose());
                            } else {
                                material.map?.dispose();
                                object.material.dispose();
                            }
                        }
                    }
                });
            }
            if (controls) {
                controls.dispose();
            }
        };
    }, []);

    return (
        <div className="lunar-surface-3d-wrapper">
            <h2 className="lunar-surface-title">Moon Surface & VIPER Path</h2>
            {/* VIPER's current position/path overlay */}
            <div className="viper-overlay">
                <p><span>Simulated VIPER Position:</span> Lat: -85.0°, Lon: 10.0°</p>
                <p><span>Current Terrain:</span> Shadowed Crater Rim</p>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{width: '60%'}}></div>
                </div>
                <p className="progress-text">60% Mission Progress</p>
            </div>
            <div ref={mountRef} className="lunar-canvas-container" />
        </div>
    );
};

export default LunarSurface3D;