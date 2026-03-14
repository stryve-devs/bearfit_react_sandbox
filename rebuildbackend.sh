
echo "Cleaning old backend images..."
docker rmi $(docker images -q backend-app) 2>/dev/null || true

echo "Rebuilding backend without cache..."
docker-compose build --no-cache backend