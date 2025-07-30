import {
    IExecuteFunctions,
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    ILoadOptionsFunctions,
    INodePropertyOptions,
    NodeOperationError,
    NodeConnectionType,
} from 'n8n-workflow';

// API Base URL - Change this to switch between environments
const API_BASE_URL = 'https://api.argil.ai/v1';

// Helper function to convert layout type and position to API layout value
function convertToApiLayout(
    layoutType: string | undefined,
    position: string = 'left'
): string | undefined {
    // If auto mode, return undefined to let backend handle randomization
    if (!layoutType || layoutType === 'auto') {
        return undefined;
    }

    // Map layout types to API values
    switch (layoutType) {
        case 'fullscreen':
            return 'NORMAL';
        case 'small':
            if (position === 'left') return 'BOTTOM_LEFT';
            if (position === 'right') return 'BOTTOM_RIGHT';
            if (position === 'top') return 'BOTTOM_LEFT'; // Remapping for portrait
            if (position === 'bottom') return 'BOTTOM_RIGHT'; // Remapping for portrait
            return 'BOTTOM_LEFT';
        case 'splitscreen':
            if (position === 'left') return 'SPLIT_LEFT';
            if (position === 'right') return 'SPLIT_RIGHT';
            if (position === 'top') return 'SPLIT_TOP';
            if (position === 'bottom') return 'SPLIT_BOTTOM';
            return 'SPLIT_LEFT';
        case 'back':
            return 'BACKGROUND';
        default:
            return undefined;
    }
}

export class Argil implements INodeType {
    constructor() {
        console.log('[Argil Node] Constructor called - Node is being loaded');
    }

