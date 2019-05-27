class UpdateMapButton {

    constructor(id, mapdata, socket = null) {
        this.mapdata = mapdata
        this.socket = socket
        var div = document.createElement('div');
        div.appendChild(document.createTextNode("update map"));
        div.style.cursor = "pointer";
        div.style.border = "1px solid gray";
        div.style.backgroundColor = "white";
        this.assignOnClick(div)

        var dom = document.getElementById(id)
        dom.appendChild(div)
    }

    assignOnClick(dom) {
        var mapdata = this.mapdata
        var socket=this.socket
        dom.onclick = function (e) {
            console.log('updating map:')
            var text = 'center=' + mapdata.center
            console.log(text)
            var msg = 'scene.map.set_center("'+mapdata.center+'")'
            console.log(mapdata.boundary)
            console.log(msg)

            if(socket != null)
                socket.send(msg)
        }

    }
}

