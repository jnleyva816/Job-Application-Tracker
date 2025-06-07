#!/bin/bash

echo "=== Job Tracker Connectivity Diagnostic ==="
echo "Running on: $(date)"
echo

# Check if containers are running
echo "1. Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

# Check network connectivity
echo "2. Checking Docker network..."
docker network ls | grep job-tracker
echo

# Test backend health from within the network
echo "3. Testing backend health internally..."
docker exec job-tracker-frontend curl -s http://backend:8080/actuator/health || echo "Backend not accessible from frontend container"
echo

# Test frontend nginx proxy
echo "4. Testing frontend proxy to backend..."
docker exec job-tracker-frontend curl -s http://localhost:80/debug/backend || echo "Nginx proxy not working"
echo

# Check external connectivity
echo "5. Testing external connectivity..."
echo "Frontend: http://localhost:3000"
curl -s -I http://localhost:3000 | head -1 || echo "Frontend not accessible externally"
echo

echo "Backend: http://localhost:8080"
curl -s -I http://localhost:8080/actuator/health | head -1 || echo "Backend not accessible externally"
echo

# Check logs for errors
echo "6. Recent error logs..."
echo "Frontend errors:"
docker logs job-tracker-frontend 2>&1 | grep -i error | tail -5
echo

echo "Backend errors:"
docker logs job-tracker-backend 2>&1 | grep -i error | tail -5
echo

echo "=== Diagnostic Complete ==="
echo "If you're still having issues, please check:"
echo "1. Server firewall allows ports 3000 and 8080"
echo "2. Docker daemon is running properly"
echo "3. Containers have proper network connectivity"
echo "4. CORS settings are configured correctly" 