# TypeGPU Graph

https://github.com/user-attachments/assets/28c0f9f9-6aea-412e-bab2-d03d38f38492

This project is a visual, node-based graph editor for creating and experimenting with GPU shaders, built with React Native, Expo, and leveraging WebGPU for rendering.

## Features

*   **Visual Node Editor:** Create, connect, and manipulate nodes in a 2D canvas.
*   **Drag & Drop Interface:** Use gestures to pan the canvas and move nodes.
*   **Shader Graph Compilation:** The node graph is compiled into a single shader.
*   **Real-time Preview:** View the output of your shader graph in real-time.

## Core Technologies

*   **React Native & Expo:** For cross-platform development on iOS, Android, and Web.
*   **Jotai:** For state management of the graph, nodes, and connections.
*   **React Native Gesture Handler & Reanimated:** For a fluid and responsive user interface.
    **React Native SVG:** For rendering everything I was too lazy to write a shader for.
*   **TypeGPU** For easy, type-safe and maintainable shader code generation.

## Getting Started

1.  **Install dependencies:**

    ```bash
    yarn install
    ```

2.  **Prebuild and start the Expo project:**

    ```bash
    npx expo prebuild
    npx expo start
    ```
