/**
 TODO Replace this by your own, correct, triangulation function
 Triangles should be return as arrays of array of indexes
 e.g., [[1,2,3],[2,3,4]] encodes two triangles, where the indices are relative to the array points
 **/



class DCELForIncrementalTriangulation extends DCEL{
    constructor(points){
        super(points);
        this.edgesList[0] = {
            'vertexStart': 0,
            'vertexEnd': 1,
            'faceLeft': 0,
            'faceRight': -1,
            'edgeBefore': 2,
            'edgeNext': 1,
        };
        this.edgesList[1] = {
            'vertexStart': 1,
            'vertexEnd': 2,
            'faceLeft': 0,
            'faceRight': -1,
            'edgeBefore': 0,
            'edgeNext': 2,
        };
        this.edgesList[2] = {
            'vertexStart': 2,
            'vertexEnd': 0,
            'faceLeft': 0,
            'faceRight': -1,
            'edgeBefore': 1,
            'edgeNext': 0,
        };

        this.edgesCount += 3;

        this.facesList[0] = 0;
        this.facesCount += 1;

        this.verticesList[0].edgeIndex = 0;
        this.verticesList[1].edgeIndex = 1;
        this.verticesList[2].edgeIndex = 2;

        this.fixedPoint = this.chooseFixedPointIndex(points);
        this.fixedPointCoordinates = this.getVertexCoordinates(this.fixedPoint);
        this.addPointToFace(this.fixedPoint, 0);
        this.triangulatedCount = 4;
    }


    getFixedPointIndex(){
        return this.fixedPoint;
    }


    chooseFixedPointIndex(points){
        let minimumXCoordinate = points[0].x;
        let maximumXCoordinate = points[0].x;
        let minimumYCoordinate = points[0].y;
        let maximumYCoordinate = points[0].y;
        for(let i=3; i < points.length; i++){ // dont look at enclosing triangle
            minimumXCoordinate = Math.min(minimumXCoordinate, points[i].x);
            maximumXCoordinate = Math.max(maximumXCoordinate, points[i].x);
            minimumYCoordinate = Math.min(minimumYCoordinate, points[i].y);
            maximumYCoordinate = Math.max(maximumYCoordinate, points[i].y);
        }

        let xSpan = (maximumXCoordinate - minimumXCoordinate) / 5;
        let ySpan = (maximumYCoordinate - minimumYCoordinate) / 5;

        let xValuesInTheMiddleStart = (minimumXCoordinate + maximumXCoordinate) / 2 - xSpan;
        let xValuesInTheMiddleEnd = (minimumXCoordinate + maximumXCoordinate) / 2 + xSpan;


        let yValuesInTheMiddleStart = (minimumYCoordinate + maximumYCoordinate) / 2 - ySpan;
        let yValuesInTheMiddleEnd = (minimumYCoordinate + maximumYCoordinate) / 2 + ySpan;
        let matchingX;
        for(let i=3; i < points.length; i++){// dont look at enclosing triangle
            if ( (xValuesInTheMiddleStart < points[i].x) && (points[i].x  < xValuesInTheMiddleEnd)){
                matchingX = i;
                if ( (yValuesInTheMiddleStart < points[i].y) && (points[i].y  < yValuesInTheMiddleEnd) ) {
                    return i;
                }
            }

        }
        if (matchingX)
            return matchingX;
        return 3;
    }

    getEdgeThatDoesntPointToFixedVertexFromSetOfEdges(edgesIndices){
        for(let i=0; i < edgesIndices.length; i++){
            let edgeIndex = edgesIndices[i];
            if (this.getStartingVertexFromEdge(edgeIndex) !== this.fixedPoint && this.getEndingVertexFromEdge(edgeIndex) !== this.fixedPoint){
                return edgeIndex
            }
        }
    }


