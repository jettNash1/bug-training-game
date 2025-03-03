# AWS Deployment Guide for Bug Training Quiz Game

This guide provides step-by-step instructions for deploying the Bug Training Quiz Game on AWS infrastructure.

## Architecture Overview

The deployment consists of:
- **Amazon EC2**: Hosts the Node.js backend server
- **Amazon S3 + CloudFront**: Hosts the static frontend files
- **Amazon DocumentDB** or **MongoDB Atlas**: Database (MongoDB-compatible)
- **Amazon Route 53** (optional): DNS management for custom domains

## Prerequisites

1. AWS account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed locally
4. Git installed

## Step 1: Set Up the Database

### Option A: Continue Using MongoDB Atlas

1. Keep your existing MongoDB Atlas cluster
2. Update security settings to allow connections from your EC2 instance:
   - Go to Network Access in MongoDB Atlas
   - Add the public IP of your EC2 instance or use 0.0.0.0/0 (not recommended for production)

### Option B: Migrate to Amazon DocumentDB

1. Create a DocumentDB cluster:
   ```
   aws docdb create-db-cluster \
     --db-cluster-identifier bug-training-game-cluster \
     --engine docdb \
     --master-username <username> \
     --master-user-password <password> \
     --vpc-security-group-ids <security-group-id> \
     --db-subnet-group-name <subnet-group>
   ```

2. Create an EC2 instance in the same VPC to use as a jump box for data migration
3. Install MongoDB tools on the jump box
4. Export data from MongoDB Atlas:
   ```
   mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/database"
   ```
5. Import data to DocumentDB:
   ```
   mongorestore --host=<docdb-endpoint> --port=27017 --username=<username> --password=<password> --ssl --sslCAFile=rds-combined-ca-bundle.pem dump/
   ```

## Step 2: Launch EC2 Instance for Backend

1. Create an EC2 instance:
   ```
   aws ec2 run-instances \
     --image-id ami-0c55b159cbfafe1f0 \
     --instance-type t2.micro \
     --key-name your-key-pair \
     --security-group-ids sg-xxxxxxxx \
     --subnet-id subnet-xxxxxxxx \
     --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=bug-training-game-backend}]'
   ```

2. Connect to your instance:
   ```
   ssh -i "your-key-pair.pem" ec2-user@your-instance-public-dns
   ```

3. Install Node.js and dependencies:
   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 14
   nvm use 14
   ```

4. Clone your repository:
   ```
   git clone https://github.com/your-username/bug-training-game.git
   cd bug-training-game
   ```

5. Set up environment variables:
   ```
   cp .env.aws .env
   nano .env  # Edit with your specific values
   ```

6. Install dependencies and start the server:
   ```
   npm install
   npm start
   ```

7. Set up PM2 for process management:
   ```
   npm install -g pm2
   pm2 start backend/server.js --name bug-training-game
   pm2 startup
   pm2 save
   ```

## Step 3: Set Up S3 Bucket for Frontend

1. Create an S3 bucket:
   ```
   aws s3 mb s3://bug-training-game-frontend
   ```

2. Enable static website hosting:
   ```
   aws s3 website s3://bug-training-game-frontend --index-document index.html --error-document index.html
   ```

3. Set bucket policy for public access:
   ```
   aws s3api put-bucket-policy --bucket bug-training-game-frontend --policy '{
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
   }'
   ```

4. Build and deploy the frontend:
   ```
   # From your local machine
   cd bug-training-game/frontend
   # Update config.js with your EC2 instance's public DNS or IP
   aws s3 sync . s3://bug-training-game-frontend --exclude "node_modules/*" --exclude ".git/*"
   ```

## Step 4: Set Up CloudFront Distribution

1. Create a CloudFront distribution:
   ```
   aws cloudfront create-distribution \
     --origin-domain-name bug-training-game-frontend.s3.amazonaws.com \
     --default-root-object index.html
   ```

2. Configure CloudFront settings:
   - Enable HTTPS
   - Set cache behaviors
   - Configure error pages

3. Wait for the distribution to deploy (can take up to 30 minutes)

## Step 5: Set Up Security

1. Configure EC2 security group to allow only necessary traffic:
   - HTTP (80) and HTTPS (443) from anywhere
   - SSH (22) from your IP only

2. Set up HTTPS:
   - Obtain an SSL certificate from AWS Certificate Manager
   - Configure CloudFront to use the certificate
   - Configure EC2 with HTTPS (using Nginx or similar)

3. Set up a proper firewall on the EC2 instance:
   ```
   sudo yum install -y iptables-services
   sudo systemctl enable iptables
   sudo systemctl start iptables
   sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
   sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
   sudo iptables -A INPUT -j DROP
   sudo service iptables save
   ```

## Step 6: Set Up Monitoring and Logging

1. Configure CloudWatch for monitoring:
   ```
   aws cloudwatch put-metric-alarm \
     --alarm-name EC2-CPU-Utilization \
     --alarm-description "Alarm when CPU exceeds 70%" \
     --metric-name CPUUtilization \
     --namespace AWS/EC2 \
     --statistic Average \
     --period 300 \
     --threshold 70 \
     --comparison-operator GreaterThanThreshold \
     --dimensions Name=InstanceId,Value=i-xxxxxxxx \
     --evaluation-periods 2 \
     --alarm-actions arn:aws:sns:region:account-id:topic-name
   ```

2. Set up CloudWatch Logs for application logging:
   ```
   # Install CloudWatch Logs agent
   sudo yum install -y awslogs
   sudo systemctl enable awslogsd.service
   sudo systemctl start awslogsd.service
   ```

## Step 7: Testing

1. Test the frontend by accessing your CloudFront URL
2. Test API endpoints using tools like Postman
3. Verify database connections and data integrity

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your backend CORS settings include your CloudFront domain
2. **Connection timeouts**: Check security groups and network ACLs
3. **Database connection issues**: Verify connection strings and network access

### Logs to Check

1. EC2 application logs: `/var/log/messages`
2. PM2 logs: `pm2 logs`
3. CloudWatch Logs
4. S3 access logs
5. CloudFront logs

## Maintenance

1. **Backups**: Set up regular database backups
2. **Updates**: Regularly update dependencies and OS packages
3. **Monitoring**: Review CloudWatch metrics and set up alerts

## Cost Optimization

1. Use Reserved Instances for EC2 to reduce costs
2. Configure CloudFront caching appropriately
3. Monitor and optimize database usage
4. Consider using AWS Free Tier resources where possible

## Security Best Practices

1. Regularly rotate credentials
2. Use IAM roles instead of access keys where possible
3. Enable AWS CloudTrail for auditing
4. Implement least privilege access
5. Regularly scan for vulnerabilities 