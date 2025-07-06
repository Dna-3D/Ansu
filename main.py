#!/usr/bin/env python3
"""
Flask application to serve the Ansugist static website
"""
from flask import Flask, render_template, send_from_directory, request
import os

app = Flask(__name__)

# Serve static files from the root directory
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)