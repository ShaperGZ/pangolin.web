class BaiduMap{
    constructor(domid){
        var dom = document.getElementById(domid)
        // dom.style.width='60%';
        // dom.style.height='80%';
        // dom.style.marginLeft='20%';
        // dom.style.marginTop='10%';

        this.dom=dom;

        var map = new BMap.Map(domid);
        var poi = new BMap.Point(113.33127,23.1399);
        map.centerAndZoom(poi, 16);
        map.enableScrollWheelZoom();


        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());
        map.addControl(new BMap.MapTypeControl());
        map.setCurrentCity("广州");
        this.map = map;
        // this.hide();

    }

    show(){
        this.dom.style.display='block';
    }

    hide(){
        this.dom.style.display='none';
    }
}