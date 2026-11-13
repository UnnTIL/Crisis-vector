/* Crisis Vector — fictional simulation engine. No external dependencies. */
(function (root) {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = n => Number(n).toLocaleString('pt-PT');
  const CITY = { PRT:'Lisboa',ESP:'Madrid',FRA:'Paris',DEU:'Berlim',GBR:'Londres',USA:'Nova Iorque',BRA:'São Paulo',IND:'Nova Deli',CHN:'Xangai',JPN:'Tóquio',ITA:'Roma',RUS:'Moscovo',TUR:'Istambul',ZAF:'Cidade do Cabo',AUS:'Sydney',CAN:'Toronto',MEX:'Cidade do México',ARG:'Buenos Aires',KOR:'Seul',UKR:'Kyiv',EGY:'Cairo',IDN:'Jacarta',NGA:'Lagos',PAK:'Carachi' };
  const LOCAL = { PRT:'Portugal',ESP:'Espanha',FRA:'França',DEU:'Alemanha',GBR:'Reino Unido',USA:'Estados Unidos',BRA:'Brasil',IND:'Índia',CHN:'China',JPN:'Japão',ITA:'Itália',RUS:'Rússia',TUR:'Turquia',ZAF:'África do Sul',AUS:'Austrália',CAN:'Canadá',MEX:'México',ARG:'Argentina',KOR:'Coreia do Sul',UKR:'Ucrânia',EGY:'Egito',IDN:'Indonésia',NGA:'Nigéria',PAK:'Paquistão',SWE:'Suécia',NOR:'Noruega',POL:'Polónia',IRN:'Irão' };
  const SEEDS = { IND:76000, CHN:9000, ESP:2800, BRA:1400, TUR:1100, USA:480, ITA:420, ZAF:350, GBR:300, FRA:180, PRT:105, JPN:60, DEU:45, AUS:12 };
  const UNIT_TYPES = {
    squad: { name:'Infantaria', cost:0.35, power:2.6, relief:0.7, color:'#69baff', radius:44 },
    barrier: { name:'Barreira', cost:0.22, power:1.5, relief:0.5, color:'#ffd27a', radius:57 },
    evac: { name:'Evacuação', cost:0.45, power:0.45, relief:3.0, color:'#69e3b3', radius:55 }
  };
  class SimEngine {
    constructor(data, seed=16927) {
      this._seed = seed >>> 0;
      this.day = 0;
      this.history = [];
      this._eventId = 0;
      this.playerId = 'PRT';
      this.countries = data.map(d => {
        const gdp = Math.max(100, Number(d.gdp) || 1000);
        const pop = Math.max(10000, Number(d.pop) || 1000000);
        const perCap = gdp * 1e6 / pop;
        const prosperity = clamp((Math.log10(Math.max(100,perCap)) - 2.3) / 2.8, .07, 1);
        const infrastructure = clamp(Math.round(25 + prosperity*62), 20, 92);
        const defense = clamp(Math.round(14 + prosperity*34 + 6*Math.log10(Math.max(1, gdp/10000))), 14, 83);
        return {...d, localName: LOCAL[d.id] || d.name, city:CITY[d.id] || ('Área urbana de '+(LOCAL[d.id] || d.name)),
          cases:SEEDS[d.id] || 0, deaths:0, saved:0, infrastructure, defense,
          budget: Math.max(.55, Math.round(gdp*.055/1000*10)/10),
          economy:100, stability: clamp(Math.round(59+prosperity*35), 51, 94),
          trust: clamp(Math.round(35+prosperity*30 + (this.random()-.5)*18),20,85),
          relations: clamp(Math.round(48 + (this.random()-.5)*25),20,80),
          borders:false, emergency:false, mobilized:false, aidDays:0,
          units:[], citySeed:Math.floor(this.random()*1000000), _alertStage:0 };
      });
      this.byId = Object.fromEntries(this.countries.map(c=>[c.id,c]));
      if(!this.byId[this.playerId]) this.playerId = this.countries[0].id;
      this.log('CENTRO DE OPERAÇÕES','Foram confirmados focos de infeção em vários continentes. A comunidade internacional reúne-se em sessão de emergência.','alert');
      this.log('SITUAÇÃO NACIONAL',`O governo de ${this.player.localName} recebeu os primeiros relatórios. As autoridades aguardam ordens.`, 'info');
    }
    random(){this._seed=(Math.imul(1664525,this._seed)+1013904223)>>>0;return this._seed/4294967296;}
    get player(){return this.byId[this.playerId];}
    getCountry(id){return this.byId[id] || null;}
    get date(){let d=new Date(Date.UTC(2027,2,15));d.setUTCDate(d.getUTCDate()+this.day);return d;}
    log(topic, message, type='info'){
      this.history.unshift({id:++this._eventId,day:this.day,topic,message,type});
      if(this.history.length>80)this.history.length=80;
    }
    get global(){let infected=0,dead=0,affected=0,stability=0;
      for(const c of this.countries){infected+=c.cases;dead+=c.deaths; if(c.cases>0)affected++; stability+=c.stability;}
      return {infected:Math.round(infected),dead:Math.round(dead),affected,stability:Math.round(stability/this.countries.length)};
    }
    togglePolicy(key){
      if(!['borders','emergency','mobilized'].includes(key))return {ok:false,message:'Política desconhecida.'};
      const c=this.player;const cost=key==='mobilized'?1.2:key==='emergency'?.8:.5;
      if(!c[key] && c.budget<cost)return {ok:false,message:'Orçamento insuficiente para esta medida.'};
      c[key]=!c[key]; if(c[key]) c.budget-=cost;
      const names={borders:'controlo reforçado de fronteiras', emergency:'estado de emergência',mobilized:'mobilização das forças militares'};
      this.log('DECISÃO GOVERNAMENTAL',`${c.localName}: ${names[key]} ${c[key]?'ativado':'desativado'}.`,c[key]?'action':'info');
      return {ok:true,message:c[key]?'Medida implementada.':'Medida terminada.'};
    }
    takeControl(id){
      const c=this.getCountry(id); if(!c)return {ok:false,message:'País indisponível.'};
      this.playerId=id;this.log('TRANSFERÊNCIA DE COMANDO',`Passaste a coordenar a resposta de ${c.localName}.`,'action');
      return {ok:true,message:'Controlo transferido.'};
    }
    sendAid(id){
      const target=this.getCountry(id), src=this.player, cost=.8;
      if(!target||target.id===src.id)return {ok:false,message:'Seleciona outro país.'};
      if(src.budget<cost)return {ok:false,message:'Recursos insuficientes para ajuda humanitária.'};
      src.budget-=cost; src.trust=clamp(src.trust+2,0,100);
      target.aidDays=Math.max(target.aidDays,8); target.stability=clamp(target.stability+2,0,100);target.relations=clamp(target.relations+10,0,100);
      this.log('DIPLOMACIA',`${src.localName} enviou ajuda humanitária para ${target.localName}. Cooperação reforçada por 8 dias.`, 'success');
      return {ok:true,message:'Ajuda enviada. Reforço temporário de contenção.'};
    }
    deployUnit(type,x,y){
      const info=UNIT_TYPES[type], c=this.player;
      if(!info)return {ok:false,message:'Unidade desconhecida.'};
      if(c.budget<info.cost)return {ok:false,message:'Recursos insuficientes.'};
      if(c.units.length>=26)return {ok:false,message:'Limite operacional local atingido.'};
      c.budget=Math.round((c.budget-info.cost)*100)/100;
      const obj={id:this._eventId+1, type, x:clamp(x,.04,.96),y:clamp(y,.06,.94),day:this.day};c.units.push(obj);
      this.log('OPERAÇÃO URBANA',`${c.city}: ${info.name.toLowerCase()} posicionada na área assinalada.`, 'action');
      return {ok:true,message:`${info.name} mobilizada com sucesso.`};
    }
    advance(days=1){
      for(let day=0;day<days;day++)this._step();
      return this.global;
    }
    _step(){
      this.day++;
      const old=this.countries.map(c=>({...c,units:c.units}));
      const hot=old.filter(c=>c.cases>200).sort((a,b)=>b.cases-a.cases).slice(0,16);
      for(const c of this.countries){
        if(c.id!==this.playerId){
          const rel=c.cases/c.pop;
          if(!c.emergency && rel>.00022 && c.stability>30 && this.random()<.24)c.emergency=true;
          if(!c.borders && rel>.000035 && c.economy>58 && this.random()<.22)c.borders=true;
          if(!c.mobilized && rel>.0015 && c.budget>1 && this.random()<.18)c.mobilized=true;
        }
        let imports=0;
        for(const source of hot){if(source.id===c.id)continue;
          const dist=distanceKm(source.center,c.center);
          // Most contagion moves through regional connections. Intercontinental
          // imports are uncommon and require economically connected hubs.
          const regional = Math.exp(-dist/1950)*(source.continent===c.continent?1:.38);
          const airHub = source.gdp>700000 && c.gdp>300000 ? .004 : .0002;
          const ports = clamp(Math.sqrt(Math.max(100,c.gdp)/100000),.17,1.8);
          const risk = Math.sqrt(source.cases/10000) * (regional*.058+airHub) * ports *
            (c.borders?.10:1) * (source.borders?.40:1);
          imports+=risk;
        }
        if(c.continent==='Seven seas (open ocean)') imports=0;
        const incoming=Math.floor(imports)+(this.random()<imports%1?1:0);
        const unitsPower=c.units.reduce((acc,u)=>acc+(UNIT_TYPES[u.type]?.power||0),0);
        const relief=clamp(unitsPower*.009,0,.18);
        const containment=clamp((c.emergency?.48:0) + (c.mobilized?.16:0) + (c.aidDays>0?.11:0) + relief,0,.83);
        const growth=Math.round(c.cases * (.115 * (1-containment)) * (.89+this.random()*.22));
        const kills=Math.round(c.cases*(.015+c.defense*.00036)*(c.mobilized?1.65:1)*(1+relief*.45));
        // Civilian losses are abstracted; this is not a clinical epidemiological model.
        const newlyDead=Math.min(c.pop-c.deaths, Math.round(c.cases*(.0017+(1-c.infrastructure/100)*.0028)*(c.emergency?.82:1)));
        c.deaths+=newlyDead;
        const newCases = clamp(c.cases + growth + incoming - kills, 0, c.pop-c.deaths);
        c.cases=Math.round(newCases);
        const evacUnits=c.units.filter(u=>u.type==='evac').length;
        c.saved+=Math.round(evacUnits * (8+this.random()*11)*(1+Math.log10(1+c.cases)*.2));
        c.budget=Math.max(0,c.budget-(c.emergency?.085:0)-(c.mobilized?.18:0)-(c.borders?.04:0)+Math.max(.002,c.gdp/10000000));
        c.economy=clamp(c.economy-(c.borders?.16:0)-(c.emergency?.23:0)-Math.min(.5,c.cases/c.pop*140) + .035,0,100);
        c.stability=clamp(c.stability-Math.min(1.8,c.cases/c.pop*105)-(c.emergency?.09:0)+(c.aidDays>0?.035:0)+ (c.cases===0?.035:0),0,100);
        if(c.aidDays>0)c.aidDays--;
        const ratio=c.cases/c.pop;
        const stage=ratio>=.1?4:ratio>=.01?3:ratio>=.001?2:ratio>=.0001?1:0;
        if(stage>c._alertStage){
          c._alertStage=stage;
          if(stage>=2 || c.id===this.playerId)this.log('ALERTA EPIDEMIOLÓGICO',`${c.localName}: infeção alcançou ${(ratio*100).toFixed(2).replace('.',',')}% da população.`,stage>=3?'alert':'info');
        }
      }
      if(this.day===5)this.log('CIMEIRA INTERNACIONAL','A comunidade internacional debate corredores humanitários e restrições de circulação.', 'info');
      if(this.day===14)this.log('INTELIGÊNCIA E DEFESA','Os serviços de informações alertam para falhas na cadeia logística e na comunicação entre governos.', 'alert');
      if(this.day%7===0){const g=this.global;
        this.log('RELATÓRIO SEMANAL',`Existem ${fmt(g.infected)} infetados estimados em ${g.affected} países. ${fmt(g.dead)} vítimas acumuladas.`,g.infected>800000?'alert':'info');
      }
    }
  }
  function distanceKm(a,b){
    let x=(a[0]-b[0])*Math.PI/180, y=(a[1]-b[1])*Math.PI/180;
    const s=Math.sin(y/2)**2+Math.cos(a[1]*Math.PI/180)*Math.cos(b[1]*Math.PI/180)*Math.sin(x/2)**2;
    return 12742*Math.asin(Math.min(1,Math.sqrt(s)));
  }
  const api={SimEngine,UNIT_TYPES,distanceKm,clamp,fmt};
  root.CrisisSim=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
