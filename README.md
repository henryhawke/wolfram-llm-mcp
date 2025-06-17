# Wolfram Alpha MCP Server
[![smithery badge](https://smithery.ai/badge/@henryhawke/wolfram-llm-mcp)](https://smithery.ai/server/@henryhawke/wolfram-llm-mcp)

A Model Context Protocol (MCP) server that provides access to Wolfram Alpha's computational knowledge engine through natural language queries.

## Features

- 🧮 **Mathematical Calculations**: Solve equations, perform complex calculations, and work with mathematical formulas
- 🔬 **Scientific Computing**: Access physics, chemistry, and scientific data
- 🌍 **Geographic Information**: Get information about countries, cities, and geographic features
- 📚 **Knowledge Base**: Query facts about history, art, astronomy, and more
- 📊 **Data Analysis**: Generate plots, analyze datasets, and perform statistical calculations
- 🔄 **Multiple Interpretations**: Handle ambiguous queries with assumption-based clarification

## Tools

### `wolfram_query`

Query Wolfram Alpha for computational, mathematical, scientific, and factual information.

**Parameters:**

- `input` (required): The natural language query to send to Wolfram Alpha
- `maxchars` (optional): Maximum number of characters in the response (default: 6800)
- `assumption` (optional): Assumption to use when Wolfram Alpha provides multiple interpretations
- `units` (optional): Unit system preference (e.g., "metric", "imperial")
- `currency` (optional): Currency preference for financial calculations
- `countrycode` (optional): Country code for localized results
- `languagecode` (optional): Language code for results
- `location` (optional): Location for location-specific queries
- `timezone` (optional): Timezone for time-related calculations

### `wolfram_query_with_assumptions`

Query Wolfram Alpha with specific assumptions when the initial query returns multiple interpretations.

**Parameters:**

- `input` (required): The exact same input from the previous query
- `assumption` (required): The assumption value to use from the previous query result
- `maxchars` (optional): Maximum number of characters in the response (default: 6800)

## Setup

### Prerequisites

1. **Node.js**: Version 18.0.0 or higher
2. **Wolfram Alpha App ID**: Get one from the [Wolfram Alpha Developer Portal](https://developer.wolframalpha.com/)

### Installing via Smithery

To install wolfram-llm-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@henryhawke/wolfram-llm-mcp):

```bash
npx -y @smithery/cli install @henryhawke/wolfram-llm-mcp --client claude
```

### Installation

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd wolfram-alpha-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Configuration

Set your Wolfram Alpha App ID as an environment variable:

```bash
export WOLFRAM_ALPHA_APP_ID=your_app_id_here
```

Or create a `.env` file:

```
WOLFRAM_ALPHA_APP_ID=your_app_id_here
```

### Getting a Wolfram Alpha App ID

1. Visit the [Wolfram Alpha Developer Portal](https://developer.wolframalpha.com/)
2. Sign up for a Wolfram ID or log in
3. Go to the "My Apps" tab
4. Click "Sign up to get your first AppID"
5. Complete the survey and create your app
6. Copy your App ID for use with this MCP server

## Usage

### Running the Server

```bash
npm start
```

### Example Queries

- **Mathematics**: "solve x^2 + 5x + 6 = 0"
- **Physics**: "speed of light in vacuum"
- **Chemistry**: "molecular weight of caffeine"
- **Geography**: "population of Tokyo"
- **Astronomy**: "distance to Andromeda galaxy"
- **History**: "when was the Eiffel Tower built"
- **Unit Conversion**: "convert 100 fahrenheit to celsius"
- **Financial**: "apple stock price"

### Handling Multiple Interpretations

When Wolfram Alpha provides multiple interpretations of a query, the server will include available assumptions in the response. You can then use the `wolfram_query_with_assumptions` tool to get more specific results.

## Best Practices

1. **Query Optimization**: Convert complex questions to simplified keyword queries when possible

   - Instead of: "how many people live in France"
   - Use: "France population"

2. **Language**: Send queries in English only; translate non-English queries before sending

3. **Mathematical Notation**: Use proper mathematical notation

   - Use `6*10^14` instead of `6e14`
   - Use single-letter variable names with optional subscripts

4. **Units**: Include spaces between compound units (e.g., "Ω m" for "ohm\*meter")

## Error Handling

The server provides comprehensive error handling for common issues:

- **Invalid App ID**: Check your `WOLFRAM_ALPHA_APP_ID` environment variable
- **Uninterpretable Input**: The query cannot be understood by Wolfram Alpha
- **Network Issues**: Connection problems with the Wolfram Alpha API
- **Timeouts**: Query too complex or service temporarily unavailable

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm start`: Run the compiled server

### Project Structure

```
src/
├── index.ts          # Main server implementation
package.json          # Package configuration and MCP metadata
tsconfig.json         # TypeScript configuration
README.md            # This file
```

## API Reference

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification and uses the [Wolfram Alpha LLM API](https://products.wolframalpha.com/llm-api/documentation).

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
