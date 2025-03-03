# Ubuntu EC2 Deployment Guide for Bug Training Quiz Game

This guide provides step-by-step instructions for deploying the Bug Training Quiz Game on an Ubuntu EC2 instance.

## Initial Server Setup

1. **Connect to your EC2 instance**:
   ```bash
   ssh -i "your-key.pem" ubuntu@your-ec2-public-dns
   ```

2. **Update system packages**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **Install essential tools**:
   ```bash
   sudo apt install -y git curl build-essential nginx
   ```

## Node.js Setup

1. **Install Node.js using nvm**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 14  # or your preferred Node.js version
   nvm use 14
   nvm alias default 14
   ```

2. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```

## Application Setup

1. **Create application directory**:
   ```bash
   mkdir -p ~/apps
   cd ~/apps
   ```

2. **Clone your repository**:
   ```bash
   git clone https://github.com/your-username/bug-training-game.git
   cd bug-training-game
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.aws .env
   nano .env
   ```

## Process Manager (PM2) Setup

1. **Install PM2 globally**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file**:
   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'bug-training-game',
       script: 'backend/server.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

3. **Start the application**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Nginx Setup

1. **Create Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/bug-training-game
   ```

2. **Add the following configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain or EC2 public DNS

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/bug-training-game /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

## SSL Setup with Let's Encrypt

1. **Install Certbot**:
   ```bash
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Automated Deployment Setup

1. **Create deployment user and setup SSH**:
   ```bash
   sudo adduser deployer
   sudo usermod -aG sudo deployer
   sudo su - deployer
   mkdir ~/.ssh
   chmod 700 ~/.ssh
   touch ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

2. **Add your deployment key to authorized_keys**:
   ```bash
   nano ~/.ssh/authorized_keys
   # Add your deployment public key here
   ```

3. **Create deployment script**:
   ```bash
   # ~/apps/bug-training-game/deploy.sh
   #!/bin/bash
   
   cd ~/apps/bug-training-game
   git pull
   npm install
   pm2 restart bug-training-game
   ```

4. **Make script executable**:
   ```bash
   chmod +x ~/apps/bug-training-game/deploy.sh
   ```

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to Ubuntu EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: deployer
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            cd ~/apps/bug-training-game
            ./deploy.sh
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy Frontend to S3
        run: |
          aws s3 sync frontend/ s3://bug-training-game-frontend/ --delete
          
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## Monitoring Setup

1. **Install Node Exporter for system metrics** (optional):
   ```bash
   sudo useradd --no-create-home --shell /bin/false node_exporter
   cd ~
   curl -LO https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
   tar xvf node_exporter-1.3.1.linux-amd64.tar.gz
   sudo cp node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin
   sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
   ```

2. **Create systemd service for Node Exporter**:
   ```bash
   sudo nano /etc/systemd/system/node_exporter.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=Node Exporter
   Wants=network-online.target
   After=network-online.target

   [Service]
   User=node_exporter
   Group=node_exporter
   Type=simple
   ExecStart=/usr/local/bin/node_exporter

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start Node Exporter**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start node_exporter
   sudo systemctl enable node_exporter
   ```

## Maintenance Tasks

1. **Log Rotation Setup**:
   ```bash
   sudo nano /etc/logrotate.d/bug-training-game
   ```
   
   Add:
   ```
   /home/ubuntu/apps/bug-training-game/logs/*.log {
       daily
       rotate 7
       compress
       delaycompress
       notifempty
       missingok
       create 0640 ubuntu ubuntu
   }
   ```

2. **Automated Updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

## Security Hardening

1. **Configure UFW (Uncomplicated Firewall)**:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Secure Shared Memory**:
   ```bash
   echo "tmpfs     /run/shm     tmpfs     defaults,noexec,nosuid     0     0" | sudo tee -a /etc/fstab
   ```

3. **Secure SSH Configuration**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Add/modify:
   ```
   PermitRootLogin no
   PasswordAuthentication no
   ```

4. **Restart SSH service**:
   ```bash
   sudo systemctl restart sshd
   ```

## Troubleshooting

### Common Issues and Solutions

1. **Application won't start**:
   ```bash
   pm2 logs
   journalctl -u nginx
   ```

2. **Permission issues**:
   ```bash
   sudo chown -R ubuntu:ubuntu ~/apps/bug-training-game
   sudo chmod -R 755 ~/apps/bug-training-game
   ```

3. **Nginx 502 Bad Gateway**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   pm2 status
   ```

### Useful Commands

```bash
# Check application status
pm2 status
pm2 logs

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Monitor system resources
htop
df -h
free -m

# View real-time logs
tail -f /var/log/nginx/error.log
pm2 logs bug-training-game
```

## Backup Strategy

1. **Database Backup Script**:
   ```bash
   #!/bin/bash
   # ~/backup.sh
   
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/home/ubuntu/backups"
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Backup MongoDB data
   mongodump --uri="your_mongodb_uri" --out="$BACKUP_DIR/db_backup_$TIMESTAMP"
   
   # Compress backup
   cd $BACKUP_DIR
   tar -czf "db_backup_$TIMESTAMP.tar.gz" "db_backup_$TIMESTAMP"
   rm -rf "db_backup_$TIMESTAMP"
   
   # Upload to S3 (optional)
   aws s3 cp "db_backup_$TIMESTAMP.tar.gz" s3://your-backup-bucket/
   
   # Keep only last 7 days of backups
   find $BACKUP_DIR -type f -mtime +7 -name '*.tar.gz' -delete
   ```

2. **Set up cron job for automated backups**:
   ```bash
   crontab -e
   ```
   
   Add:
   ```
   0 0 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
   ``` 