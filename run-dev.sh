#!/bin/sh
# -----------------------------------------
# Runs hirafood  in development
# -----------------------------------------

node order-manager/app.js -p 8080 -d ../config/database-dev.yml
