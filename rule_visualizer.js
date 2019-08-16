// sample data:

// inputs:[a]
// rules:[
//  {rule_name:Split, inputs:[a], outputs:[a,b]} //0
//  {rule_name:Split, inputs:[b], outputs:[b,c]} //1
//  {rule_name:Resize, inputs[a], outputs:[a]}   //2
// ]
// outputs:[a,b,c]

//get edges base on data:
// edges:[
//  [rules[0].b,rules[1].b]
//  [rules[0].a,rules[2].a]
//  ]
// for each rule, for each variable, search backward to find the first accurence of the variable

test_data={
    inputs:'A,D',
    rules:[
        // {rule_name:inputs,outputs['A']},
        {rule_name:'Split', inputs:'A', outputs:'A,B',id:'d2gsdf-dsfdshjg-54hf56-vcxghfdk4',
            params:[
                {type:'slider', name:'mySlider',value:12, min:10, max:30, step:1},
                {type:'number', name:'myNUmber',value:34},
                {type:'text', name:'myText', value:'(bdd-bdw)*2'},
                {type:'selection', name:'mySelection',value:'optionA', options:['optionA','optionB','optionC']}
            ]
        },
        // {rule_name:'Split', inputs:'B', outputs:'B,C,D'},
        // {rule_name:'Resize', inputs:'A', outputs:'A'},
        // {rule_name:outputs,inputs['A,B,C']}
    ],
    outputs:'A,B,C,D'
}

class IONode{

    set_data(entry){
        this.title = entry.rule_name;
        var id = entry.id;
        if(entry.inputs!=null)
            var inputs = entry.inputs.split(',')
            for(var i in inputs){
                this.addInput(inputs[i],'string')
            }
        if(entry.outputs != null)
            var outputs = entry.outputs.split(',')
            for(var i in outputs){
                // console.log('['+i+']'+outputs[i])
                this.addOutput(outputs[i],'string')
            }
        if(entry.params != undefined){
            for(var i in entry.params){
                var param = entry.params[i]
                switch (param.type){
                    case 'slider':
                        this.addWidget("slider",
                            param.name,
                            param.value,
                            function(val,wgt,nde){
                                var msg = 'GraphNode.set_state_value("' + id + '","' + param.name + '",' + val + ')'
                                console.log(msg)
                            },
                            {min:param.min,max:param.max,step:param.step});
                        break;
                    case 'number':
                        this.addWidget("number",param.name,param.value);
                        break;
                    case 'text':
                        this.addWidget("string",param.name,param.value);
                        break
                    case 'selection':
                        this.addWidget("combo",param.name,param.value,
                            function(val,wgt,nde){},
                            {values:param.options}
                            );
                        break
                    default:
                        break;
                }
            }
        }// if(entry.params

    }

}

class RuleVisGraph{
    constructor(graph){
        this.graph = graph;
        this.edges=null;
        this.nodes = [];
        console.log('register node')
        LiteGraph.registerNodeType("basic/ionode", IONode);
    }
    set_data(data){
        var internal_data=[];
        // if(data==undefined) return;
        if(data==undefined){
            console.trace('data=',data)
        }
        if(data.inputs != undefined){
            var in_names = data.inputs.split(',')
            for(var i in in_names){
                internal_data.push({rule_name:'Input', inputs:'',outputs:in_names[i]})
            }
        }



        internal_data = internal_data.concat(data.rules);

        if(data.outputs != undefined) {
            var out_names = data.outputs.split(',')
            for(var i in out_names){
                internal_data.push({rule_name:'Output', inputs:out_names[i], outputs:''})
            }
        }


        this.data = internal_data;
        console.table(this.data);
        this.nodes = [];

        this.create_graph();
    }

    clear(){
        this.graph.clear();
        this.nodes = [];
        this.edges = [];
    }

    create_graph(){
        this.edges = this._find_edges()
        this.find_depths()
        this._add_nodes()
        this._connect_nodes()

    }
    find_depths(){
        var data = this.data;
        // var edges = this.edges;
        for( var i in data){
            var rule = data[i];
            // trace the longest path
            // find all edges have target as the rule
            var iedges = this._find_edges_by_target(i);
            var depth = this._find_max_edge_depth(iedges);
            data[i].depth = depth;
        }
    }

