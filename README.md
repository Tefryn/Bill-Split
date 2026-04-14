# Bill-Split: Receipt OCR & Expense Sharing App

## Overview

Bill-Split is a full-stack application that simplifies expense management for groups. Using OCR technology, users can upload receipt images to automatically extract items and costs. The app enables users to create expense sessions, add items, split costs among participants, and calculate fair settlements.

## Features

- **Receipt OCR**: Upload receipt images and automatically extract items and prices
- **Session Management**: Create and join expense sessions with multiple participants
- **Flexible Cost Splitting**: Mark items as shareable or claim individual items
- **Automatic Calculations**: Compute fair split amounts including taxes and tips
- **User Management**: Track user expenses and contributions

## Tech Stack

### Frontend
- **Next.js** (TypeScript) - React meta-framework for server-side rendering and optimization
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Components** - Atomic design pattern (atoms, molecules, organisms)

### Backend
- **Spring Boot** (Java) - RESTful API development
- **Protocol Buffers (gRPC)** - Efficient service communication
- **GraphQL** - Flexible query language for API

## Project Structure

```
.
├── src/
│   ├── backend/          # Spring Boot Java backend
│   │   ├── pom.xml       # Maven dependencies
│   │   └── src/
│   │       ├── main/
│   │       │   ├── java/
│   │       │   ├── proto/
│   │       │   └── resources/
│   │       └── test/
│   └── frontend/         # Next.js TypeScript frontend
│       ├── app/          # Application pages and routing
│       ├── components/   # Reusable UI components
│       ├── types/        # TypeScript type definitions
│       └── public/       # Static assets
├── DesignDocument.md     # System architecture and data model
├── ocr_rfc.md           # OCR feature RFC
├── rfc_final.md         # Final RFC specifications
└── meeting_notes/       # Meeting notes and discussions
```

## Getting Started

### Prerequisites
- Java 17+ (for backend)
- Node.js 18+ (for frontend)
- Maven (for backend builds)

### Backend Setup
```bash
cd src/backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup
```bash
cd src/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8080`.

## Team

- **Eiko Reisz**
- **Harrison Gillespie**
- **Daniel Rivero**
- **Fung Lok**
- **Connor King**

## Documentation

- [Design Document](DesignDocument.md) - System architecture, data models, and state management
- [OCR RFC](ocr_rfc.md) - OCR feature specifications
- [Final RFC](rfc_final.md) - Complete feature requirements
- [Meeting Notes](meeting_notes/) - Development progress and decisions
