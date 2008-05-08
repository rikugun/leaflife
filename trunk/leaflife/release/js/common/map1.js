/*
    Map Widget for Internet Explorer (version 1.0.17)

    Copyright 2008 Huangchao.

    This file is part of LeafLife.

    LeafLife is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 2 as
    published by the Free Software Foundation.

    LeafLife is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with LeafLife. If not, see <http://www.gnu.org/licenses/>.
*/
function Map($){this.dict=new ActiveXObject("Scripting.Dictionary");if($)this.componentClass=$}Map.prototype={put:function($,_){this.dict.Item($)=_},get:function($){var _=this.dict;return _.Exists($)?_.Item($):null},keys:function(){return new VBArray(this.dict.Keys()).toArray()},values:function(){return new VBArray(this.dict.Items()).toArray()},remove:function($){var _=this.get($);if(_)this.dict.Remove($);return _},clear:function(){this.dict.RemoveAll()},size:function(){return this.dict.Count},containsKey:function($){return this.dict.Exists($)},each:function(B,_){var A=this.values(),$=A.length-1;for(;$>=0;--$)if(A[$]!=undefined)B.call(_,A[$])},invoke:function(A){var _=this.values(),$=_.length-1;for(;$>=0;--$)if(_[$]!=undefined)A.apply(_[$])},toJSONString:function(){var $=this.keys(),_=$.length-1,A=[],B;for(;_>=0;--_)if(B=this.dict.Item($[_]).toJSONString())A[_]=$[_]+":"+B;return"{"+A.join(",")+"}"}}