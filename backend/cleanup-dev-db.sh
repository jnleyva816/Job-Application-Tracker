# Check if we're in the correct directory
if [ ! -f "pom.xml" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Get database configuration from environment variables
DB_NAME=${DB_NAME:-job_tracker_db}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Find PostgreSQL container using Docker commands
echo "Searching for PostgreSQL containers..."

# Method 1: Find by PostgreSQL image
CONTAINER_ID=$(docker ps -q --filter "ancestor=postgres" | head -1)

# Method 2: If not found, search by common PostgreSQL images
if [ -z "$CONTAINER_ID" ]; then
    CONTAINER_ID=$(docker ps -q --filter "ancestor=postgresql" | head -1)
fi

# Method 3: If still not found, search for containers with "postgres" in the image name
if [ -z "$CONTAINER_ID" ]; then
    CONTAINER_ID=$(docker ps --format "{{.ID}}" --filter "status=running" | xargs -I {} docker inspect {} --format "{{.Id}} {{.Config.Image}}" | grep -i postgres | cut -d' ' -f1 | head -1)
fi

# Method 4: Last resort - search by common container names
if [ -z "$CONTAINER_ID" ]; then
    CONTAINER_NAMES=("postgres" "postgresql" "my_postgres_db" "jobtracker_postgres" "jobtracker-postgres" "db")
    for name in "${CONTAINER_NAMES[@]}"; do
        CONTAINER_ID=$(docker ps -q -f name="$name" 2>/dev/null)
        if [ -n "$CONTAINER_ID" ]; then
            break
        fi
    done
fi

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: No PostgreSQL container found."
    echo "Please make sure PostgreSQL is running in Docker."
    echo ""
    echo "Available running containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null || echo "  Docker is not accessible or no containers are running"
    exit 1
fi

# Get container details
CONTAINER_NAME=$(docker ps --format "{{.Names}}" -f id="$CONTAINER_ID")
CONTAINER_IMAGE=$(docker ps --format "{{.Image}}" -f id="$CONTAINER_ID")

echo "✓ Found PostgreSQL container:"
echo "  Name: $CONTAINER_NAME"
echo "  ID: $CONTAINER_ID"
echo "  Image: $CONTAINER_IMAGE"

# Check if the cleanup SQL file exists
if [ ! -f "src/main/resources/db/cleanup-dev.sql" ]; then
    echo "Error: Cleanup SQL file not found at src/main/resources/db/cleanup-dev.sql"
    exit 1
fi

# Confirm with the user
echo ""
echo "WARNING: This will delete all data in the development database!"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USERNAME"
echo "Container: $CONTAINER_NAME ($CONTAINER_ID)"
echo ""
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Executing database cleanup..."
    
    # Copy the SQL file into the container
    echo "→ Copying cleanup script to container..."
    if ! docker cp src/main/resources/db/cleanup-dev.sql "$CONTAINER_ID:/cleanup-dev.sql"; then
        echo "✗ Error: Failed to copy SQL file to container"
        exit 1
    fi
    
    # Execute the SQL file inside the container
    echo "→ Executing cleanup SQL script..."
    if docker exec -i "$CONTAINER_ID" psql -U "$DB_USERNAME" -d "$DB_NAME" -f /cleanup-dev.sql; then
        echo "✓ Database cleanup completed successfully!"
    else
        echo "✗ Error: Failed to execute cleanup script"
        # Still try to clean up the temp file
        docker exec "$CONTAINER_ID" rm /cleanup-dev.sql 2>/dev/null
        exit 1
    fi
    
    # Remove the SQL file from the container
    echo "→ Cleaning up temporary files..."
    docker exec "$CONTAINER_ID" rm /cleanup-dev.sql
    
    echo ""
    echo "🎉 Cleanup completed successfully!"
    echo "All data has been removed from the '$DB_NAME' database."
else
    echo "Cleanup cancelled."
fi 