# GRIDMORPH
### Adaptive Digital Twin for Renewable Distribution Networks

> **"Not just a digital twin that watches — one that adapts, compares, and tells you the truth."**

---

## ⚡ Overview

**GRIDMORPH** is a high-fidelity decision-support platform and physics-informed digital twin designed for modern power distribution utilities, renewable energy operators, and microgrid engineers.

As distributed energy resources (DERs) like rooftop solar and commercial solar farms surge, distribution networks suffer from reverse power flow, voltage rise, and thermal line congestion. Traditional SCADA systems either blindly alert operators when it's already too late or trigger blunt 25% solar curtailment.

GRIDMORPH solves this with an end-to-end autonomous decision pipeline:
1. **Real-Time Telemetry & SCADA Monitoring** across a 12-bus 11kV benchmark distribution feeder.
2. **Deterministic Multi-Horizon ML Forecasting** (Random Forest regressor with 0.12 MW MAE) predicting voltage breaches 30-120 minutes in advance.
3. **Physics-Based AC Power-Flow BFS Solver** calculating terminal voltage profiles, line ampacity loading, and power losses.
4. **Parallel Multi-Objective Action Optimizer** evaluating 5 candidate dispatch strategies across Grid Safety (40%), Renewable Utilization (30%), Battery Lifetime (15%), and Switching Minimization (15%).
5. **MorphAI Copilot** — an intelligent natural language grid assistant with instant situational diagnostics and direct setpoint execution.
6. **Feasibility Boundary & EOP Protocols** providing honest bottleneck attribution (inverter MVA, battery SOC saturation) and formal Emergency Operating Procedures.

---

## 🚀 Key Features

- **Interactive 12-Bus Digital Twin:** Real-time schematic visualization of energized buses, solar injections, battery charging, and feeder tie-switches.
- **Side-by-Side Before vs After Verification:** Proves overvoltage reduction (e.g. 1.067 pu → 1.048 pu) with 100% clean solar energy preserved.
- **What-If Scenario Lab:** Interactive sliders for solar irradiance multipliers, feeder demand shifts, battery SOC states, and topological tie reconfiguration.
- **Multi-Horizon ML Forecast Engine:** Continuous 0-120m projection comparing Random Forest against persistence baselines with confidence intervals.
- **MorphAI Copilot Chatbot:** Situational troubleshooting, technical explanations, and direct in-chat action dispatching.
- **Audit & Compliance Reporting:** One-click print / PDF export of official operator dispatch logs.
- **Automated 90-Second Judge Walkthrough:** Guided 12-phase story mode demonstrating end-to-end platform capabilities.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Power Systems Solver:** AC Backward-Forward Sweep (BFS) Radial Network Power-Flow Engine.
- **Machine Learning Engine:** Multi-Horizon Time-Series Random Forest Regressor vs Persistence Baseline.
- **Multi-Objective Optimization:** Pareto Weighted Scoring Engine.

---

## 📦 Local Development

```bash
# Clone the repository
git clone https://github.com/<your-username>/gridmorph.git

# Navigate into directory
cd gridmorph

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🚢 Deployment via GitHub Pages

This repository is configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Create a new repository on GitHub (e.g. `gridmorph`).
2. Push your code to the `main` branch:
   ```bash
   git remote add origin https://github.com/<your-username>/gridmorph.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish your site at `https://<your-username>.github.io/gridmorph/`.
