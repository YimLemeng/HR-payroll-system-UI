# HR & Payroll Management System - Modern UI

Enterprise-grade, responsive React Single-Page Application (SPA) designed for the **Spring Boot & PostgreSQL HR & Payroll Management System**.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-success?logo=cloudflare)](https://hr-payroll.yimlemeng.workers.dev/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?logo=vite)](https://vite.dev/)

---

## 🌐 Live Demo & Credentials

Experience the live application deployed on Cloudflare Workers / Pages:

🔗 **Live Demo Website**: [https://hr-payroll.yimlemeng.workers.dev](https://hr-payroll.yimlemeng.workers.dev)  
⚙️ **Backend REST API Repository**: [https://github.com/YimLemeng/HR-payroll-system](https://github.com/YimLemeng/HR-payroll-system)  

> 👤 **Test Accounts**: `admin` / `Admin@123` (Admin) • `sok_hr` / `Sokhr@123` (HR)

---

## ✨ Features & Modules

- **📊 Executive Dashboard**: Real-time staff metrics, attendance rate, monthly payroll estimation, department headcount distribution, and live clock-in streams.
- **👥 Employee Directory**: Complete staff profiles, salary management, department assignments, status tracking, and intuitive creation/editing modals.
- **🏢 Department Management**: Organizational divisions, staff count indicators, and departmental basic salary breakdowns.
- **🕒 Attendance Tracking**: Daily attendance logs, check-in/out stamps, status monitoring (Present, Late, Absent, Half-Day), and overtime calculation.
- **📅 Leave Requests**: Employee leave submissions, review/approval/rejection flows, cancel confirmation modals, and status badges.
- **💰 Automated Payroll Processing**:
  - Monthly automated wage calculation (Base Salary, 10% Allowance, 1.5x Overtime, 5% Deductions, 10% Tax, Net Pay).
  - Disbursement tracking (`CALCULATED`, `APPROVED`, `PAID`).
  - **Export to CSV**: UTF-8 BOM formatted spreadsheet download with individual employee lines and grand totals.
  - **A4 Print / Save as PDF**: Certified managerial payroll voucher formatted for standard A4 paper with corporate letterhead, 11-column schedule, and 3 formal corporate signature blocks.
- **📈 Reports & Analytics**: Printable high-level managerial audits and CSV exports.
- **🛡️ User Administration (Admin Only)**: System user creation and role management (`ADMIN`, `HR`).
- **🌐 Full Bilingual Support (🇰🇭 Khmer / 🇬🇧 English)**: Instant language toggle with typography optimized for Kantumruy Pro & Inter fonts.
- **🔒 Enterprise Security**:
  - JWT Expiration Watchdog & client-side expiration validation.
  - Automated 30-minute inactivity session timeout.
  - Synchronized multi-tab session termination on logout.
  - Role-Based Access Control (RBAC) route guards.
  - Brute-force rate limiting cooldown on login.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized error handling & token injection
- **Deployment**: Cloudflare Workers / Pages

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Running Spring Boot Backend API (default `http://localhost:8080/api`)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/YimLemeng/HR-payroll-system-UI.git
   cd HR-payroll-system-UI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   *(By default, `.env` connects to your local backend at `http://localhost:8080/api`)*

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
