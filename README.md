# FormFit AI
> **"Your Camera. Your Coach. Your Form."**  
> Built for the **iQOO Hackathon 2026 Hyderabad — Health Tech Track**

---

## 1. Executive Summary & Problem Statement
Every day, millions of people exercise at home, in hostels, and in gyms without a coach or trainer. Without expert guidance, users repeat biomechanical mistakes like knee valgus collapse, spinal hyperextension, or insufficient range of motion. Over time, these faults can lead to chronic strain, joint discomfort, or early workout abandonment.

Existing fitness apps simply count repetitions using phone accelerometers or show generic instructional videos.

**FormFit AI transforms the smartphone into an active biomechanical coach.** Using on-device real-time computer vision and pose estimation, FormFit AI calculates 3D joint angles, detects incorrect posture instantly, speaks actionable audio cues in real time, and builds a personalized **"Form Fingerprint"** that charts movement quality over time.

---

## 2. Core Architecture & System Pipeline

```
[Smartphone Camera] 
        │
        ▼ (30+ FPS Video Stream)
[MediaPipe Pose Landmarker (33 Anatomical Keypoints)]
        │
        ▼
[Exponential Moving Average (EMA) Jitter Filter (alpha = 0.45)]
        │
        ▼
[Biomechanical Kinematics Engine]
   ├─ 3-Point Angle Calculation (Hip-Knee-Ankle, Shoulder-Hip-Knee, etc.)
   ├─ Torso Plumb Line Inclination & Spine Neutrality
   └─ Frontal Plane Knee Valgus Separation Ratio
        │
        ▼
[Finite State Machine (FSM) Repetition & Phase Tracker]
   ├─ Phase: IDLE ➔ DESCENDING ➔ INFLECTION_BOTTOM ➔ ASCENDING ➔ COMPLETE
   ├─ Debounced Rep Cadence & Minimum Inflection Depth Gate
   └─ Form Score Penalties (0-100%)
        │
        ▼
[Real-Time Feedback Loop]
   ├─ Visual Skeleton Canvas (Color-coded glowing bone links & angle badges)
   ├─ Large High-Contrast HUD (Rep count, phase, form score)
   ├─ Voice Coach (Web Speech API with debouncing & tone cues)
   └─ Post-Workout Form Score Breakdown & Longitudinal "Form Fingerprint"
```

---

## 3. Supported Exercises & Biomechanical Rules

| Exercise | Primary Landmarks | Key Kinematic Metrics | Common Faults Detected | Voice Coaching Directives |
| :--- | :--- | :--- | :--- | :--- |
| **Bodyweight Squat** | Hips (23,24), Knees (25,26), Ankles (27,28), Shoulders (11,12) | Knee Flexion (Hip-Knee-Ankle), Torso Lean vs Plumb Line, Knee Valgus Ratio | Knee Valgus (knees caving in), Chest dropping &gt;45°, Shallow depth | "Keep your knees aligned with your toes", "Keep your back upright", "Go slightly deeper" |
| **Push-Up** | Shoulders (11,12), Elbows (13,14), Wrists (15,16), Hips, Ankles | Elbow Flexion (Shoulder-Elbow-Wrist), Spinal Line (Shoulder-Hip-Ankle) | Lumbar hyperextension (core sag), Hip piking, Partial depth | "Engage core, keep hips level", "Lower chest toward floor" |
| **Lunge** | Lead Knee, Lead Ankle, Hips, Back Knee, Torso | Lead Knee 90° Flexion, Lead Shin Verticality, Torso Uprightness | Lead knee drifting past toes, Excessive forward torso pitch | "Stack front knee above ankle", "Keep upper body upright" |
| **Plank** | Shoulders, Hips, Ankles | Core Horizontal Neutrality (165°–180° straight line) | Hip sag, Hip mountain pike | "Lift hips slightly, engage core", "Lower hips into flat line" |
| **Jumping Jack** | Wrists, Shoulders, Hips, Ankles | Arm Abduction Angle (&gt;135° overhead), Foot Spread Ratio | Incomplete overhead reach, Asymmetry | "Reach higher overhead", "Keep rhythmic jumping tempo" |

---

## 4. Key Unique Features

### A. The Form Fingerprint
Rather than merely logging calorie counts, FormFit AI compiles a multi-day biomechanical profile tracking:
- **Overall Form Quality Index (0–100%)**
- **Kinematic Consistency (%)**
- **Technique Stability Rating (%)**
- **Interactive Anatomical Joint Map:** Visual color-coded human avatar showing stability scores for cervical spine, lumbar spine, hips, knees, and ankles.
- **7-Day Quality Progression:** Shows verified improvement from Day 1 (e.g. 72%) to Day 7 (86%).

### B. Intelligent Voice Coach with Audio Chimes
- Speaks crisp coaching cues using the browser Speech Synthesis API.
- Intelligent cooldown (2.8s debounce) so athletes are never overwhelmed.
- Synthesizes upbeat chime sounds on clean rep completions and warning alerts when form degrades.

### C. Controlled Hackathon Presentation Mode
- Top bar enables switching between **Real Camera AI** and **Demo Presets**.
- Instant simulation buttons for judges:
  - *Clean Squat*: Perfect parallel depth and alignment.
  - *Knee Valgus Error*: Triggers real-time red skeletal warning and immediate voice correction.
  - *Shallow Depth*: Flags early turnaround.
  - *Push-Up, Lunge, Plank, Jumping Jack* simulations.

