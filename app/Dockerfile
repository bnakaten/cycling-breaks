FROM node:26-alpine AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock .yarnrc.yml ./
COPY --from=build /app/dist ./dist
RUN yarn install --production --immutable
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
