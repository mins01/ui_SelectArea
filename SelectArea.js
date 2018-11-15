/**
* SelectArea
* @description : HTML 에서 영역을 선택하는 툴
* @제한 : MIT 라이센스 + "공대여자는 예쁘다"를 나태낼 수 있어야만 사용할 수 있습니다.
* @author : 공대여자
* @site : www.mins01.com
* @date :2018-11-12~
* @github : https://github.com/mins01/ui_SelectArea
*/

// CustomEvent 호환용 (for IE)
(function () {
  
  if ( typeof window.CustomEvent === "function" ) return false;
  
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
  }
  
  CustomEvent.prototype = window.Event.prototype;
  
  window.CustomEvent = CustomEvent;
})();

var SelectArea = (function(){
  
  /**
  * 노드 이동 이벤트 제어용
  * @type {Object}
  */
  var toDragable = {
    "addListener":function(target,cb_onpointerMove,cb_onpointerUp){
      target.ing = false;
      target.x0 = 0;
      target.y0 = 0;
      target.cb_onpointerMove = cb_onpointerMove;
      target.cb_onpointerUp = cb_onpointerUp;
      target._getXY = this._getXY;
      
      target.addEventListener('pointerdown',this._onpointerdown(target));
      target.addEventListener('touchmove',function(evt){ evt.preventDefault();evt.stopPropagation()	;return false;});
      document.addEventListener('pointermove',this._onpointermove(target));
      document.addEventListener('pointerup',this._onpointerup(target));
    },
    "_getXY":function(evt){
      var x = evt.clientX;
      var y = evt.clientY;
      if(evt.isPrimary ){
        var x = evt.clientX;
        var y = evt.clientY;
      }else if(evt.touches && evt.touches[0]){
        var touch = evt.touches[0];
        var x = touch.X;
        var y = touch.Y;
      }else{
        var x = evt.x;
        var y = evt.y;
      }
      return [x,y];
    },
    "_onpointerdown":function(target){
      // var target = evt.target;
      return function(evt){
        target.ing = true;
        var xy = target._getXY(evt);
        target.x0 = xy[0];
        target.y0 = xy[1];
        // console.log(evt.type)
        evt.preventDefault();evt.stopPropagation()	;
        return false;
      }			
    },
    "_onpointermove":function(target){
      // var target = evt.target;
      return function(evt){
        // console.log(target);
        if(!target.ing){return;}
        var xy = target._getXY(evt);
        var gapX = xy[0]-target.x0;
        var gapY = xy[1]-target.y0;
        target.x0 = xy[0];
        target.y0 = xy[1];
        if(target.cb_onpointerMove){
          target.cb_onpointerMove(evt,gapX,gapY);
        }
        evt.preventDefault();evt.stopPropagation()	;
        return false;
      }
    },
    "_onpointerup":function(target){
      return function(evt){
        // var target = evt.target;
        if(target.ing && target.cb_onpointerUp){
          target.cb_onpointerUp(evt);
        }
        target.ing = false;
        evt.preventDefault();evt.stopPropagation()	;
        return false;
      }
      
    }
  }
  
  /**
  * UI 기본형 생성
  * @param  {html_node} target 기준 대상
  * @return {html_node_with_SelectArea}        UI용 노드
  */
  var _create = function(target){
    var sa = document.createElement('div');
    sa.className="selectArea";
    sa.innerHTML =
    '<div class="selectArea-box">'+
    '<button type="button" class="selectArea-pointer" data-index="0" data-x="0" data-y="0"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="1"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="2"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="3"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="4" data-w="0" data-h="0"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="5"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="6"></button>'+
    '<button type="button" class="selectArea-pointer" data-index="7"></button>'+
    '<div class="selectArea-layout"></div>'+
    '</div>'+
    '<div class="selectArea-bg"></div>';
    sa.box=sa.querySelector('.selectArea-box');
    sa.bg=sa.querySelector('.selectArea-bg');
    sa.box.pointers=sa.querySelectorAll('.selectArea-pointer');
    sa.box.layout=sa.querySelector('.selectArea-layout');

    /** @member {html_node} selectedArea 지정된 영역 노드 */
    sa.selectedArea = sa.box.layout;
    
    sa.target = target
    sa.target.sa = sa;
    var p_bcr = sa.target.getBoundingClientRect();
    
    sa.x = 0;
    sa.y = 0;
    sa.w = p_bcr.width;
    sa.h = p_bcr.height;
    sa.x1 = sa.x+sa.w;
    sa.y1 = sa.y+sa.h;
    
    /** @member {Boolean} outOfRange 대상을 벗어나서 설정 할 수 있는가? */
    sa.outOfRange = false;
    return sa;
  }
  
  /**
  * 기본 메소드 설정용
  * @param  {html_node_with_SelectArea} sa
  */
  var _initMethod = function(sa){
    /**
    * 대상 지정 설정/변경
    * @param  {html_node} target
    */
    sa.setTarget = function(target){
      this.hide();
      this.target = target;
      this.target.sa = this;
    }
    /**
    * show 
    * UI 보이기 파라메터 지정 안 할 경우 대상(target)의 좌표를 사용한다.
    * @param  {number} x  x좌표
    * @param  {number} y  y좌표
    * @param  {number} x1 x1좌표
    * @param  {number} y1 y1좌표
    */
    sa.show = function(x,y,x1,y1){
      document.body.appendChild(this);
      var p_bcr = this.target.getBoundingClientRect();
      // console.log(p_bcr)
      if(x == undefined) x = 0;
      if(y == undefined) y = 0;
      if(x1 == undefined) x1 = p_bcr.width + x;
      if(y1 == undefined) y1 = p_bcr.height + y;
      var t = 0;
      if(x > x1){t = x;x = x1;x1 = t;}
      if(y > y1){t = y;y = y1;y1 = t;}
      this.x = x;
      this.y = y;
      this.x1 = x1;
      this.y1 = y1
      this.syncPosCoordinate(x,y,x1,y1);
      
    }
    /**
    * UI숨기기
    */
    sa.hide = function(){
      if(this.parentNode) this.parentNode.removeChild(this);
    }
    /**
    * 파괴하기
    * ... 사용 비추천. 이벤트만 삭제하는 수준으로 끝낸다.
    */
    sa.destroy = function(){
      window.removeEventListener('resize',this._window_onresize);
      window.removeEventListener('scroll',this._window_onresize);
      this.parentNode.removeChild(this);
      this.show = null;
      delete this.target.sa;
    }
    /**
    * 좌표로 설정
    * @param  {number} x 
    * @param  {number} y 
    * @param  {number} x1
    * @param  {number} y1
    */
    sa.syncPosCoordinate = function(x,y,x1,y1){
      _syncPosCoordinate(this,x,y,x1,y1);
      this.dispatchEvent((new CustomEvent("change", {}) ));
    }
    /**
    * 선택된 영역의 대상에 상대적인 좌표,크기 정보 값 가져오기 
    * 페이지에서 보이는 정보를 알고 싶으면 sa.selectedArea.getBoundingClientRect() 를 사용하라.
    * @return {DOMRect}
    */
    sa.getSelectedAreaRect=function(){
      var x = Math.min(this.x,this.x1);
      var y = Math.min(this.y,this.y1);
      if(DOMRect){
        return new DOMRect(x,y,this.w,this.h);
      }else{
        
        return {"x":x,"y":y,"width":this.w,"height":this.h,"left":x,"top":y,"right":x+this.w,"bottom":y+this.h};
      }
      
    }
    /**
    * 좌표와 크기로 설정
    * @param  {number} x
    * @param  {number} y
    * @param  {number} w
    * @param  {number} h
    */
    sa.moveAndSize = function(x,y,w,h){
      if(!this.outOfRange){
        var p_bcr = sa.target.getBoundingClientRect();
        x = Math.max(Math.min(p_bcr.width,x),0)
        y = Math.max(Math.min(p_bcr.height,y),0)
        w = Math.max(Math.min(p_bcr.width,w),0)
        h = Math.max(Math.min(p_bcr.height,h),0)
        if(x+w>p_bcr.width){
          x = p_bcr.width-w
        }
        if(y+h>p_bcr.height){
          y = p_bcr.height-h
        }
      }
      // console.log(x,y,x+w,y+h);
      this.syncPosCoordinate(x,y,x+w,y+h);
    }
    /**
    * 상대적 좌표이동
    * @param  {number} x 
    * @param  {number} y 
    */
    sa.moveBy = function(x,y){
      if(!this.outOfRange){
        var p_bcr = sa.target.getBoundingClientRect();
        if(this.x+x>p_bcr.width){
          x = p_bcr.width-this.x;
        }
        if(this.x+x<0){
          x = -1*this.x;
        }
        if(this.y+y>p_bcr.width){
          y = p_bcr.width-this.y;
        }
        if(this.y+y<0){
          y = -1*this.y;
        }
      }
      // console.log(x,y,this.x+x,this.y+y,this.w,this.h)
      this.moveAndSize(this.x+x,this.y+y,this.w,this.h);
    }
    /**
    * 상대적 크기 변경
    * @param  {number} w 
    * @param  {number} h 
    */
    sa.sizeBy = function(w,h){
      if(!this.outOfRange){
        var p_bcr = sa.target.getBoundingClientRect();
        if(this.x+w>p_bcr.width){
          w = p_bcr.width-this.x;
        }
      }
      // console.log(x,y,this.x+x,this.y+y,this.w,this.h)
      this.moveAndSize(this.x,this.y,this.w+w,this.h+h);
    }
    /**
    * 화면 다시 그리기
    * onresize 를 위해서 만듬
    */
    sa.resync = function(){
      this.syncPosCoordinate(this.x,this.y,this.x1,this.y1);
    }
    /**
    * 상재적 좌표로 설정
    * @param  {number} x  
    * @param  {number} y  
    * @param  {number} x1 
    * @param  {number} y1 
    */
    sa.syncPosCoordinateBy = function(x,y,x1,y1){
      var t = 0;
      // var p_bcr = sa.target.getBoundingClientRect();
      
      var x_e = this.x+x;
      var y_e = this.y+y;
      var x1_e = this.x1+x1;
      var y1_e = this.y1+y1;
      var w = x1_e-x_e;
      var h = y1_e-y_e;
      // console.log(x,y,w,h,x1,y1)
      this.syncPosCoordinate(x_e,y_e,x1_e,y1_e);
    }
    /**
    * onresize 이벤트용
    */
    sa._window_onresize = function(thisC){
      return function(evt){
        thisC.resync();
        evt.preventDefault();evt.stopPropagation();
      }
    }(sa)
    /**
    * selectedArea 이동 후 좌표값 재계산용
    * @param  {Boolean} thisC 
    */
    sa.toDragable_onpointerup = function(thisC){
      return function(evt){
        var t = 0;
        if(thisC.x > thisC.x1){t = thisC.x;thisC.x = thisC.x1;thisC.x1 = t;}
        if(thisC.y > thisC.y1){t = thisC.y;thisC.y = thisC.y1;thisC.y1 = t;}
        thisC.syncPosCoordinate(thisC.x,thisC.y,thisC.x1,thisC.y1);
      }
    }(sa)
    
    
  }
  // 대상에 이벤트 초기화
  var _initEvent = function(sa){
    toDragable.addListener(sa.box.layout,function(thisC){return function(evt,gapX,gapY){
      thisC.moveBy(gapX,gapY);
      thisC.dispatchEvent((new CustomEvent("change", {}) ));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[0],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(gapX,gapY,0,0)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[1],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(0,gapY,0,0)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[2],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(0,gapY,gapX,0)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[3],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(0,0,gapX,0)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[4],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(0,0,gapX,gapY)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[5],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(0,0,0,gapY)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[6],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(gapX,0,0,gapY)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    toDragable.addListener(sa.box.pointers[7],function(thisC){return function(evt,gapX,gapY){
      thisC.syncPosCoordinateBy(gapX,0,0,0)
      thisC.dispatchEvent((new CustomEvent("change", {})));
    }}(sa),sa.toDragable_onpointerup);
    
    window.addEventListener('resize',sa._window_onresize,false)
    window.addEventListener('scroll',sa._window_onresize,false)
  }
  
  /** 
  * 영역의 이동, 차지에 대한 제어 부분
  * @param  {html_node_with_SelectArea} sa 
  * @param  {number} x  
  * @param  {number} y  
  * @param  {number} x1 
  * @param  {number} y1 
  */
  var _syncPosCoordinate = function(sa,x,y,x1,y1){
    var t ;
    var scrollX = (((t = document.documentElement) || (t = document.body.parentNode)) && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;
    var scrollY = (((t = document.documentElement) || (t = document.body.parentNode))  && typeof t.scrollTop == 'number' ? t : document.body).scrollTop
    var p_bcr = sa.target.getBoundingClientRect();
    
    if(!sa.outOfRange){  
      var x_e = Math.max(x,0);
      var x1_e = Math.min(x1,p_bcr.width);
      var y_e = Math.max(y,0);
      var y1_e = Math.min(y1,p_bcr.height);
      var x_min = Math.max(Math.min(x_e,x1_e),0);
      var y_min = Math.max(Math.min(y_e,y1_e),0);
      var x_max = Math.min(Math.max(x_e,x1_e),p_bcr.width);
      var y_max = Math.min(Math.max(y_e,y1_e),p_bcr.height);
      
      
    }else{
      var x_e = x
      var x1_e = x1
      var y_e = y
      var y1_e = y1
      var x_min = Math.min(x_e,x1_e)
      var y_min = Math.min(y_e,y1_e)
      var x_max = Math.max(x_e,x1_e)
      var y_max = Math.max(y_e,y1_e)
    }
    
    var w = Math.abs(x_max-x_min);
    var h = Math.abs(y_max-y_min);
    sa.x = x_e;
    sa.y = y_e;
    sa.w = w;
    sa.h = h;
    sa.x1 = x1_e;
    sa.y1 = y1_e;
    
    sa.box.pointers[0].setAttribute('data-x',x_min.toFixed(0));
    sa.box.pointers[0].setAttribute('data-y',y_min.toFixed(0));
    sa.box.pointers[4].setAttribute('data-w',w.toFixed(0));
    sa.box.pointers[4].setAttribute('data-h',h.toFixed(0));
    
    sa.box.style.top = y_min+"px";
    sa.box.style.left = x_min+"px";
    sa.box.style.width = w+"px";
    sa.box.style.height = h+"px";
    sa.style.top = p_bcr.top+scrollY+"px";
    sa.style.left = p_bcr.left+scrollX+"px";
    sa.style.width = p_bcr.width+"px";
    sa.style.height = p_bcr.height+"px";
    sa.bg.style.borderTopWidth = Math.max(0,Math.min(p_bcr.height,y_min))+"px";
    sa.bg.style.borderLeftWidth = Math.max(0,Math.min(p_bcr.width,x_min))+"px";
    sa.bg.style.borderRightWidth = Math.max(0,Math.min(p_bcr.width,(p_bcr.width-x_min-w)))+"px";
    sa.bg.style.borderBottomWidth =  Math.max(0,Math.min(p_bcr.height,(p_bcr.height-y_min-h)))+"px";
  }
  
  return function(target){
    var sa = _create(target);
    _initMethod(sa);
    _initEvent(sa)
    return sa;
    
  }
})()