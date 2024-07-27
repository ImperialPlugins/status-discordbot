FROM node:lts AS dependencies

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -rm -g app -G audio,video app

FROM dependencies AS builder

WORKDIR /home/app

COPY yarn.lock package.json /home/app/
RUN yarn install --frozen-lockfile

FROM builder AS runtime

COPY index.js config.json /home/app/

RUN chown -R app:app /home/app
RUN chmod -R 755 /home/app

USER app
ENV CHROME_PATH="/usr/bin/google-chrome"

CMD ["yarn", "start"]