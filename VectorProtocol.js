/**
 * Created by Gerryflap on 2015-03-03.
 */

//The VectorProtocol operates on port 9073

function VectorProtocol(serverAddress, videoId, canvas){

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.videoId = videoId;
    this.serverAddress = serverAddress;
    //types 0 = none, 1 = Video, 2 = Streaming
    this.videoType = 0;
    this.videoLength = 0;

    this.handleData = function(data) {
        var thisVectorProtocol = data.srcElement.vectorProtocol;
        data = data.data;
        //data = '{"type" : "NONE"}';
        try {
            data = JSON.parse(data);
            switch (data.type) {
                case "CONNECT_OK":
                    thisVectorProtocol.handleConnectOk(data);
                    break;
                case "FRAME":
                    thisVectorProtocol.handleFrame(data);
                    break;
            }
        } catch (e){
            console.log(e);
        }
    };

    this.send = function(data){
        console.log(JSON.stringify(data));
        this.webSocket.send(JSON.stringify(data));
    };

    this.handleConnectOk = function(data){
        this.videoType = data.videoType;
        if (this.videoType == 1){
            this.videoLength = data.videoLength;
        }

    };

    this.handleFrame = function(data){
        var vectorData = data.vectorData;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(vectorData[0].x, vectorData[0].y);
        for (var i = 1; i < vectorData.length; i++){
            if(vectorData[i].draw){
                this.ctx.lineTo(vectorData[i].x, vectorData[i].y);
            } else {
                this.ctx.moveTo(vectorData[i].x, vectorData[i].y);
            }
        }
        this.ctx.stroke();
    };

    this.initConnection = function(){
        this.webSocket = new WebSocket(this.serverAddress);
        this.webSocket.onmessage = this.handleData;
        this.webSocket.vectorProtocol = this;
        this.webSocket.onopen = this.connectionOpen;
        };
    this.connectionOpen = function(){
        console.log({type : "CONNECT", videoId : this.vectorProtocol.videoId}, this.vectorProtocol);
        this.send({type : "CONNECT", videoId : this.vectorProtocol.videoId});
    }

}