    description: INodeTypeDescription = {
        displayName: 'Argil',
        name: 'argil',
        icon: 'file:argil.svg',
        // Alternative: Si l'icône ne se charge pas, décommentez la ligne suivante et commentez la ligne au-dessus
        // icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHJ4PSIxMiIgZmlsbD0iIzAwMDAwMCIvPgogIDxwYXRoIGQ9Ik00Mi41IDI5LjVDNDQuNCAyOS42IDQ1LjYgMzAgNDYuNyAzMC45QzQ3IDMxLjEgNDcuNCAzMS41IDQ3LjYgMzEuN0M0OSAzMy4zIDQ5IDM1LjIgNDkgMzguOEM0OSA0Mi40IDQ5IDQ0LjIgNDcuNiA0NS44QzQ3LjQgNDYgNDcgNDYuNCA0Ni43IDQ2LjZDNDQuOSA0OCA0Mi40IDQ4IDM4LjggNDhDMzUuMiA0OCAzMy4zIDQ4IDMxLjcgNDYuNkMzMS41IDQ2LjQgMzEuMSA0NiAzMC45IDQ1LjhDMzAgNDQuOSAyOS42IDQ0LjEgMjkuNSA0Mi41QzI4LjMgNDUuOCAyNSA0OCAyMS4yIDQ4QzE2LjEgNDggMTIgNDMuOCAxMiAzOC44QzEyIDM1IDE0LjMgMzEuNyAxNy42IDMwLjNDMTYgMzAuMiAxNSAyOS44IDE0LjEgMjkuMUMxMy45IDI4LjkgMTMuNSAyOC41IDEzLjMgMjguM0MxMiAyNi44IDEyIDI0LjkgMTIgMjEuMkMxMiAxNy41IDEyIDE1LjYgMTMuMyAxNC4xQzEzLjUgMTMuOSAxMy45IDEzLjUgMTQuMSAxMy4zQzE1LjYgMTIgMTcuNSAxMiAyMS4yIDEyQzI0LjkgMTIgMjYuOCAxMiAyOC4zIDEzLjNDMjguNSAxMy41IDI4LjkgMTMuOSAyOS4xIDE0LjFDMzAgMTUgMzAuMiAxNiAzMC4zIDE3LjZDMzEuNyAxNC4zIDM1IDEyIDM4LjggMTJDNDMuOCAxMiA0OCAxNi4xIDQ4IDIxLjJDNDggMjUgNDUuOCAyOC4zIDQyLjUgMjkuNVpNMzAuMyAyNC45QzMwLjIgMjYuNCAyOS44IDI3LjQgMjkuMSAyOC4zQzI4LjkgMjguNSAyOC41IDI4LjkgMjguMyAyOS4xQzI3LjQgMjkuOCAyNi40IDMwLjIgMjQuOSAzMC4zQzI3IDMxLjIgMjguOCAzMyAyOS43IDM1LjFDMjkuOCAzMy42IDMwLjIgMzIuNiAzMC45IDMxLjdDMzEuMSAzMS41IDMxLjUgMzEuMSAzMS43IDMwLjlDMzIuNiAzMC4yIDMzLjYgMjkuOCAzNS4xIDI5LjdDMzMgMjguOCAzMS4yIDI3IDMwLjMgMjQuOVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+Cg==',
        group: ['transform'],
        version: 1,
        description: 'Create engaging videos with Argil AI',
        defaults: {
            name: 'Argil',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'argilApi',
                required: true,
            },
        ],
        properties: [
            // Operation
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    {
                        name: 'Create Video',
                        value: 'create',
                        description: 'Create a new video',
                        action: 'Create a video',
                    },
                    {
                        name: 'Get Video',
                        value: 'get',
                        description: 'Get a video by ID',
                        action: 'Get a video',
                    },
                ],
                default: 'create',
                noDataExpression: true,
            },

            // Video ID for Get operation
            {
                displayName: 'Video ID',
                name: 'videoId',
                type: 'string',
                default: '',
                required: true,
                description: 'The ID of the video to retrieve',
                displayOptions: {
                    show: {
                        operation: ['get'],
                    },
                },
            },

            // Creation Mode
            {
                displayName: 'Creation Mode',
                name: 'creationMode',
                type: 'options',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
                options: [
                    {
                        name: 'Transcript (Simple)',
                        value: 'transcript',
                        description:
                            'Provide a single transcript and let Argil handle the moments',
                    },
                    {
                        name: 'Article to Video',
                        value: 'articleToVideo',
                        description:
                            'Convert an article URL into a video automatically',
                    },
                    {
                        name: 'Moments (Advanced)',
                        value: 'moments',
                        description:
                            'Define each moment individually with specific settings',
                    },
                ],
                default: 'transcript',
            },

            // Video Name
            {
                displayName: 'Video Name',
                name: 'name',
                type: 'string',
                default: 'my_n8n_video',
                description: 'Name for your video',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
            },

            // Avatar
            {
                displayName: 'Avatar',
                name: 'avatarId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getAvatars',
                },
                default: '',
                description: 'Choose an avatar for your video',
                displayOptions: {
                    show: {
                        creationMode: ['transcript'],
                    },
                },
            },

            {
                displayName: 'Split Intensity',
                name: 'splitIntensity',
                type: 'options',
                options: [
                    {
                        name: 'Dynamic',
                        value: 'DYNAMIC',
                        description:
                            'AI will dynamically split your transcript based on context',
                    },
                    {
                        name: 'Normal',
                        value: 'NORMAL',
                        description: 'Split transcript at regular intervals',
                    },
                ],
                default: 'DYNAMIC',
                displayOptions: {
                    show: {
                        creationMode: ['transcript'],
                    },
                },
            },

            {
                displayName: 'Transcript',
                name: 'transcript',
                type: 'string',
                typeOptions: {
                    rows: 10,
                },
                default: '',
                placeholder:
                    'Enter your full transcript here. Argil will automatically split it into moments.',
                description: 'The complete transcript for your video',
                displayOptions: {
                    show: {
                        creationMode: ['transcript'],
                    },
                },
            },

            // === ARTICLE TO VIDEO MODE FIELDS ===
            {
                displayName: 'Avatar',
                name: 'articleAvatarId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getAvatars',
                },
                default: '',
                description: 'Choose an avatar for your video',
                displayOptions: {
                    show: {
                        creationMode: ['articleToVideo'],
                    },
                },
            },
            {
                displayName: 'Article URL',
                name: 'articleUrl',
                type: 'string',
                default: '',
                placeholder: 'https://example.com/article',
                description: 'URL of the article to convert into a video',
                displayOptions: {
                    show: {
                        creationMode: ['articleToVideo'],
                    },
                },
            },
            {
                displayName: 'Format',
                name: 'articleFormat',
                type: 'options',
                options: [
                    {
                        name: 'Short',
                        value: 'short',
                        description: 'Create a short summary video',
                    },
                    {
                        name: 'Long',
                        value: 'long',
                        description: 'Create a detailed video',
                    },
                ],
                default: 'short',
                displayOptions: {
                    show: {
                        creationMode: ['articleToVideo'],
                    },
                },
            },
            {
                displayName: 'Instructions',
                name: 'articleInstructions',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                placeholder:
                    'Optional instructions for how to process the article',
                description:
                    'Provide specific instructions for content generation',
                displayOptions: {
                    show: {
                        creationMode: ['articleToVideo'],
                    },
                },
            },
            {
                displayName: 'Split Intensity',
                name: 'articleSplitIntensity',
                type: 'options',
                options: [
                    {
                        name: 'Dynamic',
                        value: 'DYNAMIC',
                        description:
                            'AI will dynamically split the content based on context',
                    },
                    {
                        name: 'Normal',
                        value: 'NORMAL',
                        description: 'Split content at regular intervals',
                    },
                ],
                default: 'DYNAMIC',
                displayOptions: {
                    show: {
                        creationMode: ['articleToVideo'],
                    },
                },
            },
            // === MOMENTS MODE FIELDS ===
            {
                displayName: 'Moments',
                name: 'moments',
                type: 'fixedCollection',
                typeOptions: {
                    multipleValues: true,
                },
                placeholder: 'Add moment',
                default: {},
                description: 'Each moment represents a segment of your video',
                displayOptions: {
                    show: {
                        creationMode: ['moments'],
                    },
                },
                options: [
                    {
                        name: 'moment',
                        displayName: 'Moment',
                        values: [
                            {
                                displayName: 'Avatar',
                                name: 'avatarId',
                                type: 'options',
                                typeOptions: {
                                    loadOptionsMethod: 'getAvatars',
                                },
                                default: '',
                                description: 'Avatar for this moment',
                            },
                            {
                                displayName: 'Voice',
                                name: 'voiceId',
                                type: 'options',
                                typeOptions: {
                                    loadOptionsMethod: 'getVoices',
                                },
                                default: '',
                                description: 'Voice for this moment',
                            },
                            {
                                displayName: 'Transcript',
                                name: 'transcript',
                                type: 'string',
                                default: '',
                                description: 'Text to be spoken in this moment',
                            },
                            {
                                displayName: 'Gesture',
                                name: 'gestureSlug',
                                type: 'string',
                                default: '',
                                description: 'Optional gesture for the avatar',
                            },
                            {
                                displayName: 'Audio URL',
                                name: 'audioUrl',
                                type: 'string',
                                default: '',
                                description:
                                    'Optional audio URL (overrides voice generation)',
                            },
                            {
                                displayName: 'Layout Type',
                                name: 'layoutType',
                                type: 'options',
                                options: [
                                    {
                                        name: 'Default',
                                        value: '',
                                    },
                                    {
                                        name: 'Auto',
                                        value: 'auto',
                                    },
                                    {
                                        name: 'Fullscreen',
                                        value: 'fullscreen',
                                    },
                                    {
                                        name: 'Small',
                                        value: 'small',
                                    },
                                    {
                                        name: 'Splitscreen',
                                        value: 'splitscreen',
                                    },
                                    {
                                        name: 'Back',
                                        value: 'back',
                                    },
                                ],
                                default: '',
                                description:
                                    'Avatar layout style for this specific moment (overrides global layout)',
                            },
                            // Avatar Position
                            {
                                displayName: 'Avatar Position',
                                name: 'layoutPosition',
                                type: 'options',
                                options: [
                                    { name: 'Left', value: 'left' },
                                    { name: 'Right', value: 'right' },
                                    { name: 'Bottom', value: 'bottom' },
                                    { name: 'Top', value: 'top' },
                                ],
                                default: 'left',
                                description:
                                    'Position of the avatar for this moment (used with Small and Splitscreen layouts)',
                            },
                        ],
                    },
                ],
            },
            // === ASPECT RATIO ===
            {
                displayName: 'Aspect Ratio',
                name: 'aspectRatio',
                type: 'options',
                options: [
                    {
                        name: '16:9 (Landscape)',
                        value: '16:9',
                    },
                    {
                        name: '9:16 (Portrait)',
                        value: '9:16',
                    },
                ],
                default: '16:9',
                description: 'Video format',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
            },
            // === AUTO B-ROLLS FIELDS ===
            {
                displayName: 'Enable Auto B-Rolls',
                name: 'enableAutoBrolls',
                type: 'boolean',
                default: false,
                description: 'Whether to enable automatic B-roll generation',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
            },
            {
                displayName: 'B-Roll Source',
                name: 'autoBrollsSource',
                type: 'options',
                options: [
                    {
                        name: 'Generation',
                        value: 'GENERATION',
                    },
                    {
                        name: 'Google Images',
                        value: 'GOOGLE_IMAGES',
                    },
                    {
                        name: 'Video',
                        value: 'STOCKS_VIDEO',
                    },
                ],
                default: 'GENERATION',
                description: 'Source for B-roll content',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                    },
                },
            },
            {
                displayName: 'B-Roll Frequency',
                name: 'autoBrollsIntensity',
                type: 'options',
                options: [
                    {
                        name: 'Low',
                        value: 'LOW',
                    },
                    {
                        name: 'Medium',
                        value: 'MEDIUM',
                    },
                    {
                        name: 'High',
                        value: 'HIGH',
                    },
                ],
                default: 'MEDIUM',
                description: 'Frequency of B-roll insertions',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                    },
                },
            },
            {
                displayName: 'Layout',
                name: 'autoBrollsLayoutType',
                type: 'options',
                options: [
                    {
                        name: 'Auto',
                        value: 'auto',
                    },
                    {
                        name: 'Fullscreen',
                        value: 'fullscreen',
                    },
                    {
                        name: 'Small',
                        value: 'small',
                    },
                    {
                        name: 'Splitscreen',
                        value: 'splitscreen',
                    },
                    {
                        name: 'Back',
                        value: 'back',
                    },
                ],
                default: 'auto',
                description: 'Avatar layout style for all moments in the video',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                    },
                },
            },
            // Avatar Position for Small layout
            {
                displayName: 'Avatar Position',
                name: 'autoBrollsPosition',
                type: 'options',
                options: [
                    { name: 'Left', value: 'left' },
                    { name: 'Right', value: 'right' },
                    { name: 'Bottom', value: 'bottom' },
                    { name: 'Top', value: 'top' },
                ],
                default: 'left',
                description: 'Position of the avatar',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                        autoBrollsLayoutType: ['small'],
                    },
                },
            },
            // Avatar Position for Splitscreen 16:9
            {
                displayName: 'Avatar Position',
                name: 'autoBrollsPosition',
                type: 'options',
                options: [
                    { name: 'Left', value: 'left' },
                    { name: 'Right', value: 'right' },
                ],
                default: 'left',
                description: 'Position of the avatar',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                        autoBrollsLayoutType: ['splitscreen'],
                        aspectRatio: ['16:9'],
                    },
                },
            },
            // Avatar Position for Splitscreen 9:16
            {
                displayName: 'Avatar Position',
                name: 'autoBrollsPosition',
                type: 'options',
                options: [
                    { name: 'Top', value: 'top' },
                    { name: 'Bottom', value: 'bottom' },
                ],
                default: 'top',
                description: 'Position of the avatar',
                displayOptions: {
                    show: {
                        enableAutoBrolls: [true],
                        autoBrollsLayoutType: ['splitscreen'],
                        aspectRatio: ['9:16'],
                    },
                },
            },
            // === SUBTITLES ===
            {
                displayName: 'Enable Subtitles',
                name: 'enableSubtitles',
                type: 'boolean',
                default: false,
                description: 'Whether to enable automatic subtitles',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
            },
            {
                displayName: 'Subtitle Style',
                name: 'subtitleStyleId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getSubtitleStyles',
                },
                default: '',
                description: 'Choose a subtitle style',
                displayOptions: {
                    show: {
                        enableSubtitles: [true],
                    },
                },
            },
            {
                displayName: 'Subtitle Position',
                name: 'subtitlePosition',
                type: 'options',
                options: [
                    {
                        name: 'Top',
                        value: 'Top',
                    },
                    {
                        name: 'Bottom',
                        value: 'Bottom',
                    },
                    {
                        name: 'Centered',
                        value: 'Centered',
                    },
                ],
                default: 'Bottom',
                description: 'Position of subtitles',
                displayOptions: {
                    show: {
                        enableSubtitles: [true],
                    },
                },
            },
            {
                displayName: 'Subtitle Size',
                name: 'subtitleSize',
                type: 'options',
                options: [
                    {
                        name: 'Small',
                        value: 'Small',
                    },
                    {
                        name: 'Medium',
                        value: 'Medium',
                    },
                    {
                        name: 'Large',
                        value: 'Large',
                    },
                ],
                default: 'Medium',
                description: 'Size of subtitles',
                displayOptions: {
                    show: {
                        enableSubtitles: [true],
                    },
                },
            },
            // === BACKGROUND MUSIC ===
            {
                displayName: 'Enable Background Music',
                name: 'enableBackgroundMusic',
                type: 'boolean',
                default: false,
                description: 'Add background music to your video',
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
            },
            {
                displayName: 'Background Music',
                name: 'backgroundMusicAssetId',
                type: 'options',
                typeOptions: {
                    loadOptionsMethod: 'getAssets',
                },
                default: '',
                description: 'Choose a background music asset',
                displayOptions: {
                    show: {
                        enableBackgroundMusic: [true],
                    },
                },
            },
            {
                displayName: 'Background Music Volume',
                name: 'backgroundMusicVolume',
                type: 'number',
                default: 0.14,
                description: 'Volume for background music (0-1)',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1,
                    numberStepSize: 0.01,
                },
                displayOptions: {
                    show: {
                        enableBackgroundMusic: [true],
                    },
                },
            },
            // === ADDITIONAL OPTIONS ===
            {
                displayName: 'Additional Options',
                name: 'additionalOptions',
                type: 'collection',
                placeholder: 'Add Option',
                default: {
                    render: false,
                },
                displayOptions: {
                    show: {
                        operation: ['create'],
                    },
                },
                options: [
                    {
                        displayName: 'Render Video',
                        name: 'render',
                        type: 'boolean',
                        default: false,
                        description:
                            'Whether to immediately render the video after creation. This will make an additional API call to /render endpoint.',
                    },
                    {
                        displayName: 'Wait Until Render Complete',
                        name: 'waitForRender',
                        type: 'boolean',
                        default: false,
                        description:
                            'Whether to wait until the video rendering is complete. This will poll the video status until it is ready.',
                        displayOptions: {
                            show: {
                                render: [true],
                            },
                        },
                    },
                    {
                        displayName: 'Polling Interval (seconds)',
                        name: 'pollingInterval',
                        type: 'number',
                        default: 10,
                        description:
                            'How often to check the video status in seconds',
                        displayOptions: {
                            show: {
                                render: [true],
                                waitForRender: [true],
                            },
                        },
                    },
                    {
                        displayName: 'Max Wait Time (minutes)',
                        name: 'maxWaitTime',
                        type: 'number',
                        default: 30,
                        description:
                            'Maximum time to wait for the video to render in minutes',
                        displayOptions: {
                            show: {
                                render: [true],
                                waitForRender: [true],
                            },
                        },
                    },
                ],
            },
        ],
    };

    methods = {
        loadOptions: {
            // Get all available avatars
            async getAvatars(
                this: ILoadOptionsFunctions
            ): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('argilApi');
                const response = await this.helpers.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/avatars`,
                    headers: {
                        'x-api-key': credentials.apiKey as string,
                    },
                    json: true,
                });

                const returnData: INodePropertyOptions[] = [];

                if (Array.isArray(response)) {
                    for (const avatar of response) {
                        returnData.push({
                            name: avatar.name || avatar.id,
                            value: avatar.id,
                        });
                    }
                }

                return returnData;
            },

            // Get all available voices
            async getVoices(
                this: ILoadOptionsFunctions
            ): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('argilApi');
                const response = await this.helpers.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/voices`,
                    headers: {
                        'x-api-key': credentials.apiKey as string,
                    },
                    json: true,
                });

                const returnData: INodePropertyOptions[] = [];

                if (Array.isArray(response)) {
                    for (const voice of response) {
                        returnData.push({
                            name: voice.name || voice.id,
                            value: voice.id,
                        });
                    }
                }

                return returnData;
            },

            // Get all available assets (for background music)
            async getAssets(
                this: ILoadOptionsFunctions
            ): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('argilApi');
                const response = await this.helpers.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/assets`,
                    headers: {
                        'x-api-key': credentials.apiKey as string,
                    },
                    json: true,
                });

                const returnData: INodePropertyOptions[] = [];

                if (Array.isArray(response)) {
                    for (const asset of response) {
                        returnData.push({
                            name: asset.name || asset.id,
                            value: asset.id,
                        });
                    }
                }

                return returnData;
            },

            // Get available subtitle styles
            async getSubtitleStyles(
                this: ILoadOptionsFunctions
            ): Promise<INodePropertyOptions[]> {
                const credentials = await this.getCredentials('argilApi');
                const response = await this.helpers.request({
                    method: 'GET',
                    url: `${API_BASE_URL}/subtitles?pageSize=100`,
                    headers: {
                        'x-api-key': credentials.apiKey as string,
                    },
                    json: true,
                });

                const returnData: INodePropertyOptions[] = [];

                if (
                    response &&
                    response.items &&
                    Array.isArray(response.items)
                ) {
                    for (const style of response.items) {
                        returnData.push({
                            name: style.name || style.id,
                            value: style.id,
                        });
                    }
                }

                return returnData;
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: IDataObject[] = [];
        const operation = this.getNodeParameter('operation', 0) as string;

        // Helper function to wait
        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const credentials = await this.getCredentials('argilApi');

        for (let i = 0; i < items.length; i++) {
            try {
                // Handle Get Video operation
                if (operation === 'get') {
                    const videoId = this.getNodeParameter(
                        'videoId',
                        i
                    ) as string;

                    const response = await this.helpers.request({
                        method: 'GET',
                        url: `${API_BASE_URL}/videos/${videoId}`,
                        headers: {
                            'x-api-key': credentials.apiKey as string,
                        },
                        json: true,
                    });

                    returnData.push(response as IDataObject);
                    continue;
                }

                // Handle Create Video operation
                const creationMode = this.getNodeParameter(
                    'creationMode',
                    i
                ) as string;
                let body: IDataObject = {
                    name: this.getNodeParameter('name', i) as string,
                    extras: { source: 'n8n' },
                };

                // Get aspect ratio early (needed for layout conversions)
                const aspectRatio = this.getNodeParameter(
                    'aspectRatio',
                    i
                ) as string;

                // Handle creation mode
                if (creationMode === 'transcript') {
                    // Simple transcript mode
                    const avatarId = this.getNodeParameter(
                        'avatarId',
                        i
                    ) as string;
                    const transcriptContent = this.getNodeParameter(
                        'transcript',
                        i
                    ) as string;
                    const splitIntensity = this.getNodeParameter(
                        'splitIntensity',
                        i
                    ) as string;

                    body = {
                        ...body,
                        avatarId,
                        transcript: {
                            content: transcriptContent,
                            splitIntensity: splitIntensity,
                        },
                        type: 'transcript',
                    };
                } else if (creationMode === 'articleToVideo') {
                    // Article to video mode
                    const avatarId = this.getNodeParameter(
                        'articleAvatarId',
                        i
                    ) as string;
                    const articleUrl = this.getNodeParameter(
                        'articleUrl',
                        i
                    ) as string;
                    const format = this.getNodeParameter(
                        'articleFormat',
                        i
                    ) as string;
                    const instructions = this.getNodeParameter(
                        'articleInstructions',
                        i
                    ) as string;
                    const splitIntensity = this.getNodeParameter(
                        'articleSplitIntensity',
                        i
                    ) as string;

                    body = {
                        ...body,
                        avatarId,
                        articleToVideo: {
                            url: articleUrl,
                            format,
                            splitIntensity,
                            ...(instructions && { instructions }),
                        },
                        type: 'articleToVideo',
                    };
                } else {
                    // Advanced moments mode
                    const momentsData = this.getNodeParameter(
                        'moments',
                        i
                    ) as IDataObject;

                    // Prepare moments array
                    const moments: Array<IDataObject> = [];
                    if (
                        momentsData.moment &&
                        Array.isArray(momentsData.moment)
                    ) {
                        for (const momentItem of momentsData.moment) {
                            const moment = momentItem as IDataObject;
                            const momentObj: IDataObject = {
                                transcript: moment.transcript as string,
                                avatarId: moment.avatarId as string,
                            };

                            // Add optional fields if they exist
                            if (moment.voiceId) {
                                momentObj.voiceId = moment.voiceId as string;
                            }
                            if (moment.gestureSlug) {
                                momentObj.gestureSlug =
                                    moment.gestureSlug as string;
                            }
                            if (moment.audioUrl) {
                                momentObj.audioUrl = moment.audioUrl as string;
                            }
                            if (moment.layoutType) {
                                const layoutType = moment.layoutType as string;
                                const position =
                                    (moment.layoutPosition as string) || 'left';
                                const apiLayout = convertToApiLayout(
                                    layoutType,
                                    position
                                );
                                if (apiLayout) {
                                    momentObj.layout = apiLayout;
                                }
                            }

                            moments.push(momentObj);
                        }
                    }

                    body = {
                        ...body,
                        moments,
                        type: 'moments',
                    };
                }

                // Handle subtitles
                const enableSubtitles = this.getNodeParameter(
                    'enableSubtitles',
                    i
                ) as boolean;
                if (enableSubtitles) {
                    const subtitles: IDataObject = {
                        enable: true,
                    };
                    const subtitleStyleId = this.getNodeParameter(
                        'subtitleStyleId',
                        i
                    ) as string;
                    if (subtitleStyleId) {
                        subtitles.styleId = subtitleStyleId;
                    }
                    const subtitlePosition = this.getNodeParameter(
                        'subtitlePosition',
                        i
                    ) as string;
                    if (subtitlePosition) {
                        subtitles.position = subtitlePosition;
                    }
                    const subtitleSize = this.getNodeParameter(
                        'subtitleSize',
                        i
                    ) as string;
                    if (subtitleSize) {
                        subtitles.size = subtitleSize;
                    }
                    body.subtitles = subtitles;
                }

                // Handle auto B-rolls
                const enableAutoBrolls = this.getNodeParameter(
                    'enableAutoBrolls',
                    i
                ) as boolean;
                if (enableAutoBrolls) {
                    const autoBrolls: IDataObject = {
                        enable: true,
                        source:
                            (this.getNodeParameter(
                                'autoBrollsSource',
                                i
                            ) as string) || 'GENERATION',
                        intensity:
                            (this.getNodeParameter(
                                'autoBrollsIntensity',
                                i
                            ) as string) || 'MEDIUM',
                    };

                    // Add layout based on layout type
                    const layoutType = this.getNodeParameter(
                        'autoBrollsLayoutType',
                        i
                    ) as string | undefined;

                    // Only add layout if not auto mode
                    if (layoutType && layoutType !== 'auto') {
                        const position =
                            (this.getNodeParameter(
                                'autoBrollsPosition',
                                i
                            ) as string) || 'left';

                        const apiLayout = convertToApiLayout(
                            layoutType,
                            position
                        );

                        if (apiLayout) {
                            autoBrolls.layout = apiLayout;
                        }
                    }
                    // If auto mode, don't add layout field - let backend randomize

                    body.autoBrolls = autoBrolls;

                    // Debug log to see what we're sending
                    console.log('[n8n-argil] Auto B-rolls config:', {
                        layoutType,
                        autoBrolls,
                        hasLayout: 'layout' in autoBrolls,
                        aspectRatio: body.aspectRatio,
                    });
                }
                if (aspectRatio) {
                    body.aspectRatio = aspectRatio;
                }

                // Handle background music
                const enableBackgroundMusic = this.getNodeParameter(
                    'enableBackgroundMusic',
                    i
                ) as boolean;
                if (enableBackgroundMusic) {
                    const backgroundMusicAssetId = this.getNodeParameter(
                        'backgroundMusicAssetId',
                        i
                    ) as string;
                    const backgroundMusicVolume = this.getNodeParameter(
                        'backgroundMusicVolume',
                        i
                    ) as number;
                    body.backgroundMusic = {
                        assetId: backgroundMusicAssetId,
                        volume: backgroundMusicVolume || 0.14,
                    };
                }

                // Make API request
                const response = await this.helpers.request({
                    method: 'POST',
                    url: `${API_BASE_URL}/videos`,
                    headers: {
                        'x-api-key': credentials.apiKey as string,
                        'Content-Type': 'application/json',
                    },
                    body,
                    json: true,
                    timeout: 300000, // 5 minutes timeout
                });

                // If render option is enabled, make the render call
                const additionalOptions = this.getNodeParameter(
                    'additionalOptions',
                    i
                ) as IDataObject;
                const render = additionalOptions.render as boolean;
                if (render && response && (response as IDataObject).id) {
                    const videoId = (response as IDataObject).id;

                    try {
                        const renderResponse = await this.helpers.request({
                            method: 'POST',
                            url: `${API_BASE_URL}/videos/${videoId}/render`,
                            headers: {
                                'x-api-key': credentials.apiKey as string,
                                'Content-Type': 'application/json',
                            },
                            json: true,
                            timeout: 300000, // 5 minutes timeout
                        });

                        // Check if we should wait for render to complete
                        const waitForRender =
                            additionalOptions.waitForRender as boolean;

                        if (waitForRender) {
                            const pollingInterval =
                                ((additionalOptions.pollingInterval as number) ||
                                    10) * 1000; // Convert to milliseconds
                            const maxWaitTime =
                                ((additionalOptions.maxWaitTime as number) ||
                                    30) *
                                60 *
                                1000; // Convert to milliseconds
                            const startTime = Date.now();

                            let videoStatus = '';
                            let latestVideoData: IDataObject = {};

                            // Poll until video is ready or timeout
                            while (
                                videoStatus !== 'IDLE' &&
                                videoStatus !== 'DONE' &&
                                videoStatus !== 'FAILED' &&
                                videoStatus !== 'CONTENT_MODERATED'
                            ) {
                                // Check if we've exceeded max wait time
                                if (Date.now() - startTime > maxWaitTime) {
                                    throw new Error(
                                        `Video rendering timeout after ${additionalOptions.maxWaitTime} minutes`
                                    );
                                }

                                // Wait before polling
                                await wait(pollingInterval);

                                // Get video status
                                const statusResponse =
                                    await this.helpers.request({
                                        method: 'GET',
                                        url: `${API_BASE_URL}/videos/${videoId}`,
                                        headers: {
                                            'x-api-key':
                                                credentials.apiKey as string,
                                        },
                                        json: true,
                                    });

                                latestVideoData = statusResponse as IDataObject;
                                videoStatus =
                                    (latestVideoData.status as string) ||
                                    'GENERATING_VIDEO';

                                // Log progress
                                console.log(
                                    `[n8n-argil] Video ${videoId} status: ${videoStatus}`
                                );
                            }

                            // Check final status
                            if (
                                videoStatus === 'IDLE' ||
                                videoStatus === 'DONE'
                            ) {
                                // Success - return the latest video data
                                const finalResponse = {
                                    ...latestVideoData,
                                    renderResponse: renderResponse,
                                    renderWaitTime: Math.round(
                                        (Date.now() - startTime) / 1000
                                    ), // in seconds
                                };
                                returnData.push(finalResponse);
                            } else if (videoStatus === 'FAILED') {
                                // Failed
                                throw new Error(
                                    `Video rendering failed with status: ${videoStatus}`
                                );
                            } else if (videoStatus === 'CONTENT_MODERATED') {
                                // Content moderation issue
                                throw new Error(
                                    `Video was moderated due to content policy violations`
                                );
                            }
                        } else {
                            // Don't wait - just return render response
                            const finalResponse = {
                                ...(response as IDataObject),
                                renderResponse: renderResponse,
                            };
                            returnData.push(finalResponse);
                        }
                    } catch (renderError) {
                        // If render fails, still return the original response with render error
                        const finalResponse = {
                            ...(response as IDataObject),
                            renderError:
                                renderError instanceof Error
                                    ? renderError.message
                                    : 'Render failed',
                        };
                        returnData.push(finalResponse);
                    }
                } else {
                    returnData.push(response as IDataObject);
                }
            } catch (error) {
                if (this.continueOnFail()) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'Unknown error';
                    returnData.push({ error: errorMessage });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error as Error);
            }
        }

        return [this.helpers.returnJsonArray(returnData)];
    }
}
