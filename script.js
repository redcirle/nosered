const tagline = document.getElementById("tagline");
const phraseArray = ["请保持","心脏跳动，","小丑猫","等着","与你共鸣。"];
const phrasePause = [200,260,260];
const typingSpeed = 240;
const microPause = 110;
const loopPause  = 1600;
let phraseIndex=0,charIndex=0,isTyping=true;
function typeWriter(){
  if(!tagline) return;
  const current=phraseArray[phraseIndex];
  if(isTyping){
    if(charIndex<current.length){
      tagline.innerHTML+=current[charIndex++];
      setTimeout(typeWriter,typingSpeed);
    }else{
      isTyping=false;
      setTimeout(typeWriter,microPause);
    }
  }else{
    phraseIndex++;
    if(phraseIndex>=phraseArray.length){
      setTimeout(()=>{tagline.innerHTML="";phraseIndex=0;charIndex=0;isTyping=true;typeWriter();},loopPause);
    }else{
      const pause=phrasePause[phraseIndex-1]??300;
      charIndex=0;isTyping=true;
      setTimeout(typeWriter,pause);
    }
  }
}
function initSwiper(){
  window.swiper=new Swiper(".swiper-container",{
    loop:true,
    autoplay:{delay:3000,disableOnInteraction:false},
    effect:"coverflow",
    centeredSlides:true,
    slidesPerView:"auto",
    coverflowEffect:{rotate:30,depth:150,slideShadows:true},
    pagination:{el:".swiper-pagination",clickable:true}
  });
}
const resonanceButton=document.getElementById("resonance-button");
const resonanceAudio=document.getElementById("tagline-audio");
let isPlaying=false;
function triggerResonanceAudio(){
  if(!resonanceAudio||isPlaying) return;
  isPlaying=true;
  resonanceAudio.currentTime=0;
  resonanceAudio.play().catch(()=>{});
  resonanceButton.classList.add("auto-hover");
  pauseAutoHover();
}
if(resonanceButton){
  resonanceButton.addEventListener("click",triggerResonanceAudio);
}
if(resonanceAudio){
resonanceAudio.addEventListener("ended",()=>{
  isPlaying=false;
  resonanceButton.classList.remove("auto-hover");
  resumeAutoHover();
});
}
function autoHoverResonanceButton(){
  if(!isPlaying&&resonanceButton){
    resonanceButton.classList.add("auto-hover");
    setTimeout(()=>resonanceButton.classList.remove("auto-hover"),900);
  }
}
let isAutoHoverPaused=false,lastButton=null;
function startAutoHoverFooterButtons(interval=1600){
  const buttons=[...document.querySelectorAll('.footer-button')];
  setInterval(()=>{
    if(isAutoHoverPaused) return;
    if(lastButton) lastButton.classList.remove('auto-hover');
    const cands=buttons.filter(b=>b!==lastButton);
    const next=cands[Math.floor(Math.random()*cands.length)];
    if(next.id==="resonance-button") autoHoverResonanceButton();
    else next.classList.add("auto-hover");
    lastButton=next;
  },interval);
}
function pauseAutoHover(){isAutoHoverPaused=true;}
function resumeAutoHover(){isAutoHoverPaused=false;}
window.addEventListener("load",()=>{typeWriter();initSwiper();startAutoHoverFooterButtons();});
