import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 잠수함 컴포넌트 - 기본 도형들의 조합
function Submarine({ position, rotation, wireframe, showVectors, showNuclear, reactorPower }) {
  const groupRef = useRef();
  
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.set(
        rotation.pitch,
        rotation.yaw,
        rotation.roll
      );
    }
  }, [position, rotation]);

  const materialProps = {
    color: '#2a5a7a',
    wireframe: wireframe,
    metalness: 0.8,
    roughness: 0.2
  };

  const reactorMaterial = {
    color: wireframe ? '#ff6600' : '#ff6600',
    wireframe: wireframe,
    metalness: 0.9,
    roughness: 0.1,
    emissive: '#ff3300',
    emissiveIntensity: reactorPower / 100
  };

  const shieldMaterial = {
    color: '#555555',
    wireframe: wireframe,
    metalness: 0.7,
    roughness: 0.3,
    transparent: !wireframe,
    opacity: wireframe ? 1 : 0.6
  };

  return (
    <group ref={groupRef}>
      {/* 주선체 - 원기둥 (Z축 방향으로 눕힘) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 8, 16]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* 앞부분 - 원뿔 (Z축 방향) */}
      <mesh position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1, 2, 16]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* 뒷부분 - 원뿔 (Z축 방향, 반대 방향) */}
      <mesh position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.8, 1.5, 16]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* 함교탑 - 박스 */}
      <mesh position={[0, 1.3, 1]}>
        <boxGeometry args={[1.2, 0.8, 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* 수평타 - 양쪽 */}
      <mesh position={[2, 0, -4]}>
        <boxGeometry args={[0.1, 2.5, 1]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[-2, 0, -4]}>
        <boxGeometry args={[0.1, 2.5, 1]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      {/* 수직타 */}
      <mesh position={[0, 1.2, -4.5]}>
        <boxGeometry args={[0.1, 1.5, 1]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* ========== 핵추진 시스템 ========== */}
      {showNuclear && (
        <group>
          {/* 원자로실 차폐벽 - 두꺼운 원기둥 */}
          <mesh position={[0, 0, -1.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.85, 0.85, 2.5, 16]} />
            <meshStandardMaterial {...shieldMaterial} />
          </mesh>

          {/* 원자로 노심 - 구체 (중심) */}
          <mesh position={[0, 0, -1.5]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial {...reactorMaterial} />
          </mesh>

          {/* 제어봉 - 작은 원기둥들 (방사형 배치) */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * 0.35;
            const y = Math.sin(angle) * 0.35;
            return (
              <mesh key={i} position={[x, y, -1.5]} rotation={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
                <meshStandardMaterial color="#333333" wireframe={wireframe} />
              </mesh>
            );
          })}

          {/* 1차 냉각 루프 - 토러스 (원자로 주변) */}
          <mesh position={[0, 0, -1.5]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.65, 0.08, 8, 16]} />
            <meshStandardMaterial color="#4a90e2" wireframe={wireframe} metalness={0.8} />
          </mesh>

          {/* 증기 발생기 - 원기둥 (좌우 2개) */}
          <mesh position={[0.5, 0, -2.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 1.2, 12]} />
            <meshStandardMaterial color="#888888" wireframe={wireframe} metalness={0.7} />
          </mesh>
          <mesh position={[-0.5, 0, -2.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 1.2, 12]} />
            <meshStandardMaterial color="#888888" wireframe={wireframe} metalness={0.7} />
          </mesh>

          {/* 터빈 - 원기둥 (뒤쪽) */}
          <mesh position={[0, 0, -3.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.3, 1.5, 16]} />
            <meshStandardMaterial color="#666666" wireframe={wireframe} metalness={0.9} />
          </mesh>

          {/* 터빈 블레이드 표시 - 박스들 */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * Math.PI) / 2;
            const x = Math.cos(angle) * 0.35;
            const y = Math.sin(angle) * 0.35;
            return (
              <mesh key={`blade-${i}`} position={[x, y, -3.5]} rotation={[0, 0, angle]}>
                <boxGeometry args={[0.5, 0.05, 0.8]} />
                <meshStandardMaterial color="#555555" wireframe={wireframe} />
              </mesh>
            );
          })}

          {/* 추진축 - 긴 원기둥 */}
          <mesh position={[0, 0, -4.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 1.5, 12]} />
            <meshStandardMaterial color="#444444" wireframe={wireframe} metalness={0.8} />
          </mesh>

          {/* 2차 냉각 파이프 - 작은 토러스 (증기 발생기 주변) */}
          <mesh position={[0.5, 0, -2.8]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.04, 8, 12]} />
            <meshStandardMaterial color="#6ab7ff" wireframe={wireframe} />
          </mesh>
          <mesh position={[-0.5, 0, -2.8]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.04, 8, 12]} />
            <meshStandardMaterial color="#6ab7ff" wireframe={wireframe} />
          </mesh>

          {/* 냉각수 입출구 파이프 - 작은 원기둥들 */}
          <mesh position={[0.7, -0.5, -1.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
            <meshStandardMaterial color="#2196F3" wireframe={wireframe} />
          </mesh>
          <mesh position={[-0.7, -0.5, -1.5]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
            <meshStandardMaterial color="#2196F3" wireframe={wireframe} />
          </mesh>
        </group>
      )}
      
      {/* 벡터 표시 */}
      {showVectors && (
        <>
          {/* 전진 방향 벡터 (파란색) */}
          <arrowHelper args={[
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, 0),
            5,
            0x0000ff,
            1,
            0.5
          ]} />
          
          {/* 상승 방향 벡터 (초록색) */}
          <arrowHelper args={[
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 0),
            3,
            0x00ff00,
            0.7,
            0.4
          ]} />
          
          {/* 우현 방향 벡터 (빨간색) */}
          <arrowHelper args={[
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            3,
            0xff0000,
            0.7,
            0.4
          ]} />
        </>
      )}
    </group>
  );
}

