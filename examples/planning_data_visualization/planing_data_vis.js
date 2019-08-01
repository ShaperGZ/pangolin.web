class PlaningDataVis{
    constructor(canvas_id){
        this.svg = d3.select(canvas_id)
        this.svg.style('background-color','white')

        this.bar_plots={}
        this.bar_plots['score'] = new PlotterBar(this,this.svg, 'score', false, true,'#F2CD78')
        this.bar_plots['gfa'] = new PlotterBar(this,this.svg,'gfa_d',true,true,'#F29878')
        this.bar_plots['coverage'] = new PlotterBar(this,this.svg,'ca_d',true,true,'#6AA4D7')

        this.scatter_plot = new PlotterScatter(this,this.svg,'score','sales','score')
        this.textObj = new PlotterText(this,this.svg)

        this.name_mapper={
            score:'分數',
            far_t:'目標容積率',
            far_a:'實際容積率',
            far_d:'容積率差',
            gfa_t:'目標GFA',
            gfa_a:'實際GFA',
            gfa_d:'GFA差',
            coverage_t:'目標覆蓋面積',
            coverage_a:'實際覆蓋率',
            coverage_d:'覆蓋率差',
            sales_price:'縂銷售金額',
            ca_t:'目標基底面積',
            ca_a:'實際基底面積',
            ca_d:'基底面積差'
        };

        this.data=null
        var self = this

        this.pad_h=15
        this.pad_w=10
        this.bar_text_offset = 100

        var self = this
        // 2d layout variables
        this.lay_scatter_plot ={
            width:function(){return 0.6 * self.canvas_size()[0]}
        }
        this.lay_bar_plot ={
            width:function(){return 0.8 * self.canvas_size()[0]},
            height:function(){return 0.2 *0.8 * self.canvas_size()[0]}
        }


        var self= this
        this.svg.on('mousemove',function(){
            var mouse = d3.mouse(this);
            self.on_mouse_move(mouse[0],mouse[1])
        })
            .on('mouseup',function(){
                var mouse = d3.mouse(this);
                var index = Math.round((mouse[0] - self.bar_text_offset)/self.bar_plots.gfa.get_bar_w());
                if(index<0) index =0
                else if (index>=self.data.length) index = self.data.length-1
                self.select_index(index)
            })
        this.onWindowResize()
        this.onWindowResize()
        this.set_index(0)
    }
    onWindowResize(){
        console.log('onWindowResize')
        var pad=30
        var canvas_w = window.innerWidth-pad;
        var canvas_h = window.innerHeight-pad;
        var count=0;
        var offset = this.lay_scatter_plot.width() + this.pad_h;
        console.log(offset)

        this.svg.attr('width',canvas_w).attr('height',canvas_h);

        //scatter
        this.scatter_plot.set_size(this.lay_scatter_plot.width(),this.lay_scatter_plot.width())
        this.scatter_plot.set_position(canvas_w - this.lay_scatter_plot.width() - 10 ,0)


        //bars
        for(var k in this.bar_plots){
            this.bar_plots[k].set_position(this.bar_text_offset,  (count * (this.bar_plots[k].plot_h+this.pad_h)) + offset)
            this.bar_plots[k].set_size(canvas_w - this.bar_text_offset,canvas_w*0.15)
            count+=1
        }

        this.update_plots()
        this.textObj.update_text()
        // this.update_scatter([0],'a','b')
    }

    canvas_size(){
        var w = this.svg.node().width.baseVal.value
        var h = this.svg.node().height.baseVal.value
        return [w,h]
    }

    set_name_mapper(mapper){
        this.name_mapper=mapper;
    }

    set_data(data){
        this.data=data;
        this.scatter_plot.set_data(data)
        for(var k in this.bar_plots){
            this.bar_plots[k].set_data(data)
        }
    }

    on_mouse_move(x,y){
        if (y< this.lay_scatter_plot.width() ) return;

        var index = Math.round((x - this.bar_text_offset)/this.bar_plots.gfa.get_bar_w());
        if(index<0) index =0
        else if (index>=this.data.length) index = this.data.length-1
        this.set_index(index)



    }

    set_index(index){
        if(this.data==null)return;
        this.scatter_plot.set_index(index)
        for(var k in this.bar_plots){
            this.bar_plots[k].set_index(index)
        }
        this.textObj.set_data(this.data[index])
    }

    select_index(index){
        if(this.data==null)return;
        this.scatter_plot.select_index(index)
        for(var k in this.bar_plots){
            this.bar_plots[k].select_index(index)
        }

        // 往服务器发送指令
        console.log('selected index:',index)
        if(this.socket != undefined && this.socket!=null){
            // 这个是服务器该有的函数
            var msg = 'scene.quantity_solver.set_quantity_scheme('+index+')';
            console.log('socket.send->',msg)
            socket.send(msg)
        }
    }


    update_plots(){
        if(this.data == null) return
        this.scatter_plot.update_plot()
        for(var k in this.bar_plots){
            this.bar_plots[k].update_plot()
        }
    }

    update_sorted(data){
        for(var k in this.bar_plots){
            this.bar_plots[k].update_sort(data)
        }
        // this.sort_score(data,vis.bar_score)
        // this.sort_score(data,vis.bar_gfa)
        // this.sort_score(data,vis.bar_coverage)
    }

    update_bar(key, graphics, position=0, hfactor=2, unit_positive=false){

        // 處理一下數據
        var value = [];
        var _x = []
        this.data.forEach(function(d){
            value.push(d[key]);
            _x.push(d._x)
        });

        // 因爲這個歸一是要算正負數，所以我們提取離零偏差最大的數
        var max = Math.max.apply(Math,value)
        var min = Math.min.apply(Math,value)
        if(-min>max) max=-min


        var normal_value=[]
        for(var i=0;i<value.length;i++){
            var val;
            if(unit_positive){
                val=((value[i]-min)/(max-min))
            }
            else{
                val=value[i]/max
            }
            normal_value.push({_x:_x[i],value:val})
        };

        //畫圖
        var y_offset = this.lay_scatter_plot.width()+(position*(this.lay_bar_plot.height()+this.pad_h))
        y_offset +=this.lay_bar_plot.height()
        graphics.attr("transform", "translate(" + this.bar_text_offset + "," + y_offset + ")");

        var gap =1
        // var bar_plot_width = this.canvas_size()[0] - this.bar_text_offset
        // var bar_w = this._bar_plot_width/data.length - gap
        var bar_w = this._bar_width(data)
        var bar_h = this.lay_bar_plot.height()/ hfactor

        var hline = graphics.selectAll('line').data([0])
        hline.enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', this.canvas_size()[0])
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke','black')

        var rects = graphics
            .selectAll('rect')
            .data(normal_value);

        rects.enter()
            .append('rect')
            // .merge(rects);


        // crate an animation
        // we have to break the chain because after setting animation, can not set 'on()' again
        rects.attr('width',bar_w*0.9)
            // .attr('height',0)
            .transition().duration(1000)
            .attr('x',function(d,i){return d._x*(bar_w)})
            .attr('y',function(d,i){
                if(d.value>0) return d.value*-bar_h;
                else return 0;
            })
            .attr('height',function(d,i){
                return Math.abs(d.value*bar_h);
            })
            .attr('fill','steelblue');

        // assign events
        rects.on('mouseover',function(d,i){
            d3.select(this).attr('fill','orange')
            })
            .on('mouseout',function () {
                d3.select(this).attr('fill','steelblue')
            });


        rects.exit().remove();

        return rects
    }

    sort_score(data,g){
        var gap =1
        var bar_plot_width = this.canvas_size()[0] - this.bar_text_offset
        var bar_w = bar_plot_width/data.length - gap
        var bar_h = this.lay_bar_plot.height()/2

        g.selectAll('rect')
            .data(data)
            .transition().duration(1000)
            .attr('x',function(d,i){return d.order*(bar_w+gap)})
    }

    sort_data(key, ascending=true){
        var data = this.data
        var dup=[]
        for(var i in data){
            dup[i]=data[i];
        }
        dup.sort(function(a,b){
            if (ascending) return b[key]-a[key]
            else return a[key]-b[key]
        })

        for(var i=0;i<data.length;i++){
            var _x = dup[i]._x
            data[_x]['order']=i;
        }

        this.update_sorted(data)
        return data
    }
}