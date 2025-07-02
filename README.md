# 📊 Log Monitoring & Real-Time Analytics System

This project is a real-time log monitoring and analytics dashboard built with **Node.js**, **Express**, **MongoDB**, and **Socket.IO**. It simulates log generation from different services (`auth`, `payments`, `notifications`) and provides a REST API to fetch logs and real-time statistics.

---

## 🧩 Features

- ✅ Real-time log generation every second
- 📡 Live updates to connected clients using Socket.IO
- 🔍 Filterable API to query logs by:
  - Level (`INFO`, `WARN`, `ERROR`)
  - Service (`auth`, `payments`, `notifications`)
  - Date range
  - Search keyword
- 📈 Stats API to return error rates and counts in a time window
- 🗃️ MongoDB-based persistent log storage
- 🚦 In-memory caching for performance on frequent stats update

---

## 🚀 Getting Started

### ⚙️ Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) running locally or via MongoDB Atlas

---

## 🧰 Installation

1. **Clone the repository**

```bash
git clone https://github.com/developerdesigner18/Backend-Node-Task.git
cd log-monitoring-app


## 📦 Installation

```bash
npm install

### ⚙️ Project Execution

```bash
npm run dev

---