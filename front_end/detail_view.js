class Detail_view {
    constructor(dom_container_id) {
        this.container_id = dom_container_id;
        let container = document.getElementById(dom_container_id);
    }

    init(data){
        let self = this;
        console.log(data);
        this.data = data;
        let total_days = data.data_per_day.length;
        let date = 0;
        this.width = document.getElementById(this.container_id).offsetWidth;
        this.height = 0.7*this.width;
        this.margin = 40;
        this.topic_names = ['Lockdown', 'Vaccine', 'School', 'Travel', 'Medical', 'Pandemic', 'Vaccine reopen',
                            'Face mask', 'Time', 'COVID-19 test', 'COVID-19 statistics', 'Data update'];
        this.topic_color = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];

        d3.select("#" + this.container_id).append('h2').attr('id', 'div1');
        d3.select("#" + this.container_id).append('div').attr('id', 'div2');
        d3.select("#" + this.container_id).append('div').attr('id', 'div3');
        d3.select("#" + this.container_id).append('div').attr('id', 'div4');
        d3.select("#" + this.container_id).append('div').attr('id', 'div5').attr("class","interval");
        d3.select("#" + this.container_id).append('div').attr('id', 'div6');
        // let select = d3.select("#div1")  .append('select')
        //     .attr('class','select')
        //     .style("left", "0px")
        //     .style("top", "0px")
        //     .on('change',function(){self.render(d3.select('select').property('value'), date);})
        // let options = select      .selectAll('option')
        //                         	.data(this.topic_names).enter()
        //                         	.append('option')
        //                         		.text(function (d) { return d; });

        this.cloud_svg = d3.select("#div2")
                                              .append("svg")
                                              .attr("width", 250)
                                              .attr("height", 250)
                                              .append("g")
                                              .attr("transform",
                                                    "translate(125,125)");

        this.pie_svg = d3.select("#div2")
          .append("svg")
            .attr("width", 250)
            .attr("height", 250)
          .append("g")
            .attr("transform", "translate(125,125)");
        //this.eg_svg = d3.select("#div3")
        //  .append("svg")
          //.attr("id", 'text_svg')
      //      .attr("width", 500)
        //    .attr("height", 500)
        //    .attr("stroke", "black");
            //.attr("transform", "translate(125,125)");

        self.render("Lockdown", date);

    }

    render(_subset, date){
      let self = this;
      let data_subset = self.data;
      for (let i=0;i<self.topic_names.length;i++)
      {
        if (self.topic_names[i] == _subset){
          self.num_topic = i;
        }
      }
      this.eg_tweets = self.data.data_per_day[date].topics[self.num_topic].example_tweets;
      // console.log(this.eg_tweets);
      let senti_subset = self.data.data_per_day[date].topics[self.num_topic].sentiment_distribution;
      this.senti_subset = {'positive': senti_subset[0], 'neutral': senti_subset[1], 'negtive': senti_subset[2]};
      let topic_subset = self.data.topic_details[self.num_topic];
      self.pairs = topic_subset.split(' + ');
      self.weights =  self.pairs.map(function(d) {return (parseFloat(d.split('*')[0])); });
      self.words = self.pairs.map(function(d) {return (d.split('*')[1].split('\"')[1]); });
      d3.select("#div1").text(_subset).style("font-family", "verdana")
          .style("color", function (d) {
              let topic_id = self.topic_names.indexOf(_subset);
              return self.topic_color[topic_id];
          })

      var myWordCloud = self.wordCloud("#" + self.container_id);
      self.showNewWords(myWordCloud, _subset);
      self.draw_pie();
      self.show_eg();
    }

    getWords() {
        let self = this;
        // console.log(self.weights);
        return self.pairs
              .map(function(d) {return {text: d.split('*')[1].split('\"')[1], size: Math.max(25, parseInt(500*parseFloat(d.split('*')[0])))};})
    }
    showNewWords(vis, option) {
        let self = this;
        // console.log(self.getWords());
        vis.update(self.getWords());
        if (option === d3.select('#div1').text()) {
            setTimeout(function() { self.showNewWords(vis, option)}, 5000);
        }

    }
    wordCloud(selector) {
        let self = this;
        let fill = d3.scaleOrdinal(d3.schemeCategory10);

        let svg = self.cloud_svg;
        svg.selectAll('g text').remove();
        // Refresh svg! or end cloud()


        //Draw the word cloud
        function draw(words) {
            var cloud = svg.selectAll("g text")
                            .data(words, function(d) { return d.text; })

            //Entering words
            cloud.enter()
                .append("text")
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return fill(i); })
                .attr("text-anchor", "middle")
                .attr('font-size', 1)
                .text(function(d) { return d.text; });

            //Entering and existing words
            cloud
                .transition()
                    .duration(600)
                    .style("font-size", function(d) { return d.size + "px"; })
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .style("fill-opacity", 1);

            //Exiting words
            cloud.exit()
                .transition()
                    .duration(200)
                    .style('fill-opacity', 1e-6)
                    .attr('font-size', 1)
                    .remove();
        }



        return {

            update: function(words) {
                d3.layout.cloud().stop();
                d3.layout.cloud().size([200, 200])
                    .words(words)
                    .padding(5)
                    .rotate(function() { return ~~(Math.random() * 2) * 90; })
                    .font("Impact")
                    .fontSize(function(d) { return d.size; })
                    .on("end", draw)
                    .start();
            }
        }

    }
draw_pie(){
  let self = this;
  let width = 250,
    height = 250,
    margin = 20;
const radius = Math.min(width, height) / 2 - margin;
var svg = self.pie_svg;
let data1 = self.senti_subset
// set the color scale
const color = d3.scaleOrdinal()
  .domain(["positive", "neutral", "negative"])
    .range(['#99d594','#ffffbf','#99d594', '#fc8d59'])
  // .range(d3.schemeDark2);

// A function that create / update the plot for a given variable:
function update_pie(data) {

  // Compute the position of each group on the pie:
  const pie = d3.pie()
    .value(function(d) {return d[1]; })
    .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart
  const data_ready = pie(Object.entries(data))

  // map to data
  const u = svg.selectAll("path")
    .data(data_ready)
u
  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    .join('path')
    .transition()
    .duration(1000)
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(color(d.data[0])) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)

    u
  .exit()
  .remove()


}

update_pie(data1);

}

show_eg(){
  let self = this;
  let text_svg = self.eg_svg;
  console.log(self.eg_tweets);
  let string = ""
  let egs = self.eg_tweets.slice(0,3);
  d3.select("#div3").text("Tweets Examples: \n").attr("class", "title");
  d3.select("#div4").text(egs[0].content).attr("class", "text");
  //d3.select("#div5").text("Example 2: "+egs[1].content).attr("class", "text");
  d3.select("#div6").text(egs[1].content).attr("class", "text");
  //d3.select("#div3").selectAll('text').remove();
  //let text = d3.select("#div3").append("text").attr("font-size",8);
  //text.selectAll("tspan")
  //.data(egs)
  //.enter()
  //.append("tspan")
  //.attr("x",0)
  //.attr("dy","1em
  //.attr("dy","2em")
  //.text(function(d){
  // return d.content;
  //});
  //for (let i=0;i<10;i++){
  //  string = string+i.toString()+self.eg_tweets[i].content+'\n\n';
    //d3.select("#div3").text(self.eg_tweets[i].content);
  //}
  //d3.select("#eg_svg").text("Practice");

}

}
