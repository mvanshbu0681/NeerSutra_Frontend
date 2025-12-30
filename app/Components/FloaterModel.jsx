"use client";

import React from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("/white_floater.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002.geometry}
        material={materials["white plastic"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_1.geometry}
        material={materials["black rough"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_2.geometry}
        material={materials.red}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_3.geometry}
        material={materials["white plastic"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_4.geometry}
        material={materials["blue plastic"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_5.geometry}
        material={materials["orange plastic"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_6.geometry}
        material={materials["transluscent plastic"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_7.geometry}
        material={materials["Metal Black"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_8.geometry}
        material={materials.golden}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_9.geometry}
        material={materials["black shiny"]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cylinder002_10.geometry}
        material={materials["Metal "]}
      />
    </group>
  );
}

useGLTF.preload("/white_floater.glb");
