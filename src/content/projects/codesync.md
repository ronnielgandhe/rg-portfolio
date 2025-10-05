---
title: CodeSync
slug: codesync
year: 2024
tech: ["React", "Node.js", "WebRTC", "Docker", "Socket.io", "PostgreSQL"]
summary: Collaborative coding environment with real-time multiplayer editing and integrated terminal execution.
highlights:
  - Operational Transform for conflict-free editing
  - WebRTC peer-to-peer video/audio
  - Docker containers for code execution
  - Monaco Editor integration
---

# CodeSync

A collaborative coding platform that enables real-time pair programming with integrated code execution, chat, and video. Think of it as Google Docs meets VS Code.

## Inspiration

Remote pair programming tools often sacrifice either performance or features. CodeSync aims to provide a native-feeling experience with zero-latency collaboration.

## Architecture

### Real-Time Collaboration Engine
- Operational Transform algorithm for conflict-free editing
- WebRTC peer-to-peer connections for video/audio
- WebSocket fallback for text synchronization
- Custom CRDT implementation for cursor sharing

### Code Execution Sandbox
- Docker containers for isolated code execution
- Support for Python, JavaScript, Go, and Rust
- Resource limits and timeout protection
- Real-time stdout/stderr streaming

### Infrastructure
- Node.js backend with Express and Socket.io
- React frontend with Monaco Editor (VS Code's editor)
- PostgreSQL for session persistence
- Redis for presence tracking

## Features

- **Multi-Language Support**: Run Python, JavaScript, Go, and Rust code
- **Live Video & Audio**: WebRTC for low-latency communication
- **Shared Terminal**: Collaborative command-line access
- **Code Execution**: Run code snippets without leaving the browser
- **Session Recording**: Replay collaboration sessions for learning

## Technical Highlights

### Operational Transform Implementation
Built a custom OT implementation handling concurrent edits from multiple users. The algorithm ensures consistency across all clients while maintaining low latency.

### Docker Security
Each code execution runs in an isolated Docker container with strict resource limits (CPU, memory, network) and automatic cleanup after 5 minutes.

### WebRTC Signaling
Custom signaling server handles peer connection establishment with STUN/TURN fallback for NAT traversal.

## Tech Stack

- React with TypeScript
- Node.js + Express + Socket.io
- Monaco Editor (VS Code's editor)
- WebRTC for peer-to-peer communication
- Docker for code execution sandboxing
- PostgreSQL and Redis
- Deployed on AWS (EC2 + ECS)

## Impact

Used by over 500 developers for mock interviews and pair programming sessions. Average session length of 45 minutes with 99.2% uptime.

The project demonstrates how WebRTC and operational transforms can create seamless collaborative experiences.
