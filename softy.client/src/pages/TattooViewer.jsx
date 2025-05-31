import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import TattooControls from "../components/TattooControls";
import '../assets/styles/Tattoo.css';

const TattooViewer = () => {
    const [tattooTexture, setTattooTexture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeDecal, setActiveDecal] = useState(null);
    const [activeDecalData, setActiveDecalData] = useState(null);
    const [decals, setDecals] = useState([]);
    const [modelPart, setModelPart] = useState('head3');
    const [gender, setGender] = useState('women'); 

    const canvasRef = useRef(null);
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const controls = useRef(null);
    const model = useRef(null);
    const light = useRef(null);

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());

    const loadModel = (part, selectedGender = gender) => {
        const modelPath = `/models/${selectedGender}-${part}.glb`;

        if (model.current) scene.current.remove(model.current);
        clearDecal();

        loader.load(modelPath, (gltf) => {
            model.current = gltf.scene;
            model.current.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshLambertMaterial({ color: 0xffdfc4 });
                }
            });
            scene.current.add(model.current);
        }, undefined, (error) => {
            console.error(`Ошибка при загрузке модели ${modelPath}: `, error);
            alert(`Модель "${modelPath}" не найдена.`);
        });
    };

    const applyDecal = (mesh, position, normal) => {
        if (!tattooTexture) return;

        const rotation = 0;  // Поворот татуировки, можно настроить
        let scale = 0.5;     // Масштаб татуировки

        // Вычисление пропорций татуировки
        const aspectRatio = tattooTexture.image.width / tattooTexture.image.height;
        let size = new THREE.Vector3(1, 1, 1).multiplyScalar(scale);

        // Подгонка размера татуировки с учётом её пропорций
        if (aspectRatio > 1) {
            size.x = size.y * aspectRatio;
        } else {
            size.y = size.x / aspectRatio;
        }

        // Проверим, не слишком ли большая татуировка для модели
        const modelSize = mesh.geometry.boundingBox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
        const maxAllowedScale = maxDimension * 0.4;  // Максимальный размер татуировки (например, 40% от размера модели)

        if (size.x > maxAllowedScale) {
            size.x = maxAllowedScale;
            size.y = size.x / aspectRatio;
        }

        const decalMaterial = new THREE.MeshBasicMaterial({
            map: tattooTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            alphaTest: 0,
        });

        const orientation = new THREE.Euler();
        orientation.setFromVector3(normal.clone().normalize());
        orientation.z = rotation;

        const decalGeometry = new DecalGeometry(mesh, position, orientation, size.clone().multiplyScalar(scale));
        const decal = new THREE.Mesh(decalGeometry, decalMaterial);

        scene.current.add(decal);

        setDecals(prev => [...prev, { mesh, decal }]);
        setActiveDecal(decal);
        setActiveDecalData({ mesh, position, normal, rotation, scale, material: decalMaterial });
    };


    const updateDecal = (newRotation, newScale) => {
        if (!activeDecalData) return;
        const { mesh, position, normal, material } = activeDecalData;

        // Обновляем ориентацию с учётом нормали
        const orientation = new THREE.Euler();
        orientation.setFromVector3(normal.clone().normalize());
        orientation.z = newRotation;

        // Размеры татуировки с учётом масштаба
        const size = new THREE.Vector3(1, 1, 1).multiplyScalar(newScale);
        const newGeometry = new DecalGeometry(mesh, position, orientation, size);
        const newDecal = new THREE.Mesh(newGeometry, material);

        // Удаляем старую татуировку и добавляем новую
        if (activeDecal) scene.current.remove(activeDecal);

        setActiveDecal(newDecal);
        setActiveDecalData({ ...activeDecalData, rotation: newRotation, scale: newScale });
        scene.current.add(newDecal);
        console.log('Текущее положение татуировки:', activeDecal.position);
        if (activeDecal.position.x > 1000 || activeDecal.position.y > 1000) {
            console.warn("Татуировка вышла за пределы сцены!");
        }
    };


    const clearDecal = () => {
        if (activeDecal) scene.current.remove(activeDecal);
        decals.forEach(({ decal }) => scene.current.remove(decal));
        setActiveDecal(null);
        setActiveDecalData(null);
        setDecals([]);
    };

    const onModelClick = (event) => {
        if (!model.current || !tattooTexture) return;

        const rect = canvasRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, camera.current);
        const intersects = raycaster.current.intersectObject(model.current, true);

        if (intersects.length > 0) {
            const { point, face, object } = intersects[0];

            // Применяем татуировку на основе точки пересечения
            applyDecal(object, point, face.normal);
        }
    };

    const saveScreenshot = () => {
        renderer.current.render(scene.current, camera.current);
        renderer.current.domElement.toBlob((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'tattoo_preview.png';
            link.click();
        });
    };

    useEffect(() => {
        scene.current = new THREE.Scene();
        scene.current.background = new THREE.Color(0xffffff);

        camera.current = new THREE.PerspectiveCamera(75, 950 / 650, 0.1, 1000);
        camera.current.position.set(0, 0, 4);

        renderer.current = new THREE.WebGLRenderer({ antialias: true });
        renderer.current.setSize(950, 650);

        if (canvasRef.current.firstChild) canvasRef.current.removeChild(canvasRef.current.firstChild);
        canvasRef.current.appendChild(renderer.current.domElement);

        controls.current = new OrbitControls(camera.current, renderer.current.domElement);
        controls.current.enableDamping = true;

        controls.current.minDistance = 1.6;
        controls.current.maxDistance = 5;

        light.current = new THREE.DirectionalLight(0xffdfc4, 2);
        light.current.position.set(0, 2.5, 3);
        scene.current.add(light.current);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.current.update();
            if (light.current) light.current.position.copy(camera.current.position);
            renderer.current.render(scene.current, camera.current);
        };
        animate();

        // Загружаем модель с учётом текущего пола
        loadModel(modelPart, gender);

        window.addEventListener('click', onModelClick);
        return () => window.removeEventListener('click', onModelClick);
    }, [modelPart, gender]); // Теперь зависи от gender

    return (
        <div className="container">
            <TattooControls
                previewUrl={previewUrl}
                setTattooTexture={setTattooTexture}
                setPreviewUrl={setPreviewUrl}
                activeDecal={activeDecal}
                activeDecalData={activeDecalData}
                updateDecal={updateDecal}
                clearDecal={clearDecal}
                saveScreenshot={saveScreenshot}
                setActiveDecalData={setActiveDecalData} 
            />
            <div className="main-content">
                <h1>Виртуальная примерка</h1>
                <div className="controls">
                    <label htmlFor="bodyPartSelect">Выберите часть тела:</label>
                    <select id="bodyPartSelect" value={modelPart} onChange={(e) => setModelPart(e.target.value)}>
                        <option value="head3">Голова</option>
                        <option value="l-leg">Левая нога</option>
                        <option value="r-leg">Правая нога</option>
                        <option value="model">Модель</option>
                    </select>
                    <label htmlFor="genderSelect">Пол:</label>
                    <select id="genderSelect" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="men">Мужской</option>
                        <option value="women">Женский</option>
                    </select>
                </div>
                <div id="canvas-container" ref={canvasRef}></div>
            </div>
        </div>
    );
};

export default TattooViewer;

