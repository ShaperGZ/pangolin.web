/**
 * Created by seah on 2019/4/23.
 */
dat_guis = {}

class DATGUIS{
    constructor(viewer){
        this.viewer = viewer
        // this.application_monitor = new dat.GUI();
        this.object_inspector = new dat.GUI();
        // this.tool_bar_1 = new dat.GUI();
        this._inspection_object_folders = [];
        this.inspecting_id = null;
        this._inspection_controls = {};
        this._inspection_groups = {};
        this._inspection_control_callbacks = {};
        this.actuator=null;

        this._new_controls={};
        this._new_folders={};

        // this.set_tool_bar()
        // this.set_app_monitor()
        this._set_inspector_recursion(null)
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


    set_inspector(data, id){
        // console.log('set_inspector(data,id)', 'data= ',data, ' id=',id)
        var mode = 0
        if(id != this.inspecting_id){
            this.clear_inspector()

        }
        // console.log('+:',this._new_controls)
        // if(id == this.inspecting_id)
        // {
        //     mode = 1
        //     console.log('set values for existing GUI')
        // }
        // else{
        if(true){
            // this.clear_inspector()
            // console.log('creating new GUI')

            // add button to inspect parent object
            var container_obj={}
            var obj
            if (id in this.viewer.manager.objects)
                obj = this.viewer.manager.objects[id]
            else if (id in this.viewer.component_lib.objects)
                obj = this.viewer.component_lib.objects[id]
            else return


            var gui = this.object_inspector
            if (id != this.inspecting_id && obj.parent!=null && obj.parent != this.viewer.manager.model_container){
                var parent_id = obj.parent.name
                
                container_obj['◄◄ parent']=function(){
                    self.viewer.inspect_object(parent_id)
                }
                var control = gui.add(container_obj,'◄◄ parent')
                this._inspection_controls['parent']=control
            }
        }

        this._set_inspector_recursion(data,null,id,mode)

        // console.log('-:',this._new_controls)
        for(var k in this._inspection_controls){
            if (! k in this._new_controls){
                //TODO: remove widget
                console.log('removeing widget:',k)
                try{
                    gui.remove(this._inspection_controls[k])
                    delete this._inspection_controls[k]
                    delete this._inspection_control_callbacks[k]
                }
                catch(err){
                    // console.log('ERROR! f=',this._inspection_object_folders[f])
                }
            }
        }
        // TODO:remove non existing
        for(var k in this._inspection_object_folders){
            if (! k in this._new_folders){
                //TODO: remove widget
                try{
                    gui.removeFolder(this._inspection_object_folders[k])
                    delete this._inspection_object_folders[k]
                }
                catch(err){
                    // console.log('ERROR! f=',this._inspection_object_folders[f])
                }
            }
        }
        this._new_controls={};
        this._new_folders={};

        this.inspecting_id = id
        
    }

    _empty_function(){var name='empty';}

    set_control_value(control, value, callback){
        console.log('control=',control,' value=',value, ' callback=',callback)
        control.onChange(this._empty_function)
        control.setValue(value)
        control.onChange(callback)
    }

    _set_inspector_recursion(data, gui=null, id=null, mode=0){
        // mode =0 is creation 1 is seting values
        if(data == null) return
        if(gui == null)
            gui = this.object_inspector
            // console.log('id=',id,'gui=',gui, 'data=',data)

        var gui_obj={}
        for(var key in data){
            var value = data[key]['value']
            // if value is a folder
            if (!(value instanceof Array) && (value instanceof Object)){
                var name = key
                if(key=='root') {
                    name += ' : ' + data[key]['id'].split('-')[1]
                }
                if(this._inspection_groups[name]==undefined ){
                    var group = gui.addFolder(name)
                    // console.log(name,group)
                    if(key=='root' || key.indexOf('rule')>=0) {
                        group.open()
                    }
                    this._inspection_groups[name]=group
                    this._new_folders[name]=group
                    this._inspection_object_folders.push(group)
                    this._set_inspector_recursion(value, group, data[key]['id'], mode)
                }
            }
            // if value is a widget
            else if(data[key]!='' || data[key]!=null) {
                if(data[key].value_type=='StateButton'){
                    gui_obj[key]=this._assign_button_callback(gui_obj, key, id)
                    // this._assign_button_callback(gui_obj,key,id)
                    var control = gui.add(gui_obj,key).name(key)
                    this._inspection_controls[id+'.'+key] = control
                    this._new_controls[id+'.'+key] = control
                    this._inspection_control_callbacks[id+'.'+key] = null
                }
                else if('selections' in data[key]){
                    var selections = data[key]['selections']
                    // console.log('mode:', mode, ' selections:', selections)

                    var gui_obj={}
                    gui_obj[key]=value
                    if(this._inspection_controls[id+'.'+key] == undefined){
                        var control = gui.add(gui_obj,key,selections).name(key)
                        control.setValue(value)
                        console.log('control',control)
                        callback = this._assign_value_change_handler(id,key,control,gui_obj)
                        this._inspection_controls[id+'.'+key] = control
                        this._new_controls[id+'.'+key] = control
                        this._inspection_control_callbacks[id+'.'+key] = callback
                    }
                    else if(key != self.actuator){
                        var control = this._inspection_controls[id+'.'+key]
                        this._new_controls[id+'.'+key] = control
                        var callback = this._inspection_control_callbacks[id+'.'+key]
                        this.set_control_value(control, value, callback)
                    }
                }
                else if (value instanceof Array && value.length==3){
                    var xyz = ['x','y','z']
                    var sub_gui_obj={'x':value[0],'y':value[1],'z':value[2]}
                    if (this._inspection_controls[id+'.'+key+'.'+k] == undefined ){
                        var group = gui.addFolder(key)
                        group.open()
                        for(var i in xyz){
                            var k=xyz[i]
                            var control = group.add(sub_gui_obj,k)
                            var callback = this._assign_vector_value_change_handler(id,key,'x','y','z',control,sub_gui_obj)
                            this._inspection_controls[id+'.'+key+'.'+k] = control
                            this._new_controls[id+'.'+key+'.'+k] = control
                            this._inspection_control_callbacks[id+'.'+key+'.'+k] = callback
                        }
                    }
                    else{
                        for(var i in xyz){
                            var k=xyz[i]
                            if(id+'.'+key+'.'+k ==self.actuator){
                                var control = this._inspection_controls[id+'.'+key+'.'+k]
                                this._new_controls[id+'.'+key] = control
                                var callback = this._inspection_control_callbacks[id+'.'+key+'.'+k]
                                var v = sub_gui_obj[k]
                                this.set_control_value(control, v, callback)
                            }
                        } 
                    }
                }
                else{
                    gui_obj[key]=value
                    if(this._inspection_controls[id+'.'+key] == undefined){
                        gui_obj[key]=value
                        var control, callback
                        // console.log('gui_obj=',gui_obj)
                        // control = gui.add(gui_obj,key)
                        //control = gui.add(gui_obj,key)
                        if ('max' in data[key]){
                            control = gui.add(gui_obj,key,data[key]['min'],data[key]['max'],data[key]['step'])
                            // control.max(data[key]['max']).min(data[key]['min'])  
                        }
                        else{
                            control = gui.add(gui_obj,key)
                        }
                        // if('step' in data[key]){
                        //     control.step(data[key]['step'])
                        // }
                        
                        callback = this._assign_value_change_handler(id,key,control,gui_obj)
                        this._inspection_controls[id+'.'+key] = control
                        this._new_controls[id+'.'+key] = control
                        this._inspection_control_callbacks[id+'.'+key] = callback
                    }
                    else {
                        console.log('update_existing widget')
                        console.log('?',this.actuator != key)
                        this._new_controls[id+'.'+key] = control
                        if(this.actuator != key){
                            gui_obj[key]=value
                            var control = this._inspection_controls[id+'.'+key]
                            var callback = this._inspection_control_callbacks[id+'.'+key]

                            this.set_control_value(control, value, callback)
                        }
                        else{
                            console.log('skipping: actuator=',this.actuator, '   key=',key)
                        }
                    }

                }
               
            }
            
        }
    }

    _assign_button_callback(gui_obj, key, id){
        return function(){
            var msg = 'GraphNode.created_objects["'+id+'"].in_nodes["'+key+'"].state_on_click()'
            socket.send(msg)
        }
    }

    _assign_vector_value_change_handler(id, key, x, y, z, control, gui_obj){
        var self = this;
        var set_actuator = this._set_actuator;
        // var get_actuator = this._get_actuator;

        var callback = function () {
            set_actuator(self,key);
            var value = [gui_obj[x],gui_obj[y],gui_obj[z]]
            var msg = 'GraphNode.set_state_value("' + id + '","' + key + '",[' + value + '])'
            // console.log(msg)
            socket.send(msg)
        }
        control.onChange(callback)
        return callback
    }
    _assign_value_change_handler(id, key, control, gui_obj){
        var self = this;
        var set_actuator = this._set_actuator;
        // var get_actuator = this._get_actuator;

        var callback = function () {
            set_actuator(self,key);
            // console.log('after set, self.actuator=',self.actuator)
            var value = gui_obj[key]
            if (typeof(value) == 'string'){
                value = '"'+value+'"';
            }
            else if (typeof(value)== 'boolean'){
                if(value==true) value='True'
                if(value==false) value='False'
            }
            var msg = 'GraphNode.set_state_value("' + id + '","' + key + '",' + value + ')'
            // console.log(msg)
            socket.send(msg)
        }
        // console.log('assign control callback: id='+id+' key='+key+' control='+control+' func'+callback)
        control.onChange(callback)
        return callback
    }

    _set_actuator(self,key){
        // console.log('setting actuator, self:',self,'key=',key)
        self.actuator = key;
    }

    _get_actuator(){
        return this.actuator;
    }


    clear_inspector(){
        var gui = this.object_inspector
        for(var f in this._inspection_object_folders){
            // console.log('f=',this._inspection_object_folders[f])
            try{
                gui.removeFolder(this._inspection_object_folders[f])
            }
            catch(err){
                //console.log('ERROR! f=',this._inspection_object_folders[f])
            }
            
        }
        try{
            gui.remove(this._inspection_controls['parent'])
        }
        catch(err){
            // console.log('ERROR! f=',this._inspection_object_folders[f])
        }

        this.inspecting_id = null
        this._inspection_object_folders=[]
        this._inspection_controls = {}
        this._inspection_groups = {}
        this._inspection_control_callbacks = {}
    }
}


