// Enables dragging of any element with the class "window" using InteractJS.
// The InteractJS library must be loaded separately via a <script> tag.

interact('.window').draggable({
  listeners:{
    move(event){
      const t=event.target,x=(parseFloat(t.getAttribute('data-x'))||0)+event.dx,y=(parseFloat(t.getAttribute('data-y'))||0)+event.dy;
      t.style.transform=`translate(${x}px,${y}px)`;
      t.setAttribute('data-x',x);
      t.setAttribute('data-y',y);
    }
  }
});