    addPointOnBoundary(edgeToSplit, newPointIndex){
        let startVertex = this.getStartingVertexFromEdge(edgeToSplit);
        let endVertex = this.getEndingVertexFromEdge(edgeToSplit);

        let nextEdge = this.getNextEdge(edgeToSplit);
        let beforeEdge = this.getBeforeEdge(edgeToSplit);


        let leftFace = this.getLeftFace(edgeToSplit);
        let rightFace = this.getRightFace(edgeToSplit);

        let thirdEdgeInLeftFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(leftFace).filter(
            edge => edge !== edgeToSplit && edge !== beforeEdge
        )[0];
        let thirdEdgeInRightFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(rightFace).filter(
            edge => edge !== edgeToSplit && edge !== nextEdge
        )[0];


        let verticesAroundLeftFace = this.getVerticesIndicesAroundFace(leftFace);
        let verticesAroundRightFace = this.getVerticesIndicesAroundFace(rightFace);

        let thirdVertexFromLeftFace = verticesAroundLeftFace.filter(
            vertex => vertex !== startVertex && vertex !== endVertex
        )[0];
        let thirdVertexFromRightFace = verticesAroundRightFace.filter(
            vertex => vertex !== startVertex && vertex !== endVertex
        )[0];

        let edgesCountBeforeAdding = this.edgesCount;
        let facesCountBeforeAdding = this.facesCount;

        this.edgesCount += 3;
        this.facesCount += 2;

        this.verticesList[newPointIndex].edgeIndex = edgesCountBeforeAdding;
        this.facesList[facesCountBeforeAdding] = edgesCountBeforeAdding + 2;
        this.facesList[facesCountBeforeAdding + 1] = edgesCountBeforeAdding + 2;

        this.edgesList[edgesCountBeforeAdding] = {
            'vertexStart': newPointIndex,
            'vertexEnd': thirdVertexFromLeftFace,
            'faceLeft': facesCountBeforeAdding,
            'faceRight': leftFace,
            'edgeNext': thirdEdgeInLeftFace,
            'edgeBefore': edgesCountBeforeAdding + 2,
        };


        this.edgesList[edgesCountBeforeAdding + 1] = {
            'vertexStart': newPointIndex,
            'vertexEnd': thirdVertexFromRightFace,
            'faceLeft': leftFace,
            'faceRight': facesCountBeforeAdding + 1,
            'edgeNext': thirdEdgeInRightFace,
            'edgeBefore': edgeToSplit,
        };

        this.edgesList[edgesCountBeforeAdding + 2] = {
            'vertexStart': startVertex,
            'vertexEnd': newPointIndex,
            'faceLeft': facesCountBeforeAdding,
            'faceRight': facesCountBeforeAdding + 1,
            'edgeNext': edgesCountBeforeAdding + 1,
            'edgeBefore': beforeEdge,
        };

        this.edgesList[edgeToSplit].vertexStart = newPointIndex;
        this.edgesList[edgeToSplit].edgeBefore = edgesCountBeforeAdding;

        this.replaceFaceIndexWithNewOne(beforeEdge, leftFace, facesCountBeforeAdding);
        this.replaceFaceIndexWithNewOne(thirdEdgeInRightFace, rightFace, facesCountBeforeAdding + 1);
    }

