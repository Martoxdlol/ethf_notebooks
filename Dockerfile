FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Build phase
FROM base AS install

# Copy the package.json and lock file
COPY package.json bun.lock ./

# Install the dependencies
RUN bun install

# Copy the source code
COPY . .

# Build the application
RUN bun run build

# Run phase
FROM base AS run

# Copy the built application
COPY --from=install /usr/src/app/dist ./dist

# Expose the port
EXPOSE 3000

# Run the application
CMD ["bun", "run", "start"]