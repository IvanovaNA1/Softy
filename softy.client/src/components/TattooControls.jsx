import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import '../assets/styles/Tattoo.css';

const TattooControls = ({
    previewUrl,
    setTattooTexture,
    setPreviewUrl,
    activeDecal,
    activeDecalData,
    updateDecal,
    clearDecal,
    saveScreenshot,
    tattooTexture,
    currentModel // Добавим пропс с идентификатором выбранной 3D модели (название, id или что угодно)
}) => {
    const tattooInputRef = useRef(null);

    // Добавим состояния для контролов
    const [moveX, setMoveX] = useState(0);
    const [moveY, setMoveY] = useState(0);
    const [rotate, setRotate] = useState(0);
    const [scale, setScale] = useState(0.5);

    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);

    // Когда меняется текущая модель, сбрасываем значения ползунков
    useEffect(() => {
        setMoveX(0);
        setMoveY(0);
        setRotate(0);
        setScale(0.5);

        setLastX(0);
        setLastY(0);
    }, [currentModel]);

    // Загрузка изображения с удалением фона (оставим как есть)
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

                const tolerance = 30;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    if (Math.abs(r - maxR) < tolerance &&
                        Math.abs(g - maxG) < tolerance &&
                        Math.abs(b - maxB) < tolerance) {
                        data[i + 3] = 0;
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
            setPreviewUrl(URL.createObjectURL(file));
            setLastX(0);
            setLastY(0);
        }
    };

    const modifyDecalPosition = (newX, newY) => {
        if (!activeDecalData || !tattooTexture) return;

        const { position, normal } = activeDecalData;

        const tangent = new THREE.Vector3();
        const bitangent = new THREE.Vector3();

        if (Math.abs(normal.y) < 0.99) {
            tangent.crossVectors(normal, new THREE.Vector3(0, 1, 0)).normalize();
        } else {
            tangent.crossVectors(normal, new THREE.Vector3(1, 0, 0)).normalize();
        }
        bitangent.crossVectors(normal, tangent).normalize();

        const offset = new THREE.Vector3();

        if (newX !== null) {
            const deltaX = newX - lastX;
            setLastX(newX);
            offset.addScaledVector(tangent, deltaX);
        }

        if (newY !== null) {
            const deltaY = newY - lastY;
            setLastY(newY);
            offset.addScaledVector(bitangent, deltaY);
        }

        const newPosition = position.clone().add(offset);
        updateDecal(activeDecalData.rotation, activeDecalData.scale, newPosition);
    };

    const modifyDecalRotation = (angleDeg) => {
        if (activeDecalData) updateDecal(angleDeg * (Math.PI / 180), activeDecalData.scale);
    };

    const modifyDecalScale = (scaleFactor) => {
        if (activeDecalData) updateDecal(activeDecalData.rotation, scaleFactor);
    };

    useEffect(() => {
        modifyDecalPosition(moveX, moveY);
    }, [moveX, moveY]);

    useEffect(() => {
        modifyDecalRotation(rotate);
    }, [rotate]);

    useEffect(() => {
        modifyDecalScale(scale);
    }, [scale]);

    return (
        <div className="sidebar">
            <h2>Управление</h2>
            <div className="image-preview">
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={tattooInputRef}
                    onChange={handleTattooInputChange}
                />
                <div onClick={() => tattooInputRef.current.click()} style={{ cursor: 'pointer' }}>
                    {previewUrl ? <img src={previewUrl} alt="Татуировка" /> : <span>Выбрать изображение</span>}
                </div>
            </div>
            <label>Перемещение по X:</label>
            <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.005"
                value={moveX}
                onChange={e => setMoveX(parseFloat(e.target.value))}
            />
            <label>Перемещение по Y:</label>
            <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.005"
                value={moveY}
                onChange={e => setMoveY(parseFloat(e.target.value))}
            />
            <label>Поворот:</label>
            <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotate}
                onChange={e => setRotate(parseFloat(e.target.value))}
            />
            <label>Масштаб:</label>
            <input
                type="range"
                min="0.2"
                max="1.2"
                step="0.01"
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
            />
            <button className="book-button" onClick={clearDecal}>Удалить</button>
            <button className="book-button" onClick={saveScreenshot}>Сохранить</button>
        </div>
    );
};

export default TattooControls;

