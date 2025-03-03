# Complete AWS Deployment Guide: S3 Frontend + EC2 Backend

## Phase 1: AWS Account Setup

1. **Create AWS Account** (if you don't have one):
   - Go to [AWS Console](https://aws.amazon.com/)
   - Click "Create an AWS Account"
   - Follow the signup process
   - Add a payment method
   - Verify your identity

2. **Set up IAM User**:
   ```bash
   # Log into AWS Console
   1. Go to IAM Dashboard
   2. Click "Users" → "Add user"
   3. Username: bug-game-deployer
   4. Select "Access key - Programmatic access"
   5. Click "Next: Permissions"
   6. Click "Attach existing policies directly"
   7. Search and select:
      - AmazonS3FullAccess
      - CloudFrontFullAccess
      - AWSCloudFormationFullAccess
   8. Click "Next: Tags" → "Next: Review" → "Create user"
   9. IMPORTANT: Download the credentials CSV file
   ```

3. **Install AWS CLI**:
   ```bash
   # On Windows (PowerShell as Administrator)
   msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

   # Verify installation
   aws --version

   # Configure AWS CLI
   aws configure
   # Enter the Access Key ID from credentials.csv
   # Enter the Secret Access Key from credentials.csv
   # Region: us-east-1 (or your preferred region)
   # Output format: json
   ```

## Phase 2: S3 Frontend Setup

1. **Create S3 Bucket**:
   ```bash
   # Create bucket (replace bucket-name with your desired name)
   aws s3 mb s3://bug-training-game-frontend --region us-east-1

   # Enable static website hosting
   aws s3 website s3://bug-training-game-frontend --index-document index.html --error-document index.html
   ```

2. **Configure S3 Bucket Policy**:
   ```bash
   # Create bucket-policy.json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::bug-training-game-frontend/*"
       }
     ]
   }

   # Apply the policy
   aws s3api put-bucket-policy --bucket bug-training-game-frontend --policy file://bucket-policy.json
   ```

3. **Enable CORS on S3 Bucket**:
   ```bash
   # Create cors-policy.json
   {
     "CORSRules": [
       {
         "AllowedOrigins": ["*"],
         "AllowedMethods": ["GET", "HEAD"],
         "AllowedHeaders": ["*"],
         "MaxAgeSeconds": 3000
       }
     ]
   }

   # Apply CORS policy
   aws s3api put-bucket-cors --bucket bug-training-game-frontend --cors-configuration file://cors-policy.json
   ```

## Phase 3: EC2 Backend Setup

1. **Create Security Group**:
   ```bash
   # Create security group
   aws ec2 create-security-group \
     --group-name bug-game-backend-sg \
     --description "Security group for bug training game backend"

   # Add inbound rules
   aws ec2 authorize-security-group-ingress \
     --group-name bug-game-backend-sg \
     --protocol tcp \
     --port 22 \
     --cidr $(curl -s https://checkip.amazonaws.com)/32

   aws ec2 authorize-security-group-ingress \
     --group-name bug-game-backend-sg \
     --protocol tcp \
     --port 80 \
     --cidr 0.0.0.0/0

   aws ec2 authorize-security-group-ingress \
     --group-name bug-game-backend-sg \
     --protocol tcp \
     --port 443 \
     --cidr 0.0.0.0/0
   ```

2. **Create Key Pair**:
   ```bash
   # Create key pair
   aws ec2 create-key-pair \
     --key-name bug-game-key \
     --query 'KeyMaterial' \
     --output text > bug-game-key.pem

   # Set correct permissions
   chmod 400 bug-game-key.pem
   ```

3. **Launch EC2 Instance**:
   ```bash
   # Get Ubuntu AMI ID (20.04 LTS)
   aws ec2 describe-images \
     --owners 099720109477 \
     --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*" \
     --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
     --output text

   # Launch instance (replace ami-id with the one from above)
   aws ec2 run-instances \
     --image-id ami-id \
     --count 1 \
     --instance-type t2.micro \
     --key-name bug-game-key \
     --security-group-ids bug-game-backend-sg \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=bug-game-backend}]'

   # Get instance public IP
   aws ec2 describe-instances \
     --filters "Name=tag:Name,Values=bug-game-backend" \
     --query 'Reservations[].Instances[].PublicIpAddress' \
     --output text
   ```

## Phase 4: Backend Server Setup

1. **Connect to EC2**:
   ```bash
   ssh -i bug-game-key.pem ubuntu@<your-instance-ip>
   ```

2. **Initial Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install essential packages
   sudo apt install -y git curl build-essential nginx

   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 16
   nvm use 16
   nvm alias default 16

   # Verify installations
   node --version
   npm --version
   ```

3. **Clone and Setup Application**:
   ```bash
   # Create app directory
   mkdir -p ~/apps
   cd ~/apps

   # Clone repository
   git clone https://github.com/your-username/bug-training-game.git
   cd bug-training-game

   # Install dependencies
   npm install

   # Install PM2
   npm install -g pm2
   ```

4. **Create PM2 Ecosystem File**:
   ```bash
   # Create ecosystem.config.js
   cat > ecosystem.config.js << 'EOL'
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
   EOL
   ```

5. **Configure Nginx**:
   ```bash
   # Create Nginx configuration
   sudo tee /etc/nginx/sites-available/bug-training-game << 'EOL'
   server {
       listen 80;
       server_name _;

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
   EOL

   # Enable site
   sudo ln -s /etc/nginx/sites-available/bug-training-game /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup Environment Variables**:
   ```bash
   # Create .env file
   cat > .env << 'EOL'
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   ALLOWED_ORIGINS=https://your-s3-bucket.s3-website-us-east-1.amazonaws.com
   EOL
   ```

7. **Start Application**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Phase 5: Frontend Deployment

1. **Update Frontend Configuration**:
   ```javascript
   // frontend/config.js
   export const config = {
     apiUrl: process.env.NODE_ENV === 'production'
       ? 'http://your-ec2-public-ip'  // Replace with your EC2 IP
       : 'http://localhost:3000',
   };
   ```

2. **Deploy Frontend to S3**:
   ```bash
   # From your local machine
   cd frontend
   
   # Deploy to S3
   aws s3 sync . s3://bug-training-game-frontend \
     --exclude "node_modules/*" \
     --exclude ".git/*" \
     --delete
   ```

## Phase 6: CloudFront Setup

1. **Create CloudFront Distribution**:
   ```bash
   # Create distribution-config.json
   {
     "CallerReference": "bug-game-$(date +%s)",
     "Origins": {
       "Quantity": 1,
       "Items": [
         {
           "Id": "S3-bug-training-game-frontend",
           "DomainName": "bug-training-game-frontend.s3.amazonaws.com",
           "S3OriginConfig": {
             "OriginAccessIdentity": ""
           }
         }
       ]
     },
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-bug-training-game-frontend",
       "ViewerProtocolPolicy": "redirect-to-https",
       "AllowedMethods": {
         "Quantity": 2,
         "Items": ["GET", "HEAD"],
         "CachedMethods": {
           "Quantity": 2,
           "Items": ["GET", "HEAD"]
         }
       },
       "ForwardedValues": {
         "QueryString": false,
         "Cookies": {
           "Forward": "none"
         }
       },
       "MinTTL": 0,
       "DefaultTTL": 86400,
       "MaxTTL": 31536000
     },
     "Enabled": true,
     "DefaultRootObject": "index.html"
   }

   # Create distribution
   aws cloudfront create-distribution --distribution-config file://distribution-config.json
   ```

## Phase 7: GitHub Actions Setup

1. **Add GitHub Secrets**:
   ```
   Go to your GitHub repository:
   1. Settings → Secrets → New repository secret
   2. Add the following secrets:
      - EC2_HOST: Your EC2 public IP
      - EC2_USERNAME: ubuntu
      - EC2_PRIVATE_KEY: Content of bug-game-key.pem
      - AWS_ACCESS_KEY_ID: From credentials.csv
      - AWS_SECRET_ACCESS_KEY: From credentials.csv
      - CLOUDFRONT_DISTRIBUTION_ID: Your CloudFront distribution ID
   ```

2. **Create GitHub Actions Workflow**:
   ```bash
   # .github/workflows/deploy.yml
   name: Deploy to AWS

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
             username: ubuntu
             key: ${{ secrets.EC2_PRIVATE_KEY }}
             script: |
               cd ~/apps/bug-training-game
               git pull
               npm install
               pm2 restart bug-training-game
         
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
             aws cloudfront create-invalidation \
               --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
               --paths "/*"
   ```

## Phase 8: Testing and Verification

1. **Test Backend API**:
   ```bash
   # Test using curl
   curl http://your-ec2-ip:3000/api/health

   # Check logs
   pm2 logs
   ```

2. **Test Frontend**:
   - Open CloudFront URL in browser
   - Test all functionality
   - Verify API calls are working

3. **Monitor Deployment**:
   ```bash
   # Check EC2 status
   pm2 status
   sudo systemctl status nginx

   # Check S3 sync
   aws s3 ls s3://bug-training-game-frontend

   # Check CloudFront
   aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
   ```

## Phase 9: Ongoing Maintenance

1. **Setup Monitoring**:
   ```bash
   # Install CloudWatch agent
   sudo apt install -y amazon-cloudwatch-agent

   # Configure CloudWatch
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
   ```

2. **Setup Backups**:
   ```bash
   # Create backup script
   cat > ~/backup.sh << 'EOL'
   #!/bin/bash
   
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   BACKUP_DIR="/home/ubuntu/backups"
   
   mkdir -p $BACKUP_DIR
   
   # Backup MongoDB
   mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/db_backup_$TIMESTAMP"
   
   # Compress backup
   cd $BACKUP_DIR
   tar -czf "db_backup_$TIMESTAMP.tar.gz" "db_backup_$TIMESTAMP"
   rm -rf "db_backup_$TIMESTAMP"
   
   # Upload to S3
   aws s3 cp "db_backup_$TIMESTAMP.tar.gz" s3://your-backup-bucket/
   
   # Cleanup old backups
   find $BACKUP_DIR -type f -mtime +7 -name '*.tar.gz' -delete
   EOL

   chmod +x ~/backup.sh

   # Add to crontab
   (crontab -l 2>/dev/null; echo "0 0 * * * /home/ubuntu/backup.sh") | crontab -
   ```

## Phase 10: Security Hardening

1. **Configure UFW**:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Secure SSH**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Add/modify:
   PermitRootLogin no
   PasswordAuthentication no
   
   sudo systemctl restart sshd
   ```

3. **Enable Automatic Updates**:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

## Troubleshooting Guide

1. **Backend Issues**:
   ```bash
   # Check application logs
   pm2 logs

   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log

   # Check system logs
   journalctl -u nginx
   journalctl -u pm2-ubuntu
   ```

2. **Frontend Issues**:
   ```bash
   # Check S3 bucket policy
   aws s3api get-bucket-policy --bucket bug-training-game-frontend

   # Check CloudFront distribution
   aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

   # Verify frontend files
   aws s3 ls s3://bug-training-game-frontend
   ```

3. **Deployment Issues**:
   ```bash
   # Check GitHub Actions
   - Go to repository → Actions tab
   - Check the latest workflow run
   - Review logs for errors

   # Verify EC2 permissions
   ls -la ~/apps/bug-training-game
   sudo systemctl status nginx
   ``` 