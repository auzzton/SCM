# External Setup Guide

This project requires an external PostgreSQL database. We have chosen **Neon** (serverless PostgreSQL) for this project.

## 1. Database Setup (Neon)

1.  **Create an Account**: Go to [https://neon.tech](https://neon.tech) and sign up.
2.  **Create a Project**:
    - Project Name: `scm-project`
    - Postgres Version: 15 or 16
    - Region: Select the one closest to you.
3.  **Get Connection Details**:
    - On the Dashboard, find the "Connection Details" block.
    - Copy the **Connection String** (e.g., `postgres://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`).
    - Note down the separate components if needed:
        - **Host**: `ep-....aws.neon.tech`
        - **Database**: `neondb`
        - **Username**: `...`
        - **Password**: `...`
4.  **Configuration**:
    - We will update `scm-server/src/main/resources/application.properties` with these values later.

## 2. Environment Variables (Optional but Recommended)
For security, you should not commit passwords to git. We will configure the backend to read from environment variables or a local `.env` file (if using a dotenv library or IDE configuration).

For development, we will start by putting them in `application.properties` but **do not commit** that file if it has real passwords.
