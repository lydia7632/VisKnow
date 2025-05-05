window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function () {
	// Initialize Bulma carousel and slider
	var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
	}

	bulmaCarousel.attach('.carousel', options);
	bulmaSlider.attach();

	// -------------------------------
	// D3 Knowledge Graph Section
	// -------------------------------

	// Ensure D3 is loaded before running
	if (typeof d3 !== 'undefined') {
		d3.json("static/data/graph1.json").then(function (graph) {
			const width = document.getElementById('graph').clientWidth;
			const height = 600;

			const svg = d3.select("#graph").append("svg")
				.attr("width", width)
				.attr("height", height);

			const simulation = d3.forceSimulation(graph.nodes)
				.force("link", d3.forceLink(graph.links).id(d => d.id).distance(100))
				.force("charge", d3.forceManyBody().strength(-300))
				.force("center", d3.forceCenter(width / 2, height / 2));

			const link = svg.append("g")
				.attr("stroke", "#aaa")
				.selectAll("line")
				.data(graph.links)
				.enter().append("line");

			const node = svg.append("g")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1.5)
				.selectAll("circle")
				.data(graph.nodes)
				.enter().append("circle")
				.attr("r", 8)
				.attr("fill", d => d3.schemeCategory10[d.group % 10])
				.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

			const label = svg.append("g")
				.selectAll("text")
				.data(graph.nodes)
				.enter().append("text")
				.text(d => d.id)
				.attr("font-size", 12)
				.attr("dx", 12)
				.attr("dy", "0.35em");

			simulation.on("tick", () => {
				link
					.attr("x1", d => d.source.x)
					.attr("y1", d => d.source.y)
					.attr("x2", d => d.target.x)
					.attr("y2", d => d.target.y);

				node
					.attr("cx", d => d.x)
					.attr("cy", d => d.y);

				label
					.attr("x", d => d.x)
					.attr("y", d => d.y);
			});

			function dragstarted(event, d) {
				if (!event.active) simulation.alphaTarget(0.3).restart();
				d.fx = d.x;
				d.fy = d.y;
			}

			function dragged(event, d) {
				d.fx = event.x;
				d.fy = event.y;
			}

			function dragended(event, d) {
				if (!event.active) simulation.alphaTarget(0);
				d.fx = null;
				d.fy = null;
			}
		}).catch(error => {
			console.error("Error loading knowledge graph JSON:", error);
		});
	} else {
		console.warn("D3.js not loaded. Knowledge graph will not be rendered.");
	}
	loadGraph('antelope_graph.json');
});

function loadGraph(filename) {
	// 清除旧图
	d3.select("#graph").select("svg").remove();

	const width = document.getElementById('graph').clientWidth;
	const height = 600;

	d3.json("static/data/" + filename).then(function (graph) {
		const svg = d3.select("#graph").append("svg")
			.attr("width", width)
			.attr("height", height);

		const simulation = d3.forceSimulation(graph.nodes)
			.force("link", d3.forceLink(graph.links).id(d => d.id).distance(100))
			.force("charge", d3.forceManyBody().strength(-300))
			.force("center", d3.forceCenter(width / 2, height / 2));


		// 绘制边
		const link = svg.append("g")
			.attr("stroke", "#aaa")
			.selectAll("line")
			.data(graph.links)
			.enter().append("line");

		// 边的标签（显示 name）
		const linkLabel = svg.append("g")
			.selectAll("text")
			.data(graph.links)
			.enter().append("text")
			.text(d => d.name)
			.attr("font-size", 10)
			.attr("fill", "#555");

		// 绘制节点
		const node = svg.append("g")
			.attr("stroke", "#fff")
			.attr("stroke-width", 1.5)
			.selectAll("circle")
			.data(graph.nodes)
			.enter().append("circle")
			.attr("r", 8)
			.attr("fill", d => d3.schemeCategory10[d.id % 10]) // 用 id 保证颜色多样性
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

		// 节点标签（显示 name）
		const label = svg.append("g")
			.selectAll("text")
			.data(graph.nodes)
			.enter().append("text")
			.text(d => d.name)
			.attr("font-size", 12)
			.attr("dx", 12)
			.attr("dy", "0.35em");

		// 动画更新位置
		simulation.on("tick", () => {
			const nodeRadius = 8; // 与 circle 半径一致

			link
				.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);

			node
				.attr("cx", d => d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)))
				.attr("cy", d => d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)));

			label
				.attr("x", d => d.x)
				.attr("y", d => d.y);

			linkLabel
				.attr("x", d => (d.source.x + d.target.x) / 2)
				.attr("y", d => (d.source.y + d.target.y) / 2);
		});

		// 拖拽交互
		function dragstarted(event, d) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(event, d) {
			d.fx = event.x;
			d.fy = event.y;
		}

		function dragended(event, d) {
			if (!event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	}).catch(error => {
		console.error("Error loading " + filename, error);
	});
}
