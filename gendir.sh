#!/bin/bash

# Exit on error
set -e

# Things we don't want in output
IGNORE_DIRS="node_modules|.git|.expo|.next|dist|build|coverage|.turbo|.cache|.DS_Store"

echo "=============================="
echo "frontend dir-"
echo "=============================="

if [ -d "frontend" ]; then
    tree -L 4 -I "$IGNORE_DIRS" frontend
else
    echo "frontend directory not found"
fi

echo ""
echo "=============================="
echo "backend dir-"
echo "=============================="

if [ -d "backend" ]; then
    tree -L 4 -I "$IGNORE_DIRS" backend
else
    echo "backend directory not found"
fi