---

## 5. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion, Canvas-Confetti
- **Computer Vision & AI:** MediaPipe Tasks Vision (`PoseLandmarker`), WebGL/GPU delegate, Vector Trigonometry, Exponential Moving Average Filters
- **Audio:** Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext` oscillators)
- **Database & Schemas:** TypeScript models, Mongoose document schema specifications, LocalStorage persistence layer
- **Backend Ready:** Node.js Express architecture with REST endpoints `/api/v1/sessions`, `/api/v1/fingerprint`, `/api/v1/exercises`

---

## 6. Project Structure

```
├── index.html                   # HTML entry point with meta tags & Google fonts
├── metadata.json                # App metadata and camera/microphone permissions
├── package.json                 # Dependencies and build scripts
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main application orchestrator & presentation mode
│   ├── index.css                # Tailwind CSS global styles
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces (Landmarks, Sessions, Fingerprint)
│   ├── ai/
│   │   ├── math.ts              # Vector trigonometry, angles, and smoothing filters
│   │   ├── detector.ts          # MediaPipe PoseLandmarker on-device manager
│   │   ├── renderSkeleton.ts    # Biomechanical glowing canvas overlay renderer
│   │   ├── voice.ts             # Speech synthesis coach & Web Audio synthesizer
│   │   ├── demoData.ts          # Kinematic landmark cycle generator for hackathon demo
│   │   └── rules/
│   │       ├── squat.ts         # Squat state machine & valgus detection
│   │       ├── pushup.ts        # Push-up elbow & bodyline engine
│   │       ├── lunge.ts         # Lunge lead-knee & torso uprightness
│   │       ├── plank.ts         # Plank isometric alignment & hold timer
│   │       ├── jumpingJack.ts   # Jumping Jack abduction & cadence
│   │       └── index.ts         # Exercise catalog & analyzer dispatcher
│   ├── services/
│   │   ├── storage.ts           # Local persistence & 7-day progress store
│   │   └── api.ts               # API endpoints client
│   ├── models/
│   │   └── schema.ts            # MongoDB/Mongoose database schemas & API docs
│   └── components/
│       ├── HomeScreen.tsx           # Health-tech flagship home screen
│       ├── ExerciseScreen.tsx       # Live camera HUD & computer vision interface
│       ├── ExerciseLibrary.tsx      # 5 supported exercises catalog
│       ├── FormFingerprintScreen.tsx # Biomechanical joint avatar & trend graphs
│       ├── ProgressDashboard.tsx    # Analytics, rep volume & session history
│       ├── WorkoutSummaryModal.tsx  # Post-workout score breakdown & confetti
│       ├── OnboardingModal.tsx      # 4-step onboarding & camera permission flow
│       ├── SafetyModal.tsx          # Medical advisory & pain protocol
│       ├── HackathonDemoBar.tsx     # 1-click presenter & judge control bar
│       └── Navigation.tsx           # Mobile bottom navigation bar
└── README.md
```

---

## 7. Setup & Installation Instructions

### Prerequisites
- Node.js 18+ and npm installed on your machine.
- A modern smartphone or laptop browser with camera support (Chrome, Safari, Firefox, Edge).

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd formfit-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will run at `http://localhost:3000`.

---

## 8. 3-Minute Hackathon Demo Pitch Script

| Scene | Duration | Action | Voice / Pitch Narrative |
| :--- | :--- | :--- | :--- |
| **Scene 1: The Problem** | 0:00 – 0:30 | Show Home Screen with Tagline *"Your Camera. Your Coach. Your Form."* | *"Over 70% of fitness injuries occur from repetitive poor form during unguided home workouts. Apps today only count reps. We built FormFit AI to solve this."* |
| **Scene 2: Select Exercise** | 0:30 – 0:50 | Click **START WORKOUT** or select **Squat** in the Exercise Library | *"FormFit AI loads exercise kinematics. No wearable sensors or special equipment needed—just your phone camera."* |
| **Scene 3: Real-Time Detection** | 0:50 – 1:20 | Position camera or click **Clean Squat** in the top bar | *"The AI identifies 33 anatomical landmarks. Notice the green glowing skeleton and the live knee angle badge tracking at 92 degrees. It counts clean reps and plays an audio chime."* |
| **Scene 4: Instant Error Correction** | 1:20 – 1:50 | Click **Knee Valgus Error** in the Demo bar | *"Watch what happens when the knees cave inward. The skeleton turns red, a critical fault is logged, and the AI voice coach immediately speaks: 'Keep your knees aligned with your toes'."* |
| **Scene 5: Form Score Breakdown** | 1:50 – 2:20 | Click **End Workout** | *"At set completion, the athlete receives an AI Form Score (88/100) split into Knee Alignment, Back Posture, Depth, and Cadence."* |
| **Scene 6: Form Fingerprint** | 2:20 – 3:00 | Navigate to **Form Fingerprint** | *"Finally, FormFit AI updates your personal Form Fingerprint. We see the anatomical joint stability avatar and a 7-day progression curve proving how form improved from 72% on Day 1 to 86% today."* |

---

## 9. Safety & Non-Medical Disclaimer
FormFit AI is an educational movement coach and algorithmic fitness feedback tool. It does **not** diagnose musculoskeletal pathologies, ligament tears, or medical conditions. Users experiencing joint pain or discomfort are advised via an in-app safety protocol to discontinue exercise and consult a qualified medical professional.
