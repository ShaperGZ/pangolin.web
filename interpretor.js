Interpretor = function(viewer){
    this.viewer=viewer;
    var self=this;

    this.parse=function(jsonMessage){
        var msg=JSON.parse(jsonMessage);
        var command=msg['cmd'];
        if (command.includes('set_')){
            var data=msg['data'];
            self.convert_style(data['s'])
            return eval('self.viewer.'+command+'(data)');
        }
        else if(command.includes('del')){
            return eval('self.viewer.'+command+'(data)');
        }

    }

    this.convert_style=function(style){
        if('color' in style){
            var c=style['color']
            style['color']=new THREE.Color(c[0],c[1],c[2])

        }
    }
}
