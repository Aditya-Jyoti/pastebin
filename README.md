# Pastebin Application

A modern, minimal pastebin application with custom slugs, authentication, and syntax highlighting.

## Features

- **Custom Slugs**: Each user gets a unique 3-character code allowing multiple users to have the same slug
- **Private/Public Pastes**: Toggle between public and private with password protection
- **Authentication**: Complete login/signup system with JWT tokens
- **Syntax Highlighting**: Support for 25+ programming languages
- **Markdown Support**: Special rendering for markdown content
- **Admin Dashboard**: View all your pastes with click tracking
- **Raw Content View**: Access raw paste content at \`/raw\` endpoint
- **Gruvbox Theme**: Modern, minimal UI with authentic Gruvbox colors

## Quick Start with Docker

1. Clone the repository
2. Copy the environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Update the environment variables in \`.env\` (especially the JWT_SECRET)

4. Start the application:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

5. The application will be available at \`http://localhost:3000\`

## URL Structure

- Main site: \`paste.omrin.in\`
- User pastes: \`paste.omrin.in/ABC/my-custom-slug\`
- Raw content: \`paste.omrin.in/ABC/my-custom-slug/raw\`
- Dashboard: \`paste.omrin.in/dashboard\`

## Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start PostgreSQL (or use Docker):
   \`\`\`bash
   docker-compose up postgres -d
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Production Deployment

1. Update \`.env\` with production values
2. Configure SSL certificates in nginx.conf if using HTTPS
3. Run with Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Environment Variables

- \`DATABASE_URL\`: PostgreSQL connection string
- \`JWT_SECRET\`: Secret key for JWT tokens (change in production!)
- \`NEXT_PUBLIC_APP_URL\`: Public URL of your application
- \`NODE_ENV\`: Environment (development/production)

## Security Notes

- Change the JWT_SECRET in production
- Use HTTPS in production
- Configure proper firewall rules
- Regular database backups recommended
- Consider rate limiting for API endpoints
