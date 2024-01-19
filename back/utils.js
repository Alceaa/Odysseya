class Utils{
    constructor(){};

    getDistance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    getDistances = (graph, start) => {
        const distances = {};
        const visited = {};
        let queue = Object.keys(graph);
    
        queue.forEach(node => {
        distances[node] = Infinity;
        });
    
        distances[start] = 0;
    
        while (queue.length > 0) {
        let closestNode = null;
    
        queue.forEach(node => {
            if (!closestNode || distances[node] < distances[closestNode]) {
            closestNode = node;
            }
        });
    
        queue = queue.filter(node => node !== closestNode);
        visited[closestNode] = true;
    
        for (let neighbor in graph[closestNode]) {
            if (!visited[neighbor]) {
            const distance = distances[closestNode] + graph[closestNode][neighbor];
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
            }
            }
        }
        }
    
        return distances;
    }

    defStart = (data) => {
        let start;
        let maxParameter = 0;
        let sumX = 0;
        let sumY = 0;
        for(let i = 0; i < data[1].length; i++){
            sumX += Number(data[1][i]["x"]);
            sumY += Number(data[1][i]["y"]);
        }
        let avgX = sumX / data[1].length;
        let avgY = sumY / data[1].length;

        for(let j = 0; j < data[1].length; j++){
            let parameter = Math.abs(data[1][j]["x"] - avgX) + Math.abs(data[1][j]["y"] - avgY);
            if(parameter > maxParameter){
                maxParameter = parameter;
                start = data[1][j];
            }
        }
        return start;
    }

    makeGraph = (data) =>{
        let graph = {};
        for(let i = 0; i < data[1].length; i++){
            let value = {};
            for(let j = 0; j < data[1].length; j++){
                if(data[1][j]["id"] != data[1][i]["id"]){
                    value[data[1][j]["id"]] = this.getDistance(Number(data[1][i]["x"]), 
                    Number(data[1][i]["y"]), 
                    Number(data[1][j]["x"]),
                    Number(data[1][j]["y"]))
                }
            }
            graph[data[1][i]["id"]] = value;
        }
        return graph;
    }

    getPath = (d) =>{
        let data = d;
        let start = this.defStart(data);
        let path = {};
        path[0] = start;
        let l = data[1].length;
        for(let i = 1; i < l + 1; i++){
            let alg = this.getDistances(this.makeGraph(data), start["id"]);
            let min = Number.MAX_VALUE;
            let minId = -1;
            for(let key in alg){
                if(alg[key] < min && alg[key] != 0){
                    min = alg[key];
                    minId = key;
                }
            }
            data[1].splice(data[1].indexOf(start), 1);
            for(let j = 0; j < data[1].length; j++){
                if(data[1][j]["id"] == minId){
                    path[i] = data[1][j];
                    start = data[1][j];
                    break;
                }
            }
        }
        return path;
    }
}
module.exports = Utils;