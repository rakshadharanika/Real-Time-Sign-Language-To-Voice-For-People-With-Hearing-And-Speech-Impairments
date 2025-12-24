# SignSpeak

## Real-Time Sign Language to Voice and Text System  
### Empowering Communication for People with Hearing and Speech Impairments

---

## 📌 Overview

**SignSpeak** is a real-time assistive communication system designed to bridge the communication gap between **sign language users** and **non-signers**. Using a live camera feed, the system detects hand gestures, converts them into readable text, and optionally speaks them out loud using text-to-speech technology.

This project focuses on **accessibility, inclusivity, and real-time interaction** using modern web and machine learning technologies.

---

## 🎯 Objectives

- Enable real-time sign language recognition
- Convert sign language gestures into text
- Provide voice output for better interaction
- Support multiple languages
- Offer an accessible and user-friendly interface

---

## ✨ Features

- 📷 **Live Camera-Based Detection**  
  Captures hand gestures in real time using a webcam.

- ✋ **Sign Language Recognition**  
  Detects and interprets hand signs using computer vision and ML models.

- 📝 **Sign → Text Conversion**  
  Converts recognized signs into readable text instantly.

- 🔊 **Text → Voice Output**  
  Converts detected text into speech using the Web Speech API.

- 🌍 **Multilingual Support**  
  Supports multiple languages for broader usability.

- ♿ **Accessible UI**  
  Designed specifically for deaf and mute users.

---

## 🛠️ Tech Stack

### Frontend
- React + Vite
- HTML5, CSS3, JavaScript

### Computer Vision & Machine Learning
- MediaPipe (Hand landmark detection)
- OpenCV (Image processing)
- TensorFlow (Gesture classification model)

### Speech
- Web Speech API (Text-to-Speech)

---

## 🧠 System Workflow

1. Camera captures live video stream  
2. MediaPipe detects hand landmarks  
3. ML model classifies the gesture  
4. Gesture is converted into text  
5. Optional voice output is generated  
6. Result is displayed on the UI in real time  

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16 or above)
- npm or yarn
- Webcam-enabled device
- Modern browser (Chrome recommended)

---

### Installation

```bash
npm install
npm run dev

```

### Project Structure
```

SignSpeak/
│
├── src/
│   ├── components/        # UI components
│   ├── hooks/             # Camera & detection logic
│   ├── ml/                # ML models & classifiers
│   ├── utils/             # Helper utilities
│   └── App.jsx
│
├── public/
├── package.json
└── README.md


```
### 📝 Project Abstract

SignSpeak is a real-time sign language interpretation system aimed at assisting individuals with hearing and speech impairments. The system leverages computer vision and machine learning techniques to recognize hand gestures from live video input and convert them into textual and audible output. By integrating modern web technologies and accessibility-focused design principles, SignSpeak enables inclusive communication and demonstrates the practical application of AI-driven assistive technologies.



### 📸 Screenshots

<img width="1919" height="797" alt="image" src="https://github.com/user-attachments/assets/16485fe9-b9a8-4cae-baf9-10e09bca4c4e" />

<img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/ff6784f2-cda9-454d-8e62-10c926acd66c" />

<img width="1303" height="957" alt="image" src="https://github.com/user-attachments/assets/f5036ca9-b842-4e03-a0f4-59a44e6589b7" />

### Result:
The SignSpeak system successfully detects sign language gestures in real time, converts them into readable text, and generates corresponding voice output. The application demonstrates accurate gesture recognition, low-latency response, and an accessible user interface, enabling effective communication for people with hearing and speech impairments.