    _find_edges_by_target(index){
        //find edges by target index
        var edges=[]
        for(var i in this.edges){
            if(this.edges[i].trg_node == index){
                edges.push(this.edges[i])
            }
        }
        return edges;
    }
    _find_max_edge_depth(edges){
        var max_depth=-1;
        var depth;
        for(var i in edges){
            depth = this._find_edge_depth(edges[i],0);
            if(depth>max_depth){
                max_depth = depth;
            }
        }
        return max_depth+1;

    }
    _find_edge_depth(edge, depth=0){
        var src_index= edge.src_node;
        var newdepth = depth;
        var untested_depth;
        // console.log('src=',src_index, 'trg=',edge.trg_node)
        var counter=0;

        var pre_edges = this._find_edges_by_target(src_index)

        // console.log('pre_edges=',pre_edges)
        for(var j in pre_edges){
            untested_depth = this._find_edge_depth(pre_edges[j],depth+1)
            if(untested_depth > newdepth){
                src_index = pre_edges[j].src_node;
                newdepth = untested_depth;
            }
        }
        if(newdepth>depth) depth = newdepth;
        counter++;


        return depth;
    }

    _add_nodes(){
        var depth,rule,node,posX,posY,unused;
        var hor_gap = 100
        var ver_gap = 50

        //sort nodes by depth
        var depths = []
        var counts = []
        for(var i in this.data){
            rule = this.data[i];
            depth = rule.depth;
            if(depths[depth] == undefined){
                depths[depth] = []
                counts[depth] = 0
            }
            depths[depth].push({rule:rule,data_index:i});
            counts[depth]++;
        }



        // add nodes base on depth
        posX = 0
        for(var i in depths){
            posY = 0
            var max_x = 0
            for(var j in depths[i]){
                // posX = i * hor_gap;
                rule = depths[i][j].rule;
                var data_index = depths[i][j].data_index;
                var node = this.addIONode(rule,data_index,[posX,posY])
                var size = node.size
                posY += size[1] + ver_gap;
                max_x = (size[0] > max_x) ? size[0]:max_x;
            }
            posX += max_x + hor_gap;
        }
    }

    _connect_nodes(){
        var edge, src_node, trg_node;
        for(var i in this.edges){
            edge = this.edges[i];
            src_node =this.nodes[edge.src_node];
            trg_node =this.nodes[edge.trg_node];
            src_node.connect(edge.src_slot, trg_node, edge.trg_slot);
        }
    }

    _find_edges(){
        if(this.data == undefined) return;
        var rules = this.data;
        var names,prev_names,index;
        var edges=[]// each entry:[rule1,output,rule2,input]
        var logs = []
        for(var i=0; i<rules.length; i++){
            var rule = rules[i];
            var depth =0;
            var log = {'i':i}
            names = rule.inputs.split(',')
            log.name = rule.rule_name;
            log.in_names=rule.inputs;
            for(var k=0;k<names.length;k++) {

                // find this input from all previous outputs
                for(var j=i-1;j<i && j>=0;j--){
                    if(rules[j].outputs!=undefined) {
                        prev_names = rules[j].outputs.split(',')
                        index = prev_names.indexOf(names[k])
                        if (index >= 0) {
                            log.k=k

                            log.prev_outnames = rules[j].outputs;
                            log.j=j
                            log.index=index
                            edges.push({src_node:j,src_slot:index,trg_node:i,trg_slot:k})
                            if( i-k < depth)
                                depth = i-k;
                            break;
                        }
                    }
                    else
                        prev_names=[]

                }

            }

            rules[i].depth=depth;
            logs.push(log);
        }
        // console.table(logs);
        return edges;
    }


    addIONode(entry,index,pos){
        var node = LiteGraph.createNode("basic/ionode")
        node.set_data(entry);
        node.pos = pos;
        // node.size=[200,200]

        // sie size
        var out_count, in_count, io_count, param_count;
        out_count = entry.outputs == null? 0: entry.outputs.split(',').length;
        in_count = entry.inputs == null? 0: entry.inputs.split(',').length;
        io_count = (out_count>in_count) ? out_count : in_count;
        param_count = entry.params == undefined ? 0:entry.params.length;
        // io_count += param_count;
        var y = 15+(15*io_count)+(25 * param_count);
        console.log('io_count=',io_count, '  y=', y)
        node.size = [200,y];

        this.nodes[index]=node;
        this.graph.add(node);
        return node
    }


}