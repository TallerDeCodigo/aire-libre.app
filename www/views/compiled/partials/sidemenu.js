!function(){var n=Handlebars.template,a=Handlebars.templates=Handlebars.templates||{};a["sidemenu"]=n({1:function(n,a,e,l,s){return'						<img src="'+n.escapeExpression(n.lambda(a,a))+'">\n'},3:function(n,a,e,l,s){return'						<img src="images/menu1.png">\n'},compiler:[7,">= 4.0.0"],main:function(n,a,e,l,s){var i,o=n.lambda,r=e.blockHelperMissing,m=n.escapeExpression;return'<div class="overscreen" style="display:none">\n<div class="fitted"></div>\n	<nav class="menu">\n		<div class="header">\n			<a href="#">\n				<div class="profile-img">\n'+(null!=(i=r.call(a,o(null!=(i=null!=a?a.me:a)?i.profile_pic:i,a),{name:"me.profile_pic",hash:{},fn:n.program(1,s,0),inverse:n.noop,data:s}))?i:"")+"\n"+(null!=(i=r.call(a,o(null!=(i=null!=a?a.me:a)?i.profile_pic:i,a),{name:"me.profile_pic",hash:{},fn:n.noop,inverse:n.program(3,s,0),data:s}))?i:"")+'				</div>\n				<div class="profile-name">Hola '+m(o(null!=(i=null!=a?a.me:a)?i.first_name:i,a))+" "+m(o(null!=(i=null!=a?a.me:a)?i.last_name:i,a))+'</div>\n			</a>\n		</div>\n		<a class="menu-btn hook home">Descubre</a>\n		<a class="menu-btn hook recent">Lo Último</a>\n		<a class="menu-btn hook podcast">Podcast</a>\n		<a class="menu-btn hook columna">Artículos</a>\n		<a class="menu-btn" id="logout">Salir</a>\n	</nav>\n</div>'},useData:!0})}();