
FROM node:16


WORKDIR /usr/src/app


COPY package*.json ./

# Install the npm dependencies
RUN npm install

# Step 4: Copy the source code into the container
COPY . . .

# Step 5: Install TypeScript globally (if you want it available in the container for running/compiling)
RUN npm install -g typescript

# Step 6: Compile TypeScript code to JavaScript
RUN npm run build

# Step 7: Expose the port the app runs on (e.g., 4000)
EXPOSE 4000

# Step 8: Run the application
CMD ["npm", "start"]
