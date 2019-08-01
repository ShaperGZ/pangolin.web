class PlotterBar{
    constructor(host,container, key, signed=true, normalized=true, color='steelblue', ){
        this.host = host
        this.plot_w = 500
        this.plot_h = 200
        this.g = container.append('g')
        this.pg = this.g.append('g')

        this.vline = this.g.append('line')
        this.vline_select = this.g.append('line')
        this.hline = this.g.append('line')
        this.signed=signed
        this.normalized = normalized
        this.text = this.g.append('text')
        this.data=null
        this.data_key=key
        this.bar_w = null
        this.title_text = this.g.append('text')
        this.color=color

    }

    // set_mouse_move(){
    //     var self = this;
    //     this.g.on('mousemove',function(){
    //        var mouse = d3.mouse(this);
    //        console.log(mouse)
    //        var index = Math.round(mouse[0]/self.get_bar_w());
    //        self.set_index(index)
    //
    //     });
    // }

    get_bar_w(){
        return this.bar_w;
    }

    set_data(data){
        this.data=data
        this.bar_w = this.plot_w/this.data.length;
        this.update_plot()
    }

    set_position(x,y){
        this.g.attr('transform','translate('+x+','+y+')');
    }

    set_size(w,h){
        this.plot_w = w;
        this.plot_h = h;
        if (this.data !=null){
            this.bar_w = this.plot_w/this.data.length;
        }
        this.update_plot();
    }

    set_index(index){
        if(this.data==null) return
        var vx = this.bar_w * index + (this.bar_w/2);
        this.vline
            .attr('x1', vx)
            .attr('x2', vx)
            .attr('y1', 0)
            .attr('y2', this.plot_h)
            .attr('stroke','gray');

        var color = this.color
        var value = Math.round(this.data[index][this.data_key]*100)*0.01
        var text = this.data_key+': '+value
        this.text
            .attr('x',vx+2)
            .attr('y',-3)
            .attr('dy','.30em')
            .attr('fill', color)
            .text(text)
    }
    select_index(index){
        if(this.data==null) return
        var vx = this.bar_w * index + (this.bar_w/2);
        this.vline_select
            .attr('x1', vx)
            .attr('x2', vx)
            .attr('y1', 0)
            .attr('y2', this.plot_h)
            .attr('stroke','darkred');


    }

    update_plot(){
        if(this.data == null) return
        var graphics = this.pg;
        var color = this.color;
        var key = this.data_key;
        var plot_h = this.plot_h
        var host = this.host
        //update title
        this.title_text
            .attr('x',-80)
            .attr('y',plot_h/2)
            .attr('fill', color)
            .attr('font-family','monospace')
            .attr('font-weight','bold')
            .attr('font-size','20px')
            .text(this.data_key.toUpperCase());
        this.title_text
            .on('mouseup', function(){
                console.log('mouse up')
                host.sort_data(this.data_key);
            })


        // 處理一下數據
        var value = [];
        var _x = []
        this.data.forEach(function(d){
            value.push(d[key]);
            _x.push(d._x)
        });

        var hfactor=1
        if (this.signed) hfactor=2

        // 因爲這個歸一是要算正負數，所以我們提取離零偏差最大的數
        var max = Math.max.apply(Math,value)
        var min = Math.min.apply(Math,value)
        if(-min>max) max=-min


        var normal_value=[]
        for(var i=0;i<value.length;i++){
            var val;
            if(this.signed == false){
                val=((value[i]-min)/(max-min))
            }
            else{
                val=value[i]/max
            }
            normal_value.push({_x:_x[i],value:val})
        };

        //畫圖
        var gap =1
        // var bar_plot_width = this.canvas_size()[0] - this.bar_text_offset
        // var bar_w = this._bar_plot_width/data.length - gap
        var bar_w = this.bar_w
        var bar_h = this.plot_h / hfactor
        var plot_h = this.plot_h

        this.hline
            .attr('x1', 0)
            .attr('x2', this.plot_w)
            .attr('y1', bar_h)
            .attr('y2', bar_h)
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
                if(d.value>0) return bar_h*(1- d.value);
                else return  bar_h;
            })
            .attr('height',function(d,i){
                return Math.abs(d.value*bar_h);
            })
            .attr('fill',color);



        rects.exit().remove();

        return rects
    }

    update_sort(data){
        var bar_w = this.bar_w
        this.g.selectAll('rect')
            .data(data)
            .transition().duration(1000)
            .attr('x',function(d,i){return d.order*(bar_w)})
    }
}