FROM node:14

COPY src/ ./src/ 
COPY order-manager ./
RUN npm install --no-optional
EXPOSE 80

CMD ["node", "app.js", "-p", "80", "-d", "config/database.yml"]
