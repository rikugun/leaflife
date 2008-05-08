/*
    Map Widget for Mozilla Firefox (version 1.0.17)

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
eval(function(B,D,A,G,E,F){function C(A){return String.fromCharCode(A+65)}while(A>0)E[C(G--)]=D[--A];return B.replace(/[\w\$]+/g,function(A){return E[A]==F[A]?A:E[A]})}('W K(){Q.N={};Q.V=[];Q.Y=[];Q.R=[]}K.prototype={J:F,put:W(H,B){M A=Q.N,G=A[H],D=Q.Y,C=Q.R;I(G==X){A[H]=G=C.S>F?C.pop():D.S;++Q.J;Q.V[G]=H}D[G]=B},get:W(H){U H==X?O:Q.Y[Q.N[H]]},keys:W(){M A=[],G=Q.V,H=E=F;L(;H<G.S;++H)I(G[H]!=X)A[E++]=G[H];U A},values:W(){M G=[],A=Q.Y,H=E=F;L(;H<A.S;++H)I(A[H]!=X)G[E++]=A[H];U G},remove:W(H){M C=O,A=Q.N,G=A[H],D=Q.Y,B=Q.V;I(G!=X){C=D[G];--Q.J;T A[H];I(!Q.J&&D.S>100)B.S=D.S=Q.R.S=F;P{T B[G];T D[G];I(G==D.S-1){--B.S;--D.S}P Q.R.push(G)}}U C},clear:W(){Q.N={};Q.J=Q.V.S=Q.Y.S=Q.R.S=F},size:W(){U Q.J},containsKey:W(H){U Q.N[H]!=X},each:W(A,G){M B=Q.Y,H=F;L(;H<B.S;++H)I(B[H]!=X)A.call(G,B[H])},invoke:W(G){M A=Q.Y,H=F;L(;H<A.S;++H)I(A[H]!=X)G.apply(A[H])}}','j|0|_|$|if|len|Map|for|var|dict|null|else|this|empty|length|delete|return|keyList|function|undefined|valueList'.split('|'),21,24,{},{}))