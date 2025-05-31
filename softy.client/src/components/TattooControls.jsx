import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import '../assets/styles/Tattoo.css';

const TattooControls = ({ previewUrl, setTattooTexture, setPreviewUrl, activeDecal, activeDecalData, updateDecal, clearDecal, saveScreenshot, setActiveDecalData }) => {
    const tattooInputRef = useRef(null);
    const moveXRef = useRef(null);
    const moveYRef = useRef(null);
    const rotateRef = useRef(null);
    const scaleRef = useRef(null);

    const loadImageAndRemoveBackground = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // 1. Найти самый светлый цвет (фон)
                let maxR = 0, maxG = 0, maxB = 0;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    if (r + g + b > maxR + maxG + maxB) {
                        maxR = r;
                        maxG = g;
                        maxB = b;
                    }
                }

                // 2. Удалить всё, что близко к этому цвету (фон)
                const tolerance = 30; // Чем больше — тем шире допуск, обычно 20-40
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    if (Math.abs(r - maxR) < tolerance &&
                        Math.abs(g - maxG) < tolerance &&
                        Math.abs(b - maxB) < tolerance) {
                        data[i + 3] = 0; // Сделать пиксель прозрачным
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                texture.flipY = true;
                resolve(texture);
            };
            img.src = URL.createObjectURL(file);
        });
    };


    const handleTattooInputChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const texture = await loadImageAndRemoveBackground(file);
            setTattooTexture(texture);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const modifyDecalPosition = (dx, dy) => {
        if (activeDecal && activeDecalData) {
            const { mesh, position } = activeDecalData;

            const localPosition = mesh.worldToLocal(position.clone());

            if (dx !== null) localPosition.x += dx;
            if (dy !== null) localPosition.y += dy;

            localPosition.x = Math.max(-1, Math.min(1, localPosition.x));  // Ограничиваем по X
            localPosition.y = Math.max(-1, Math.min(1, localPosition.y));  // Ограничиваем по Y
            activeDecal.position.set(localPosition.x, localPosition.y, localPosition.z);
            setActiveDecalData({ ...activeDecalData, position: localPosition });
        }
    };


    const modifyDecalRotation = (angleDeg) => {
        if (activeDecalData) updateDecal(angleDeg * (Math.PI / 180), activeDecalData.scale);
    };

    const modifyDecalScale = (scaleFactor) => {
        if (activeDecalData) updateDecal(activeDecalData.rotation, scaleFactor);
    };

    useEffect(() => {
        const moveX = moveXRef.current;
        const moveY = moveYRef.current;
        const rotate = rotateRef.current;
        const scale = scaleRef.current;

        const onMoveX = (e) => modifyDecalPosition(parseFloat(e.target.value), null);
        const onMoveY = (e) => modifyDecalPosition(null, parseFloat(e.target.value));
        const onRotate = (e) => modifyDecalRotation(parseFloat(e.target.value));
        const onScale = (e) => modifyDecalScale(parseFloat(e.target.value));

        moveX.addEventListener('input', onMoveX);
        moveY.addEventListener('input', onMoveY);
        rotate.addEventListener('input', onRotate);
        scale.addEventListener('input', onScale);

        return () => {
            moveX.removeEventListener('input', onMoveX);
            moveY.removeEventListener('input', onMoveY);
            rotate.removeEventListener('input', onRotate);
            scale.removeEventListener('input', onScale);
        };
    }, [activeDecal, activeDecalData]);

    return (
        <div className="sidebar">
            <h2>Управление</h2>
            <div className="image-preview">
                <input type="file" accept="image/*" hidden ref={tattooInputRef} onChange={handleTattooInputChange} />
                <div onClick={() => tattooInputRef.current.click()} style={{ cursor: 'pointer' }}>
                    {previewUrl ? <img src={previewUrl} alt="Татуировка" /> : <span>Выбрать изображение</span>}
                </div>
            </div>
            <label>Перемещение по X:</label>
            <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                ref={moveXRef}
                onChange={(e) => modifyDecalPosition(parseFloat(e.target.value), null)}
            />
            <label>Перемещение по Y:</label>
            <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                ref={moveYRef}
                onChange={(e) => modifyDecalPosition(null, parseFloat(e.target.value))}
            />
            <label>Поворот:</label>
            <input type="range" min="-180" max="180" step="1" ref={rotateRef} />
            <label>Масштаб:</label>
            <input type="range" min="0.5" max="2" step="0.01" defaultValue="1" ref={scaleRef} />
            <button class = "book-button" onClick={clearDecal}>Удалить</button>
            <button class="book-button" onClick={saveScreenshot}>Сохранить</button>
        </div>

    );
};

export default TattooControls;
