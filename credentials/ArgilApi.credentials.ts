import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ArgilApi implements ICredentialType {
    name = 'argilApi';
    displayName = 'Argil API';
    documentationUrl = 'https://docs.argil.ai/authentication';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            required: true,
            description: 'Your Argil API key',
        },
    ];
}
