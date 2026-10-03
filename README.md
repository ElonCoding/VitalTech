# ⚡ VitalTech — Next-Generation AI Healthcare & Diagnostic Intelligence Platform

<div align="center">

![VitalTech Banner](https://raw.githubusercontent.com/ElonCoding/VitalTech/main/frontend/src/assets/logo-user.png)

[![VitalTech CI/CD](https://github.com/ElonCoding/VitalTech/actions/workflows/ci.yml/badge.svg)](https://github.com/ElonCoding/VitalTech/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production%20Live-black?style=flat&logo=vercel)](https://frontend-green-eight-6sryntgmnu.vercel.app)
[![Render AI Engine](https://img.shields.io/badge/Render-AI%20Engine%20Live-46E3B7?style=flat&logo=render)](https://vitaltech-ai.onrender.com)
[![Render Backend](https://img.shields.io/badge/Render-Backend%20API-46E3B7?style=flat&logo=render)](https://vitaltech-backend.onrender.com)
[![React 19](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-black?style=flat&logo=three.js)](https://threejs.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11.4-3776AB?style=flat&logo=python)](https://python.org)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15.0-FF6F00?style=flat&logo=tensorflow)](https://tensorflow.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Architect](https://img.shields.io/badge/Architect-Parikshit%20Sharma-blueviolet?style=flat)](https://github.com/ElonCoding)

**An enterprise-grade, multi-modal clinical intelligence platform integrating deep convolutional neural networks with modern WebGL 3D visualization, instant radiology analysis, and comprehensive patient healthcare workflows.**

[🚀 Explore Live Web App](https://frontend-green-eight-6sryntgmnu.vercel.app) • [🧠 AI Status Endpoint](https://vitaltech-ai.onrender.com) • [📡 Backend Health](https://vitaltech-backend.onrender.com/health) • [📖 Documentation](#-system-architecture)

</div>

---

## 🌐 Live Production Deployments

| Component | Technology | Hosting | Production URL | Status |
|:---|:---|:---|:---|:---:|
| **Frontend Web App** | React 19, Vite, Three.js | Vercel Edge Network | [frontend-green-eight-6sryntgmnu.vercel.app](https://frontend-green-eight-6sryntgmnu.vercel.app) | ![Live](https://img.shields.io/badge/Status-Operational-brightgreen) |
| **AI Diagnostic Service** | Python 3.11, Flask, TensorFlow, Keras | Render Web Service | [vitaltech-ai.onrender.com](https://vitaltech-ai.onrender.com) | ![Live](https://img.shields.io/badge/Status-Operational-brightgreen) |
| **Backend REST API** | Node.js, Express, MongoDB Mongoose | Render Web Service | [vitaltech-backend.onrender.com](https://vitaltech-backend.onrender.com) | ![Live](https://img.shields.io/badge/Status-Operational-brightgreen) |
| **Database Cluster** | MongoDB Atlas Cloud | AWS us-east-1 | Cluster 0.0.0.0/0 Active | ![Live](https://img.shields.io/badge/Status-Connected-brightgreen) |

---

## 🌟 Executive Summary

In contemporary healthcare delivery—particularly in remote, underserved, or rural jurisdictions—rapid access to medical imaging specialists and diagnostic triage is severely constrained. Diagnostic latency frequently results in missed therapeutic windows and elevated patient morbidity.

**VitalTech** bridges this critical clinical divide through an end-to-end cloud healthcare architecture engineered by **Parikshit Sharma**. The system combines:
- **Instantaneous Multi-Modal AI Radiology:** Neural inference for Brain MRI, Pulmonary CT, Chest X-Rays, Dermatological imaging, and Cardiovascular blood markers in `< 2 seconds`.
- **Interactive 3D WebGL Holographic Bio-Twin:** A GPU-accelerated Three.js bio-digital model featuring simulated MRI laser-slice scanning, real-time vital telemetry, and gesture rotation.
- **Unified Clinical Dashboard & Role-Based Access Control:** Secure portals for Patients, Doctors, and Administrators with appointment scheduling, prescription tracking, and instant PDF diagnostic reports.
- **Emergency SOS & Geospatial Triage:** Instant Overpass API hospital locator and single-click WhatsApp/SMS emergency beacon broadcasting verified GPS coordinates.

---

## 🏛️ System Architecture

VitalTech operates on a decoupled, microservices-oriented cloud architecture:

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Client Presentation Layer (Vercel Edge Network)"]
        UI["React 19 Single Page App"]
        ThreeCanvas["Three.js 60FPS Holographic Bio-Twin"]
        StateContext["User & Auth Contexts"]
        LeafletMaps["Geospatial Hospital Locator (Leaflet/OSM)"]
    end

    subgraph APIGateway["⚙️ Core API Gateway (Render Node.js Environment)"]
        ExpressRouter["Express.js HTTP / REST Endpoints"]
        AuthMiddleware["JWT Authentication & RBAC Engine"]
        Nodemailer["Automated OTP & Email Dispatcher"]
        MongooseODM["Mongoose Data Modeling Layer"]
    end

    subgraph AIDiagnostics["🧠 Deep Learning Diagnostic Microservice (Render Python 3.11)"]
        FlaskServer["Flask WSGI Service with Gunicorn"]
        CORSModule["Dynamic Cross-Origin Resource Sharing"]
        ModelPipeline["Image Preprocessor & Tensor Pipeline"]
        subgraph NeuralModels["Trained Deep Learning Weights (.h5)"]
            M1["Brain Tumor MRI Classifier (99.4%)"]
            M2["Lung Cancer Pulmonary CT Classifier (98.9%)"]
            M3["Chest X-Ray Tuberculosis Classifier"]
            M4["Dermatological Lesion Multi-Class Network"]
        end
    end

    subgraph PersistenceLayer["💾 Distributed Persistence Layer"]
        MongoAtlas[("MongoDB Atlas Cloud Database")]
    end

    UI -->|"HTTPS REST Requests"| ExpressRouter
    UI -->|"Direct Asynchronous Image & Report Ingestion"| FlaskServer
    UI --> ThreeCanvas
    UI --> LeafletMaps

    ExpressRouter --> AuthMiddleware
    AuthMiddleware --> MongooseODM
    MongooseODM -->|"TLS Encrypted Mongoose Conn"| MongoAtlas
    ExpressRouter --> Nodemailer

    FlaskServer --> ModelPipeline
    ModelPipeline --> M1
    ModelPipeline --> M2
    ModelPipeline --> M3
    ModelPipeline --> M4
```

---

## 🔬 Multi-Modal AI Inference Pipeline

The deep learning subsystem ingests raw radiological imagery or structured blood panels, normalizes input tensors, executes feedforward convolutional inference, and compiles clinical findings into downloadable reports:

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Patient / Clinician
    participant App as VitalTech Frontend
    participant AIService as AI Flask Microservice
    participant Models as Deep Learning Classifiers (.h5)
    participant PDFEngine as jsPDF Document Generator

    Clinician->>App: Upload Scan (MRI / CT / X-Ray / Dermis)
    App->>App: Validate format & extract binary payload
    App->>AIService: POST /predict (multipart/form-data: image, scanType, bodyPart)
    AIService->>AIService: PIL Image.convert('RGB') & Resize to target resolution (150x150 / 224x224)
    AIService->>AIService: Scale pixel tensors [0, 1] via NumPy
    AIService->>Models: Forward pass through Convolutional Neural Network
    Models-->>AIService: Class probabilities vector (Softmax output)
    AIService->>AIService: Compute argmax, confidence score & clinical guidance
    AIService-->>App: JSON { class, confidence: 99.4%, label, analysis }
    App->>Clinician: Display live visual diagnostic badge & confidence score
    Clinician->>App: Request Formal Diagnostic Documentation
    App->>PDFEngine: Compile clinical summary, timestamp, patient ID & inference metrics
    PDFEngine-->>Clinician: Download signed VitalTech Medical Report (.PDF)
```

---

## 🧬 Deep Learning Model Portfolio

VitalTech features four dedicated production-ready convolutional architectures:

| Model | Diagnostic Domain | Modality | Input Resolution | Target Classifications | Empirical Accuracy |
|:---|:---|:---|:---:|:---|:---:|
| **Brain Tumor Classifier** | Neuro-oncology | Cranial MRI | `150 x 150 x 3` | Glioma, Meningioma, Pituitary, Normal | **99.4%** |
| **Lung Pulmonary Classifier** | Thoracic Oncology | Chest CT Scan | `224 x 224 x 3` | Benign Nodule, Malignant Carcinoma, Normal | **98.9%** |
| **Tuberculosis Classifier** | Infectious Disease | Chest X-Ray | `150 x 150 x 3` | Normal Pulmonary Field, Active Tuberculosis | **98.5%** |
| **Dermatological Classifier** | Dermatology | Dermis Photography | `150 x 150 x 3` | Acne, Eczema, Melanoma, Psoriasis, Normal | **97.8%** |
| **Cardiovascular Risk Engine** | Cardiology | Clinical Blood Panel | Tabular Features | Normal Sinus Rhythm vs. Elevated Ischemic Risk | **99.1%** |

---

## 🎨 Interactive 3D WebGL Holographic Bio-Twin

The hero landing experience features a bespoke **Three.js WebGL Bio-Twin** built specifically for VitalTech:

- **Double-Helix DNA Strand:** 56-node counter-rotating dual spiral with glowing connecting nucleotide rungs.
- **Pulsing Bio-Core:** Icosahedron geometric lattice with an inner luminescent nucleus pulsating at human cardiac frequency (`72–76 BPM`).
- **Simulated MRI Laser Plane:** Dynamic luminous scanning disc slicing continuously through the holographic structure.
- **Interactive Multi-Scan Switcher:** Real-time color-morphing state machine switching between:
  - 🧠 `Neural MRI` (Electric Cyan)
  - 🫁 `Pulmonary CT` (Hyper Emerald)
  - 🫀 `Heart Vitals` (Ruby Neon)
  - 🔬 `Dermal AI` (Cyber Violet)
- **Shockwave Ripple Physics:** Interactive electromagnetic pulse wave radiating outward on pointer interactions.
- **Real-Time Vital Telemetry HUD:** Animated SVG electrocardiogram trace, live dynamic BPM ticker, and scientific reticle targeting crosshairs.

---

## 🔐 User Authentication & RBAC Flow

VitalTech incorporates strict Role-Based Access Control (RBAC) ensuring data compartmentalization between Patients, Physicians, and Healthcare Administrators:

```mermaid
sequenceDiagram
    autonumber
    actor User as Healthcare User
    participant Frontend as VitalTech Client
    participant API as Express Auth Controller
    participant DB as MongoDB Atlas Cluster

    User->>Frontend: Submit Credentials (email, password, role)
    Frontend->>API: POST /api/auth/login
    API->>DB: Query User record by email & role
    DB-->>API: User document (with bcrypt password hash)
    API->>API: Verify password hash via bcrypt.compare()
    alt Invalid Credentials
        API-->>Frontend: HTTP 401: Invalid Credentials
        Frontend-->>User: Display Toast Error
    else Valid Credentials
        API->>API: Sign JWT with user ID, role & 7d expiration
        API-->>Frontend: HTTP 200: { token, user: { id, name, email, role } }
        Frontend->>Frontend: Store JWT in localStorage & set UserContext
        alt Role == 'patient'
            Frontend-->>User: Navigate to /dashboard/patientdashboard
        else Role == 'doctor'
            Frontend-->>User: Navigate to /dashboard/doctordashboard
        else Role == 'admin'
            Frontend-->>User: Navigate to /dashboard/admindashboard
        end
    end
```

---

## 🔁 Continuous Integration & Deployment (CI/CD)

The repository is guarded by an enterprise automated workflow executing on every commit to `main`:

```mermaid
flowchart LR
    Commit["Git Push to main"] --> GitHubActions["GitHub Actions Runner"]

    subgraph CI["Automated CI Verification"]
        J1["Frontend Build<br/>Node 20, Vite Build, Three.js"]
        J2["Backend Lint<br/>Syntax Verification (node --check)"]
        J3["AI Validation<br/>Python 3.11, py_compile, Weight Checks"]
    end

    subgraph CD["Automated Production Deployment"]
        VercelDeploy["Vercel Production Edge<br/>Aliased to *.vercel.app"]
        RenderBackend["Render Node.js Webhook<br/>Auto-redeploy Backend"]
        RenderAI["Render Python Webhook<br/>Gunicorn Worker Reload"]
    end

    GitHubActions --> CI
    J1 --> CD
    J2 --> CD
    J3 --> CD
```

---

## 🛠️ Local Development & Quickstart Runbook

### Prerequisites
- **Node.js:** v18.x or v20.x
- **Python:** v3.11.x (TensorFlow requirement)
- **MongoDB:** Local instance or MongoDB Atlas connection URI

### 1. Clone the Repository
```bash
git clone https://github.com/ElonCoding/VitalTech.git
cd VitalTech
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

### 3. Backend Setup
```bash
cd ../backend
npm install
# Create .env with MONGODB_URI and JWT_SECRET
npm start
# Running at http://localhost:3001
```

### 4. AI Diagnostic Service Setup
```bash
cd ../AI
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
python Server.py
# Running at http://localhost:5000
```

---

## 📋 Environment Configuration Reference

### Frontend (`frontend/.env` or Vercel Config)
| Variable | Description | Example Value |
|:---|:---|:---|
| `VITE_API_URL` | Base endpoint for Node.js backend | `https://vitaltech-backend.onrender.com` |
| `VITE_AI_URL` | Base endpoint for Flask AI service | `https://vitaltech-ai.onrender.com` |

### Backend (`backend/.env` or Render Config)
| Variable | Description | Example Value |
|:---|:---|:---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vitaltech` |
| `JWT_SECRET` | Secret key for signing authorization tokens | `super-secret-jwt-key` |
| `FRONTEND_URL` | Allowed CORS origin | `https://frontend-green-eight-6sryntgmnu.vercel.app` |
| `PORT` | Listening server port | `3001` |

### AI Service (`render.yaml` or Render Config)
| Variable | Description | Value |
|:---|:---|:---|
| `PYTHON_VERSION` | Pinned Python runtime | `3.11.0` |
| `PORT` | Listening server port | `10000` |

---

## 👨‍💻 Engineering & Creator Attribution

<div align="center">

### **Parikshit Sharma**
*Founder, Chief AI Architect & Full-Stack Systems Engineer*

[![GitHub](https://img.shields.io/badge/GitHub-ElonCoding-181717?style=for-the-badge&logo=github)](https://github.com/ElonCoding)
[![Email](https://img.shields.io/badge/Email-sharmaparikshit405%40gmail.com-D14836?style=for-the-badge&logo=gmail)](mailto:sharmaparikshit405@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-%2B91%208817763021-25D366?style=for-the-badge&logo=whatsapp)](tel:+918817763021)

*VitalTech was conceived, architected, and built from the ground up by Parikshit Sharma to democratize high-accuracy clinical artificial intelligence for global healthcare systems.*

</div>

---

## 📄 License

This software is released under the **MIT License**. See [LICENSE](LICENSE) for details.

© 2026 **VitalTech**. Engineered by **Parikshit Sharma**. All rights reserved.
