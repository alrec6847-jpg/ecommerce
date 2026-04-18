#!/bin/bash

# Wait for database to be ready
echo "Waiting for postgres..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Start Gunicorn
echo "Starting gunicorn..."
exec gunicorn ecom_project.wsgi:application \
    --name ecom_project \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --log-level=info \
    --access-logfile /app/logs/access.log \
    --error-logfile /app/logs/error.log
