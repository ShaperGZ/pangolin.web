
class Interpretor{
    constructor(viewer, manager){
        this.viewer= viewer
        this.manager= manager
    }

    parse(jsonMessage, parse=true){
        var msg=jsonMessage;
        if (parse){
            msg=JSON.parse(jsonMessage);
        }
        var cmd =msg['cmd']
        console.log('interpreting: cmd='+cmd)
        if (cmd == 'set_line_group') this.manager.set_line_group(msg)
        else if (cmd == 'set_mesh') this.manager.set_mesh(msg)
        else if (cmd == 'set_polygon_mesh') this.manager.set_polygon_mesh(msg)
        else if (cmd == 'inspect_inplace') {
            console.log('inspecting inplace')
            set_gui(msg['id'],msg['parameters'])
        }
    }


    parse_multiple(jsonMessage){
        //console.log(jsonMessage)
        var messages = JSON.parse(jsonMessage)
        var ids = []
        //console.log(messages)
        //console.log(messages.length)
        //console.log('message0=',messages[0])
        var self = this
        messages.forEach(function(msg){
            var objid = self.parse(msg, false);
            ids.push(objid);
        });
        return ids;
    }

    
    convert_style(style){
        if('color' in style){
            var c=style['color']
            style['color']=new THREE.Color(c[0],c[1],c[2])

        }
    }
}



 