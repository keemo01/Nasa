import * as THREE from 'three';

// Assembling our little rover model from basic shapes.
export const createViperRover = () => {
    const roverGroup = new THREE.Group();

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.5 });
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.2, roughness: 0.8, emissive: 0x111133 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.1, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 1.0, roughness: 0.3 });
    const suspensionMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.6 });

    // Main Body (Warm Electronics Box)
    const bodyGeom = new THREE.BoxGeometry(0.25, 0.15, 0.2);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.1;
    roverGroup.add(body);

    // Solar Panel Deck
    const deckGeom = new THREE.BoxGeometry(0.4, 0.02, 0.3);
    const deck = new THREE.Mesh(deckGeom, panelMat);
    deck.position.y = 0.18;
    roverGroup.add(deck);

    // Mast Assembly
    const mastBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.1, 8), bodyMat);
    mastBase.position.set(0, 0.23, 0.1);
    roverGroup.add(mastBase);
    const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), bodyMat);
    mastPole.position.set(0, 0.38, 0.1);
    roverGroup.add(mastPole);
    const mastHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), bodyMat);
    mastHead.position.set(0, 0.5, 0.1);
    roverGroup.add(mastHead);

    // Rocker-Bogie Suspension
    const wheels = [];
    const createSuspension = (side) => {
        const sideGroup = new THREE.Group();
        const rockerGeom = new THREE.BoxGeometry(0.02, 0.02, 0.25);
        const rocker = new THREE.Mesh(rockerGeom, suspensionMat);
        rocker.position.set(side * 0.13, 0.1, 0);
        sideGroup.add(rocker);
        const bogieGeom = new THREE.BoxGeometry(0.02, 0.02, 0.15);
        const bogie = new THREE.Mesh(bogieGeom, suspensionMat);
        bogie.position.set(0, -0.05, 0.05);
        rocker.add(bogie);
        const wheelGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
        const rearWheel = new THREE.Mesh(wheelGeom, wheelMat);
        rearWheel.position.set(0, 0, -0.125);
        rearWheel.rotation.x = Math.PI / 2;
        rocker.add(rearWheel);
        wheels.push(rearWheel);
        const frontWheel = new THREE.Mesh(wheelGeom, wheelMat);
        frontWheel.position.set(0, 0, 0.075);
        frontWheel.rotation.x = Math.PI / 2;
        bogie.add(frontWheel);
        wheels.push(frontWheel);
        const middleWheel = new THREE.Mesh(wheelGeom, wheelMat);
        middleWheel.position.set(0, 0, -0.075);
        middleWheel.rotation.x = Math.PI / 2;
        bogie.add(middleWheel);
        wheels.push(middleWheel);
        return sideGroup;
    };
    const leftSuspension = createSuspension(-1);
    const rightSuspension = createSuspension(1);
    roverGroup.add(leftSuspension, rightSuspension);

    // Robotic Arm
    const armBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), bodyMat);
    armBase.position.set(0, 0.1, 0.11);
    roverGroup.add(armBase);
    const armSegment1 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.1), suspensionMat);
    armSegment1.position.set(0, 0.05, 0.05);
    armBase.add(armSegment1);
    const armSegment2 = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.1), suspensionMat);
    armSegment2.position.set(0, 0, 0.1);
    armSegment1.add(armSegment2);
    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.03, 8), goldMat);
    drill.position.set(0, 0, 0.06);
    armSegment2.add(drill);

    roverGroup.scale.set(0.6, 0.6, 0.6);
    roverGroup.userData = { wheels, drill };
    return roverGroup;
};

// Generates a procedural lunar surface
export const createEnhancedLunarSurface = () => {
    const geometry = new THREE.SphereGeometry(2.5, 256, 256);
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
        const distance = vertex.length();
        const noise1 = (Math.sin(vertex.x * 3) + Math.cos(vertex.z * 2)) * 0.03;
        const noise2 = (Math.sin(vertex.x * 8) + Math.cos(vertex.z * 6)) * 0.015;
        const craterNoise = Math.sin(vertex.x * 15) * Math.cos(vertex.z * 15) * 0.008;
        const totalNoise = noise1 + noise2 + craterNoise;
        vertex.normalize().multiplyScalar(distance + totalNoise);
        vertices[i] = vertex.x;
        vertices[i + 1] = vertex.y;
        vertices[i + 2] = vertex.z;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#C8C8C8');
    gradient.addColorStop(0.3, '#B0B0B0');
    gradient.addColorStop(0.7, '#989898');
    gradient.addColorStop(1, '#808080');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 120 + 40;
        const craterGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        craterGradient.addColorStop(0, 'rgba(30, 30, 30, 0.9)');
        craterGradient.addColorStop(0.2, 'rgba(50, 50, 50, 0.7)');
        craterGradient.addColorStop(0.5, 'rgba(70, 70, 70, 0.5)');
        craterGradient.addColorStop(0.8, 'rgba(90, 90, 90, 0.3)');
        craterGradient.addColorStop(1, 'rgba(110, 110, 110, 0)');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = craterGradient;
        ctx.fill();
    }
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 8 + 1;
        const brightness = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${100 + Math.random() * 60}, ${100 + Math.random() * 60}, ${100 + Math.random() * 60}, ${brightness})`;
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 2,
        bumpMap: texture,
        bumpScale: 0.05,
        specular: 0x111111
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
};

// Creates the line showing the rover's path
export const createViperPath = () => {
    const pathPoints = [];
    const totalPoints = 400;
    for (let i = 0; i <= totalPoints; i++) {
        const t = i / totalPoints;
        const angle = t * Math.PI * 2;
        pathPoints.push(new THREE.Vector3(Math.cos(angle) * 2.6, 0.05, Math.sin(angle) * 2.6));
    }
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.userData = { points: pathPoints };
    return pathLine;
};

// Creates the starfield background
export const createStars = () => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    const starsColors = [];
    for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;
        starsVertices.push(x, y, z);
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 0.3, Math.random() * 0.5 + 0.5);
        starsColors.push(color.r, color.g, color.b);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
    const starsMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    return stars;
};