// 좌표축 표시
function CoordinateAxes({ size = 20 }) {
  const points = {
    x: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(size, 0, 0)
    ],
    y: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, size, 0)
    ],
    z: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, size)
    ]
  };

  return (
    <>
      {/* X축 - 빨강 */}
      <Line points={points.x} color="red" lineWidth={2} />
      <Text position={[size + 1, 0, 0]} fontSize={1} color="red">
        X
      </Text>
      
      {/* Y축 - 초록 */}
      <Line points={points.y} color="green" lineWidth={2} />
      <Text position={[0, size + 1, 0]} fontSize={1} color="green">
        Y
      </Text>
      
      {/* Z축 - 파랑 */}
      <Line points={points.z} color="blue" lineWidth={2} />
      <Text position={[0, 0, size + 1]} fontSize={1} color="blue">
        Z
      </Text>
    </>
  );
}

// 그리드 평면
function GridPlane({ size = 50, divisions = 25, yPosition = -10 }) {
  return (
    <gridHelper args={[size, divisions, '#444444', '#222222']} position={[0, yPosition, 0]} />
  );
}

// 궤적 표시
function TrajectoryPath({ points }) {
  if (points.length < 2) return null;
  
  return (
    <Line
      points={points.map(p => new THREE.Vector3(...p))}
      color="yellow"
      lineWidth={2}
      dashed={false}
    />
  );
}

// 위치 마커
function PositionMarker({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="yellow" wireframe />
      </mesh>
      
      {/* 수직선 */}
      <Line
        points={[
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -position[1] - 10, 0)
        ]}
        color="yellow"
        lineWidth={1}
        dashed
      />
    </group>
  );
}

// 메인 씬
function Scene({ submarinePos, submarineRot, wireframe, showVectors, showGrid, showAxes, trajectory, showNuclear, reactorPower }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      {showAxes && <CoordinateAxes size={25} />}
      {showGrid && <GridPlane />}
      
      <Submarine 
        position={submarinePos} 
        rotation={submarineRot}
        wireframe={wireframe}
        showVectors={showVectors}
        showNuclear={showNuclear}
        reactorPower={reactorPower}
      />
      
      <PositionMarker position={submarinePos} />
      <TrajectoryPath points={trajectory} />
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </>
  );
}

