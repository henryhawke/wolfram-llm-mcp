#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

interface WolframQueryParams {
    input: string;
    maxchars?: number;
    assumption?: string;
    units?: string;
    currency?: string;
    countrycode?: string;
    languagecode?: string;
    location?: string;
    timezone?: string;
    width?: number;
    maxwidth?: number;
    plotwidth?: number;
    scantimeout?: number;
    formattimeout?: number;
    parsetimeout?: number;
    totaltimeout?: number;
}

class WolframAlphaMCPServer {
    private server: Server;
    private apiKey: string | undefined;

    constructor() {
        this.server = new Server(
            {
                name: 'wolfram-alpha-mcp-server',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.apiKey = process.env.WOLFRAM_ALPHA_APP_ID;
        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'wolfram_query',
                        description: 'Query Wolfram Alpha for computational, mathematical, scientific, and factual information. Supports natural language queries about entities in chemistry, physics, geography, history, art, astronomy, mathematics, and more.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                input: {
                                    type: 'string',
                                    description: 'The natural language query to send to Wolfram Alpha. Convert complex questions to simplified keyword queries when possible (e.g., "how many people live in France" becomes "France population").',
                                },
                                maxchars: {
                                    type: 'number',
                                    description: 'Maximum number of characters in the response (default: 6800)',
                                    default: 6800,
                                },
                                assumption: {
                                    type: 'string',
                                    description: 'Assumption to use when Wolfram Alpha provides multiple interpretations of a query',
                                },
                                units: {
                                    type: 'string',
                                    description: 'Unit system preference (e.g., "metric", "imperial")',
                                },
                                currency: {
                                    type: 'string',
                                    description: 'Currency preference for financial calculations',
                                },
                                countrycode: {
                                    type: 'string',
                                    description: 'Country code for localized results',
                                },
                                languagecode: {
                                    type: 'string',
                                    description: 'Language code for results (queries should still be in English)',
                                },
                                location: {
                                    type: 'string',
                                    description: 'Location for location-specific queries',
                                },
                                timezone: {
                                    type: 'string',
                                    description: 'Timezone for time-related calculations',
                                },
                                width: {
                                    type: 'number',
                                    description: 'Width for generated images',
                                },
                                maxwidth: {
                                    type: 'number',
                                    description: 'Maximum width for generated images',
                                },
                                plotwidth: {
                                    type: 'number',
                                    description: 'Width for plots and graphs',
                                },
                                scantimeout: {
                                    type: 'number',
                                    description: 'Timeout for scanning operations (seconds)',
                                },
                                formattimeout: {
                                    type: 'number',
                                    description: 'Timeout for formatting operations (seconds)',
                                },
                                parsetimeout: {
                                    type: 'number',
                                    description: 'Timeout for parsing operations (seconds)',
                                },
                                totaltimeout: {
                                    type: 'number',
                                    description: 'Total timeout for the request (seconds)',
                                },
                            },
                            required: ['input'],
                        },
                    },
                    {
                        name: 'wolfram_query_with_assumptions',
                        description: 'Query Wolfram Alpha with specific assumptions when the initial query returns multiple interpretations. Use this when you need to clarify ambiguous queries.',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                input: {
                                    type: 'string',
                                    description: 'The exact same input from the previous query',
                                },
                                assumption: {
                                    type: 'string',
                                    description: 'The assumption value to use from the previous query result',
                                },
                                maxchars: {
                                    type: 'number',
                                    description: 'Maximum number of characters in the response (default: 6800)',
                                    default: 6800,
                                },
                            },
                            required: ['input', 'assumption'],
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                if (name === 'wolfram_query' || name === 'wolfram_query_with_assumptions') {
                    return await this.handleWolframQuery(args as unknown as WolframQueryParams);
                } else {
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${name}`
                    );
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }

                let errorMessage = 'An unexpected error occurred';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }

                throw new McpError(ErrorCode.InternalError, errorMessage);
            }
        });
    }

    private async handleWolframQuery(params: WolframQueryParams) {
        if (!this.apiKey) {
            throw new McpError(
                ErrorCode.InvalidRequest,
                'Wolfram Alpha App ID not configured. Please set the WOLFRAM_ALPHA_APP_ID environment variable.'
            );
        }

        if (!params.input || params.input.trim().length === 0) {
            throw new McpError(
                ErrorCode.InvalidParams,
                'Input parameter is required and cannot be empty'
            );
        }

        try {
            const url = 'https://www.wolframalpha.com/api/v1/llm-api';
            const queryParams: Record<string, string | number> = {
                appid: this.apiKey,
                input: params.input.trim(),
            };

            // Add optional parameters if provided
            if (params.maxchars) queryParams.maxchars = params.maxchars;
            if (params.assumption) queryParams.assumption = params.assumption;
            if (params.units) queryParams.units = params.units;
            if (params.currency) queryParams.currency = params.currency;
            if (params.countrycode) queryParams.countrycode = params.countrycode;
            if (params.languagecode) queryParams.languagecode = params.languagecode;
            if (params.location) queryParams.location = params.location;
            if (params.timezone) queryParams.timezone = params.timezone;
            if (params.width) queryParams.width = params.width;
            if (params.maxwidth) queryParams.maxwidth = params.maxwidth;
            if (params.plotwidth) queryParams.plotwidth = params.plotwidth;
            if (params.scantimeout) queryParams.scantimeout = params.scantimeout;
            if (params.formattimeout) queryParams.formattimeout = params.formattimeout;
            if (params.parsetimeout) queryParams.parsetimeout = params.parsetimeout;
            if (params.totaltimeout) queryParams.totaltimeout = params.totaltimeout;

            const response = await axios.get(url, {
                params: queryParams,
                timeout: (params.totaltimeout || 30) * 1000, // Convert to milliseconds
                headers: {
                    'User-Agent': 'WolframAlpha-MCP-Server/1.0.0',
                },
            });

            if (response.status === 200) {
                const result = response.data;

                // Parse the response to extract useful information
                const lines = result.split('\n');
                let formattedResult = result;

                // Look for assumptions in the response
                const assumptions: string[] = [];
                let inAssumptions = false;

                for (const line of lines) {
                    if (line.includes('Assumptions:') || line.includes('Input interpretation:')) {
                        inAssumptions = true;
                    } else if (inAssumptions && line.trim() && !line.includes('Result:')) {
                        if (line.includes('|')) {
                            assumptions.push(line.trim());
                        }
                    } else if (line.includes('Result:')) {
                        inAssumptions = false;
                    }
                }

                let metadata = `**Query:** "${params.input}"\n\n`;

                if (assumptions.length > 0) {
                    metadata += `**Available Assumptions:**\n${assumptions.join('\n')}\n\n`;
                    metadata += `*If the result is not what you expected, you can use the wolfram_query_with_assumptions tool with one of the assumption values above.*\n\n`;
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: metadata + formattedResult,
                        },
                    ],
                };
            } else {
                throw new McpError(
                    ErrorCode.InternalError,
                    `Wolfram Alpha API returned status ${response.status}: ${response.statusText}`
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 501) {
                    const errorMessage = error.response.data || 'Input cannot be interpreted by Wolfram Alpha';
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        `Wolfram Alpha could not interpret the input: "${params.input}". ${errorMessage}. Try rephrasing your query with simpler, more specific terms.`
                    );
                } else if (error.response?.status === 400) {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        'Invalid request parameters. Please check your input and try again.'
                    );
                } else if (error.response?.status === 403) {
                    const errorData = error.response.data || '';
                    if (errorData.includes('Invalid appid')) {
                        throw new McpError(
                            ErrorCode.InvalidRequest,
                            'Invalid Wolfram Alpha App ID. Please check your WOLFRAM_ALPHA_APP_ID environment variable.'
                        );
                    } else if (errorData.includes('Appid missing')) {
                        throw new McpError(
                            ErrorCode.InvalidRequest,
                            'Wolfram Alpha App ID is missing. Please set the WOLFRAM_ALPHA_APP_ID environment variable.'
                        );
                    } else {
                        throw new McpError(
                            ErrorCode.InvalidRequest,
                            'Authentication failed with Wolfram Alpha API.'
                        );
                    }
                } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                    throw new McpError(
                        ErrorCode.InternalError,
                        'Unable to connect to Wolfram Alpha API. Please check your internet connection.'
                    );
                } else if (error.code === 'ETIMEDOUT') {
                    throw new McpError(
                        ErrorCode.InternalError,
                        'Request to Wolfram Alpha API timed out. The query may be too complex or the service may be temporarily unavailable.'
                    );
                } else {
                    throw new McpError(
                        ErrorCode.InternalError,
                        `Network error: ${error.message}`
                    );
                }
            } else {
                throw new McpError(
                    ErrorCode.InternalError,
                    `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Wolfram Alpha MCP server running on stdio');
    }
}

const server = new WolframAlphaMCPServer();
server.run().catch(console.error); 