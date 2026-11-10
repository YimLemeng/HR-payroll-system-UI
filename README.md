# HR & Payroll Management System - Modern UI

Enterprise-grade, responsive React Single-Page Application (SPA) designed for the **Spring Boot & PostgreSQL HR & Payroll Management System**.

![UI Preview](https://img.shields.io/badge/React-18-blue?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)

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

3. Setup environment variables (optional, defaults to `http://localhost:8080/api`):
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```
