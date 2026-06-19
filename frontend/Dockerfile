FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL=http://itayepckhl0wh3m5gh64w7y9.138.121.128.232.sslip.io
ENV API_URL=${API_URL}

RUN apk add --no-cache gettext

COPY package*.json ./
RUN npm install

COPY . .
RUN envsubst < src/environments/environment.prod.ts.template > src/environments/environment.prod.ts
RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
