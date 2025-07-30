# n8n-nodes-argil

This is an n8n community node. It lets you use Argil AI in your n8n workflows.

[Argil](https://argil.ai) is a platform for creating engaging AI-generated videos.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Installation

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-argil` in **Enter npm package name**
4. Agree to the risks of using community nodes
5. Select **Install**

### Manual Installation

To install the node manually:

```bash
npm install n8n-nodes-argil
```

## Operations

### Video Resource

-   **Create**: Create a new engaging video with AI avatars

## Credentials

You'll need an Argil API key to use this node. You can get one by:

1. Creating an account at [Argil](https://argil.ai)
2. Going to your account settings
3. Generating an API key

## Usage

### Create a Video

1. Add the Argil node to your workflow
2. Select the **Create** operation
3. Choose an avatar from the dropdown
4. Add your transcript lines (write short to medium sentences for better results)
5. Configure optional settings:
    - **Video Name**: Name for your video
    - **Aspect Ratio**: 16:9 (Landscape) or 9:16 (Portrait)
    - **Auto Captions**: Enable automatic subtitles
    - **Auto B-rolls**: Add dynamic B-roll videos
    - **Background Music**: Select from available music assets

### Example Workflow

Here's a simple example of creating a video:

```json
{
    "nodes": [
        {
            "parameters": {
                "resource": "video",
                "operation": "create",
                "avatarId": "your-avatar-id",
                "transcript": {
                    "lines": [
                        {
                            "content": "Welcome to our product demo!"
                        },
                        {
                            "content": "Today we'll show you how to use our amazing features."
                        }
                    ]
                },
                "name": "Product Demo Video",
                "additionalOptions": {
                    "aspectRatio": "16:9",
                    "subtitles": true,
                    "autoBrolls": true,
                    "autoBrollsIntensity": "MEDIUM"
                }
            },
            "name": "Argil",
            "type": "n8n-nodes-argil.argil",
            "position": [250, 300]
        }
    ]
}
```

## Resources

-   [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
-   [Argil API documentation](https://docs.argil.ai/)

## Development

To develop and test this node locally:

```bash
# Clone the repository
git clone https://github.com/your-username/n8n-nodes-argil.git

# Install dependencies
npm install

# Build the node
npm run build

# Link the node to n8n
npm link

# In your n8n installation folder
npm link n8n-nodes-argil

# Start n8n
n8n start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE.md)
