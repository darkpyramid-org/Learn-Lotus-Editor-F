# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Lotus Hieroglyphic SVG Editor to various environments, from development staging to production deployment. The application supports multiple deployment strategies including static hosting, containerized deployment, and cloud platforms.

## Deployment Strategies

### Static Site Deployment

**Recommended for**: Small to medium traffic, cost-effective hosting
**Platforms**: Netlify, Vercel, GitHub Pages, AWS S3 + CloudFront

### Containerized Deployment

**Recommended for**: Scalable applications, enterprise environments
**Platforms**: Docker, Kubernetes, AWS ECS, Google Cloud Run

### Cloud Platform Deployment

**Recommended for**: High availability, auto-scaling requirements
**Platforms**: AWS, Google Cloud Platform, Microsoft Azure

## Build Process

### Production Build

**Standard Build**
```bash
# Install dependencies
npm ci --only=production

# Build for production
npm run build

# Output directory: dist/
# Contains optimized HTML, CSS, JS, and assets
```

**Build Configuration**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-slider']
        }
      }
    }
  }
})
```

### Environment-Specific Builds

**Development Build**
```bash
# Development build with source maps
VITE_APP_ENV=development npm run build
```

**Staging Build**
```bash
# Staging build with debugging enabled
VITE_APP_ENV=staging npm run build
```

**Production Build**
```bash
# Production build optimized for performance
VITE_APP_ENV=production npm run build
```

## Static Site Deployment

### Netlify Deployment

**Automatic Deployment**
1. Connect GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

**netlify.toml Configuration**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/jseshGlyphs/*"
  [headers.values]
    Cache-Control = "public, max-age=2592000"
```

**Manual Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Vercel Deployment

**Automatic Deployment**
1. Import project from GitHub
2. Vercel auto-detects Vite configuration
3. Deploy with default settings

**vercel.json Configuration**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/jseshGlyphs/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=2592000"
        }
      ]
    }
  ]
}
```

**Manual Deployment**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages Deployment

**GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

**Manual Deployment**
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Build and deploy
npm run build
npm run deploy
```

## Containerized Deployment

### Docker Deployment

**Production Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run**
```bash
# Build Docker image
docker build -t lotus-editor:latest .

# Run container
docker run -d -p 3000:80 --name lotus-editor lotus-editor:latest

# Check health
docker ps
curl http://localhost:3000
```

**Docker Compose Deployment**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  lotus-editor:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Add reverse proxy
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - lotus-editor
```

### Kubernetes Deployment

**Deployment Manifest**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lotus-editor
  labels:
    app: lotus-editor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: lotus-editor
  template:
    metadata:
      labels:
        app: lotus-editor
    spec:
      containers:
      - name: lotus-editor
        image: lotus-editor:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: lotus-editor-service
spec:
  selector:
    app: lotus-editor
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

**Ingress Configuration**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lotus-editor-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - lotus-editor.com
    secretName: lotus-editor-tls
  rules:
  - host: lotus-editor.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lotus-editor-service
            port:
              number: 80
```

**Deploy to Kubernetes**
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/lotus-editor
```

## Cloud Platform Deployment

### AWS Deployment

**AWS S3 + CloudFront**
```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://lotus-editor-static

# Build and sync
npm run build
aws s3 sync dist/ s3://lotus-editor-static --delete

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

**AWS ECS Deployment**
```json
{
  "family": "lotus-editor",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "lotus-editor",
      "image": "your-account.dkr.ecr.region.amazonaws.com/lotus-editor:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lotus-editor",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

**Cloud Run Deployment**
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/lotus-editor

# Deploy to Cloud Run
gcloud run deploy lotus-editor \
  --image gcr.io/PROJECT-ID/lotus-editor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

**App Engine Deployment**
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production

handlers:
- url: /assets
  static_dir: dist/assets
  secure: always

- url: /jseshGlyphs
  static_dir: dist/jseshGlyphs
  secure: always

- url: /.*
  static_files: dist/index.html
  upload: dist/index.html
  secure: always
```

### Microsoft Azure

**Azure Static Web Apps**
```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
    - uses: actions/checkout@v3
      with:
        submodules: true
    - name: Build And Deploy
      id: builddeploy
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        api_location: ""
        output_location: "dist"
```

## Environment Configuration

### Environment Variables

**Production Environment**
```bash
# .env.production
VITE_APP_ENV=production
VITE_APP_TITLE="Lotus Hieroglyphic SVG Editor"
VITE_API_BASE_URL="https://api.lotus-editor.com"
VITE_ENABLE_PERFORMANCE_STATS=false
VITE_SENTRY_DSN="https://your-sentry-dsn"
```

**Staging Environment**
```bash
# .env.staging
VITE_APP_ENV=staging
VITE_APP_TITLE="Lotus Editor - Staging"
VITE_API_BASE_URL="https://staging-api.lotus-editor.com"
VITE_ENABLE_PERFORMANCE_STATS=true
VITE_SENTRY_DSN="https://your-staging-sentry-dsn"
```

