/* Local-calendar keys with an extensible user timezone preference. */
(function(root){'use strict';
 const DEFAULT_TIME_ZONE='Asia/Dhaka';
 function dateKey(date=new Date(),timeZone=DEFAULT_TIME_ZONE){const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
 function addDays(key,amount){const [y,m,d]=key.split('-').map(Number),x=new Date(Date.UTC(y,m-1,d+amount));return `${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,'0')}-${String(x.getUTCDate()).padStart(2,'0')}`}
 function weekday(key){const [y,m,d]=key.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).getUTCDay()}
 function streak(activeDays,today=dateKey(),includeTodayGrace=true){let cursor=today;if(includeTodayGrace&&!activeDays[cursor])cursor=addDays(cursor,-1);let n=0;while(activeDays[cursor]){n++;cursor=addDays(cursor,-1)}return n}
 function weekDates(today=dateKey()){const mondayOffset=(weekday(today)+6)%7,start=addDays(today,-mondayOffset);return Array.from({length:7},(_,i)=>addDays(start,i))}
 root.MathDates={DEFAULT_TIME_ZONE,dateKey,addDays,weekday,streak,weekDates};if(typeof module!=='undefined'&&module.exports)module.exports=root.MathDates;
})(typeof globalThis!=='undefined'?globalThis:this);
