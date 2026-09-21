/* LearnandForge course runtime: self-marking quizzes, per-course progress (saved only in this browser), active-module highlighting. No dependencies. */
(function(){
  function initCourse(root){

  var KEY='lf-progress:'+(root.getAttribute('data-course')||'course');
  var TOTAL=root.querySelectorAll('.quiz').length;
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
  function save(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
  function render(p){
    var passed=0;
    root.querySelectorAll('.nav-item[data-key]').forEach(function(a){
      var r=p[a.dataset.key]; a.classList.remove('done','passed');
      var sc=a.querySelector('.sc'); if(sc) sc.textContent='';
      if(r){ a.classList.add(r.passed?'passed':'done'); if(sc) sc.textContent=r.score+'/'+r.total; if(r.passed) passed++; }
    });
    var fill=root.querySelector('#progress-fill'), txt=root.querySelector('#progress-text');
    if(fill) fill.style.width=(TOTAL?Math.round(passed/TOTAL*100):0)+'%';
    if(txt) txt.textContent='ප්‍රශ්නාවලි '+passed+' / '+TOTAL+' සමත්'+(passed===TOTAL&&TOTAL?' — පාඨමාලාව සම්පූර්ණයි!':'');
  }
  root.querySelectorAll('.quiz').forEach(function(quiz){
    var key=quiz.dataset.quiz, qs=Array.prototype.slice.call(quiz.querySelectorAll('.q'));
    var check=quiz.querySelector('.check'), reset=quiz.querySelector('.reset'), score=quiz.querySelector('.score');
    var pass=Math.ceil(qs.length*0.6);
    function restore(){
      var p=load(), r=p[key]; if(!r||!r.answers) return;
      qs.forEach(function(q,i){ var v=r.answers[i]; if(!v) return; var inp=q.querySelector('input[value="'+v+'"]'); if(inp) inp.checked=true; });
      grade(false);
    }
    function grade(persist){
      var correct=0, answered=0, answers=[];
      qs.forEach(function(q){
        var sel=q.querySelector('input:checked'), expl=q.querySelector('.expl');
        q.classList.remove('correct','wrong','unanswered');
        q.querySelectorAll('label').forEach(function(l){ var i=l.querySelector('input'); l.classList.toggle('is-answer', !!i && i.value===q.dataset.answer); });
        if(!sel){ q.classList.add('unanswered'); if(expl) expl.hidden=true; answers.push(null); return; }
        answered++; answers.push(sel.value);
        if(sel.value===q.dataset.answer){ correct++; q.classList.add('correct'); } else { q.classList.add('wrong'); }
        if(expl) expl.hidden=false;
      });
      if(answered<qs.length){ score.textContent='සියලු ප්‍රශ්නවලට පිළිතුරු දෙන්න ('+answered+'/'+qs.length+')'; return; }
      var msg='ලකුණු: '+correct+'/'+qs.length;
      msg+= correct===qs.length ? ' — විශිෂ්ටයි!' : (correct>=pass ? ' — සමත්' : ' — මොඩියුලය නැවත කියවා උත්සාහ කරන්න');
      score.textContent=msg;
      if(persist){ var p=load(); p[key]={score:correct,total:qs.length,passed:correct>=pass,answers:answers}; save(p); render(p); }
    }
    if(check) check.addEventListener('click',function(){grade(true)});
    if(reset) reset.addEventListener('click',function(){
      qs.forEach(function(q){ q.classList.remove('correct','wrong','unanswered'); q.querySelectorAll('input').forEach(function(i){i.checked=false}); q.querySelectorAll('label').forEach(function(l){l.classList.remove('is-answer')}); var e=q.querySelector('.expl'); if(e) e.hidden=true; });
      score.textContent=''; var p=load(); delete p[key]; save(p); render(p);
    });
    restore();
  });
  render(load());
  /* active section in syllabus */
  if('IntersectionObserver' in window){
    var items={}; root.querySelectorAll('.nav-item[href^="#"]').forEach(function(a){items[a.getAttribute('href').slice(1)]=a});
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ Object.keys(items).forEach(function(k){items[k].classList.remove('active')}); var a=items[en.target.id]; if(a) a.classList.add('active'); } });
    },{rootMargin:'-20% 0px -70% 0px'});
    root.querySelectorAll('.course-main section[id]').forEach(function(s){io.observe(s)});
  }

  }
  function boot(){ document.querySelectorAll('.course-root').forEach(initCourse); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',boot); } else { boot(); }
})();
