class Main_view {
	constructor(dom_container_id) {
		let container = document.getElementById(dom_container_id);
		this.container_id = dom_container_id;
		this.dispatch = d3.dispatch("change_day");
		this.date = 0;
		this.topic_name = "Lockdown";
		container.innerHTML = "<div style='display: flex; background-color: Gainsboro;'>" +
		"<div class='container' id='topic_view_container' style='width: 60%; float: left;'></div>" +
		"<div class='container' id='detail_view_container' style='width: 40%; float: left;'></div>" +
		"</div>";
	}

	on(event_name, event_handler) {
		this.dispatch.on(event_name, event_handler);
	}

	init(data) {
		let self = this;
		this.topic_view = new Topic_view("topic_view_container", ["change_day", "select_topic", "unselect"]);
		this.topic_view.init(data);
		this.detail_view = new Detail_view("detail_view_container");
		this.detail_view.init(data);
		require(["dojo/_base/lang"], function(lang){
			// lang now contains the module features
			self.topic_view.on("change_day", lang.hitch(self, self.update_day));
			self.topic_view.on("select_topic", lang.hitch(self, self.update_topic))
		});

		this.topic_view.on("unselect", function (d, i) {console.log("unselect")})
	}

	update_day(args) {
		this.date = parseInt(args.day);
		this.detail_view.render(this.topic_name, this.date);
	}

	update_topic(args) {
		this.topic_name = args.topic;
		this.detail_view.render(this.topic_name, this.date);
	}
}