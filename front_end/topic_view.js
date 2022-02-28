class Topic_view {
    constructor(dom_container_id, _events) {
        this.container_id = dom_container_id;
        let container = document.getElementById(dom_container_id);
        container.innerHTML = "";
        this.dispatcher = d3.dispatch.apply(this, _events);
    }
    on(event_name, event_handler) {
        this.dispatcher.on(event_name, event_handler);
    }
    init(data) {
        let self = this;
        this.data = data;
        this.dot_location = [
            [5.3105288,  171.04965  ],
            [136.30466  ,   23.800941 ],
            [ 101.19055  ,  -84.98519  ],
            [-106.82487  ,  148.84174  ],
            [ -44.36576  ,   78.63272  ],
            [  43.88409  ,   73.47402  ],
            [ 114.09397  ,  135.93303  ],
            [-119.72714  ,  -72.07718  ],
            [ -49.518208 ,   -9.617325 ],
            [-141.93874  ,   40.05521  ],
            [  38.731544 ,  -14.776019 ],
            [ -10.94434  , -107.193344 ]
        ];
        this.topic_names = ['Lockdown', 'Vaccine', 'School', 'Travel', 'Medical', 'Pandemic', 'Vaccine reopen',
                            'Face mask', 'Time', 'COVID-19 test', 'COVID-19 statistics', 'Data update'];
        this.connections = [
            [9, 11, 4, 3, 7], [5, 8, 10, 11, 4], [4, 8, 0, 1, 11], [0, 7, 9, 11, 2], [1, 9, 2, 11, 0], [8, 1, 10, 9, 11],
            [9, 7, 11, 0, 4], [11, 0, 9, 3, 4], [5, 1, 10, 9, 11], [10, 8, 11, 4, 1], [5, 1, 8, 9, 11], [10, 1, 9, 4, 7]
        ];
        this.selected_topic = null;
        let all_x = this.dot_location.map(function(d) {return d[0]});
        let all_y = this.dot_location.map(function(d) {return d[1]});
        let total_days = data.data_per_day.length;
        this.width = document.getElementById(this.container_id).offsetWidth;
        this.height = 0.7 * this.width;
        this.margin = 60;

        this.svg = d3.select("#" + this.container_id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)

        this.x = d3.scaleLinear()
            .domain([Math.min(...all_x), Math.max(...all_x)])
            .range([100, this.width - 100]);

        this.y = d3.scaleLinear()
            .domain([Math.max(...all_y), Math.min(...all_y)])
            .range([this.margin, this.height-this.margin]);

        this.region_color = d3.scaleOrdinal(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']);

        let all_topics = data.data_per_day.map(function(d) {
            return d.topics;
        }).flat();
        let all_radius = all_topics.map(function(d) {return Math.sqrt(d.number_tweets)})

        this.radius = d3.scaleLinear()
            .domain([Math.min(...all_radius), Math.max(...all_radius)])
            .range([20, 160]);


        d3.select("#" + this.container_id)
            .append("div")
            .style("width", '50%')
            .style("margin", "0 auto")
            .html("<label for=\"customRange2\" class=\"form-label\">Example range</label>\n" +
                "<input id='date_slider' type=\"range\" class=\"form-range\" min=\"0\" max=\""+(total_days-1)+"\" id=\"customRange2\">")
        let date = d3.select("#" + this.container_id)
            .select("input")
            .property("value");
        this.render(date)
        this.link_data = self.get_connections();
        d3.select("#" + this.container_id)
            .select("input")
            .on("change", function(d) {
                let date = d3.select(this).property("value");
                console.log(date)
                self.render(date);
                let args = {day: date};
                self.dispatcher.call("change_day", self, args);
                console.log(args);
            })
        this.draw_connections(-1);
    }

    render(date){
        let self = this;

        let data = this.data.data_per_day[date].topics;

        let new_data = data.map(function(d, i) {
            d.x = self.dot_location[i][0];
            d.y = self.dot_location[i][1];
            d.topic_name = self.topic_names[i];
            d.id = i;
            return d;
        })

        // update date shown
        d3.select("#" + this.container_id)
            .select(".form-label")
            .text("Day-"+date)

        // console.log(new_data);
        // Add circles
        let circles = this.svg.selectAll(".topic")
            .data(new_data, function(d) {return d.topic_name});

        circles.enter().append('g')
            .attr("class", "topic")
            .attr("id", function(d) {return "group-"+d.id;})
            .attr("transform", function(d) {return "translate("+self.x(d.x)+", "+self.y(d.y)+")"})
            .append("circle")
            .attr("id", function (d) {return d.id;})
            // .attr("cx", function(d, i) {return self.x(d.x)})
            // .attr("cy", function(d, i) {return self.y(d.y)})
            .style("stroke", function(d) { return self.region_color(d.topic_name); })
            .style("fill", function(d) { return self.region_color(d.topic_name); })
            .style("fill-opacity", 0.6)
            .attr("r", function(d, i) {return self.radius(Math.sqrt(d.number_tweets))})
            .on("mouseover", function (d, i) {
                let selected_node = d3.select(this).attr("id");
                self.draw_connections(selected_node);
            })
            .on("mouseout", function (d, i) {
                self.draw_connections(-1);
            })
            .on("click", function (d, i) {
                if (self.selected_topic === d3.select(this).attr("id")) {
                    self.selected_topic = null;
                    d3.select(this).classed("selected", false);
                    let args={topic: d3.select(this).attr("id")}
                    self.dispatcher.call("unselect", self, args);
                }
                else {
                    if (self.selected_topic) {
                        d3.selectAll('circle').each(function (d, i) {
                            if (i == self.selected_topic) d3.select(this).classed("selected", false);
                        })
                    }
                    self.selected_topic = d3.select(this).attr("id");
                    d3.select(this).classed("selected", true);
                    let args={topic: self.topic_names[d3.select(this).attr("id")]}
                    self.dispatcher.call("select_topic", self, args);
                }

            })

        circles.enter().selectAll('g').append("text")
            .text(function(d){return d.topic_name})
            .style("fill", 'black')
            .attr("text-anchor", 'middle')
            .attr("y", function(d) {return self.radius(Math.sqrt(d.number_tweets)) + 20});

        circles
            .select("circle")
            .transition().duration(500)
            .attr("r", function(d, i) {return self.radius(Math.sqrt(d.number_tweets))});


    }

    draw_connections(node_id) {
        let self = this;
        let connection_info = self.link_data;

        if (node_id!=-1) {
            // if we are on any of the node, show connections starting from the node
            connection_info = connection_info.filter(function (d, i) {
                return (d.start_node == node_id) | (d.start_node == self.selected_topic);
            })

        }
        else if (self.selected_topic){
            connection_info = connection_info.filter(function (d, i) {
                return (d.start_node == self.selected_topic);
            })
        }
        let links = this.svg
            .selectAll(".links")
            .data(connection_info, function (d) {return d.start_node;});

        links.enter()
            .append("line")
            .attr("class", "links")
            .attr("x1", function(d) { return d.start_pos[0]; })
            .attr("y1", function(d) { return d.start_pos[1]; })
            .attr("x2", function(d) { return d.end_pos[0]; })
            .attr("y2", function(d) { return d.end_pos[1]; })
            .style("stroke", function (d) { return self.region_color(d.start_pos); })
            .style("stroke-width", "3px")
            .style("stroke-opacity", 0.5)

        if (node_id != -1 || self.selected_topic) {
            this.svg.selectAll(".links").style("stroke-opacity", 1)
        }
        else {
            this.svg.selectAll(".links").style("stroke-opacity", 0.5)
        }

        links.exit()
            .remove()
    }

    get_connections(){
        // Add connections between circles
        let self = this;
        // let connections = [
        //     [9, 11, 4, 3, 7], [5, 8, 10, 11, 4], [4, 8, 0, 1, 11], [0, 7, 9, 11, 2], [1, 9, 2, 11, 0], [8, 1, 10, 9, 11],
        //     [9, 7, 11, 0, 4], [11, 0, 9, 3, 4], [5, 1, 10, 9, 11], [10, 8, 11, 4, 1], [5, 1, 8, 9, 11], [10, 1, 9, 4, 7]
        // ]

        // tidy up the link data
        let link_data = [];
        for (let start = 0; start < 12; start ++) {
            // d3.transform(d3.select(this).attr("transform")).translate[0];
            // let start_pos = d3.select("#" + self.container_id).select("#group-" + start).attr("transform");
            let start_pos = self.get_circle_center(start);
            console.log(self.connections[start])
            self.connections[start].forEach((node_id, i)=> {
                if (i < 3) {
                    let end_pos = self.get_circle_center(node_id);
                    link_data.push({
                        start_pos: start_pos,
                        end_pos: end_pos,
                        start_node: start,
                        end_node: node_id
                    });
                }
            });
            // console.log(start_pos)
            // this.svg.append("circle")
            //     .attr("cx", start_pos[0])
            //     .attr("cy", start_pos[1])
            //     .attr("r", 2)
            //     .attr("fill", 'black')
            // // console.log(start_pos)
        }
        return link_data
    }

    get_circle_center(circle_id){
        let self=this;
        let transform = d3.select("#" + self.container_id).select("#group-" + circle_id).attr("transform");
        let translate = transform.substring(transform.indexOf("(")+1, transform.indexOf(")")).split(",");
        let x = parseInt(translate[0]);
        let y = parseInt(translate[1]);
        // let bbox = d3.select("#" + self.container_id).select("#group-" + circle_id).select("circle").node().getBBox();
        // let cx = bbox.x + bbox.width/2;
        // let cy = bbox.y + bbox.height/2;
        // let r = bbox.width;
        return [x, y];
    }
}