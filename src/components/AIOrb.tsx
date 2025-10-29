import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AIOrbProps {
  mood?: 'neutral' | 'excited' | 'thinking' | 'happy';
  intensity?: number;
}

export const AIOrb = ({ mood = 'neutral', intensity = 1 }: AIOrbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00C2D1, 2, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Create orb
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00C2D1,
      emissive: 0x00C2D1,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;
    scene.add(sphere);

    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(1.05, 16, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00C2D1,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (sphere) {
        sphere.rotation.x += 0.005;
        sphere.rotation.y += 0.005;
      }
      
      if (wireframe) {
        wireframe.rotation.x -= 0.003;
        wireframe.rotation.y -= 0.003;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update orb based on mood and intensity
  useEffect(() => {
    if (!sphereRef.current) return;

    const material = sphereRef.current.material as THREE.MeshPhongMaterial;
    
    const moodColors = {
      neutral: 0x00C2D1,
      excited: 0xFF7A59,
      thinking: 0x9D4EDD,
      happy: 0x06FFA5,
    };

    const targetColor = moodColors[mood];
    material.color.setHex(targetColor);
    material.emissive.setHex(targetColor);
    material.emissiveIntensity = 0.3 + (intensity * 0.5);
  }, [mood, intensity]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-[300px] h-[300px] flex items-center justify-center"
      style={{
        filter: `drop-shadow(0 0 ${20 * intensity}px rgba(0, 194, 209, ${0.3 * intensity}))`,
      }}
    />
  );
};
