# QuickSupport Agent API

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

## Introduction
QuickSupport Agent API is a backend service built with Express and TypeScript. It provides audio processing : speech to text using Grok Whispers API, text to speech using Speechify API, data processing using RAG API with vector database called pinecone for efficient vector searches, user input embeddings using all-MiniLM-L6-v2 and Llama 3.1 70B as our LLM. the RAG is stored at https://github.com/nshimiyimanaamani/AI-irembo-project.

## Features
- Audio processing
- Natural Language Processing

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/ArseneMerci/Irembo-AI-hackathon-api.git
    cd quicksupport-agent-api
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file based on `.env.example`:
    ```sh
    UPLOAD_PATH=
    SPEECHIFY_API_URL=
    SPEECHIFY_API_KEY=LjE29aHN0vGPISee6znKVlVqYnkfobPSMGOs_WvB2W8=
    GROQ_API_KEY=
    RAG_APPLICATION_URL=
    ```

## Usage
### Development
To start the development server with hot-reloading:
```sh
npm run start-dev