class PlotterScatter{
    constructor(host,container,x_key, y_key, size_key, normalized = true){
        this.host = host;
        this.plot_w = 500;
        this.plot_h = 500;
        this.x_key = x_key;
        this.y_key = y_key;
        this.size_key = size_key;
        this.g = container.append('g');
        this.pg = this.g.append('g');
        this.highliter = this.g.append('g').append('circle');
        this.selector = this.g.append('g').append('circle');
        this.vline = this.g.append('line');
        this.hline = this.g.append('line');
        this.vline_select = this.g.append('line');
        this.hline_select = this.g.append('line');
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

    update_plot(){
        if(this.data == null) return;

        var graphics = this.g;
        var plot_w = this.plot_w
        var plot_h = this.plot_h
        console.log('plot_w',plot_w)



        //data
        var points = this.pg
            .selectAll('circle')
            .data(this.data)

        points
            .enter()
            .append('circle')



        var normal_x = this.get_normal_value(this.data,this.x_key,false)
        var normal_y = this.get_normal_value(this.data,this.y_key,false)
        var normal_size = this.get_normal_value(this.data,this.size_key, false)

        console.log('normal_x=',normal_x)
        console.log('normal_size=',normal_size)
        var plot_w = this.plot_w
        var plot_h = this.plot_h
        var radius = this.plot_w/60
        var host = this.host

        points
            .attr('cx',function(d,i){return normal_x[0][i].value * plot_w;})
            .attr('cy',function(d,i){return normal_y[0][i].value * plot_h;})
            .attr('r',function(d,i){return normal_size[0][i].value * radius;})
            .attr('stroke','gray')
            .attr('fill','lightgray')
            .on('mouseover',function(d,i){
                host.set_index(i);})
            .on('mouseup',function(d,i){
               console.log('select index:',i)
                host.set_index(i);
            });

        console.log('points=',this.points)


    }

    set_index(index){
        var sel = this.g.selectAll('circle')[0][index]
        var plot_w = this.plot_w
        var plot_h = this.plot_h
        this.highliter
            .attr('cx',sel.cx.baseVal.value)
            .attr('cy',sel.cy.baseVal.value)
            .attr('r',sel.r.baseVal.value)
            .attr('fill','steelblue')

        //vline
        this.vline
            .attr('x1',sel.cx.baseVal.value)
            .attr('x2',sel.cx.baseVal.value)
            .attr('y1',0)
            .attr('y2',plot_h)
            .attr('stroke','lightgray')
        //hline
        this.hline
            .attr('x1',0)
            .attr('x2',plot_w)
            .attr('y1',sel.cy.baseVal.value)
            .attr('y2',sel.cy.baseVal.value)
            .attr('stroke','lightgray')
    }

    select_index(index){
        var sel = this.g.selectAll('circle')[0][index]
        var plot_w = this.plot_w
        var plot_h = this.plot_h
        this.selector
            .attr('cx',sel.cx.baseVal.value)
            .attr('cy',sel.cy.baseVal.value)
            .attr('r',sel.r.baseVal.value)
            .attr('fill','darkred')

        //vline
        this.vline_select
            .attr('x1',sel.cx.baseVal.value)
            .attr('x2',sel.cx.baseVal.value)
            .attr('y1',0)
            .attr('y2',plot_h)
            .attr('stroke','darkred')
        //hline
        this.hline_select
            .attr('x1',0)
            .attr('x2',plot_w)
            .attr('y1',sel.cy.baseVal.value)
            .attr('y2',sel.cy.baseVal.value)
            .attr('stroke','darkred')
    }

    get_normal_value(data,key,signed){
        var value = [];
        var _x = []
        data.forEach(function(d){
            value.push(d[key]);
            _x.push(d._x)
        });

        var hfactor=1
        if (signed) hfactor=2

        // 因爲這個歸一是要算正負數，所以我們提取離零偏差最大的數
        var max = Math.max.apply(Math,value)
        var min = Math.min.apply(Math,value)
        if(-min>max) max=-min


        var normal_value=[]
        for(var i=0;i<value.length;i++){
            var val;
            if(signed == false){
                val=((value[i]-min)/(max-min))
            }
            else{
                val=value[i]/max
            }
            normal_value.push({_x:_x[i],value:val})
        };
        return [normal_value,min,max]
    }
}