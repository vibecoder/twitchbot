import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';
import { promises as fs } from 'fs';
import { Server } from "socket.io";
import http from 'http';
import { api, discovery} from 'node-hue-api';

async function main() {
    const clientId = 'gqdp9ge4a1udxqyi9c38kt2yux53fh';
    const clientSecret = 'un2odqj3aq8ncpanmcp3szdgmbwhsu';
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'UTF-8'));
    // const auth = new StaticAuthProvider(clientId, tokenData.accessToken)
    const auth = new RefreshableAuthProvider(
         new StaticAuthProvider(clientId, tokenData.accessToken),
         {
             clientSecret,
             refreshToken: tokenData.refreshToken,
             expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
             onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                 const newTokenData = {
                     accessToken,
                     refreshToken,
                     expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                 };
                 await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'UTF-8')
             }
         }
     );

    async function getBridge() {
//        const results = await discovery.upnpSearch(10000);
        // Results will be an array of bridges that were found
 //       console.log(JSON.stringify(results, null, 2));
        //if (results[0] === undefined) {
            return "192.168.0.102"
        //} else {
         //   return results[0].ipaddress;
        //}
    }

        const ipAddress = await getBridge();

        // Create an unauthenticated instance of the Hue API so that we can create a new user
        // const unauthenticatedApi = await api.createLocal(ipAddress).connect();
  
        //let createdUser;

            //createdUser = await unauthenticatedApi.users.createUser("twichbot", "twitchbotdevice" );
            //console.log('*******************************************************************************\n');
            //console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
            //            'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
            //            'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
            //console.log(`Hue Bridge User: ${createdUser.username}`);
            //console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
            //console.log('*******************************************************************************\n');
        
            // Create a new API instance that is authenticated with the new user we created
            const authenticatedApi = await api.createLocal(ipAddress).connect("u5K02A1YdgwP2w5tyzPnE7auTh7RXdOZCzHVgIPJ");
        
            // Do something with the authenticated user/api
            const bridgeConfig = await authenticatedApi.configuration.getConfiguration();
            console.log(`Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`);
        

    // Invoke the discovery and create user code

    //getBridge();
    //    authenticatedApi.lights.getLight(1)
    //  .then(lights => {
    //    // Display the full capabilities from the bridge
    //    console.log(JSON.stringify(lights, null, 2));
    //  });

    authenticatedApi.lights.getLightState(1)
  .then(state => {
    // Display the state of the light
    console.log(JSON.stringify(state, null, 2));
  });
    const ioServer = new Server( http.server , {
        cors: { 
        origin: "*", 
        methods: ["GET", "POST"], 
        }
    });

    ioServer.on("connection", socketServer => {

        console.log(socketServer.id);

        // either with send()
        socketServer.send("Hello!");

        // or with emit() and custom event names
        socketServer.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));

        socketServer.emit("FromAPI", Math.floor(Math.random()*10));

        // handle the event sent with socket.send()
        socketServer.on("message", (data) => {
            console.log(data);
        });

        // handle the event sent with socket.emit()
        socketServer.on("salutations", (elem1, elem2, elem3) => {
            console.log(elem1, elem2, elem3);
        });
    });



    const chatClient = new ChatClient(auth, { channels: ['vibecoder'] });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {

        //console.log("recieved message: " + message)

        if (message === '!ping') {
            chatClient.say(channel, 'Pong!');
        } else if (message === '!dice') {
            const diceRoll = Math.floor(Math.random() * 6) + 1;
            chatClient.say(channel, `@${user} rolled a ${diceRoll}`)
        }
        if (message === '!light off') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{on:false}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if (message === '!light on') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{on:true}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if (message === '!light green') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{hue:21840,sat:254}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if (message === '!light red') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{hue:0,sat:254}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if (message === '!light blue') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{hue:43680,sat:254}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if (message === '!light 100') {
            console.log("recieved");            
            authenticatedApi.lights.setLightState(1,{bri: 100}).then(result => {
               console.log(`Light state change was successful? ${result}`);
            });
        }
        if(message === '!spin') {
            // ioServer.on("connection", socketServer => {
                // console.log(socketServer.id);
                ioServer.emit("FromAPI", Math.floor((Math.random()*5)));
            // });
            chatClient.say(channel, 'Hello');
        }
    });

    chatClient.onSub((channel, user) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    chatClient.onResub((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    chatClient.onSubGift((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });

    ioServer.listen(3001);


}



main();