### Configuration Management

**Docker Environment Variables**
```bash
# Pass environment variables to container
docker run -d \
  -p 3000:80 \
  -e NODE_ENV=production \
  -e VITE_APP_ENV=production \
  --name lotus-editor \
  lotus-editor:latest
```

**Kubernetes ConfigMap**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lotus-editor-config
data:
  NODE_ENV: "production"
  VITE_APP_ENV: "production"
  VITE_API_BASE_URL: "https://api.lotus-editor.com"
```

## Performance Optimization

### CDN Configuration

**CloudFront Settings**
```json
{
  "Origins": [
    {
      "DomainName": "lotus-editor.s3.amazonaws.com",
      "OriginPath": "",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-lotus-editor",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "managed-caching-optimized",
    "Compress": true
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/assets/*",
      "TargetOriginId": "S3-lotus-editor",
      "CachePolicyId": "managed-caching-optimized-for-uncompressed-objects",
      "TTL": 31536000
    },
    {
      "PathPattern": "/jseshGlyphs/*",
      "TargetOriginId": "S3-lotus-editor",
      "CachePolicyId": "managed-caching-optimized",
      "TTL": 2592000
    }
  ]
}
```

### Compression Configuration

**Nginx Compression**
```nginx
# nginx.conf
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Brotli compression (if available)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;
}
```

### Caching Strategy

**HTTP Headers**
```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /jseshGlyphs/ {
    expires 30d;
    add_header Cache-Control "public";
}

location / {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## Monitoring and Logging

### Application Monitoring

**Health Check Endpoint**
```javascript
// Add to vite.config.ts for development
export default defineConfig({
  server: {
    proxy: {
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
          });
        }
      }
    }
  }
})
```

**Docker Health Check**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

### Error Tracking

**Sentry Integration**
```javascript
// src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 0.1,
  });
}
```

### Performance Monitoring

**Web Vitals Tracking**
```javascript
// src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Security Considerations

### HTTPS Configuration

**SSL Certificate Setup**
```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d lotus-editor.com

# Manual certificate installation
sudo nginx -t
sudo systemctl reload nginx
```

**Security Headers**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';" always;
```

### Environment Security

**Secrets Management**
```bash
# Use environment-specific secret management
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/lotus-editor/config

# Kubernetes Secrets
kubectl create secret generic lotus-editor-secrets \
  --from-literal=api-key=your-api-key \
  --from-literal=database-url=your-db-url
```

## Rollback Procedures

### Docker Rollback

```bash
# Tag current version
docker tag lotus-editor:latest lotus-editor:backup

# Rollback to previous version
docker pull lotus-editor:v1.0.0
docker stop lotus-editor
docker rm lotus-editor
docker run -d -p 3000:80 --name lotus-editor lotus-editor:v1.0.0
```

### Kubernetes Rollback

```bash
# Check rollout history
kubectl rollout history deployment/lotus-editor

# Rollback to previous version
kubectl rollout undo deployment/lotus-editor

# Rollback to specific revision
kubectl rollout undo deployment/lotus-editor --to-revision=2
```

### Static Site Rollback

```bash
# Netlify rollback
netlify sites:list
netlify api listSiteDeploys --data='{"site_id":"your-site-id"}'
netlify api restoreSiteDeploy --data='{"site_id":"your-site-id","deploy_id":"previous-deploy-id"}'

# Vercel rollback
vercel ls
vercel rollback [deployment-url]
```

## Troubleshooting

### Common Deployment Issues

**Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check for environment-specific issues
NODE_ENV=production npm run build
```

**Container Issues**
```bash
# Debug container
docker run -it --entrypoint /bin/sh lotus-editor:latest

# Check logs
docker logs lotus-editor

# Inspect container
docker inspect lotus-editor
```

**Network Issues**
```bash
# Test connectivity
curl -I http://localhost:3000
wget --spider http://localhost:3000

# Check port binding
netstat -tulpn | grep :3000
```

### Performance Issues

**Slow Loading**
- Check CDN configuration
- Verify compression settings
- Analyze bundle size with `npm run build -- --analyze`
- Monitor network requests in browser DevTools

**High Memory Usage**
- Increase container memory limits
- Check for memory leaks in application
- Monitor garbage collection patterns
- Optimize image and asset sizes

## Maintenance

### Regular Updates

**Security Updates**
```bash
# Update dependencies
npm audit
npm update

# Rebuild and redeploy
npm run build
docker build -t lotus-editor:latest .
```

**Performance Monitoring**
- Monitor Core Web Vitals
- Check error rates and response times
- Review resource utilization
- Analyze user behavior patterns

**Backup Procedures**
- Regular database backups (if applicable)
- Configuration backup
- SSL certificate backup
- Deployment artifact backup

---

For security considerations, see [SECURITY.md](SECURITY.md).
For development setup, see [PROJECT_SETUP.md](PROJECT_SETUP.md).
For monitoring setup, see [TECHNOLOGIES.md](TECHNOLOGIES.md).