---
title: AlgoViz
slug: algoviz
year: 2024
tech: ["TypeScript", "React", "Canvas API", "Web Workers", "Zustand", "Vite"]
summary: Interactive algorithm visualizer with step-by-step execution and performance profiling for technical interview prep.
highlights:
  - Step-by-step algorithm execution
  - Canvas rendering for large datasets
  - Web Workers for heavy computation
  - Support for sorting, graph, and DP algorithms
---

# AlgoViz

An interactive algorithm visualization platform designed for technical interview preparation. Watch algorithms execute step-by-step with beautiful animations and detailed complexity analysis.

## The Vision

Learning algorithms from static diagrams is hard. AlgoViz makes understanding algorithms intuitive by showing exactly how they work, one step at a time.

## What It Does

### Supported Algorithms
- **Sorting**: QuickSort, MergeSort, HeapSort, RadixSort
- **Graph**: Dijkstra, A*, BFS, DFS, Kruskal's, Prim's
- **Dynamic Programming**: LCS, Knapsack, Edit Distance
- **Tree**: AVL, Red-Black, B-Tree operations
- **Search**: Binary Search variants, Two Pointers

### Interactive Features
- **Step Controls**: Play, pause, step forward/backward
- **Speed Adjustment**: 0.5x to 4x speed control
- **Custom Input**: Test with your own data
- **Code Highlighting**: See which lines execute at each step
- **Complexity Analysis**: Real-time time/space complexity

## Technical Architecture

### Animation Engine
Custom animation system built on React Spring for smooth 60fps transitions. Implements a timeline-based approach allowing scrubbing through algorithm execution.

### State Management
Zustand for global state with time-travel debugging. Each algorithm step is immutable, enabling perfect replay and step-backward functionality.

### Performance Optimization
- Canvas rendering for large datasets (>1000 elements)
- Web Workers for algorithm execution to keep UI responsive
- Memoization to prevent unnecessary re-renders
- Virtualized lists for displaying large arrays

## Tech Stack

- React 18 with TypeScript
- Zustand for state management
- React Spring for animations
- Canvas API for performance-critical rendering
- Web Workers for heavy computation
- TailwindCSS for styling
- Vite for blazing-fast development

## Educational Impact

### Features for Learning
- **Interactive Tutorials**: Step-by-step guides for each algorithm
- **Complexity Explanations**: Why O(n log n) vs O(n²) matters
- **Common Pitfalls**: Highlights edge cases and gotchas
- **Interview Tips**: Real tips from actual interviews

### Code Generation
Generates clean, production-ready code in Python, JavaScript, and C++ for any visualized algorithm.

## Challenges Solved

### Smooth Animations at Scale
Rendering 10,000+ elements while maintaining smooth animations required switching from DOM-based rendering to Canvas. Implemented custom batching and requestAnimationFrame optimization.

### Algorithm Abstraction
Created a unified interface for defining algorithms that automatically generates visualizations. New algorithms require minimal boilerplate.

## Results

- 10K+ monthly active users
- Used by students at MIT, Stanford, and Berkeley
- Featured on Hacker News front page
- 4.8/5 rating from 200+ reviews

Built to prove that learning computer science fundamentals can be beautiful and interactive.
