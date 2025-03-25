#!/bin/bash

# Development Database Cleanup Script
# This script will clean up all tables in the development database
# WARNING: This script will delete all data. Use only in development!

# Check if we're in the correct directory
if [ ! -f "pom.xml" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Load database configuration from application.properties
DB_URL=$(grep "spring.datasource.url" src/main/resources/application.properties | cut -d'=' -f2 | tr -d ' ')
DB_NAME=$(echo $DB_URL | sed 's/.*\/\([^?]*\).*/\1/')
DB_USER=$(grep "spring.datasource.username" src/main/resources/application.properties | cut -d'=' -f2 | tr -d ' ')
DB_PASSWORD=$(grep "spring.datasource.password" src/main/resources/application.properties | cut -d'=' -f2 | tr -d ' ')

# Get the PostgreSQL container ID
CONTAINER_ID=$(docker ps -q -f name=job-tracker-db)

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: PostgreSQL container not found. Make sure it's running."
    exit 1
fi

# Confirm with the user
echo "WARNING: This will delete all data in the development database!"
echo "Database: $DB_NAME"
echo "Container: $CONTAINER_ID"
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Executing database cleanup..."
    # Copy the SQL file into the container
    docker cp src/main/resources/db/cleanup-dev.sql $CONTAINER_ID:/cleanup-dev.sql
    
    # Execute the SQL file inside the container
    docker exec -i $CONTAINER_ID psql -U $DB_USER -d $DB_NAME -f /cleanup-dev.sql
    
    # Remove the SQL file from the container
    docker exec $CONTAINER_ID rm /cleanup-dev.sql
    
    echo "Cleanup completed!"
else
    echo "Cleanup cancelled."
fi 