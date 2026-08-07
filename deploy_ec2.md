# AWS EC2 Free Tier Deployment Guide

This guide describes how to deploy the Supply Chain Management (SCM) multi-container application to a single **EC2** (Amazon Elastic Compute Cloud) virtual machine on **AWS** (Amazon Web Services) using the **Free Tier**. We will deploy the stack configured in [docker-compose.yml](file:///c:/Projects/SCM/docker-compose.yml).

---

## Prerequisites
* An active AWS Account.
* An **SSH** (Secure Shell) client installed locally (standard on Windows/macOS/Linux terminals).

---

## Step 1: Launch an EC2 Instance

1. Log in to the AWS Management Console and navigate to the **EC2 Dashboard**.
2. Click **Launch Instance** and configure:
   * **Name**: `scm-deployment-server`
   * **Application and OS Image (AMI)**: Select **Amazon Linux 2023** (Free Tier Eligible).
   * **Instance Type**: Select `t2.micro` (or `t3.micro` depending on your region's Free Tier eligibility).
   * **Key Pair**: Select or create an SSH key pair (`.pem` format) and download it to your local machine.
3. Under **Network Settings**, click **Edit** and set up the Security Group:
   * Create a new security group named `scm-ec2-sg`.
   * Add the following **Inbound Security Group Rules**:
     
     | Type | Port Range | Source | Description |
     | :--- | :--- | :--- | :--- |
     | **SSH** | `22` | **My IP** | Secures access to the host machine command line |
     | **Custom TCP** | `3000` | **Anywhere-IPv4** (`0.0.0.0/0`) | Access to the Next.js Frontend **UI** (User Interface) |
     | **Custom TCP** | `8080` | **Anywhere-IPv4** (`0.0.0.0/0`) | Access to the Spring Boot **API** (Application Programming Interface) |
     | **Custom TCP** | `8090` | **Anywhere-IPv4** (`0.0.0.0/0`) | (Optional) Access to the Kafka UI console |

4. Click **Launch Instance**. Wait a few minutes for the instance status to transition to `Running`.

---

## Step 2: Retrieve Your Public DNS Hostname

To ensure communication works without a paid domain name, AWS automatically assigns a free public **DNS** (Domain Name System) hostname to your running instance.
1. Select your running instance in the EC2 Console.
2. In the details panel at the bottom, locate and copy the **Public IPv4 DNS** (for example: `ec2-54-210-43-12.compute-1.amazonaws.com`).
3. Take note of this URL. We will use it to link the frontend to the backend.

---

## Step 3: Connect and Install Docker Stack

1. Open your local terminal, navigate to where you saved your key pair file, and secure the file permissions:
   ```bash
   chmod 400 your-key-pair.pem
   ```
2. Connect to your EC2 instance via SSH (replace the placeholder hostname with your actual Public IPv4 DNS):
   ```bash
   ssh -i your-key-pair.pem ec2-user@ec2-54-210-43-12.compute-1.amazonaws.com
   ```
3. Update packages and install Docker:
   ```bash
   sudo dnf update -y
   sudo dnf install -y docker
   ```
4. Start the Docker service and enable it to run on boot:
   ```bash
   sudo systemctl enable --now docker
   ```
5. Add the `ec2-user` to the `docker` group so you do not have to prepend `sudo` to every command:
   ```bash
   sudo usermod -aG docker ec2-user
   ```
6. Reload the terminal group settings so changes take effect:
   ```bash
   newgrp docker
   ```
7. Install the latest version of Docker Compose:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
8. Verify both installations:
   ```bash
   docker --version
   docker-compose --version
   ```

---

## Step 4: Clone and Configure the Application

1. Install Git and clone the repository onto your EC2 instance:
   ```bash
   sudo dnf install git -y
   git clone <your-git-repository-url> SCM
   cd SCM
   ```
2. Copy the environment variables template [.env.example](file:///c:/Projects/SCM/.env.example) to create the active environment config:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file using a terminal text editor like `nano`:
   ```bash
   nano .env
   ```
4. Update the **CORS** (Cross-Origin Resource Sharing) origins and public API URL environment variables:
   * Replace `localhost` with your actual EC2 public DNS hostname:
   ```bash
   # Update these values in the .env file:
   NEXT_PUBLIC_API_URL=http://ec2-54-210-43-12.compute-1.amazonaws.com:8080/api
   CORS_ALLOWED_ORIGINS=http://ec2-54-210-43-12.compute-1.amazonaws.com:3000
   ```
   * *Tip: In `nano`, save changes by pressing `Ctrl + O`, hitting `Enter`, and exit with `Ctrl + X`.*

---

## Step 5: Start the SCM Stack

1. Build and run the entire multi-container service in detached background mode:
   ```bash
   docker-compose up -d --build
   ```
2. Monitor progress as Docker downloads and builds your service images:
   ```bash
   # Check the startup status of all containers
   docker-compose ps
   
   # View logs of the Spring Boot backend container
   docker-compose logs -f scm-server
   ```
3. Once running, you can access the user interface in your browser:
   * **SCM Frontend**: `http://ec2-54-210-43-12.compute-1.amazonaws.com:3000`
   * **Spring Swagger API Docs**: `http://ec2-54-210-43-12.compute-1.amazonaws.com:8080/swagger-ui/index.html`

---

## Step 6: Power Down (Stop Accumulating Charges)

When you are done demonstrating the project or testing it, shut down the containers to conserve CPU and disk space:
```bash
docker-compose down
```
If you wish to stop the EC2 instance entirely to make sure it accumulates zero charges, go to your **EC2 Dashboard**, select the instance, and click **Instance State** -> **Stop Instance**.
