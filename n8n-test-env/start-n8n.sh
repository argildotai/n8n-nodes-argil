#!/bin/bash

echo "🚀 Starting n8n with Argil node..."
echo "📁 Data will be stored in: $HOME/.n8n"
echo ""
echo "🌐 n8n will be available at: http://localhost:5678"
echo ""
echo "📌 First time setup:"
echo "   1. Create an account when you access n8n"
echo "   2. Go to 'Credentials' → 'New' → Search 'Argil'"
echo "   3. Add your Argil API key"
echo ""
echo "🔍 To test the node:"
echo "   1. Create a new workflow"
echo "   2. Add the 'Argil' node"
echo "   3. Configure and test video creation"
echo ""
echo "Press Ctrl+C to stop n8n"
echo ""

# Set environment variables
export N8N_CUSTOM_EXTENSIONS="/Users/briva/Desktop/argil/n8n-nodes-argil/n8n-test-env/node_modules"
export N8N_USER_FOLDER="$HOME/.n8n"
export N8N_LOG_LEVEL="info"

# Start n8n
n8n start 