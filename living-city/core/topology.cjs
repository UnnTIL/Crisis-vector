'use strict';

function createCity() {
  const city={width:96,height:70,buildings:[],roads:[],sidewalks:[],crossings:[],blocks:[],
    pedestrianGraph:{nodes:[],edges:[]},vehicleGraph:{nodes:[],edges:[]}};
  const xs=[5,26,48,70,92],zs=[5,34,65];
  const roadNodes=[];
  const edge=(graph,a,b,kind)=>{
    const na=graph.nodes.find(n=>n.id===a),nb=graph.nodes.find(n=>n.id===b);
    graph.edges.push({from:a,to:b,kind,length:Math.hypot(na.x-nb.x,na.z-nb.z),blocked:false});
  };
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){
    const n={id:`road-${row}-${col}`,x:xs[col]+[0,1.2,-.8][row],z:zs[row]+[0,.9,-.7,1.1,0][col]};
    city.vehicleGraph.nodes.push(n);roadNodes.push(n);
  }
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){
    const a=roadNodes[row*5+col];
    for(const [r,c] of [[row,col+1],[row+1,col]])if(r<3&&c<5){
      const b=roadNodes[r*5+c];edge(city.vehicleGraph,a.id,b.id,'road');
      city.roads.push({id:`road-segment-${a.id}-${b.id}`,points:[{x:a.x,z:a.z},{x:b.x,z:b.z}],width:4.8});
    }
  }
  const rings=[];
  for(let row=0;row<2;row++)for(let col=0;col<4;col++){
    const id=`block-${row*4+col+1}`,tl=roadNodes[row*5+col],tr=roadNodes[row*5+col+1],bl=roadNodes[(row+1)*5+col],br=roadNodes[(row+1)*5+col+1];
    const left=Math.max(tl.x,bl.x)+3.8,right=Math.min(tr.x,br.x)-3.8,top=Math.max(tl.z,tr.z)+3.8,bottom=Math.min(bl.z,br.z)-3.8;
    const middle=(left+right)/2;
    const points=[{x:left,z:top},{x:middle,z:top},{x:right,z:top},{x:right,z:(top+bottom)/2},
      {x:right,z:bottom},{x:middle,z:bottom},{x:left,z:bottom},{x:left,z:(top+bottom)/2}];
    const nodes=points.map((p,i)=>({id:`${id}-walk-${i}`,...p}));city.pedestrianGraph.nodes.push(...nodes);
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i],b=nodes[(i+1)%nodes.length];edge(city.pedestrianGraph,a.id,b.id,'sidewalk');
      city.sidewalks.push({id:`${id}-side-${i}`,points:[{x:a.x,z:a.z},{x:b.x,z:b.z}],width:1.4});
    }
    city.blocks.push({id,x:(left+right)/2,z:(top+bottom)/2,width:right-left,depth:bottom-top});rings.push(nodes);
    for(let index=0;index<4;index++){
      const buildingNumber=(row*4+col)*4+index+1,bid=`building-${String(buildingNumber).padStart(2,'0')}`;
      const side=index<2?0:1,x=left+(right-left)*(index%2?.72:.28),z=top+(bottom-top)*(side?.72:.28);
      const type=buildingNumber===3?'hospital':buildingNumber===27?'station':buildingNumber%4===0?'office':buildingNumber%4===2?'shop':'residential';
      const width=Math.min(4.4,(right-left)*.32),depth=5.2;
      const portal={id:`${bid}-entrance`,x,z:z+(side?1:-1)*(depth/2+.35)};
      const access={id:`${bid}-sidewalk`,x,z:side?bottom:top};city.pedestrianGraph.nodes.push(portal,access);
      edge(city.pedestrianGraph,portal.id,access.id,'entrance');
      const sideNodes=side?[nodes[4],nodes[5],nodes[6]]:[nodes[0],nodes[1],nodes[2]];
      const closest=sideNodes.slice().sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)||a.id.localeCompare(b.id))[0];
      edge(city.pedestrianGraph,access.id,closest.id,'sidewalk');
      city.sidewalks.push({id:`${bid}-access`,points:[{x:portal.x,z:portal.z},{x:access.x,z:access.z},{x:closest.x,z:closest.z}],width:1.1});
      const vehicleNode=roadNodes.slice().sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)||a.id.localeCompare(b.id))[0];
      city.buildings.push({id:bid,type,name:type==='hospital'?'Hospital do Bairro':type==='station'?'Esquadra Central':type==='residential'?`Habitação ${buildingNumber}`:type==='shop'?`Comércio ${buildingNumber}`:`Serviços ${buildingNumber}`,
        x,z,width,depth,height:type==='hospital'?6.4:type==='station'?4.4:3.2+(buildingNumber%3)*1.1,entranceNodeIds:[portal.id],vehicleNodeId:vehicleNode.id,capacity:type==='hospital'?4:type==='station'?12:12});
    }
  }
  const crossing=(a,b,id)=>{
    edge(city.pedestrianGraph,a.id,b.id,'crossing');
    city.crossings.push({id,points:[{x:a.x,z:a.z},{x:b.x,z:b.z}],width:2});
  };
  for(let row=0;row<2;row++)for(let col=0;col<4;col++){
    const ring=rings[row*4+col];
    if(col<3)crossing(ring[3],rings[row*4+col+1][7],`cross-east-${row}-${col}`);
    if(row<1)crossing(ring[5],rings[4+col][1],`cross-south-${col}`);
  }
  for(const roadNode of roadNodes){
    const access={id:`foot-${roadNode.id}`,x:roadNode.x,z:roadNode.z,roadNodeId:roadNode.id};
    const neighbors=rings.flat().slice().sort((a,b)=>Math.hypot(a.x-access.x,a.z-access.z)-Math.hypot(b.x-access.x,b.z-access.z)||a.id.localeCompare(b.id)).slice(0,2);
    city.pedestrianGraph.nodes.push(access);
    for(const n of neighbors)crossing(access,n,`parking-${roadNode.id}-${n.id}`);
  }
  return city;
}
module.exports={createCity};
