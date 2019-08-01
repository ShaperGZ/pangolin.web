class PlotterText{
    constructor(host, container){
        this.host = host
        this.g = container.append('g')
        // this.pg = this.g.append('text')
        this.data=null

    }

    set_data(data){
        var arr = []
        for(var k in data){
            if(typeof(data[k])=='number')
                arr.push({key:k, value:Math.round(100*data[k]) * 0.01})
            else arr.push({key:k, value:data[k]})
        }
        this.data=arr
        this.update_text()
    }

    update_text(){
        if(this.data==null)return;
        var length = this.data.length
        if (length < 8) length=8
        var font_h= this.host.lay_scatter_plot.width() / length;
        var textObj = this.g
            .selectAll('text')
            .data(this.data)

        textObj.enter().append('text')
        textObj
            .attr('x',5)
            .attr('y',function(d,i){return 10+ i * font_h;})
            .attr('font-family','monospace')
            .attr('font-weight','bold')
            .attr('font-size',font_h*0.9)
            .text(function (d,i){
                return d.key.toUpperCase()+': '+d.value;
            })

    }
}