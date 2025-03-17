/** 
 * SINGLE FILE SERVER
 * (webSocketServer)
 *  creates ws server for base64 images and to broadcast simple messages
 * (streamServer)
 *  creates http server for streaming images
 * (StubServer)
 *  additional stubserver to hold data
 */
const express = require('express');
const fs = require('fs');
const { Server } = require("socket.io");
const http = require('http');
const https = require('https');
const config = require('./config');
const withssl = config.key && config.cert;
let options = {};
if(withssl) {
    options = {
        key: fs.readFileSync(config.key),
        cert: fs.readFileSync(config.cert),
        ca: fs.readFileSync(config.ca),
    };
}
/** simple observer class */
class RoomDataObserver {constructor() {this.observers = [];}subscribe(observer) {this.observers.push(observer);}unsubscribe(observer) {this.observers = this.observers.filter(sub => sub !== observer);}notify(room, data) {this.observers.forEach(observer => {observer.update(room, data);});}}
const dataObserver = new RoomDataObserver();

// chunksize is 65536 (64*1024)
/**
 * Stream server
 *  `broadcast` room for simple broadcasting
 *  all other rooms for streaming, expects base64 image data
 * todo encode using ffmpeg, see require('fluent-ffmpeg');
 * https://socket.io/docs/v4/server-socket-instance/
 */
const webSocketServer = https.createServer(options);
const iocors = {
    cors: {
      origin: config.allowedOrigins,
      credentials: false
    }
};
const io = new Server(webSocketServer, iocors);
io.on("connection", (client) => {
    client.onAny((room, ...data) => {
        if (room.includes(config.BROADCAST_CHANNEL)) {
            io.emit(room, data);
        } else if (room.includes(config.STREAMING_CHANNEL)) {
            try {
                config.PERSIST_WBM&&fs.appendFileSync('stream.webm', data);
                const base64Data =  data.toString().replace(/^data:image\/\w+;base64,/, ''); //'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABAL...';
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const assignedRoom = room.replace(config.STREAMING_CHANNEL,'');
                dataObserver.notify(assignedRoom, imageBuffer);
            } catch (error) {
                console.error('Error passing imageBuffer');
            }
        }
    });
    client.on('disconnect', () => { 
        console.log('client disconnected');
    });
});
const logmsgws = () => console.log('Socket io server is running on port:', config.portws);
webSocketServer.listen(config.portws, logmsgws);

// HTTP endpoint to serve video data using multipart/x-mixed-replace
/**
 * connect url to live view stream, data is not persisted
 * @example http://localhost:2222/stream/pillar1
 * http://localhost:2222/stream/:name
 * :name is the stream connection name in websocket ( event name )
 */
const logmsg = () => console.log('Streaming server running at <STREAMING_CHANNEL>/<:name of streaming client>');
const streamServer = express();
const streamroom_path = '/' + config.STREAMING_CHANNEL + ':room?';
streamServer.get(streamroom_path, (req, res) => {
    const pathroom = req.params.room;
    const ENTER = "\r\n\r\n";
    if (!pathroom) {res.status(400).send('Missing :name parameter');return;}
    res.writeHead(200, {'Content-Type': "multipart/x-mixed-replace; boundary=FRAME"});

    const subscriber = {
        update: (room, data) => {
            if(pathroom !== room) return;
            res.write("--FRAME\r\n");
            res.write("Content-Type: image/jpeg\r\n");
            res.write("Content-Length: " + data.length);
            res.write(ENTER);
            res.write(data);
            res.write(ENTER);
        }
    };
    dataObserver.subscribe(subscriber);
    req.on('close', () => {
        res.end();
        res.destroy();
        dataObserver.unsubscribe(subscriber);
    });
});
const httpStrewamServer = http.createServer(streamServer);
httpStrewamServer.listen(config.porthttp, logmsg);
if(withssl){
    const httpsStreamServer = https.createServer(options, streamServer);
    httpsStreamServer.listen(config.porthttps, logmsg);
}
/**********************************************************************************/
/*******************       END OF STARTUP-SERVER       ****************************/
/**********************************************************************************/

/**
--myboundary
Content-Type: image/jpeg
Content-Length: 12345

[binary data of the JPEG frame]

--myboundary
Content-Type: image/jpeg
Content-Length: 12345

[binary data of the next JPEG frame]

 */