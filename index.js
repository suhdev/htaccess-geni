var fs = require('fs'),
	_ = require('lodash');

var rewriteCond = function RewriteCondition(operand1,operand2){

};

var rewriteRule = function RewriteRule(operand1,operand2,conditions,flags){
	this.template = '__COND__RewriteRule __OP1__ __OP2__ __FLAGS__';
	this.operand1 = operand1 || '';
	this.operand2 = operand2 || '';
	this.conditions = conditions || [];
	this.flags = flags || [];
};

rewriteRule.prototype = {
	condition:function(cond){
		this.conditions.push(cond);
		return this;
	},
	toStringConditions:function(){
		_(this.conditions)
			.map(function(e){
				return e.toString();
			})
			.value()
			.join('\n');
	},
	flag:function(flag){
		this.flags.push(flag);
		return this;
	},
	last:function(){
		this.flags.push('L');
		return this;
	},
	redirect:function(v){
		this.flags.push(v?('R='+v):('R=301'));
		return this;
	},
	toString:function(){
		return this.template
			.replace(/__OP1__/,this.operand1)
			.replace(/__OP2__/,this.operand2)
			.replace(/__COND__/,_(this.conditions)
				.map(function(e){
					return e.toString();
				})
				.value()
				.join('\n'))
			.replace(/__FLANGS__/,this.flags.length>0?('['+
				this.flags.join(',')+']'):'');
	}
};

var htacces = function(name){
	this.filename = name;
	this.rules = ['RewriteEngine on'];
};

htacces.prototype = {
	generate:function(){
		return this.rules.join('\n');
	},
	addRule:function(rule,cond){
		this.rules = [].concat(this.rules,(cond?cond:[]));
		this.rules.push(rule);
		return this;
	},
	prependRule:function(rule,cond){
		this.rules = [].concat(cond?cond:[],this.rules);
		this.rules.unshift(rule);
		return this;
	}
};

var HTAccessBuilder = function(name){
	this.file = new htacces(name);
};

HTAccessBuilder.prototype = {
	rewriteRule:function(rule,conditions){
		this.file.addRule(rule,conditions)
		return this;
	},
	// logLevel:function(text){
	// 	this.file.addRule('LogLevel '+text);
	// 	return this;
	// },
	// alert:function(){
	// 	return this.logLevel('alert');
	// },
	// info:function(){
	// 	return this.logLevel('info');
	// },
	// debug:function(){
	// 	return this.logLevel('debug');
	// },
	// notice:function(){
	// 	return this.logLevel('notice');
	// },
	// error:function(){
	// 	return this.logLevel('error');
	// },
	rewriteBase:function(base){
		this.file.addRule('RewriteBase '+base);
		return this;
	},
	rewriteRule:function(rule)
	generate:function(){
		return this.file.generate();
	},
	out:function(filename){
		fs.writeFileSync(filename,this.file.generate());
		return this;
	}
};