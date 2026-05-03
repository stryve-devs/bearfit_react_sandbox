#!/bin/bash

echo "=============================="
echo "wdev.sh (root)"
echo "=============================="
cat ./wdev.sh 2>/dev/null || echo "not found"
echo -e "\n\n"


echo "=============================="
echo ".env (frontend) - KEYS ONLY"
echo "=============================="

if [ -f ./frontend/.env ]; then
  awk -F= '{print $1"="}' ./frontend/.env
else
  echo "frontend/.env not found"
fi

echo -e "\n\n"


echo "=============================="
echo ".env (backend) - KEYS ONLY"
echo "=============================="

if [ -f ./backend/.env ]; then
  awk -F= '{print $1"="}' ./backend/.env
else
  echo "backend/.env not found"
fi

echo -e "\nDone."