/**
 * Created by seah on 2019/4/23.
 */
dat_guis = {}

class DATGUIS{
    constructor(viewer){
        this.viewer = viewer
        this.application_monitor = new dat.GUI();
        this.object_inspector = new dat.GUI();
        this.tool_bar_1 = new dat.GUI();
        this._inspection_object_folders = null

        this.set_tool_bar()
        this.set_app_monitor()
        this.set_inspector(null,null)
    }
    set_app_monitor(){
        var gui = this.application_monitor
        var application = gui.addFolder('APPLICATION')
    }
    set_tool_bar(){
        var toobar={
            'box':function(){console.log('create box')},
            'ball':function(){console.log('create ball')},
            'map':function(){console.log('load_map')},
            'poi':function(){console.log('search poi')}
        }
        var gui = this.tool_bar_1
        var creation = gui.addFolder('CREATION')
        var primitives = creation.addFolder('PRIMITIVES')
        primitives.add(toobar,'box')
        primitives.add(toobar,'ball')
        var gis = gui.addFolder('GIS')
        gis.add(toobar,'map')
        gis.add(toobar,'poi')
    }

    set_inspector(id = null, parameters = null){
        var gui = this.object_inspector
        this.clear_inspector()
        if(id!=null && parameters!=null){
            var inspecting_object = gui.addFolder(id)
            inspecting_object.open()
            this._inspection_object_folders.push(inspecting_object)
            var gui_obj={}
            var gui_obj_domain={}
            for(var k  in parameters){
                var value = parameters[k].value
                var lower = Math.round(value/4)
                var higher = value*4
                if(parameters[k].type=='integer')
                    step=1
                else
                    step=1
                    //step = value/10.0
                gui_obj[k] = value
                gui_obj_domain[k] = [higher,lower,step]
            }
            for(var k in gui_obj) {
                if(k in gui_obj_domain){
                    var max = gui_obj_domain[k][0]
                var min = gui_obj_domain[k][1]
                var step = gui_obj_domain[k][2]
                if (min < 1) min = 1
                var control = inspecting_object.add(gui_obj, k, min, max)
                control.step(1)
                }

                function assign_onchange(id, k, control) {
                    control.onChange(function () {
                        var value = gui_obj[k]
                        var msg = 'set_state_value("' + id + '","' + k + '",' + value + ')'
                        console.log(msg)
                        socket.send(msg)
                    })
                }

                assign_onchange(id, k, control)
            }
            var sub_graphs = gui.addFolder('SUBGRAPH')
            this._inspection_object_folders.push(sub_graphs)
            // sub_graphs.add()
        }
        else{
            var prompt = gui.addFolder('sel an obj to inspect')
            this._inspection_object_folders.push(prompt)
        }
    }

    clear_inspector(){
        var gui = this.object_inspector
        for(var f in this._inspection_object_folders){
            console.log('f=',this._inspection_object_folders[f])
            gui.removeFolder(this._inspection_object_folders[f])
        }
        this._inspection_object_folders=[]
    }
}