export default function App() {
  const [position, setPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [velocity, setVelocity] = useState([0, 0, 0]);
  const [wireframe, setWireframe] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showNuclear, setShowNuclear] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [trajectory, setTrajectory] = useState([]);
  
  // 제어 입력
  const [thrust, setThrust] = useState(0);
  const [pitchControl, setPitchControl] = useState(0);
  const [yawControl, setYawControl] = useState(0);
  const [rollControl, setRollControl] = useState(0);
  
  // 핵추진 시스템
  const [reactorPower, setReactorPower] = useState(75);

  // 물리 시뮬레이션
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setPosition(prev => {
        const [x, y, z] = prev;
        const { pitch, yaw, roll } = rotation;
        
        // 회전 행렬 기반 이동
        const forwardX = Math.sin(yaw) * Math.cos(pitch) * thrust;
        const forwardY = Math.sin(pitch) * thrust;
        const forwardZ = Math.cos(yaw) * Math.cos(pitch) * thrust;
        
        const newPos = [
          x + forwardX * 0.1,
          y + forwardY * 0.1,
          z + forwardZ * 0.1
        ];
        
        // 궤적 추가 (일정 거리마다)
        const distance = Math.sqrt(
          Math.pow(newPos[0] - x, 2) +
          Math.pow(newPos[1] - y, 2) +
          Math.pow(newPos[2] - z, 2)
        );
        
        if (distance > 0.5) {
          setTrajectory(prev => [...prev.slice(-200), newPos]);
        }
        
        return newPos;
      });
      
      setRotation(prev => ({
        pitch: prev.pitch + pitchControl * 0.01,
        yaw: prev.yaw + yawControl * 0.01,
        roll: prev.roll + rollControl * 0.01
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, thrust, pitchControl, yawControl, rollControl, rotation]);

  const resetPosition = () => {
    setPosition([0, 0, 0]);
    setRotation({ pitch: 0, yaw: 0, roll: 0 });
    setVelocity([0, 0, 0]);
    setTrajectory([]);
    setThrust(0);
    setPitchControl(0);
    setYawControl(0);
    setRollControl(0);
    setReactorPower(75);
  };

  return (
    <div className="w-full h-full bg-gray-900 relative">
      <Canvas camera={{ position: [20, 15, 20], fov: 60 }}>
        <Scene
          submarinePos={position}
          submarineRot={rotation}
          wireframe={wireframe}
          showVectors={showVectors}
          showGrid={showGrid}
          showAxes={showAxes}
          trajectory={trajectory}
          showNuclear={showNuclear}
          reactorPower={reactorPower}
        />
      </Canvas>

      {/* UI 오버레이 */}
      <div className="absolute top-0 left-0 p-4 text-white bg-black/70 rounded-br-lg">
        <h1 className="text-2xl font-bold mb-2">핵추진 잠수함 시뮬레이터</h1>
        <p className="text-sm text-gray-300 mb-4">공간좌표 & 도형 시뮬레이션</p>
        
        {/* 좌표 정보 */}
        <div className="mb-4 font-mono text-sm">
          <div className="mb-2 font-semibold text-yellow-400">위치 좌표:</div>
          <div>X: {position[0].toFixed(2)}</div>
          <div>Y: {position[1].toFixed(2)}</div>
          <div>Z: {position[2].toFixed(2)}</div>
          
          <div className="mt-2 mb-2 font-semibold text-cyan-400">회전각 (rad):</div>
          <div>Pitch: {rotation.pitch.toFixed(3)}</div>
          <div>Yaw: {rotation.yaw.toFixed(3)}</div>
          <div>Roll: {rotation.roll.toFixed(3)}</div>
          
          <div className="mt-2 mb-2 font-semibold text-green-400">회전각 (도):</div>
          <div>Pitch: {(rotation.pitch * 180 / Math.PI).toFixed(1)}°</div>
          <div>Yaw: {(rotation.yaw * 180 / Math.PI).toFixed(1)}°</div>
          <div>Roll: {(rotation.roll * 180 / Math.PI).toFixed(1)}°</div>
          
          <div className="mt-3 mb-2 font-semibold text-orange-400">⚛️ 원자로 상태:</div>
          <div>출력: {reactorPower.toFixed(0)}%</div>
          <div className={`${reactorPower > 90 ? 'text-red-400' : reactorPower > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            상태: {reactorPower > 90 ? '최대출력' : reactorPower > 50 ? '정상운전' : '저출력'}
          </div>
          <div>온도: {(250 + reactorPower * 3).toFixed(0)}°C</div>
        </div>

        {/* 시각화 옵션 */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`w-full px-3 py-1 rounded ${wireframe ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            {wireframe ? '솔리드 모드' : '와이어프레임'}
          </button>
          
          <button
            onClick={() => setShowNuclear(!showNuclear)}
            className={`w-full px-3 py-1 rounded ${showNuclear ? 'bg-orange-600' : 'bg-gray-600'}`}
          >
            ⚛️ 핵추진 시스템: {showNuclear ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`w-full px-3 py-1 rounded ${showVectors ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            방향 벡터: {showVectors ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`w-full px-3 py-1 rounded ${showGrid ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            그리드: {showGrid ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={() => setShowAxes(!showAxes)}
            className={`w-full px-3 py-1 rounded ${showAxes ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            좌표축: {showAxes ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 제어 패널 */}
      <div className="absolute top-0 right-0 p-4 text-white bg-black/70 rounded-bl-lg w-80">
        <h2 className="text-xl font-bold mb-3">제어 패널</h2>
        
        <div className="space-y-3">
          <div className="border-b border-orange-600 pb-3 mb-3">
            <label className="block text-sm mb-1 text-orange-400">⚛️ 원자로 출력 (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={reactorPower}
              onChange={(e) => setReactorPower(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center font-semibold text-orange-300">
              {reactorPower.toFixed(0)}% - {(250 + reactorPower * 3).toFixed(0)}°C
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">추진력</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={thrust}
              onChange={(e) => setThrust(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center">{thrust.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm mb-1">Pitch (상하)</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={pitchControl}
              onChange={(e) => setPitchControl(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center">{pitchControl.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm mb-1">Yaw (좌우)</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={yawControl}
              onChange={(e) => setYawControl(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center">{yawControl.toFixed(1)}</div>
          </div>

          <div>
            <label className="block text-sm mb-1">Roll (회전)</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={rollControl}
              onChange={(e) => setRollControl(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center">{rollControl.toFixed(1)}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-full px-4 py-2 rounded font-semibold ${
              isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isPaused ? '▶ 시작' : '⏸ 정지'}
          </button>

          <button
            onClick={resetPosition}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            🔄 초기화
          </button>
        </div>

        {/* 도형 정보 */}
        <div className="mt-4 text-xs border-t border-gray-600 pt-3">
          <div className="font-semibold mb-2 text-purple-400">구성 도형:</div>
          <div className="mb-2">
            <div className="font-semibold text-cyan-400">선체:</div>
            <div>• 원기둥 (주선체)</div>
            <div>• 원뿔 (함수, 함미)</div>
            <div>• 직육면체 (함교탑, 방향타)</div>
          </div>
          {showNuclear && (
            <div className="mb-2">
              <div className="font-semibold text-orange-400">⚛️ 핵추진:</div>
              <div>• 구체 (원자로 노심)</div>
              <div>• 원기둥 (차폐벽, 제어봉)</div>
              <div>• 토러스 (냉각 루프)</div>
              <div>• 원기둥 (증기발생기, 터빈)</div>
              <div>• 직육면체 (터빈 블레이드)</div>
            </div>
          )}
          <div className="text-gray-400">
            궤적 포인트: {trajectory.length}
          </div>
        </div>
      </div>

      {/* 하단 범례 */}
      <div className="absolute bottom-0 left-0 p-4 text-white bg-black/70 rounded-tr-lg text-sm">
        <div className="font-semibold mb-2">벡터 범례:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600"></div>
            <span>빨강: X축 / 우현 방향</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600"></div>
            <span>초록: Y축 / 상승 방향</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600"></div>
            <span>파랑: Z축 / 전진 방향</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400"></div>
            <span>노랑: 이동 궤적</span>
          </div>
        </div>
      </div>
    </div>
  );
}