    addPointToTriangulatedSet(newPointIndex){
        let newPointCoordinates = this.getVertexCoordinates(newPointIndex);
        let facesAroundFixedVertex = this.getFacesAroundVertex(this.fixedPoint);
        for(let i = 0; i < facesAroundFixedVertex.length; i++){
            let faceAroundFixedVertex = facesAroundFixedVertex[i];

            // check if point is already in this face
            let verticesIndicesAroundFace = this.getVerticesIndicesAroundFace(faceAroundFixedVertex);
            let verticesCoordinatesAroundFace = verticesIndicesAroundFace.map(this.getVertexCoordinates.bind(this));

            if (isInsideTriangle(verticesCoordinatesAroundFace, newPointCoordinates)){
                this.addPointToFace(newPointIndex, faceAroundFixedVertex);
                this.triangulatedCount++;
                break;
            }

            // let pointOnBoundaryOfTriangle = isOnBoundaryOfTriangle(verticesCoordinatesAroundFace, newPointCoordinates);
            // else if (isOnBoundaryOfTriangle(verticesIndicesAroundFace, newPointCoordinates)) {
            //     let edgesAroundFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(faceAroundFixedVertex);
            //     let edgeToSplit = edgesAroundFace.filter(
            //         edge => orientationTest(this.getVertexCoordinates(this.getStartingVertexFromEdge(edge)),
            //             this.getVertexCoordinates(this.getEndingVertexFromEdge(edge)), newPointCoordinates) === 0
            //     )[0];
            //     this.addPointOnBoundary(edgeToSplit, newPointIndex);
            //     this.triangulatedCount++;
            //     break;
            // }

            else {
                let edgesAroundFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(faceAroundFixedVertex);
                let edgeNotPointingToFixedVertex = this.getEdgeThatDoesntPointToFixedVertexFromSetOfEdges(edgesAroundFace);

                let startVertexCoordinates = this.getVertexCoordinates(this.getStartingVertexFromEdge(edgeNotPointingToFixedVertex));
                let endVertexCoordinates = this.getVertexCoordinates(this.getEndingVertexFromEdge(edgeNotPointingToFixedVertex));

                let a = orientationTest(startVertexCoordinates, endVertexCoordinates, this.fixedPointCoordinates);
                let b = orientationTest(startVertexCoordinates, endVertexCoordinates, newPointCoordinates);
                let c = orientationTest(this.fixedPointCoordinates, newPointCoordinates, startVertexCoordinates);
                let d = orientationTest(this.fixedPointCoordinates, newPointCoordinates, endVertexCoordinates);

                if (a * b < 0 && c * d < 0){
                    let nextFaceToSearch = this.getOtherFaceFromEdge(edgeNotPointingToFixedVertex, faceAroundFixedVertex);
                    let foundFace =  this.recursivelySearchByStabbingLine(edgeNotPointingToFixedVertex, nextFaceToSearch, newPointCoordinates);
                    this.addPointToFace(newPointIndex, foundFace);
                    this.triangulatedCount++;
                    break;
                }
            }
        }
    }

    recursivelySearchByStabbingLine(edgeEnteredBy, faceIndex, newPointCoordinates){
        let verticesIndicesAroundFace = this.getVerticesIndicesAroundFace(faceIndex);
        let verticesCoordinatesAroundFace = verticesIndicesAroundFace.map(this.getVertexCoordinates.bind(this));

        if (isInsideTriangle(verticesCoordinatesAroundFace, newPointCoordinates)){
            return faceIndex
        }
        //
        // let pointOnBoundaryOfTriangle = isOnBoundaryOfTriangle(verticesCoordinatesAroundFace, newPointCoordinates);
        // if (pointOnBoundaryOfTriangle) {
        //     console.log("\n\n\n\n\n\n!!!!!!!!!!!!!!!!!point on boundary", edgeEnteredBy, faceIndex, newPointCoordinates)
        //     // return;
        // }

        let edgesAroundFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(faceIndex);
        let edgesToCheckWhetherTheyCrossWithStabbingLine = edgesAroundFace.filter(edge => edge !== edgeEnteredBy);

        for (let i = 0; i < edgesToCheckWhetherTheyCrossWithStabbingLine.length; i++){
            let edgeToCheck = edgesToCheckWhetherTheyCrossWithStabbingLine[i];
            let startVertexCoordinates = this.getVertexCoordinates(this.getStartingVertexFromEdge(edgeToCheck));
            let endVertexCoordinates = this.getVertexCoordinates(this.getEndingVertexFromEdge(edgeToCheck));
            let a = orientationTest(startVertexCoordinates, endVertexCoordinates, this.fixedPointCoordinates);
            let b = orientationTest(startVertexCoordinates, endVertexCoordinates, newPointCoordinates);
            let c = orientationTest(this.fixedPointCoordinates, newPointCoordinates, startVertexCoordinates);
            let d = orientationTest(this.fixedPointCoordinates, newPointCoordinates, endVertexCoordinates);

            if (a * b < 0 && c * d < 0){
                let nextFaceToSearch = this.getOtherFaceFromEdge(edgeToCheck, faceIndex);
                return this.recursivelySearchByStabbingLine(edgeToCheck, nextFaceToSearch, newPointCoordinates);
            }
        }
    }


