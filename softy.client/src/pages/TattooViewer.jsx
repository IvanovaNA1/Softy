import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import '../assets/styles/Tattoo.css';

const TattooViewer = () => {
    const [tattooTexture, setTattooTexture] = useState(null);
    const [activeDecal, setActiveDecal] = useState(null);
    const [activeDecalData, setActiveDecalData] = useState(null);
    const [decals, setDecals] = useState([]);
    const [modelPart, setModelPart] = useState('head');
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const canvasRef = useRef(null);
    const tattooInputRef = useRef(null);
    const moveXRef = useRef(null);
    const moveYRef = useRef(null);
    const rotateRef = useRef(null);
    const scaleRef = useRef(null);

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

    const loadModel = (part) => {
        if (model.current) {
            scene.current.remove(model.current);
        }
        clearDecal();

        loader.load(
            `/models/${part}.glb`,
            (gltf) => {
                model.current = gltf.scene;
                model.current.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshLambertMaterial({ color: 0xffdfc4 });
                    }
                });
                scene.current.add(model.current);
                setIsModelLoaded(true); // Модель загружена
            },
            undefined,
            (error) => {
                console.error('Ошибка при загрузке модели: ', error);
            }
        );
    };
    
    const applyTattoo = (url) => {
        textureLoader.load(url, (texture) => {
            console.log("Textura загружена", texture); 
            setTattooTexture(texture);
        });
    };

    const applyDecal = (mesh, position, normal) => {
        if (!tattooTexture) return;

        const rotation = 0; // начальный угол поворота
        const scale = 1;    // начальный масштаб
        const size = new THREE.Vector3(0.3, 0.3, 0.02);

        const decalMaterial = new THREE.MeshBasicMaterial({
            map: tattooTexture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            alphaTest: 0.5,
        });

        const orientation = new THREE.Euler();
        orientation.setFromVector3(normal.clone().normalize()); // ориентация по нормали
        orientation.z = rotation;

        const decalGeometry = new DecalGeometry(mesh, position, orientation, size.clone().multiplyScalar(scale));
        const decal = new THREE.Mesh(decalGeometry, decalMaterial);

        clearDecal(); 

        setActiveDecal(decal);
        setActiveDecalData({ mesh, position, normal, rotation, scale, material: decalMaterial });

        scene.current.add(decal);
    };

    const updateDecal = (newRotation, newScale) => {
        if (!activeDecalData) return;

        const { mesh, position, normal, material } = activeDecalData;

        const orientation = new THREE.Euler();
        orientation.setFromVector3(normal.clone().normalize());
        orientation.z = newRotation;

        const size = new THREE.Vector3(0.2, 0.2, 0.01).multiplyScalar(newScale);

        const newGeometry = new DecalGeometry(mesh, position, orientation, size);
        const newDecal = new THREE.Mesh(newGeometry, material);

        if (activeDecal) {
            scene.current.remove(activeDecal);
        }

        setDecals(prevDecals => [...prevDecals, { mesh, decal: newDecal }]);
        setActiveDecal(newDecal);
        setActiveDecalData({ ...activeDecalData, rotation: newRotation, scale: newScale });
        scene.current.add(newDecal);
    };

    const clearDecal = () => {
        // Удаляем активную татуировку из сцены
        if (activeDecal) {
            scene.current.remove(activeDecal);
        }
        setDecals([]); // Очищаем массив с татуировками
        setActiveDecal(null); // Очищаем активную татуировку
        setActiveDecalData(null); // Очищаем данные об активной татуировке
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
            console.log("Пересечение с моделью найдено", point, face, object);
            applyDecal(object, point, face.normal);
        } else {
            console.log("Пересечение не найдено.");
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

    const handleSaveScreenshotClick = () => {
        saveScreenshot();
    };

    const handleTattooInputChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            applyTattoo(url);
        }
    };

    const handleBodyPartChange = (event) => {
        setModelPart(event.target.value);
    };

    useEffect(() => {
        scene.current = new THREE.Scene();
        scene.current.background = new THREE.Color(0xffffff);

        camera.current = new THREE.PerspectiveCamera(75, 950 / 650, 0.1, 1000);
        camera.current.position.set(0, 0, 4);

        renderer.current = new THREE.WebGLRenderer({ antialias: true });
        renderer.current.setSize(950, 650);
        if (canvasRef.current.firstChild) {
            canvasRef.current.removeChild(canvasRef.current.firstChild);
        }

        canvasRef.current.appendChild(renderer.current.domElement);

        controls.current = new OrbitControls(camera.current, renderer.current.domElement);
        controls.current.enableDamping = true;

        light.current = new THREE.DirectionalLight(0xffdfc4, 2);
        light.current.shadowCameraVisible = true;
        light.current.position.set(0, 2.5, 3);
        scene.current.add(light.current);

        animate(); 

        loadModel(modelPart);

        window.addEventListener('click', onModelClick);

        return () => {
            window.removeEventListener('click', onModelClick);
        };
    }, [modelPart]);

    const animate = () => {
        requestAnimationFrame(animate);
        controls.current.update();

        if (light.current) {
            light.current.position.copy(camera.current.position); 
        }

        renderer.current.render(scene.current, camera.current);
    };

    useEffect(() => {
        const moveX = moveXRef.current;
        const moveY = moveYRef.current;
        const rotate = rotateRef.current;
        const scale = scaleRef.current;

        moveX.addEventListener('input', (e) => modifyDecalPosition(parseFloat(e.target.value), null));
        moveY.addEventListener('input', (e) => modifyDecalPosition(null, parseFloat(e.target.value)));
        rotate.addEventListener('input', (e) => modifyDecalRotation(parseFloat(e.target.value) * (Math.PI / 180)));
        scale.addEventListener('input', (e) => modifyDecalScale(parseFloat(e.target.value)));

        return () => {
            moveX.removeEventListener('input', () => { });
            moveY.removeEventListener('input', () => { });
            rotate.removeEventListener('input', () => { });
            scale.removeEventListener('input', () => { });
        };
    }, [activeDecal]);

    const modifyDecalPosition = (dx, dy) => {
        if (activeDecal) {
            if (dx !== null) activeDecal.position.x = dx;
            if (dy !== null) activeDecal.position.y = dy;
        }
    };

    const modifyDecalRotation = (angle) => {
        const radians = angle * (Math.PI / 180);
        if (activeDecalData) {
            updateDecal(radians, activeDecalData.scale);
        }
    };

    const modifyDecalScale = (scaleFactor) => {
        if (activeDecalData) {
            updateDecal(activeDecalData.rotation, scaleFactor);
        }
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2>Управление</h2>
                <div className="image-preview" style={{ marginBottom: '20px' }}>
                    <input
                        type="file"
                        id="tattooInput"
                        accept="image/*"
                        hidden
                        ref={tattooInputRef}
                        onChange={handleTattooInputChange}
                    />
                    <div
                        id="imageContainer"
                        onClick={() => tattooInputRef.current.click()}
                        style={{ cursor: 'pointer' }}
                    >
                        {tattooTexture && (
                            <img
                                id="previewImage"
                                src={tattooTexture.image.currentSrc}
                                alt="Татуировка"
                                style={{ display: 'block' }}
                            />
                        )}
                        <span id="placeholderText">Выбрать изображение</span>
                    </div>
                </div>
                <label htmlFor="moveX">Перемещение по X:</label>
                <input type="range" id="moveX" min="-1" max="1" step="0.01" ref={moveXRef} />
                <label htmlFor="moveY">Перемещение по Y:</label>
                <input type="range" id="moveY" min="-1" max="1" step="0.01" ref={moveYRef} />
                <label htmlFor="rotate">Поворот:</label>
                <input type="range" id="rotate" min="-180" max="180" step="1" ref={rotateRef} />
                <label htmlFor="scale">Масштаб:</label>
                <input type="range" id="scale" min="0.5" max="2" step="0.01" defaultValue="1" ref={scaleRef} />
                <button id="deleteDecal" onClick={clearDecal}>Удалить</button>
                <button id="saveScreenshot" onClick={handleSaveScreenshotClick}>Сохранить</button>
            </div>

            <div className="main-content">
                <h1>Примерка Татуировок</h1>
                <div className="controls">
                    <label htmlFor="bodyPartSelect">Выберите часть тела:</label>
                    <select id="bodyPartSelect" value={modelPart} onChange={handleBodyPartChange}>
                        <option value="head">Голова</option>
                        <option value="l-leg">Левая нога</option>
                        <option value="r-leg">Правая нога</option>
                        <option value="model">Модель</option>
                    </select>
                </div>
                <div id="canvas-container" ref={canvasRef}></div>
            </div>
        </div>
    );
};

export default TattooViewer;
