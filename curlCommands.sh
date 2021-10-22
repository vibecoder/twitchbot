#/bin/bash

curl https://id.twitch.tv/oauth2/authorize?client_id=$TWITCH_CLIENT_ID&redirect_uri=$TWITCH_REDIRECT_URI&response_type=code&scope=chat:read+chat:edit
