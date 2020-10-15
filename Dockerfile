FROM node:14

COPY src/ ./src/ 
COPY order-manager ./
RUN npm install --no-optional
EXPOSE 8080

CMD ["node", "app.js", "-p", "8080", "-d", "config/database.yml"]
