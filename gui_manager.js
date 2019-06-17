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
        this._inspection_object_folders = []
        this.inspecting_id = null
        this._inspection_controls = {}
        this._inspection_groups = {}
        this._inspection_control_callbacks = {}

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
        var mode = 0
        if(id == this.inspecting_id) 
        {
            mode = 1
            // console.log('set values for existing GUI')
        }
        else{
            this.clear_inspector()
            // console.log('creating new GUI')

            // add button to inspect parent object
            var container_obj={}
            var obj = this.viewer.manager.model_container.getObjectByName(id)
            var gui = this.object_inspector
            if (obj.parent != this.viewer.manager.model_container){
                var parent_id = obj.parent.name
                
                container_obj['◄◄ parent']=function(){
                    console.log('asking to insepect ',parent_id)
                    self.viewer.inspect_object(parent_id)
                }
                var control = gui.add(container_obj,'◄◄ parent')
                this._inspection_controls['parent']=control
            }
        }
        this._set_inspector_recursion(data,null,id,mode)

        if(mode ==0){
            if (obj.children.length>0){
                var folder = gui.addFolder('►► children')
                folder.open()
                this._inspection_object_folders.push(folder)
                
                for(var i in obj.children){
                    // console.log('i=',i)
                    var child = obj.children[i]
                    if(child.name != undefined && child.name.length == 36)
                    {
                        // console.log('added child.name = ',child.name)
                        var short_id = '►► '+child.name.split('-')[1]
                        var assign_button_callback=function(child){
                            container_obj[short_id]=function(){
                                console.log('gui send: inspect',child.name)
                                self.viewer.inspect_object(child.name)
                            }
                        }
                        assign_button_callback(child)
                        var control = folder.add(container_obj,short_id)
                        this._inspection_controls[short_id]=control
                    }
                } // end for i
            }
        }
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
            // if value is a dictionary
            if (!(value instanceof Array) && (value instanceof Object)){
                var name = key
                if(mode==0){
                    if(key=='root') {
                        name += data[key]['id'].split('-')[1]
                    }
                    var group = gui.addFolder(name)
                    // console.log(name,group)
                    if(key=='root' || key.indexOf('rule')>=0) {
                        group.open()
                    }
                    this._inspection_groups[name]=group
                    this._inspection_object_folders.push(group)
                    this._set_inspector_recursion(value, group, data[key]['id'], mode)

                }
                else{
                    if(key!='root') {
                        var group = this._inspection_groups[name]
                        group.name = key
                    }
                }
            }
            else {
                if('selections' in data[key]){
                    var selections = data[key]['selections']
                    console.log('mode:', mode, ' selections:', selections)

                    var gui_obj={}
                    gui_obj[key]=value
                    if(mode == 0){
                        var control = gui.add(gui_obj,key,selections).name(key)
                        control.setValue(value)
                        console.log('control',control)
                        callback = this._assign_value_change_handler(id,key,control,gui_obj)
                        this._inspection_controls[id+'.'+key] = control
                        this._inspection_control_callbacks[id+'.'+key] = callback
                    }
                    else{
                        var control = this._inspection_controls[id+'.'+key]
                        var callback = this._inspection_control_callbacks[id+'.'+key]
                        this.set_control_value(control, value, callback)
                    }
                }
                else if (value instanceof Array && value.length==3){
                    var xyz = ['x','y','z']
                    var sub_gui_obj={'x':value[0],'y':value[1],'z':value[2]}
                    if (mode ==0 ){
                        var group = gui.addFolder(key)
                        group.open()
                        for(var i in xyz){
                            var k=xyz[i]
                            var control = group.add(sub_gui_obj,k)
                            var callback = this._assign_vector_value_change_handler(id,key,'x','y','z',control,sub_gui_obj)
                            this._inspection_controls[id+'.'+key+'.'+k] = control
                            this._inspection_control_callbacks[id+'.'+key+'.'+k] = callback
                        }
                    }
                    else{
                        for(var i in xyz){
                            var k=xyz[i]
                            var control = this._inspection_controls[id+'.'+key+'.'+k]
                            var callback = this._inspection_control_callbacks[id+'.'+key+'.'+k]
                            var v = sub_gui_obj[k]
                            this.set_control_value(control, v, callback)
                        } 
                    }
                }
                else{
                    gui_obj[key]=value
                    if(mode == 0){
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
                        this._inspection_control_callbacks[id+'.'+key] = callback
                    }
                    else{
                        var control_key = id+'.'+key
                        console.log('control key =',control_key)
                        var control = this._inspection_controls[id+'.'+key]
                        var callback = this._inspection_control_callbacks[id+'.'+key]
                        this.set_control_value(control, value, callback)
                    }
                    
                }
               
            }
            
        }
    }

    _assign_vector_value_change_handler(id, key, x, y, z, control, gui_obj){
        var callback = function () {
            var value = [gui_obj[x],gui_obj[y],gui_obj[z]]
            var msg = 'GraphNode.set_state_value("' + id + '","' + key + '",[' + value + '])'
            console.log(msg)
            socket.send(msg)
        }
        control.onChange(callback)
        return callback
    }
    _assign_value_change_handler(id, key, control, gui_obj){
        var callback = function () {
            var value = gui_obj[key]
            if (typeof(value) == 'string'){
                value = '"'+value+'"';
            }
            var msg = 'GraphNode.set_state_value("' + id + '","' + key + '",' + value + ')'
            // console.log(msg)
            socket.send(msg)
        }
        // console.log('assign control callback: id='+id+' key='+key+' control='+control+' func'+callback)
        control.onChange(callback)
        return callback
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