    addPointToFace(newPointIndex, faceIndex){
        let edgesCountBeforeAdding = this.edgesCount;
        let facesCountBeforeAdding = this.facesCount;

        let edgesEnclosingFace = this.getEdgesEnclosingFaceInCounterClockwiseOrder(faceIndex);

        this.edgesList[edgesCountBeforeAdding] = {
            'vertexStart': newPointIndex,
            'vertexEnd': this.getStartingVertexFromEdgeWithRespectToFaceBeingOnLeft(
                edgesEnclosingFace[0], faceIndex),
            'faceLeft': facesCountBeforeAdding,
            'faceRight': faceIndex,
            'edgeNext': edgesEnclosingFace[2],
            'edgeBefore': edgesCountBeforeAdding + 1,
        };

        this.replaceFaceIndexWithNewOne(edgesEnclosingFace[0], faceIndex, facesCountBeforeAdding);
        this.replaceEdgeWithNewOne(edgesEnclosingFace[0], edgesEnclosingFace[2], edgesCountBeforeAdding);


        this.edgesList[edgesCountBeforeAdding + 1] = {
            'vertexStart': newPointIndex,
            'vertexEnd': this.getStartingVertexFromEdgeWithRespectToFaceBeingOnLeft(
                edgesEnclosingFace[1], faceIndex),
            'faceRight': facesCountBeforeAdding,
            'faceLeft': facesCountBeforeAdding + 1,
            'edgeNext': edgesEnclosingFace[0],
            'edgeBefore': edgesCountBeforeAdding + 2,
        };

        this.replaceFaceIndexWithNewOne(edgesEnclosingFace[1], faceIndex, facesCountBeforeAdding + 1);
        this.replaceEdgeWithNewOne(edgesEnclosingFace[1], edgesEnclosingFace[0], edgesCountBeforeAdding + 1);

        this.edgesList[edgesCountBeforeAdding + 2] = {
            'vertexStart': newPointIndex,
            'vertexEnd': this.getStartingVertexFromEdgeWithRespectToFaceBeingOnLeft(
                edgesEnclosingFace[2], faceIndex),
            'faceLeft': faceIndex,
            'faceRight': facesCountBeforeAdding + 1,
            'edgeNext': edgesEnclosingFace[1],
            'edgeBefore': edgesCountBeforeAdding,
        };

        this.replaceEdgeWithNewOne(edgesEnclosingFace[2], edgesEnclosingFace[1], edgesCountBeforeAdding + 2);
        this.verticesList[newPointIndex].edgeIndex = edgesCountBeforeAdding; //add information about edge
        this.facesList[faceIndex] = edgesCountBeforeAdding;
        this.facesList[facesCountBeforeAdding] = edgesCountBeforeAdding + 1; //create two new faces
        this.facesList[facesCountBeforeAdding + 1] = edgesCountBeforeAdding + 2;

        this.edgesCount += 3;
        this.facesCount += 2;
    }


    triangulate(){
        for(let i=3; i < this.verticesList.length; i+=1){
            if(i !== this.fixedPoint){
                try{
                    this.addPointToTriangulatedSet(i)
                }
                catch(error){
                    console.warn("problem with point no: ", i);
                    console.warn(error);
                    break;
                }
            }

        }

        console.log("Triangulated", this.triangulatedCount, "points in total out of", this.verticesList.length)
    }
}
