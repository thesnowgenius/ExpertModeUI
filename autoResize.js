/* Optional: keep if you're embedding in Squarespace/IFrame and want to post height */
(function(){
  function postHeight(){
    try{
      const h = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      window.parent && window.parent.postMessage({snow_genius_height:h}, '*');
    }catch(_){}
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  setInterval(postHeight, 1000);
})();