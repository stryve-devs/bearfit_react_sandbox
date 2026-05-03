#!/bin/bash

echo "=============================="
echo "docker-compose.yml (root)"
echo "=============================="
cat ./docker-compose.yml
echo -e "\n\n"

echo "=============================="
echo "frontend/Dockerfile"
echo "=============================="
cat ./frontend/Dockerfile
echo -e "\n\n"

echo "=============================="
echo "backend/Dockerfile"
echo "=============================="
cat ./backend/Dockerfile
echo -e "\n\n"

echo "Done."