# 🚀 SubHub Production Deployment Guide

## 📋 **ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SERVER                       │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   POCKETBASE    │    │        SUBHUB APP               │ │
│  │   (Backend)     │    │       (Frontend)                │ │
│  │                 │    │                                 │ │
│  │ Port: 8090      │◄──►│ Static Files (Nginx)            │ │
│  │                 │    │                                 │ │
│  │ • Database      │    │ • User Interface                │ │
│  │ • API           │    │ • /admin (Business Dashboard)   │ │
│  │ • Admin Panel   │    │ • User Registration/Login       │ │
│  │   (Hidden)      │    │ • Subscription Management       │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **DEPLOYMENT OPTIONS**

### **Option 1: VPS/Cloud Server (Recommended)**
- **Cost**: $5-20/month
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2
- **Best for**: Full control, custom domain, SSL

### **Option 2: Vercel + Railway/Render**
- **Cost**: Free tier available
- **Frontend**: Vercel (free)
- **Backend**: Railway/Render ($5-10/month)
- **Best for**: Easy deployment, automatic scaling

### **Option 3: Docker + Any Cloud**
- **Cost**: Varies by provider
- **Deployment**: Single container
- **Best for**: Consistent environments

## 🔧 **OPTION 1: VPS DEPLOYMENT (COMPLETE GUIDE)**

### **Step 1: Server Setup**

```bash
# 1. Create Ubuntu 22.04 server
# 2. Connect via SSH
ssh root@your-server-ip

# 3. Update system
apt update && apt upgrade -y

# 4. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 5. Install Nginx
apt install nginx -y

# 6. Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# 7. Create app user
adduser subhub
usermod -aG sudo subhub
su - subhub
```

### **Step 2: Deploy Application**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/SubHub.git
cd SubHub

# 2. Build frontend
cd app
npm install
npm run build

# 3. Set up PocketBase
cd ../backend
chmod +x pocketbase

# 4. Create systemd service for PocketBase
sudo nano /etc/systemd/system/pocketbase.service
```

**PocketBase Service File:**
```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=subhub
WorkingDirectory=/home/subhub/SubHub/backend
ExecStart=/home/subhub/SubHub/backend/pocketbase serve --http=127.0.0.1:8090
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# 5. Enable and start PocketBase
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

### **Step 3: Configure Nginx**

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/subhub
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React app)
    location / {
        root /home/subhub/SubHub/app/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PocketBase Admin (restrict access)
    location /_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Restrict to your IP only
        allow YOUR_IP_ADDRESS;
        deny all;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/subhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 4: SSL Certificate**

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### **Step 5: Database Setup**

```bash
# 1. Access PocketBase admin
# Visit: https://yourdomain.com/_/

# 2. Create admin account with your credentials:
# Email: kaiserkong65@gmail.com
# Password: )d?32P!,}LYGLb!

# 3. Create collections as per SETUP_GUIDE.md
```

## 🐳 **OPTION 2: DOCKER DEPLOYMENT**

### **Create Dockerfile**

```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ .
RUN npm run build

# Production stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/

# Copy PocketBase
COPY backend/pocketbase ./
RUN chmod +x ./pocketbase

# Copy frontend build
COPY --from=frontend-build /app/dist ./public

# Expose port
EXPOSE 8090

# Start PocketBase with public dir
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/root/public"]
```

### **Docker Compose**

```yaml
version: '3.8'
services:
  subhub:
    build: .
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/pb_data
    restart: unless-stopped

volumes:
  pb_data:
```

## ☁️ **OPTION 3: VERCEL + RAILWAY**

### **Frontend (Vercel)**

1. **Connect GitHub to Vercel**
2. **Deploy from `/app` directory**
3. **Environment Variables:**
   ```
   VITE_POCKETBASE_URL=https://your-railway-app.railway.app
   ```

### **Backend (Railway)**

1. **Connect GitHub to Railway**
2. **Deploy from `/backend` directory**
3. **Add start command:** `./pocketbase serve --http=0.0.0.0:$PORT`

## 🔒 **SECURITY CHECKLIST**

### **Essential Security Measures:**

- [ ] **SSL Certificate** - Always use HTTPS
- [ ] **Admin Panel Access** - Restrict to your IP only
- [ ] **Strong Passwords** - Use complex admin passwords
- [ ] **Regular Backups** - Backup PocketBase data
- [ ] **Firewall** - Configure UFW or cloud firewall
- [ ] **Updates** - Keep system and dependencies updated

### **PocketBase Security:**

```bash
# Backup database
./pocketbase backup

# Restore database
./pocketbase restore backup_name.zip
```

## 📊 **MONITORING & MAINTENANCE**

### **Log Monitoring:**

```bash
# PocketBase logs
sudo journalctl -u pocketbase -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Performance Monitoring:**

```bash
# System resources
htop
df -h
free -h

# Service status
sudo systemctl status pocketbase
sudo systemctl status nginx
```

## 🚀 **GOING LIVE CHECKLIST**

- [ ] **Domain purchased and configured**
- [ ] **DNS pointing to server**
- [ ] **SSL certificate installed**
- [ ] **Database collections created**
- [ ] **Admin account set up**
- [ ] **Sample data added for testing**
- [ ] **Backup system configured**
- [ ] **Monitoring set up**
- [ ] **Security measures implemented**
- [ ] **Performance tested**

## 🎉 **POST-DEPLOYMENT**

### **Your Live URLs:**
- **Main App**: `https://yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/_/` (restricted)
- **API**: `https://yourdomain.com/api/`

### **Next Steps:**
1. **Test all functionality**
2. **Add real subscription data**
3. **Monitor performance**
4. **Set up analytics**
5. **Plan feature updates**

---

**🎯 Your SubHub app is now PRODUCTION-READY and can handle real users!**
