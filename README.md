# HR & Payroll Management System — Modern UI

Enterprise-grade, responsive React Single-Page Application (SPA) designed for the **Spring Boot & PostgreSQL HR & Payroll Management System**.

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

- **🎨 Modern Enterprise Layout**: Full-height dark slate sidebar (`#1c2434`), clean white top bar with `⌘K` Quick Search & Language Switcher, and a crisp light-gray (`#f4f7fa`) workspace canvas.
- **📊 Executive Dashboard**:
  - Real-time KPI sparkline cards (Total Employees, Present Today, On Leave, Est. Monthly Payroll).
  - Interactive **Headcount Trend** line chart (`7d` / `30d` / `90d`), **Department Headcount** SVG donut chart, **Workforce Distribution** radial ring, and **Attendance This Week** bar chart.
  - **Upcoming Events** combining live pending leave requests with monthly HR milestones, plus a live **Today's Attendance Stream** table with department enrichment, sorting, filtering, and pagination.
- **👥 Employee Directory**: Complete staff profiles, salary management, department assignments, live search/filtering, column sorting (`↑↓`), pagination (`5`/`10`/`20`/`50` rows), and clean white modals.
- **🏢 Department Management**: Clean sortable DataTable for organizational divisions, staff headcounts, descriptions, and CRUD modals.
- **🕒 Attendance Tracking**: Daily attendance logs, check-in/out stamps, status monitoring (Present, Late, Absent, Half-Day), overtime calculation, and monthly summary cards.
- **📅 Leave Requests**: Employee leave submissions, status filter tabs, review/approval/rejection flows, and cancellation modals.
- **💰 Automated Payroll Processing**:
  - Monthly automated wage calculation (Base Salary, Allowances, Overtime, Bonus, Deductions, Tax, Net Pay).
  - Disbursement tracking (`CALCULATED`, `APPROVED`, `PAID`).
  - **Export to CSV**: UTF-8 BOM formatted spreadsheet download with individual employee lines and grand totals.
  - **A4 Print / Save as PDF**: Certified managerial payroll voucher formatted for standard A4 paper with corporate letterhead, 11-column schedule, and 3 formal corporate signature blocks.
- **📈 Reports & Analytics**: Printable high-level managerial audits, department salary breakdowns, and CSV exports.
- **🛡️ User Administration (Admin Only)**: System user creation and role management (`ADMIN`, `HR`).
- **🌐 Full Bilingual Support (🇰🇭 Khmer / 🇬🇧 English)**: Instant language toggle (on both Login and Dashboard) with typography optimized for **Khmer OS Battambang** (with Google Font **Battambang** fallback) & **Inter**.
- **🔒 Enterprise Security**:
  - Split-screen production Login UI with clean light authentication form and 5-minute brute-force cooldown protection.
  - JWT Expiration Watchdog & client-side expiration validation.
  - Automated 30-minute inactivity session timeout.
  - Synchronized multi-tab session termination on logout.
  - Role-Based Access Control (RBAC) route guards.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 3.4
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
